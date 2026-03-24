"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DIETARY_OPTIONS, ALLERGY_OPTIONS, CUISINE_OPTIONS, EQUIPMENT_OPTIONS, DAY_OPTIONS, POPULAR_STORES } from "@/lib/utils";

const STEPS = [
  { id: "welcome", title: "Welcome!", emoji: "👋" },
  { id: "household", title: "Your Household", emoji: "🏠" },
  { id: "dietary", title: "Diet & Allergies", emoji: "🥗" },
  { id: "cuisines", title: "Favorite Cuisines", emoji: "🌍" },
  { id: "cooking", title: "Cooking Setup", emoji: "👨‍🍳" },
  { id: "planning", title: "Planning Style", emoji: "📅" },
  { id: "stores", title: "Your Stores", emoji: "🛒" },
  { id: "notifications", title: "Notifications", emoji: "📧" },
];

const defaultData = {
  household_size: 2,
  weekly_budget: 150,
  dietary_restrictions: [] as string[],
  allergies: [] as string[],
  disliked_ingredients: "",
  liked_cuisines: [] as string[],
  cooking_equipment: ["oven", "stovetop"] as string[],
  max_weekday_cook_time: 30,
  max_weekend_cook_time: 60,
  meal_prep_enabled: false,
  leftovers_for_lunch: true,
  shopping_day: "sunday",
  week_start_day: "monday",
  preferred_stores: [] as string[],
  custom_store: "",
  plan_breakfast: true,
  plan_lunch: true,
  plan_dinner: true,
  plan_snacks: false,
  email_notifications: true,
  sms_notifications: false,
  phone_number: "",
};

