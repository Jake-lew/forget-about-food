import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

OUTPUT FORMAT: Return a single valid JSON object. No markdown, no code blocks, just the JSON.`;

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

For EACH meal slot, provide 2-3 recipe options so the user can choose what appeals to them that week.

Return this exact JSON structure:
{
  "week_start": "${weekStartStr}",
  "week_end": "${weekEndStr}",
  "total_estimated_cost": 0.00,
  "notes": "Brief overview of the week's plan and any meal prep session details",
  "meal_prep_sessions": [
    {
      "day": "sunday",
      "duration_minutes": 90,
      "meals_prepped": ["Meal 1", "Meal 2"],
      "instructions": ["Step 1", "Step 2"]
    }
  ],
  "meals": [
    {
      "day": "monday",
      "meal_type": "breakfast",
      "options": [
        {
          "meal_name": "Recipe Name",
          "description": "1-2 sentence description",
          "servings": ${prefs.household_size},
          "prep_time": 10,
          "cook_time": 20,
          "estimated_cost": 8.50,
          "calories_per_serving": 450,
          "cuisine_type": "American",
          "equipment_needed": ["oven"],
          "is_meal_prep": false,
          "is_leftover": false,
          "ingredients": [
            {
              "name": "chicken breast",
              "quantity": "2",
              "unit": "lbs",
              "estimated_cost": 8.00,
              "category": "meat_seafood",
              "store_section": "Meat & Seafood"
            }
          ],
          "instructions": [
            "Preheat oven to 400°F",
            "Season chicken with salt, pepper, and herbs",
            "Bake for 20-25 minutes until cooked through"
          ]
        }
      ]
    }
  ],
  "shopping_items": [
    {
      "name": "chicken breast",
      "quantity": "2",
      "unit": "lbs",
      "category": "meat_seafood",
      "store_section": "Meat & Seafood",
      "estimated_cost": 8.00,
      "preferred_store": "${prefs.preferred_stores?.[0] || ""}",
      "meal_names": ["Recipe Name 1", "Recipe Name 2"],
      "in_pantry": false
    }
  ]
}

Important:
- Each meal must have 2-3 recipe options in the "options" array
- The first option should be the recommended one
- Shopping items should be consolidated (don't list chicken twice)
- Mark in_pantry: true for items from the user's pantry list
- Total estimated_cost should be sum of all non-pantry shopping items
- For leftovers meals: set is_leftover: true and note the source meal`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 16000,
      messages: [{ role: "user", content: userPrompt }],
      system: systemPrompt,
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    let generatedPlan;
    try {
      // Extract JSON if wrapped in markdown
      const jsonText = content.text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      generatedPlan = JSON.parse(jsonText);
    } catch {
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

    // Save planned meals — we save the first (recommended) option as the default
    // but store all options as JSON in instructions for reference
    const mealsToInsert = generatedPlan.meals.flatMap((mealSlot: {
      day: string;
      meal_type: string;
      options: Array<{
        meal_name: string;
        description?: string;
        servings: number;
        prep_time: number;
        cook_time: number;
        estimated_cost: number;
        calories_per_serving?: number;
        is_meal_prep?: boolean;
        is_leftover?: boolean;
        ingredients?: unknown[];
        instructions?: string[];
        cuisine_type?: string;
        equipment_needed?: string[];
      }>;
    }) => {
      const primary = mealSlot.options[0];
      return {
        meal_plan_id: mealPlan.id,
        user_id: user.id,
        day: mealSlot.day,
        meal_type: mealSlot.meal_type,
        meal_name: primary.meal_name,
        description: primary.description || "",
        servings: primary.servings,
        prep_time: primary.prep_time,
        cook_time: primary.cook_time,
        estimated_cost: primary.estimated_cost,
        calories_per_serving: primary.calories_per_serving || null,
        is_meal_prep: primary.is_meal_prep || false,
        is_leftover: primary.is_leftover || false,
        ingredients: primary.ingredients || [],
        // Store all options in instructions field as a special marker
        instructions: [
          "__OPTIONS__:" + JSON.stringify(mealSlot.options),
          ...(primary.instructions || []),
        ],
        cuisine_type: primary.cuisine_type || null,
        equipment_needed: primary.equipment_needed || [],
      };
    });

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
        unit?: string;
        category?: string;
        store_section?: string;
        estimated_cost?: number;
        preferred_store?: string;
        meal_names?: string[];
        in_pantry?: boolean;
      }) => ({
        shopping_list_id: shoppingList.id,
        user_id: user.id,
        name: item.name,
        quantity: item.quantity || "",
        unit: item.unit || "",
        category: item.category || "other",
        store_section: item.store_section || "",
        estimated_cost: item.estimated_cost || 0,
        preferred_store: item.preferred_store || null,
        meal_names: item.meal_names || [],
        in_pantry: item.in_pantry || false,
        checked: item.in_pantry || false, // auto-check pantry items
      }));

      await supabase.from("shopping_items").insert(itemsToInsert);
    }

    // Send notification email/SMS if enabled
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
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
