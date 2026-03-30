"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { formatCurrency, formatShortDate } from "@/lib/utils";

const TIER_LIMITS: Record<string, number> = {
  starter: 2,
  pro: 5,
  chef: Infinity,
};

const TIER_NAMES: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
  chef: "Chef",
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<{ full_name: string | null; email: string; subscription_tier: string; is_superadmin: boolean; trial_ends_at: string | null } | null>(null);
  const [activePlan, setActivePlan] = useState<{ id: string; week_start: string; week_end: string; total_estimated_cost: number } | null>(null);
  const [mealCount, setMealCount] = useState(0);
  const [shoppingList, setShoppingList] = useState<{ id: string; total_estimated_cost: number } | null>(null);
  const [uncheckedCount, setUncheckedCount] = useState(0);
  const [prefs, setPrefs] = useState<{ weekly_budget: number } | null>(null);
  const [regenUsed, setRegenUsed] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { loadData(); }, []);

  const getCurrentWeekOf = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(new Date().setDate(diff));
    return monday.toISOString().split("T")[0];
  };

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const weekOf = getCurrentWeekOf();

    const [{ data: prof }, { data: plan }, { data: pref }, { data: usage }] = await Promise.all([
      supabase.from("profiles").select("full_name, email, subscription_tier, is_superadmin, trial_ends_at").eq("id", user.id).single(),
      supabase.from("meal_plans").select("id, week_start, week_end, total_estimated_cost").eq("user_id", user.id).eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("user_preferences").select("weekly_budget").eq("user_id", user.id).maybeSingle(),
      supabase.from("usage_tracking").select("meal_plan_regenerations").eq("user_id", user.id).eq("week_of", weekOf).maybeSingle(),
    ]);

    setProfile(prof);
    setPrefs(pref);
    setRegenUsed(usage?.meal_plan_regenerations || 0);

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
    setGenerateError("");
    try {
      const resp = await fetch("/api/generate-meal-plan", { method: "POST" });
      if (resp.ok) {
        await loadData();
      } else {
        const body = await resp.json().catch(() => ({}));
        if (resp.status === 403 && body.error === "limit_reached") {
          setGenerateError(`limit_reached:${body.tier}`);
        } else if (resp.status === 400 && body.error?.includes("onboarding")) {
          window.location.href = "/onboarding";
        } else {
          setGenerateError(body.error || "Something went wrong. Please try again.");
        }
      }
    } catch {
      setGenerateError("Network error. Please check your connection and try again.");
    }
    setGenerating(false);
  };

  const tier = profile?.subscription_tier || "starter";
  const limit = TIER_LIMITS[tier] ?? 2;
  const isTrialing = profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date();
  const effectiveLimit = (profile?.is_superadmin || isTrialing) ? Infinity : limit;
  const regenRemaining = effectiveLimit === Infinity ? Infinity : Math.max(0, effectiveLimit - regenUsed);
  const atLimit = regenRemaining === 0;

  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const isLimitError = generateError.startsWith("limit_reached:");

  const cardStyle = {
    borderRadius: "16px",
    border: "1px solid #E8D5C4",
    backgroundColor: "#FFFDF9",
    padding: "24px",
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ height: "40px", width: "280px", backgroundColor: "#F0E4D7", borderRadius: "8px", marginBottom: "32px", animation: "pulse 1.5s ease infinite" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: "100px", backgroundColor: "#F0E4D7", borderRadius: "12px" }} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px", fontFamily: "'Inter', sans-serif" }}>

      {/* Greeting row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 700, color: "#3C271A", marginBottom: "6px" }}>
            {greeting}, {firstName}
          </h1>
          <p style={{ fontSize: "15px", color: "#72492C" }}>
            {activePlan
              ? `Your meal plan for the week of ${formatShortDate(activePlan.week_start)} is ready.`
              : "Ready to plan your week?"}
          </p>
        </div>

        {/* Tier + regen badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {isTrialing && (
            <span style={{ fontSize: "12px", fontWeight: 600, padding: "4px 10px", borderRadius: "20px", backgroundColor: "#EDE9FE", color: "#6D28D9" }}>
              Free trial active
            </span>
          )}
          <span style={{ fontSize: "12px", fontWeight: 600, padding: "5px 12px", borderRadius: "20px", backgroundColor: "#FAE5DB", color: "#9E4226" }}>
            {TIER_NAMES[tier]} plan
          </span>
          {effectiveLimit !== Infinity && (
            <span style={{ fontSize: "12px", color: "#AD7B54" }}>
              {regenRemaining} of {effectiveLimit} regenerations left this week
            </span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        {[
          { label: "Meals planned", value: activePlan ? `${mealCount}` : "—", unit: activePlan ? "meals" : "", accent: "#D96B3D" },
          { label: "Grocery estimate", value: activePlan ? formatCurrency(activePlan.total_estimated_cost) : "—", unit: "", accent: "#5A8A56" },
          { label: "Budget remaining", value: (activePlan && prefs) ? formatCurrency(prefs.weekly_budget - activePlan.total_estimated_cost) : "—", unit: "", accent: "#3C271A" },
          { label: "Items to buy", value: shoppingList ? `${uncheckedCount}` : "—", unit: shoppingList ? "items" : "", accent: "#AD7B54" },
        ].map((stat) => (
          <div key={stat.label} style={cardStyle}>
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#AD7B54", marginBottom: "10px" }}>{stat.label}</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: 700, color: stat.accent }}>
              {stat.value} <span style={{ fontSize: "14px", fontWeight: 400, color: "#AD7B54" }}>{stat.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Limit reached banner */}
      {(isLimitError || atLimit) && (
        <div style={{ marginBottom: "24px", padding: "20px 24px", borderRadius: "14px", backgroundColor: "#FFF7ED", border: "1px solid #FED7AA", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <p style={{ fontWeight: 600, color: "#92400E", marginBottom: "4px" }}>Weekly regeneration limit reached</p>
            <p style={{ fontSize: "14px", color: "#B45309" }}>
              Your {TIER_NAMES[tier]} plan includes {limit} regenerations per week. Upgrade to generate more.
            </p>
          </div>
          <Link href="/pricing" style={{ padding: "10px 20px", borderRadius: "10px", backgroundColor: "#D96B3D", color: "#fff", fontWeight: 600, fontSize: "14px", textDecoration: "none", whiteSpace: "nowrap" }}>
            Upgrade plan
          </Link>
        </div>
      )}

      {/* Error banner (non-limit errors) */}
      {generateError && !isLimitError && (
        <div style={{ marginBottom: "24px", padding: "16px 20px", borderRadius: "12px", backgroundColor: "#FEE2E2", border: "1px solid #FECACA", display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <div style={{ width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#DC2626", flexShrink: 0, marginTop: "1px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: "11px", fontWeight: 700 }}>!</span>
          </div>
          <div>
            <p style={{ fontWeight: 600, color: "#991B1B", marginBottom: "3px" }}>Could not generate meal plan</p>
            <p style={{ fontSize: "13px", color: "#B91C1C" }}>{generateError}</p>
          </div>
        </div>
      )}

      {/* Main content */}
      {!activePlan ? (
        <div style={{ ...cardStyle, padding: "56px 32px", textAlign: "center", borderRadius: "20px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#FAE5DB", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D96B3D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
              <path d="M12 8v4l3 3"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 700, color: "#3C271A", marginBottom: "12px" }}>
            Generate your first meal plan
          </h2>
          <p style={{ fontSize: "15px", color: "#72492C", maxWidth: "420px", margin: "0 auto 32px", lineHeight: "1.7" }}>
            AI will build you a full week of personalized meals, complete with a smart shopping list tailored to your preferences.
          </p>
          <button
            onClick={generatePlan}
            disabled={generating || atLimit}
            style={{
              backgroundColor: atLimit ? "#E8D5C4" : "#D96B3D",
              color: atLimit ? "#AD7B54" : "#fff",
              fontWeight: 600,
              fontSize: "15px",
              padding: "14px 32px",
              borderRadius: "12px",
              border: "none",
              cursor: (generating || atLimit) ? "not-allowed" : "pointer",
              transition: "opacity 0.15s",
            }}
          >
            {generating ? "Generating your plan..." : atLimit ? "Upgrade to generate" : "Generate my meal plan"}
          </button>
          {atLimit && (
            <p style={{ marginTop: "12px", fontSize: "13px", color: "#AD7B54" }}>
              <Link href="/pricing" style={{ color: "#D96B3D", textDecoration: "none", fontWeight: 500 }}>View upgrade options</Link>
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {/* Meal plan card */}
          <Link href="/meal-plan" style={{ ...cardStyle, display: "block", textDecoration: "none", borderRadius: "16px", transition: "box-shadow 0.15s, transform 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(60,39,26,0.1)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#D96B3D", marginBottom: "4px" }}>This week</p>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: "#3C271A" }}>Meal Plan</h2>
              </div>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#FAE5DB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D96B3D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "#72492C", marginBottom: "16px" }}>
              {formatShortDate(activePlan.week_start)} – {formatShortDate(activePlan.week_end)} &middot; {mealCount} meals
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: 500, color: "#9E4226" }}>View full plan →</span>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: "#D96B3D" }}>{formatCurrency(activePlan.total_estimated_cost)}</p>
            </div>
          </Link>

          {/* Shopping list card */}
          <Link href="/shopping-list" style={{ ...cardStyle, display: "block", textDecoration: "none", borderRadius: "16px", transition: "box-shadow 0.15s, transform 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(60,39,26,0.1)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5A8A56", marginBottom: "4px" }}>Ready to shop</p>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: "#3C271A" }}>Shopping List</h2>
              </div>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#E2EDE1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5A8A56" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                </svg>
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "#72492C", marginBottom: "16px" }}>
              {uncheckedCount} items remaining &middot; Sorted by store section
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: 500, color: "#345531" }}>Open list →</span>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: "#5A8A56" }}>{shoppingList ? formatCurrency(shoppingList.total_estimated_cost) : "—"}</p>
            </div>
          </Link>

          {/* Regenerate card */}
          <div style={{ ...cardStyle, backgroundColor: "#FAF0DE", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px" }}>
            <div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 700, color: "#3C271A", marginBottom: "6px" }}>New plan</h3>
              <p style={{ fontSize: "13px", color: "#72492C", lineHeight: "1.6" }}>
                {atLimit
                  ? `You've used all ${limit} generations this week. Upgrade for more.`
                  : "Not feeling this week's menu? Generate a fresh one."}
              </p>
              {effectiveLimit !== Infinity && (
                <p style={{ fontSize: "12px", color: "#AD7B54", marginTop: "8px" }}>
                  {regenRemaining} of {effectiveLimit} uses remaining this week
                </p>
              )}
            </div>
            {atLimit ? (
              <Link href="/pricing" style={{ padding: "11px 20px", borderRadius: "10px", backgroundColor: "#D96B3D", color: "#fff", fontWeight: 600, fontSize: "14px", textDecoration: "none", textAlign: "center" }}>
                Upgrade plan
              </Link>
            ) : (
              <button
                onClick={generatePlan}
                disabled={generating}
                style={{ padding: "11px 20px", borderRadius: "10px", border: "none", cursor: generating ? "not-allowed" : "pointer", backgroundColor: "#3C271A", color: "#FDF8F0", fontWeight: 600, fontSize: "14px", opacity: generating ? 0.7 : 1 }}
              >
                {generating ? "Generating..." : "Regenerate"}
              </button>
            )}
          </div>

          {/* Pantry card */}
          <Link href="/pantry" style={{ ...cardStyle, display: "flex", alignItems: "center", gap: "20px", textDecoration: "none", borderRadius: "16px", transition: "box-shadow 0.15s, transform 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(60,39,26,0.1)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
          >
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", backgroundColor: "#FAE5DB", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D96B3D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22V12M12 12C12 12 7 10 7 5a5 5 0 0110 0c0 5-5 7-5 7z"/>
              </svg>
            </div>
            <div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 700, color: "#3C271A", marginBottom: "4px" }}>Pantry</h3>
              <p style={{ fontSize: "13px", color: "#72492C" }}>Track what you have to reduce waste and save money.</p>
            </div>
          </Link>
        </div>
      )}

      {/* Manage subscription link */}
      {profile?.subscription_tier === "starter" ? (
        <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid #E8D5C4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: "13px", color: "#AD7B54" }}>
            On the {TIER_NAMES[tier]} plan &middot; {effectiveLimit === Infinity ? "Unlimited" : `${regenRemaining} of ${effectiveLimit}`} generations remaining this week
          </p>
          <Link href="/pricing" style={{ fontSize: "13px", color: "#D96B3D", textDecoration: "none", fontWeight: 500 }}>
            View plans
          </Link>
        </div>
      ) : null}
    </div>
  );
}
