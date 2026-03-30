import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export const PLANS = {
  starter: {
    name: "Starter",
    price: 499, // cents
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    regenerationsPerWeek: 2,
    description: "2 meal plan regenerations per week",
  },
  pro: {
    name: "Pro",
    price: 999,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    regenerationsPerWeek: 5,
    description: "5 meal plan regenerations per week",
  },
  chef: {
    name: "Chef",
    price: 1499,
    priceId: process.env.STRIPE_CHEF_PRICE_ID!,
    regenerationsPerWeek: Infinity,
    description: "Unlimited meal plan regenerations",
  },
} as const;

export type PlanTier = keyof typeof PLANS;

export function getRegenLimit(tier: PlanTier): number {
  return PLANS[tier]?.regenerationsPerWeek ?? 2;
}

export function getCurrentWeekOf(): string {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}
