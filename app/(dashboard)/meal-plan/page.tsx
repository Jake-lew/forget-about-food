"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatShortDate, formatCurrency, minutesToHoursAndMinutes, getEmojiForMealType } from "@/lib/utils";
import type { PlannedMeal, MealPlan } from "@/types";

const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"] as const;
const MEAL_TYPES = ["breakfast","lunch","dinner","snack"] as const;

export default function MealPlanPage() {
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [meals, setMeals] = useState<PlannedMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState<PlannedMeal | null>(null);
  const supabase = createClient();

  useEffect(() => { loadPlan(); }, []);

  const loadPlan = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: p } = await supabase.from("meal_plans").select("*").eq("user_id", user.id).eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (p) {
      setPlan(p);
      const { data: m } = await supabase.from("planned_meals").select("*").eq("meal_plan_id", p.id).order("day").order("meal_type");
      setMeals((m as PlannedMeal[]) || []);
    }
    setLoading(false);
  };

  const rateMeal = async (mealId: string, liked: boolean) => {
    await supabase.from("planned_meals").update({ liked }).eq("id", mealId);
    setMeals(m => m.map(meal => meal.id === mealId ? { ...meal, liked } : meal));
  };

  const getMealsForSlot = (day: string, type: string) =>
    meals.filter(m => m.day === day && m.meal_type === type);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="skeleton h-10 w-64 mb-8 rounded-2xl" />
      <div className="grid grid-cols-7 gap-3">
        {Array.from({length:21}).map((_,i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
      </div>
    </div>
  );

  if (!plan) return (
    <div className="max-w-4xl mx-auto px-6 py-16 text-center">
      <div className="text-6xl mb-4">📅</div>
      <h2 className="text-2xl font-bold mb-3" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>No active meal plan</h2>
      <p style={{ color: "#72492C" }}>Head to the dashboard to generate your first meal plan.</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>
            Meal Plan 🍽️
          </h1>
          <p style={{ color: "#72492C" }}>
            {formatShortDate(plan.week_start)} – {formatShortDate(plan.week_end)} · {meals.length} meals planned
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm" style={{ color: "#AD7B54" }}>Est. cost</p>
          <p className="text-2xl font-bold" style={{ color: "#D96B3D", fontFamily: "'Playfair Display', serif" }}>{formatCurrency(plan.total_estimated_cost)}</p>
        </div>
      </div>

      {/* Meal grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-center">
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "#D96B3D" }}>
                  {day.slice(0,3).toUpperCase()}
                </p>
              </div>
            ))}
          </div>

          {/* Meal rows */}
          {MEAL_TYPES.map(type => (
            <div key={type} className="mb-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span>{getEmojiForMealType(type)}</span>
                <p className="text-xs font-semibold uppercase tracking-wide capitalize" style={{ color: "#AD7B54" }}>{type}</p>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {DAYS.map(day => {
                  const slotMeals = getMealsForSlot(day, type);
                  if (slotMeals.length === 0) {
                    return <div key={day} className="rounded-xl p-2 min-h-[80px] border border-dashed" style={{ borderColor: "#F0E4D7" }} />;
                  }
                  return slotMeals.map(meal => (
                    <button
                      key={meal.id}
                      onClick={() => setSelectedMeal(meal)}
                      className="rounded-xl p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md border min-h-[80px]"
                      style={{ backgroundColor: meal.is_leftover ? "#F2F6F2" : meal.is_meal_prep ? "#FEF3C7" : "#FFFDF9", borderColor: meal.is_leftover ? "#C3D9C1" : meal.is_meal_prep ? "#FDE68A" : "#F0E4D7" }}
                    >
                      <p className="text-xs font-semibold leading-tight mb-1" style={{ color: "#3C271A" }}>{meal.meal_name}</p>
                      <div className="flex items-center gap-1 flex-wrap">
                        {meal.is_leftover && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#E2EDE1", color: "#345531" }}>leftovers</span>}
                        {meal.is_meal_prep && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#FDE68A", color: "#92400E" }}>prep</span>}
                        <span className="text-xs" style={{ color: "#AD7B54" }}>{minutesToHoursAndMinutes(meal.prep_time + meal.cook_time)}</span>
                      </div>
                      {meal.liked !== null && (
                        <p className="text-sm mt-1">{meal.liked ? "👍" : "👎"}</p>
                      )}
                    </button>
                  ));
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-6">
        {[
          { color: "#FFFDF9", border: "#F0E4D7", label: "Regular meal" },
          { color: "#F2F6F2", border: "#C3D9C1", label: "Leftovers" },
          { color: "#FEF3C7", border: "#FDE68A", label: "Meal prep batch" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border" style={{ backgroundColor: l.color, borderColor: l.border }} />
            <span className="text-xs" style={{ color: "#AD7B54" }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Meal detail modal */}
      {selectedMeal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedMeal(null)}>
          <div className="max-w-lg w-full rounded-3xl p-6 max-h-[80vh] overflow-y-auto" style={{ backgroundColor: "#FFFDF9" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>{selectedMeal.meal_name}</h3>
              <button onClick={() => setSelectedMeal(null)} className="text-2xl" style={{ color: "#AD7B54" }}>×</button>
            </div>
            {selectedMeal.description && <p className="text-sm mb-4" style={{ color: "#72492C" }}>{selectedMeal.description}</p>}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                ["⏱️ Prep", `${selectedMeal.prep_time}m`],
                ["🔥 Cook", `${selectedMeal.cook_time}m`],
                ["💰 Cost", formatCurrency(selectedMeal.estimated_cost)],
              ].map(([label, val]) => (
                <div key={label} className="rounded-xl p-3 text-center" style={{ backgroundColor: "#FAF0DE" }}>
                  <p className="text-xs" style={{ color: "#AD7B54" }}>{label}</p>
                  <p className="font-bold" style={{ color: "#3C271A" }}>{val}</p>
                </div>
              ))}
            </div>
            {Array.isArray(selectedMeal.ingredients) && selectedMeal.ingredients.length > 0 && (
              <div className="mb-5">
                <h4 className="font-semibold mb-2" style={{ color: "#3C271A" }}>Ingredients</h4>
                <ul className="space-y-1">
                  {(selectedMeal.ingredients as Array<{quantity: string; unit: string; name: string}>).map((ing, i) => (
                    <li key={i} className="text-sm flex gap-2" style={{ color: "#72492C" }}>
                      <span className="font-medium" style={{ color: "#D96B3D" }}>{ing.quantity} {ing.unit}</span>
                      {ing.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selectedMeal.instructions && selectedMeal.instructions.length > 0 && (
              <div className="mb-5">
                <h4 className="font-semibold mb-2" style={{ color: "#3C271A" }}>Instructions</h4>
                <ol className="space-y-2">
                  {selectedMeal.instructions.map((step, i) => (
                    <li key={i} className="text-sm flex gap-3" style={{ color: "#72492C" }}>
                      <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "#FAE5DB", color: "#D96B3D" }}>{i+1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: "#3C271A" }}>Rate this meal</p>
              <div className="flex gap-3">
                <button onClick={() => rateMeal(selectedMeal.id, true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition-all" style={selectedMeal.liked === true ? { backgroundColor: "#E2EDE1", borderColor: "#5A8A56", color: "#345531" } : { borderColor: "#F0E4D7", color: "#72492C" }}>
                  👍 Loved it
                </button>
                <button onClick={() => rateMeal(selectedMeal.id, false)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition-all" style={selectedMeal.liked === false ? { backgroundColor: "#FEE2E2", borderColor: "#EF4444", color: "#991B1B" } : { borderColor: "#F0E4D7", color: "#72492C" }}>
                  👎 Not for me
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
