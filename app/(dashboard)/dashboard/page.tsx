"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { formatCurrency, formatShortDate } from "@/lib/utils";

export default function DashboardPage() {
  const [profile, setProfile] = useState<{full_name: string|null; email: string} | null>(null);
  const [activePlan, setActivePlan] = useState<{id: string; week_start: string; week_end: string; total_estimated_cost: number} | null>(null);
  const [mealCount, setMealCount] = useState(0);
  const [shoppingList, setShoppingList] = useState<{id: string; total_estimated_cost: number} | null>(null);
  const [uncheckedCount, setUncheckedCount] = useState(0);
  const [prefs, setPrefs] = useState<{weekly_budget: number} | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [{ data: prof }, { data: plan }, { data: pref }] = await Promise.all([
      supabase.from("profiles").select("full_name, email").eq("id", user.id).single(),
      supabase.from("meal_plans").select("id, week_start, week_end, total_estimated_cost").eq("user_id", user.id).eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("user_preferences").select("weekly_budget").eq("user_id", user.id).maybeSingle(),
    ]);
    setProfile(prof);
    setPrefs(pref);
    if (plan) {
      setActivePlan(plan);
      const [{ count }, { data: sl }] = await Promise.all([
        supabase.from("planned_meals").select("*", { count: "exact", head: true }).eq("meal_plan_id", plan.id),
        supabase.from("shopping_lists").select("id, total_estimated_cost").eq("meal_plan_id", plan.id).maybeSingle(),
      ]);
      setMealCount(count || 0);
      if (sl) {
        setShoppingList(sl);
        const { count: unc } = await supabase.from("shopping_items").select("*", { count: "exact", head: true }).eq("shopping_list_id", sl.id).eq("checked", false);
        setUncheckedCount(unc || 0);
      }
    }
    setLoading(false);
  };

  const generatePlan = async () => {
    setGenerating(true);
    try {
      const resp = await fetch("/api/generate-meal-plan", { method: "POST" });
      if (resp.ok) { await loadData(); }
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="skeleton h-10 w-64 mb-8 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>
          {greeting}, {firstName}! 👋
        </h1>
        <p className="mt-1" style={{ color: "#72492C" }}>
          {activePlan ? `Your meal plan for the week of ${formatShortDate(activePlan.week_start)} is ready.` : "Let's set up your first meal plan."}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Meals planned", value: activePlan ? `${mealCount} meals` : "—", emoji: "🍽️", color: "#D96B3D" },
          { label: "Est. grocery cost", value: activePlan ? formatCurrency(activePlan.total_estimated_cost) : "—", emoji: "💰", color: "#5A8A56" },
          { label: "Budget remaining", value: (activePlan && prefs) ? formatCurrency(prefs.weekly_budget - activePlan.total_estimated_cost) : "—", emoji: "📊", color: "#F59E0B" },
          { label: "Items left to buy", value: shoppingList ? `${uncheckedCount} items` : "—", emoji: "🛒", color: "#8B5CF6" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl p-5 border" style={{ backgroundColor: "#FFFDF9", borderColor: "#F0E4D7" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium" style={{ color: "#AD7B54" }}>{stat.label}</span>
              <span className="text-xl">{stat.emoji}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: stat.color, fontFamily: "'Playfair Display', serif" }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main actions */}
      {!activePlan ? (
        <div className="rounded-3xl border p-10 text-center" style={{ backgroundColor: "#FFFDF9", borderColor: "#F0E4D7" }}>
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>
            Generate your first meal plan
          </h2>
          <p className="mb-8 max-w-md mx-auto" style={{ color: "#72492C" }}>
            AI will build you a full week of personalized meals, complete with recipes and a smart shopping list.
          </p>
          <button
            onClick={generatePlan}
            disabled={generating}
            className="text-white font-semibold px-8 py-4 rounded-2xl transition-all disabled:opacity-60 text-lg"
            style={{ backgroundColor: "#D96B3D" }}
          >
            {generating ? "✨ Generating your plan…" : "✨ Generate my meal plan"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Meal plan card */}
          <Link href="/meal-plan" className="rounded-3xl border p-6 block transition-all hover:-translate-y-0.5 hover:shadow-lg" style={{ backgroundColor: "#FFFDF9", borderColor: "#F0E4D7" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#D96B3D" }}>This week</p>
                <h2 className="text-xl font-bold" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>Meal Plan</h2>
              </div>
              <span className="text-3xl">📅</span>
            </div>
            <p className="text-sm mb-4" style={{ color: "#72492C" }}>
              {formatShortDate(activePlan.week_start)} – {formatShortDate(activePlan.week_end)} · {mealCount} meals
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ backgroundColor: "#FAE5DB", color: "#9E4226" }}>View full plan →</span>
              <p className="text-lg font-bold" style={{ color: "#D96B3D" }}>{formatCurrency(activePlan.total_estimated_cost)}</p>
            </div>
          </Link>

          {/* Shopping list card */}
          <Link href="/shopping-list" className="rounded-3xl border p-6 block transition-all hover:-translate-y-0.5 hover:shadow-lg" style={{ backgroundColor: "#FFFDF9", borderColor: "#F0E4D7" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#5A8A56" }}>Ready to shop</p>
                <h2 className="text-xl font-bold" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>Shopping List</h2>
              </div>
              <span className="text-3xl">🛒</span>
            </div>
            <p className="text-sm mb-4" style={{ color: "#72492C" }}>
              {uncheckedCount} items remaining · Sorted by store
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ backgroundColor: "#E2EDE1", color: "#345531" }}>Open list →</span>
              <p className="text-lg font-bold" style={{ color: "#5A8A56" }}>{shoppingList ? formatCurrency(shoppingList.total_estimated_cost) : "—"}</p>
            </div>
          </Link>

          {/* Generate new plan */}
          <div className="rounded-3xl border p-6 flex items-center gap-5" style={{ backgroundColor: "#FAF0DE", borderColor: "#F0E4D7" }}>
            <span className="text-4xl">🔄</span>
            <div className="flex-1">
              <h3 className="font-bold mb-1" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>Regenerate Plan</h3>
              <p className="text-sm" style={{ color: "#72492C" }}>Not feeling this week&apos;s menu? Generate a fresh one.</p>
            </div>
            <button onClick={generatePlan} disabled={generating} className="text-white text-sm font-medium px-4 py-2 rounded-xl flex-shrink-0 disabled:opacity-60" style={{ backgroundColor: "#D96B3D" }}>
              {generating ? "…" : "Regenerate"}
            </button>
          </div>

          {/* Pantry */}
          <Link href="/pantry" className="rounded-3xl border p-6 flex items-center gap-5 transition-all hover:-translate-y-0.5" style={{ backgroundColor: "#FFFDF9", borderColor: "#F0E4D7" }}>
            <span className="text-4xl">🫙</span>
            <div>
              <h3 className="font-bold mb-1" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>Pantry</h3>
              <p className="text-sm" style={{ color: "#72492C" }}>Keep your pantry updated to save money every week.</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
