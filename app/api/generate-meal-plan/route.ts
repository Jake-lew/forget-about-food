import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { jsonrepair } from "jsonrepair";
import { getRegenLimit, getCurrentWeekOf, PlanTier } from "@/lib/stripe";

// Extend Vercel function timeout to 60 seconds (max on Hobby plan)
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check subscription tier and regeneration limits
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier, is_superadmin, trial_ends_at")
    .eq("id", user.id)
    .single();

  const tier = (profile?.subscription_tier || "starter") as PlanTier;
  const isSuperadmin = profile?.is_superadmin || false;
  const isTrialing = profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date();

  // Superadmins and active trials bypass limits
  if (!isSuperadmin && !isTrialing) {
    const weekOf = getCurrentWeekOf();
    const limit = getRegenLimit(tier);

    if (limit !== Infinity) {
      const { data: usage } = await supabase
        .from("usage_tracking")
        .select("meal_plan_regenerations")
        .eq("user_id", user.id)
        .eq("week_of", weekOf)
        .maybeSingle();

      const used = usage?.meal_plan_regenerations || 0;
      if (used >= limit) {
        return NextResponse.json(
          { error: "limit_reached", used, limit, tier },
          { status: 403 }
        );
      }
    }
  }

  // Load user preferences, pantry, and meal history
  const [{ data: prefs }, { data: pantry }, { data: history }] = await Promise.all([
    supabase.from("user_preferences").select("*").eq("user_id", user.id).single(),
    supabase.from("pantry_items").select("*").eq("user_id", user.id),
    supabase.from("meal_history").select("*").eq("user_id", user.id).order("last_made", { ascending: false }).limit(50),
  ]);

  if (!prefs) return NextResponse.json({ error: "No preferences found. Please complete onboarding." }, { status: 400 });

  // Calculate week dates
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const daysUntilStart = dayOfWeek === 0 ? 1 : 8 - dayOfWeek; // Next Monday
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + daysUntilStart);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const weekStartStr = weekStart.toISOString().split("T")[0];
  const weekEndStr = weekEnd.toISOString().split("T")[0];

  const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const MEAL_TYPES = [];
  if (prefs.plan_breakfast) MEAL_TYPES.push("breakfast");
  if (prefs.plan_lunch) MEAL_TYPES.push("lunch");
  if (prefs.plan_dinner) MEAL_TYPES.push("dinner");
  if (prefs.plan_snacks) MEAL_TYPES.push("snack");

  const likedMeals = history?.filter(h => h.liked).map(h => h.meal_name) || [];
  const dislikedMeals = history?.filter(h => !h.liked).map(h => h.meal_name) || [];
  const pantryIngredients = pantry?.map(p => `${p.name} (${p.quantity || ""} ${p.unit || ""})`).join(", ") || "nothing tracked";

  const systemPrompt = `You are a world-class personal chef and nutritionist. You create detailed, personalized weekly meal plans.

CRITICAL RULES:
- NEVER include meals or ingredients from the user's allergy list
- NEVER include disliked meals or ingredients
- Always respect dietary restrictions
- Always stay within the weekly budget
- Cook times must fit within stated time constraints
- Use pantry items when possible
- For meal prep mode: plan a dedicated prep session (usually Sunday/Saturday)
- For leftovers: plan dinner portions that cover next day's lunch

OUTPUT FORMAT: Your entire response must be ONLY a valid JSON object. Do not include any text before or after the JSON. Do not use markdown code blocks. Do not add any explanation. Start your response with { and end with }.`;

  const userPrompt = `Create a complete weekly meal plan with the following requirements:

HOUSEHOLD: ${prefs.household_size} people
WEEKLY BUDGET: $${prefs.weekly_budget}
WEEK: ${weekStartStr} to ${weekEndStr}

MEALS TO PLAN: ${MEAL_TYPES.join(", ")}

DIETARY RESTRICTIONS: ${prefs.dietary_restrictions?.join(", ") || "none"}
ALLERGIES (NEVER include): ${prefs.allergies?.join(", ") || "none"}
DISLIKED INGREDIENTS (avoid): ${prefs.disliked_ingredients?.join(", ") || "none"}
PREFERRED CUISINES: ${prefs.liked_cuisines?.join(", ") || "varied"}

COOKING EQUIPMENT: ${prefs.cooking_equipment?.join(", ") || "oven, stovetop"}
MAX WEEKDAY COOK TIME: ${prefs.max_weekday_cook_time} minutes
MAX WEEKEND COOK TIME: ${prefs.max_weekend_cook_time} minutes

MEAL PREP MODE: ${prefs.meal_prep_enabled}
LEFTOVERS FOR LUNCH: ${prefs.leftovers_for_lunch}

PANTRY ITEMS (use these first): ${pantryIngredients}

PREVIOUSLY LIKED MEALS (include variations): ${likedMeals.slice(0,10).join(", ") || "none yet"}
DISLIKED MEALS (never include): ${dislikedMeals.slice(0,10).join(", ") || "none yet"}

PREFERRED STORES: ${prefs.preferred_stores?.join(", ") || "any"}

Return this exact JSON structure (keep it compact — no step-by-step instructions, no detailed ingredient lists):
{
  "week_start": "${weekStartStr}",
  "week_end": "${weekEndStr}",
  "total_estimated_cost": 0.00,
  "notes": "Brief 1-2 sentence overview of the week",
  "meals": [
    {
      "day": "monday",
      "meal_type": "breakfast",
      "meal_name": "Recipe Name",
      "description": "1-2 sentence description",
      "servings": ${prefs.household_size},
      "prep_time": 10,
      "cook_time": 20,
      "estimated_cost": 8.50,
      "calories_per_serving": 450,
      "cuisine_type": "American",
      "is_meal_prep": false,
      "is_leftover": false,
      "key_ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"]
    }
  ],
  "shopping_items": [
    {
      "name": "chicken breast",
      "quantity": "2 lbs",
      "category": "meat_seafood",
      "store_section": "Meat & Seafood",
      "estimated_cost": 8.00,
      "meal_names": ["Recipe Name"],
      "in_pantry": false
    }
  ]
}

Important:
- ONE meal object per slot (no options array)
- key_ingredients: max 5 items as plain strings
- Shopping items consolidated (don't list chicken twice)
- Mark in_pantry: true for pantry items
- Total estimated_cost = sum of non-pantry shopping items
- For leftover meals: set is_leftover: true`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8000,
      messages: [{ role: "user", content: userPrompt }],
      system: systemPrompt,
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    let generatedPlan;
    try {
      // Strip markdown code fences if present
      const stripped = content.text
        .replace(/^```json\s*/m, "")
        .replace(/^```\s*/m, "")
        .replace(/```\s*$/m, "")
        .trim();
      // Extract the outermost JSON object
      const jsonMatch = stripped.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON object found in response");
      // Use jsonrepair to fix any minor syntax errors the model made
      const repaired = jsonrepair(jsonMatch[0]);
      generatedPlan = JSON.parse(repaired);
    } catch (parseErr) {
      console.error("Parse error:", String(parseErr));
      throw new Error("Failed to parse AI response as JSON");
    }

    // Save meal plan to database
    const { data: mealPlan, error: planError } = await supabase
      .from("meal_plans")
      .insert({
        user_id: user.id,
        week_start: weekStartStr,
        week_end: weekEndStr,
        status: "active",
        total_estimated_cost: generatedPlan.total_estimated_cost,
        notes: generatedPlan.notes,
      })
      .select()
      .single();

    if (planError || !mealPlan) throw new Error("Failed to save meal plan");

    // Save planned meals
    const mealsToInsert = generatedPlan.meals.map((meal: {
      day: string;
      meal_type: string;
      meal_name: string;
      description?: string;
      servings: number;
      prep_time: number;
      cook_time: number;
      estimated_cost: number;
      calories_per_serving?: number;
      is_meal_prep?: boolean;
      is_leftover?: boolean;
      key_ingredients?: string[];
      cuisine_type?: string;
    }) => ({
      meal_plan_id: mealPlan.id,
      user_id: user.id,
      day: meal.day,
      meal_type: meal.meal_type,
      meal_name: meal.meal_name,
      description: meal.description || "",
      servings: meal.servings,
      prep_time: meal.prep_time,
      cook_time: meal.cook_time,
      estimated_cost: meal.estimated_cost,
      calories_per_serving: meal.calories_per_serving || null,
      is_meal_prep: meal.is_meal_prep || false,
      is_leftover: meal.is_leftover || false,
      ingredients: meal.key_ingredients?.map((name: string) => ({ name })) || [],
      instructions: [],
      cuisine_type: meal.cuisine_type || null,
      equipment_needed: [],
    }));

    if (mealsToInsert.length > 0) {
      await supabase.from("planned_meals").insert(mealsToInsert);
    }

    // Create shopping list
    const { data: shoppingList } = await supabase
      .from("shopping_lists")
      .insert({
        user_id: user.id,
        meal_plan_id: mealPlan.id,
        name: `Week of ${weekStartStr}`,
        week_start: weekStartStr,
        status: "active",
        total_estimated_cost: generatedPlan.shopping_items
          ?.filter((i: { in_pantry?: boolean }) => !i.in_pantry)
          .reduce((sum: number, i: { estimated_cost?: number }) => sum + (i.estimated_cost || 0), 0) || 0,
      })
      .select()
      .single();

    if (shoppingList && generatedPlan.shopping_items?.length > 0) {
      const itemsToInsert = generatedPlan.shopping_items.map((item: {
        name: string;
        quantity?: string;
        category?: string;
        store_section?: string;
        estimated_cost?: number;
        meal_names?: string[];
        in_pantry?: boolean;
      }) => ({
        shopping_list_id: shoppingList.id,
        user_id: user.id,
        name: item.name,
        quantity: item.quantity || "",
        unit: "",
        category: item.category || "other",
        store_section: item.store_section || "",
        estimated_cost: item.estimated_cost || 0,
        preferred_store: null,
        meal_names: item.meal_names || [],
        in_pantry: item.in_pantry || false,
        checked: item.in_pantry || false,
      }));

      await supabase.from("shopping_items").insert(itemsToInsert);
    }

    // Increment usage counter (skip for superadmins and trialing users)
    if (!isSuperadmin && !isTrialing && getRegenLimit(tier) !== Infinity) {
      const weekOf = getCurrentWeekOf();
      const { data: existingUsage } = await supabase
        .from("usage_tracking")
        .select("id, meal_plan_regenerations")
        .eq("user_id", user.id)
        .eq("week_of", weekOf)
        .maybeSingle();
      if (existingUsage) {
        await supabase.from("usage_tracking")
          .update({ meal_plan_regenerations: existingUsage.meal_plan_regenerations + 1 })
          .eq("id", existingUsage.id);
      } else {
        await supabase.from("usage_tracking")
          .insert({ user_id: user.id, week_of: weekOf, meal_plan_regenerations: 1 });
      }
    }

    // Send notification email/SMS if enabled
    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    const profile = profileData;
    if (profile?.email_notifications) {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-notification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          mealPlanId: mealPlan.id,
          shoppingListId: shoppingList?.id,
        }),
      }).catch(() => {}); // Don't fail if notification fails
    }

    return NextResponse.json({
      success: true,
      mealPlanId: mealPlan.id,
      shoppingListId: shoppingList?.id,
    });

  } catch (error) {
    console.error("Meal plan generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
