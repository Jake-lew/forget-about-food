import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatShortDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ");
}

export function getWeekDates(weekStart: string): Date[] {
  const start = new Date(weekStart);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function getNextMonday(): Date {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + diff);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday;
}

export function minutesToHoursAndMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function getEmojiForMealType(mealType: string): string {
  const emojis: Record<string, string> = {
    breakfast: "🌅",
    lunch: "☀️",
    dinner: "🌙",
    snack: "🍎",
  };
  return emojis[mealType] || "🍽️";
}

export function getEmojiForCuisine(cuisine: string): string {
  const emojis: Record<string, string> = {
    italian: "🍝",
    mexican: "🌮",
    asian: "🍜",
    american: "🍔",
    mediterranean: "🥗",
    indian: "🍛",
    japanese: "🍱",
    chinese: "🥢",
    thai: "🌶️",
    french: "🥐",
    greek: "🫒",
    middle_eastern: "🧆",
  };
  return emojis[cuisine?.toLowerCase()] || "🍽️";
}

export function getEmojiForCategory(category: string): string {
  const emojis: Record<string, string> = {
    produce: "🥦",
    meat_seafood: "🥩",
    dairy_eggs: "🥛",
    pantry: "🫙",
    frozen: "🧊",
    bakery: "🍞",
    beverages: "🥤",
    condiments: "🫙",
    spices: "🌿",
    other: "📦",
  };
  return emojis[category] || "📦";
}

export function groupShoppingItemsByCategory<T extends { category: string }>(
  items: T[]
): Record<string, T[]> {
  return items.reduce(
    (acc, item) => {
      const key = item.category || "other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

export function groupShoppingItemsByStore<T extends { preferred_store: string | null }>(
  items: T[]
): Record<string, T[]> {
  return items.reduce(
    (acc, item) => {
      const key = item.preferred_store || "Any Store";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

export function calculateBudgetProgress(
  spent: number,
  budget: number
): { percentage: number; isOver: boolean; remaining: number } {
  const percentage = Math.min((spent / budget) * 100, 100);
  const isOver = spent > budget;
  const remaining = budget - spent;
  return { percentage, isOver, remaining };
}

export const DIETARY_OPTIONS = [
  { value: "vegetarian", label: "Vegetarian", emoji: "🌱" },
  { value: "vegan", label: "Vegan", emoji: "🌿" },
  { value: "gluten_free", label: "Gluten-Free", emoji: "🌾" },
  { value: "dairy_free", label: "Dairy-Free", emoji: "🥛" },
  { value: "keto", label: "Keto", emoji: "🥑" },
  { value: "paleo", label: "Paleo", emoji: "🦣" },
  { value: "halal", label: "Halal", emoji: "☪️" },
  { value: "kosher", label: "Kosher", emoji: "✡️" },
  { value: "low_carb", label: "Low Carb", emoji: "🥬" },
  { value: "low_sodium", label: "Low Sodium", emoji: "🧂" },
];

export const ALLERGY_OPTIONS = [
  { value: "nuts", label: "Tree Nuts", emoji: "🥜" },
  { value: "peanuts", label: "Peanuts", emoji: "🥜" },
  { value: "shellfish", label: "Shellfish", emoji: "🦐" },
  { value: "fish", label: "Fish", emoji: "🐟" },
  { value: "eggs", label: "Eggs", emoji: "🥚" },
  { value: "dairy", label: "Dairy", emoji: "🧀" },
  { value: "soy", label: "Soy", emoji: "🫘" },
  { value: "wheat", label: "Wheat/Gluten", emoji: "🌾" },
  { value: "sesame", label: "Sesame", emoji: "⚪" },
];

export const CUISINE_OPTIONS = [
  { value: "italian", label: "Italian", emoji: "🍝" },
  { value: "mexican", label: "Mexican", emoji: "🌮" },
  { value: "asian", label: "Asian", emoji: "🍜" },
  { value: "american", label: "American", emoji: "🍔" },
  { value: "mediterranean", label: "Mediterranean", emoji: "🥗" },
  { value: "indian", label: "Indian", emoji: "🍛" },
  { value: "japanese", label: "Japanese", emoji: "🍱" },
  { value: "chinese", label: "Chinese", emoji: "🥢" },
  { value: "thai", label: "Thai", emoji: "🌶️" },
  { value: "french", label: "French", emoji: "🥐" },
  { value: "greek", label: "Greek", emoji: "🫒" },
  { value: "middle_eastern", label: "Middle Eastern", emoji: "🧆" },
];

export const EQUIPMENT_OPTIONS = [
  { value: "oven", label: "Oven", emoji: "🫕" },
  { value: "stovetop", label: "Stovetop", emoji: "🔥" },
  { value: "grill", label: "Grill / BBQ", emoji: "🍖" },
  { value: "pizza_oven", label: "Pizza Oven", emoji: "🍕" },
  { value: "instant_pot", label: "Instant Pot", emoji: "♨️" },
  { value: "slow_cooker", label: "Slow Cooker", emoji: "🫕" },
  { value: "air_fryer", label: "Air Fryer", emoji: "💨" },
  { value: "blender", label: "Blender", emoji: "🥤" },
  { value: "food_processor", label: "Food Processor", emoji: "⚙️" },
  { value: "stand_mixer", label: "Stand Mixer", emoji: "🌀" },
  { value: "wok", label: "Wok", emoji: "🥘" },
  { value: "microwave", label: "Microwave", emoji: "📡" },
  { value: "toaster_oven", label: "Toaster Oven", emoji: "🟫" },
  { value: "sous_vide", label: "Sous Vide", emoji: "🌡️" },
  { value: "smoker", label: "Smoker", emoji: "💨" },
];

export const DAY_OPTIONS = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

export const POPULAR_STORES = [
  "Whole Foods",
  "Trader Joe's",
  "Costco",
  "Kroger",
  "Safeway",
  "Publix",
  "Target",
  "Walmart",
  "Sprouts",
  "Aldi",
  "H-E-B",
  "Wegmans",
  "Instacart",
];
