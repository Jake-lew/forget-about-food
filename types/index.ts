// ============================================================
// Forget About Food — Core TypeScript Types
// ============================================================

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  onboarding_completed: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  phone_number: string | null;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  // Household
  household_size: number;
  // Budget
  weekly_budget: number;
  currency: string;
  // Dietary
  dietary_restrictions: string[];  // vegetarian, vegan, gluten-free, dairy-free, keto, paleo, etc.
  allergies: string[];             // nuts, shellfish, eggs, soy, etc.
  disliked_ingredients: string[];  // individual ingredients
  disliked_meals: string[];        // meals by name
  liked_cuisines: string[];        // Italian, Mexican, Asian, etc.
  // Cooking
  cooking_equipment: string[];     // oven, grill, instant-pot, pizza-oven, air-fryer, etc.
  max_weekday_cook_time: number;   // minutes
  max_weekend_cook_time: number;   // minutes
  // Planning style
  meal_prep_enabled: boolean;
  leftovers_for_lunch: boolean;
  shopping_day: DayOfWeek;
  week_start_day: DayOfWeek;
  // Stores
  preferred_stores: string[];
  // Which meals to plan
  plan_breakfast: boolean;
  plan_lunch: boolean;
  plan_dinner: boolean;
  plan_snacks: boolean;
  updated_at: string;
}

export interface MealPlan {
  id: string;
  user_id: string;
  week_start: string;         // ISO date string (Monday)
  week_end: string;           // ISO date string (Sunday)
  status: "draft" | "active" | "completed";
  total_estimated_cost: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  meals?: PlannedMeal[];
}

export interface PlannedMeal {
  id: string;
  meal_plan_id: string;
  day: DayOfWeek;
  meal_type: MealType;
  meal_name: string;
  description: string;
  servings: number;
  prep_time: number;          // minutes
  cook_time: number;          // minutes
  estimated_cost: number;
  calories_per_serving: number | null;
  is_meal_prep: boolean;      // part of batch cooking session
  is_leftover: boolean;       // leftover from previous meal
  source_meal_id: string | null; // if leftover, which meal it came from
  ingredients: MealIngredient[];
  instructions: string[];
  cuisine_type: string | null;
  equipment_needed: string[];
  liked: boolean | null;      // null = no feedback yet
  image_url: string | null;
}

export interface MealIngredient {
  name: string;
  quantity: string;
  unit: string;
  estimated_cost: number;
  category: IngredientCategory;
  store_section: string;
}

export type IngredientCategory =
  | "produce"
  | "meat_seafood"
  | "dairy_eggs"
  | "pantry"
  | "frozen"
  | "bakery"
  | "beverages"
  | "condiments"
  | "spices"
  | "other";

export interface ShoppingList {
  id: string;
  user_id: string;
  meal_plan_id: string | null;
  name: string;
  week_start: string;
  status: "active" | "completed" | "archived";
  total_estimated_cost: number;
  actual_cost: number | null;
  items: ShoppingItem[];
  created_at: string;
  updated_at: string;
}

export interface ShoppingItem {
  id: string;
  shopping_list_id: string;
  name: string;
  quantity: string;
  unit: string;
  category: IngredientCategory;
  store_section: string;
  estimated_cost: number;
  actual_cost: number | null;
  checked: boolean;
  in_pantry: boolean;         // user already has this
  preferred_store: string | null;
  notes: string | null;
  meal_names: string[];       // which meals need this
}

export interface PantryItem {
  id: string;
  user_id: string;
  name: string;
  quantity: string;
  unit: string;
  category: IngredientCategory;
  expiry_date: string | null;
  added_at: string;
  updated_at: string;
}

export interface MealHistory {
  id: string;
  user_id: string;
  meal_name: string;
  cuisine_type: string | null;
  liked: boolean;
  times_made: number;
  last_made: string;
  notes: string | null;
}

// ---- AI Generation Types ----

export interface MealPlanGenerationRequest {
  preferences: UserPreferences;
  pantry_items: PantryItem[];
  meal_history: MealHistory[];
  week_start: string;
  special_instructions?: string;
}

export interface GeneratedMealPlan {
  meals: GeneratedMeal[];
  shopping_items: Omit<ShoppingItem, "id" | "shopping_list_id">[];
  total_estimated_cost: number;
  meal_prep_sessions: MealPrepSession[];
  notes: string;
}

export interface GeneratedMeal {
  day: DayOfWeek;
  meal_type: MealType;
  meal_name: string;
  description: string;
  servings: number;
  prep_time: number;
  cook_time: number;
  estimated_cost: number;
  calories_per_serving: number;
  is_meal_prep: boolean;
  is_leftover: boolean;
  source_meal_name?: string;
  ingredients: MealIngredient[];
  instructions: string[];
  cuisine_type: string;
  equipment_needed: string[];
}

export interface MealPrepSession {
  day: DayOfWeek;
  duration_minutes: number;
  meals_prepped: string[];
  instructions: string[];
}

// ---- Notification Types ----

export interface NotificationPayload {
  user: UserProfile;
  meal_plan: MealPlan;
  shopping_list: ShoppingList;
  week_start: string;
  web_link: string;
}

// ---- Onboarding Step Types ----

export type OnboardingStep =
  | "welcome"
  | "household"
  | "dietary"
  | "cooking"
  | "planning"
  | "stores"
  | "notifications"
  | "complete";

export interface OnboardingData {
  household_size: number;
  weekly_budget: number;
  dietary_restrictions: string[];
  allergies: string[];
  disliked_ingredients: string;
  liked_cuisines: string[];
  cooking_equipment: string[];
  max_weekday_cook_time: number;
  max_weekend_cook_time: number;
  meal_prep_enabled: boolean;
  leftovers_for_lunch: boolean;
  shopping_day: DayOfWeek;
  week_start_day: DayOfWeek;
  preferred_stores: string;
  plan_breakfast: boolean;
  plan_lunch: boolean;
  plan_dinner: boolean;
  plan_snacks: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  phone_number: string;
}
