-- ============================================================
-- Forget About Food — Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up all tables
-- ============================================================

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for fuzzy text search

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  onboarding_completed boolean default false,
  email_notifications boolean default true,
  sms_notifications boolean default false,
  phone_number text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- USER PREFERENCES
-- ============================================================
create table if not exists public.user_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  -- Household
  household_size integer default 2,
  -- Budget
  weekly_budget numeric(10,2) default 150.00,
  currency text default 'USD',
  -- Dietary
  dietary_restrictions text[] default '{}',
  allergies text[] default '{}',
  disliked_ingredients text[] default '{}',
  disliked_meals text[] default '{}',
  liked_cuisines text[] default '{}',
  -- Cooking
  cooking_equipment text[] default '{oven,stovetop}',
  max_weekday_cook_time integer default 30,   -- minutes
  max_weekend_cook_time integer default 60,   -- minutes
  -- Planning style
  meal_prep_enabled boolean default false,
  leftovers_for_lunch boolean default true,
  shopping_day text default 'sunday',
  week_start_day text default 'monday',
  -- Stores
  preferred_stores text[] default '{}',
  -- Which meals to plan
  plan_breakfast boolean default true,
  plan_lunch boolean default true,
  plan_dinner boolean default true,
  plan_snacks boolean default false,
  updated_at timestamptz default now()
);

-- ============================================================
-- MEAL PLANS
-- ============================================================
create table if not exists public.meal_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  week_start date not null,
  week_end date not null,
  status text default 'active' check (status in ('draft','active','completed')),
  total_estimated_cost numeric(10,2),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists meal_plans_user_week on public.meal_plans(user_id, week_start);

-- ============================================================
-- PLANNED MEALS
-- ============================================================
create table if not exists public.planned_meals (
  id uuid default uuid_generate_v4() primary key,
  meal_plan_id uuid references public.meal_plans(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  day text not null check (day in ('monday','tuesday','wednesday','thursday','friday','saturday','sunday')),
  meal_type text not null check (meal_type in ('breakfast','lunch','dinner','snack')),
  meal_name text not null,
  description text,
  servings integer default 4,
  prep_time integer default 15,    -- minutes
  cook_time integer default 30,    -- minutes
  estimated_cost numeric(8,2),
  calories_per_serving integer,
  is_meal_prep boolean default false,
  is_leftover boolean default false,
  source_meal_id uuid references public.planned_meals(id),
  ingredients jsonb default '[]',  -- array of MealIngredient
  instructions text[] default '{}',
  cuisine_type text,
  equipment_needed text[] default '{}',
  liked boolean,                   -- null = no feedback, true/false = rated
  image_url text,
  created_at timestamptz default now()
);

create index if not exists planned_meals_plan on public.planned_meals(meal_plan_id);
create index if not exists planned_meals_user on public.planned_meals(user_id);

-- ============================================================
-- SHOPPING LISTS
-- ============================================================
create table if not exists public.shopping_lists (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  meal_plan_id uuid references public.meal_plans(id) on delete set null,
  name text not null,
  week_start date,
  status text default 'active' check (status in ('active','completed','archived')),
  total_estimated_cost numeric(10,2),
  actual_cost numeric(10,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists shopping_lists_user on public.shopping_lists(user_id);

-- ============================================================
-- SHOPPING ITEMS
-- ============================================================
create table if not exists public.shopping_items (
  id uuid default uuid_generate_v4() primary key,
  shopping_list_id uuid references public.shopping_lists(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  quantity text,
  unit text,
  category text default 'other',
  store_section text,
  estimated_cost numeric(8,2),
  actual_cost numeric(8,2),
  checked boolean default false,
  in_pantry boolean default false,
  preferred_store text,
  notes text,
  meal_names text[] default '{}',
  created_at timestamptz default now()
);

create index if not exists shopping_items_list on public.shopping_items(shopping_list_id);

-- ============================================================
-- PANTRY ITEMS
-- ============================================================
create table if not exists public.pantry_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  quantity text,
  unit text,
  category text default 'other',
  expiry_date date,
  added_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists pantry_items_user on public.pantry_items(user_id);

-- ============================================================
-- MEAL HISTORY (for learning preferences)
-- ============================================================
create table if not exists public.meal_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  meal_name text not null,
  cuisine_type text,
  liked boolean not null,
  times_made integer default 1,
  last_made timestamptz default now(),
  notes text
);

create index if not exists meal_history_user on public.meal_history(user_id);
create unique index if not exists meal_history_user_meal on public.meal_history(user_id, meal_name);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.meal_plans enable row level security;
alter table public.planned_meals enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.shopping_items enable row level security;
alter table public.pantry_items enable row level security;
alter table public.meal_history enable row level security;

-- Profiles: users can only read/write their own
create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id);

-- User preferences
create policy "prefs_own" on public.user_preferences
  for all using (auth.uid() = user_id);

-- Meal plans
create policy "meal_plans_own" on public.meal_plans
  for all using (auth.uid() = user_id);

-- Planned meals
create policy "planned_meals_own" on public.planned_meals
  for all using (auth.uid() = user_id);

-- Shopping lists
create policy "shopping_lists_own" on public.shopping_lists
  for all using (auth.uid() = user_id);

-- Shopping items
create policy "shopping_items_own" on public.shopping_items
  for all using (auth.uid() = user_id);

-- Pantry items
create policy "pantry_items_own" on public.pantry_items
  for all using (auth.uid() = user_id);

-- Meal history
create policy "meal_history_own" on public.meal_history
  for all using (auth.uid() = user_id);

-- ============================================================
-- AUTO-UPDATE updated_at TIMESTAMPS
-- ============================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.update_updated_at();
create trigger user_preferences_updated_at before update on public.user_preferences
  for each row execute procedure public.update_updated_at();
create trigger meal_plans_updated_at before update on public.meal_plans
  for each row execute procedure public.update_updated_at();
create trigger shopping_lists_updated_at before update on public.shopping_lists
  for each row execute procedure public.update_updated_at();
create trigger pantry_items_updated_at before update on public.pantry_items
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- STORAGE BUCKET (for meal images)
-- ============================================================
-- Run this in the Supabase Storage section or via API:
-- insert into storage.buckets (id, name, public) values ('meal-images', 'meal-images', true);
