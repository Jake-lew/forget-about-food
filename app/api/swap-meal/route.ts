import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { mealId, optionIndex } = await request.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: meal } = await supabase.from("planned_meals").select("*").eq("id", mealId).eq("user_id", user.id).single();
  if (!meal) return NextResponse.json({ error: "Meal not found" }, { status: 404 });

  const optionLine = meal.instructions?.find((l: string) => l.startsWith("__OPTIONS__:"));
  if (!optionLine) return NextResponse.json({ error: "No options available" }, { status: 400 });

  const options = JSON.parse(optionLine.replace("__OPTIONS__:", ""));
  const chosen = options[optionIndex];
  if (!chosen) return NextResponse.json({ error: "Invalid option" }, { status: 400 });

  await supabase.from("planned_meals").update({
    meal_name: chosen.meal_name,
    description: chosen.description || "",
    prep_time: chosen.prep_time,
    cook_time: chosen.cook_time,
    estimated_cost: chosen.estimated_cost,
    calories_per_serving: chosen.calories_per_serving || null,
    is_meal_prep: chosen.is_meal_prep || false,
    is_leftover: chosen.is_leftover || false,
    ingredients: chosen.ingredients || [],
    instructions: ["__OPTIONS__:" + JSON.stringify(options), ...(chosen.instructions || [])],
    cuisine_type: chosen.cuisine_type || null,
    equipment_needed: chosen.equipment_needed || [],
    liked: null,
  }).eq("id", mealId);

  return NextResponse.json({ success: true, meal: chosen });
}