function Pill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2 rounded-xl text-sm font-medium border transition-all"
      style={selected ? { backgroundColor: "#FAE5DB", borderColor: "#D96B3D", color: "#9E4226" } : { backgroundColor: "#FFFDF9", borderColor: "#F0E4D7", color: "#72492C" }}
    >
      {label}
    </button>
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(defaultData);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const toggle = (key: keyof typeof data, value: string) => {
    const arr = data[key] as string[];
    setData((d) => ({ ...d, [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] }));
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const progress = ((step) / (STEPS.length - 1)) * 100;

  const save = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const stores = [...data.preferred_stores, ...(data.custom_store ? [data.custom_store] : [])];
    const disliked = data.disliked_ingredients.split(",").map(s => s.trim()).filter(Boolean);

    await supabase.from("user_preferences").upsert({
      user_id: user.id,
      household_size: data.household_size,
      weekly_budget: data.weekly_budget,
      dietary_restrictions: data.dietary_restrictions,
      allergies: data.allergies,
      disliked_ingredients: disliked,
      liked_cuisines: data.liked_cuisines,
      cooking_equipment: data.cooking_equipment,
      max_weekday_cook_time: data.max_weekday_cook_time,
      max_weekend_cook_time: data.max_weekend_cook_time,
      meal_prep_enabled: data.meal_prep_enabled,
      leftovers_for_lunch: data.leftovers_for_lunch,
      shopping_day: data.shopping_day,
      week_start_day: data.week_start_day,
      preferred_stores: stores,
      plan_breakfast: data.plan_breakfast,
      plan_lunch: data.plan_lunch,
      plan_dinner: data.plan_dinner,
      plan_snacks: data.plan_snacks,
    });

    await supabase.from("profiles").update({
      onboarding_completed: true,
      email_notifications: data.email_notifications,
      sms_notifications: data.sms_notifications,
      phone_number: data.phone_number || null,
    }).eq("id", user.id);

    router.push("/dashboard?new=true");
  };

  const inputStyle = {
    backgroundColor: "#FFFDF9", borderColor: "#F0E4D7", color: "#3C271A",
    border: "1px solid #F0E4D7", borderRadius: "0.75rem", padding: "0.625rem 1rem",
    width: "100%", fontSize: "0.875rem", outline: "none"
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FDF8F0" }}>
      {/* Header */}
      <header className="px-6 py-4 border-b" style={{ borderColor: "#F0E4D7", backgroundColor: "#FFFDF9" }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍽️</span>
            <span className="font-bold" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>Forget About Food</span>
          </div>
          <span className="text-sm" style={{ color: "#AD7B54" }}>Step {step + 1} of {STEPS.length}</span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1.5" style={{ backgroundColor: "#F0E4D7" }}>
        <div className="h-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: "#D96B3D" }} />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Step header */}
          <div className="text-center mb-10">
            <div className="text-5xl mb-4">{STEPS[step].emoji}</div>
            <h2 className="text-3xl font-bold" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>
              {STEPS[step].title}
            </h2>
          </div>

          {/* Step content */}
          <div className="rounded-3xl border p-8" style={{ backgroundColor: "#FFFDF9", borderColor: "#F0E4D7" }}>
            {step === 0 && (
              <div className="text-center space-y-4">
                <p className="text-xl" style={{ color: "#3C271A" }}>Hey there! I&apos;m about to build your <strong>perfect weekly meal plan</strong>.</p>
                <p style={{ color: "#72492C" }}>
                  In just a few quick steps I&apos;ll learn your preferences, budget, cooking style, and schedule—then I&apos;ll generate a meal plan tailored just for you every single week.
                </p>
                <div className="grid grid-cols-3 gap-4 mt-8">
                  {[["3 min","to set up"],["AI-powered","meal plans"],["Delivered","to your inbox"]].map(([v,l]) => (
                    <div key={l} className="rounded-2xl p-4" style={{ backgroundColor: "#FAF0DE" }}>
                      <p className="font-bold text-lg" style={{ color: "#D96B3D" }}>{v}</p>
                      <p className="text-xs" style={{ color: "#72492C" }}>{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#3C271A" }}>How many people are you cooking for?</label>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setData(d => ({ ...d, household_size: Math.max(1, d.household_size - 1) }))} className="w-10 h-10 rounded-xl border text-xl font-bold transition-all" style={{ borderColor: "#F0E4D7", color: "#D96B3D" }}>−</button>
                    <span className="text-3xl font-bold w-12 text-center" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>{data.household_size}</span>
                    <button onClick={() => setData(d => ({ ...d, household_size: Math.min(12, d.household_size + 1) }))} className="w-10 h-10 rounded-xl border text-xl font-bold transition-all" style={{ borderColor: "#F0E4D7", color: "#D96B3D" }}>+</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#3C271A" }}>Weekly grocery budget</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium" style={{ color: "#AD7B54" }}>$</span>
                    <input type="number" value={data.weekly_budget} onChange={e => setData(d => ({...d, weekly_budget: +e.target.value}))} className="w-full pl-8 py-3 rounded-xl border outline-none text-sm" style={inputStyle} min={20} max={1000} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: "#AD7B54" }}>Suggested: $75–$200/week for {data.household_size} {data.household_size === 1 ? "person" : "people"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: "#3C271A" }}>Which meals do you want planned?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[["plan_breakfast","🌅 Breakfast"],["plan_lunch","☀️ Lunch"],["plan_dinner","🌙 Dinner"],["plan_snacks","🍎 Snacks"]].map(([key, label]) => (
                      <button key={key} type="button" onClick={() => setData(d => ({ ...d, [key]: !d[key as keyof typeof d] }))}
                        className="flex items-center gap-3 p-3 rounded-xl border transition-all text-sm font-medium"
                        style={(data[key as keyof typeof data] as boolean) ? { backgroundColor: "#FAE5DB", borderColor: "#D96B3D", color: "#9E4226" } : { backgroundColor: "#FFFDF9", borderColor: "#F0E4D7", color: "#72492C" }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: "#3C271A" }}>Dietary preferences</label>
                  <div className="flex flex-wrap gap-2">
                    {DIETARY_OPTIONS.map(o => (
                      <Pill key={o.value} label={`${o.emoji} ${o.label}`} selected={data.dietary_restrictions.includes(o.value)} onClick={() => toggle("dietary_restrictions", o.value)} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: "#3C271A" }}>Allergies (will never be included)</label>
                  <div className="flex flex-wrap gap-2">
                    {ALLERGY_OPTIONS.map(o => (
                      <Pill key={o.value} label={`${o.emoji} ${o.label}`} selected={data.allergies.includes(o.value)} onClick={() => toggle("allergies", o.value)} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#3C271A" }}>Ingredients you dislike (comma-separated)</label>
                  <input type="text" value={data.disliked_ingredients} onChange={e => setData(d => ({...d, disliked_ingredients: e.target.value}))} placeholder="e.g. cilantro, mushrooms, olives" className="w-full px-4 py-3 rounded-xl border outline-none text-sm" style={inputStyle} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: "#3C271A" }}>Cuisines you love (select all that apply)</label>
                <div className="grid grid-cols-3 gap-2">
                  {CUISINE_OPTIONS.map(o => (
                    <Pill key={o.value} label={`${o.emoji} ${o.label}`} selected={data.liked_cuisines.includes(o.value)} onClick={() => toggle("liked_cuisines", o.value)} />
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: "#3C271A" }}>Kitchen equipment you have</label>
                  <div className="grid grid-cols-2 gap-2">
                    {EQUIPMENT_OPTIONS.map(o => (
                      <Pill key={o.value} label={`${o.emoji} ${o.label}`} selected={data.cooking_equipment.includes(o.value)} onClick={() => toggle("cooking_equipment", o.value)} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "#3C271A" }}>Max weekday cook time</label>
                    <select value={data.max_weekday_cook_time} onChange={e => setData(d => ({...d, max_weekday_cook_time: +e.target.value}))} className="w-full px-4 py-3 rounded-xl border outline-none text-sm appearance-none" style={inputStyle}>
                      {[15,20,30,45,60,90].map(v => <option key={v} value={v}>{v} minutes</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "#3C271A" }}>Max weekend cook time</label>
                    <select value={data.max_weekend_cook_time} onChange={e => setData(d => ({...d, max_weekend_cook_time: +e.target.value}))} className="w-full px-4 py-3 rounded-xl border outline-none text-sm appearance-none" style={inputStyle}>
                      {[30,45,60,90,120,180].map(v => <option key={v} value={v}>{v} minutes</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "#3C271A" }}>Shopping day</label>
                    <select value={data.shopping_day} onChange={e => setData(d => ({...d, shopping_day: e.target.value}))} className="w-full px-4 py-3 rounded-xl border outline-none text-sm appearance-none" style={inputStyle}>
                      {DAY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "#3C271A" }}>Week starts on</label>
                    <select value={data.week_start_day} onChange={e => setData(d => ({...d, week_start_day: e.target.value}))} className="w-full px-4 py-3 rounded-xl border outline-none text-sm appearance-none" style={inputStyle}>
                      {DAY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { key: "meal_prep_enabled", label: "🥡 Meal prep mode", desc: "Plan a big batch-cooking session to prep multiple meals at once" },
                    { key: "leftovers_for_lunch", label: "🍱 Leftovers for lunch", desc: "Make extra at dinner to have lunch ready the next day" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all" style={{ borderColor: "#F0E4D7", backgroundColor: "#FAF9F7" }} onClick={() => setData(d => ({ ...d, [key]: !d[key as keyof typeof d] }))}>
                      <div className="mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0" style={(data[key as keyof typeof data] as boolean) ? { backgroundColor: "#D96B3D", borderColor: "#D96B3D" } : { borderColor: "#DDB99A" }}>
                        {(data[key as keyof typeof data] as boolean) && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12"><path d="M10 3L5 8.5 2 5.5l-1 1 4 4 6-6.5-1-1z"/></svg>}
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: "#3C271A" }}>{label}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#AD7B54" }}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4">
                <label className="block text-sm font-medium mb-3" style={{ color: "#3C271A" }}>Stores you shop at (helps optimize your list)</label>
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR_STORES.map(s => (
                    <Pill key={s} label={s} selected={data.preferred_stores.includes(s)} onClick={() => toggle("preferred_stores", s)} />
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#3C271A" }}>Other store not listed?</label>
                  <input type="text" value={data.custom_store} onChange={e => setData(d => ({...d, custom_store: e.target.value}))} placeholder="e.g. Fresh Market, local co-op…" className="w-full px-4 py-3 rounded-xl border outline-none text-sm" style={inputStyle} />
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="space-y-5">
                <p style={{ color: "#72492C" }}>We&apos;ll send your meal plan and shopping list every week, right before your shopping day.</p>
                <div className="space-y-3">
                  {[
                    { key: "email_notifications", label: "📧 Email delivery", desc: "Beautiful weekly email with your full plan and shopping list" },
                    { key: "sms_notifications", label: "📱 Text message link", desc: "Get a text with a direct link to your shopping list" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all" style={{ borderColor: "#F0E4D7", backgroundColor: "#FAF9F7" }} onClick={() => setData(d => ({ ...d, [key]: !d[key as keyof typeof d] }))}>
                      <div className="mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0" style={(data[key as keyof typeof data] as boolean) ? { backgroundColor: "#D96B3D", borderColor: "#D96B3D" } : { borderColor: "#DDB99A" }}>
                        {(data[key as keyof typeof data] as boolean) && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12"><path d="M10 3L5 8.5 2 5.5l-1 1 4 4 6-6.5-1-1z"/></svg>}
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: "#3C271A" }}>{label}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#AD7B54" }}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {data.sms_notifications && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "#3C271A" }}>Phone number</label>
                    <input type="tel" value={data.phone_number} onChange={e => setData(d => ({...d, phone_number: e.target.value}))} placeholder="+1 (555) 000-0000" className="w-full px-4 py-3 rounded-xl border outline-none text-sm" style={inputStyle} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button onClick={back} disabled={step === 0} className="px-5 py-2.5 rounded-xl text-sm font-medium border transition-all disabled:opacity-0" style={{ borderColor: "#F0E4D7", color: "#72492C" }}>
              ← Back
            </button>
            <div className="flex gap-1.5">
              {STEPS.map((_,i) => (
                <div key={i} className="rounded-full transition-all" style={{ width: i === step ? "24px" : "8px", height: "8px", backgroundColor: i <= step ? "#D96B3D" : "#F0E4D7" }} />
              ))}
            </div>
            {step < STEPS.length - 1 ? (
              <button onClick={next} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all" style={{ backgroundColor: "#D96B3D" }}>
                {step === 0 ? "Let's go →" : "Continue →"}
              </button>
            ) : (
              <button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-70" style={{ backgroundColor: "#5A8A56" }}>
                {saving ? "Saving…" : "✨ Generate my meal plan!"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
