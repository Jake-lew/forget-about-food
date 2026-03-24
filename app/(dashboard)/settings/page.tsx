"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DIETARY_OPTIONS, ALLERGY_OPTIONS, CUISINE_OPTIONS, EQUIPMENT_OPTIONS, DAY_OPTIONS, POPULAR_STORES } from "@/lib/utils";

function Pill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-all"
      style={selected ? { backgroundColor: "#FAE5DB", borderColor: "#D96B3D", color: "#9E4226" } : { backgroundColor: "#FFFDF9", borderColor: "#F0E4D7", color: "#72492C" }}>
      {label}
    </button>
  );
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<{full_name:string; email:string; email_notifications:boolean; sms_notifications:boolean; phone_number:string|null} | null>(null);
  const [prefs, setPrefs] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [{ data: p }, { data: pr }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("user_preferences").select("*").eq("user_id", user.id).maybeSingle(),
    ]);
    setProfile(p);
    setPrefs(pr || {});
  };

  const saveAll = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await Promise.all([
      supabase.from("profiles").update({ full_name: profile?.full_name, email_notifications: profile?.email_notifications, sms_notifications: profile?.sms_notifications, phone_number: profile?.phone_number }).eq("id", user.id),
      supabase.from("user_preferences").upsert({ ...prefs, user_id: user.id }),
    ]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const togglePref = (key: string, value: string) => {
    const arr = (prefs?.[key] as string[]) || [];
    setPrefs(p => ({ ...p, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] }));
  };

  const inputStyle = { backgroundColor: "#FFFDF9", borderColor: "#F0E4D7", color: "#3C271A", border: "1px solid #F0E4D7", borderRadius: "0.75rem", padding: "0.5rem 0.75rem", fontSize: "0.875rem", outline: "none", width: "100%" };

  if (!profile || !prefs) return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="skeleton h-10 w-48 mb-6 rounded-xl" />
      {[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-2xl mb-4" />)}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>Settings ⚙️</h1>
        <button onClick={saveAll} disabled={saving} className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-60" style={{ backgroundColor: saved ? "#5A8A56" : "#D96B3D" }}>
          {saving ? "Saving…" : saved ? "✓ Saved!" : "Save changes"}
        </button>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <Section title="👤 Profile">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#3C271A" }}>Full name</label>
              <input style={inputStyle} value={profile.full_name || ""} onChange={e => setProfile(p => p ? {...p, full_name: e.target.value} : p)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#3C271A" }}>Email</label>
              <input style={{ ...inputStyle, opacity: 0.6 }} value={profile.email} disabled />
            </div>
          </div>
        </Section>

        {/* Household & Budget */}
        <Section title="🏠 Household & Budget">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#3C271A" }}>People cooking for</label>
              <input type="number" min={1} max={12} style={inputStyle} value={(prefs.household_size as number) || 2} onChange={e => setPrefs(p => ({...p, household_size: +e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#3C271A" }}>Weekly budget ($)</label>
              <input type="number" min={20} style={inputStyle} value={(prefs.weekly_budget as number) || 150} onChange={e => setPrefs(p => ({...p, weekly_budget: +e.target.value}))} />
            </div>
          </div>
        </Section>

        {/* Dietary */}
        <Section title="🥗 Dietary Preferences">
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: "#AD7B54" }}>Dietary restrictions</p>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map(o => <Pill key={o.value} label={`${o.emoji} ${o.label}`} selected={((prefs.dietary_restrictions as string[]) || []).includes(o.value)} onClick={() => togglePref("dietary_restrictions", o.value)} />)}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium mb-2" style={{ color: "#AD7B54" }}>Allergies</p>
            <div className="flex flex-wrap gap-2">
              {ALLERGY_OPTIONS.map(o => <Pill key={o.value} label={`${o.emoji} ${o.label}`} selected={((prefs.allergies as string[]) || []).includes(o.value)} onClick={() => togglePref("allergies", o.value)} />)}
            </div>
          </div>
        </Section>

        {/* Cuisines */}
        <Section title="🌍 Favorite Cuisines">
          <div className="flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map(o => <Pill key={o.value} label={`${o.emoji} ${o.label}`} selected={((prefs.liked_cuisines as string[]) || []).includes(o.value)} onClick={() => togglePref("liked_cuisines", o.value)} />)}
          </div>
        </Section>

        {/* Equipment */}
        <Section title="👨‍🍳 Kitchen Equipment">
          <div className="grid grid-cols-2 gap-2">
            {EQUIPMENT_OPTIONS.map(o => <Pill key={o.value} label={`${o.emoji} ${o.label}`} selected={((prefs.cooking_equipment as string[]) || []).includes(o.value)} onClick={() => togglePref("cooking_equipment", o.value)} />)}
          </div>
        </Section>

        {/* Planning */}
        <Section title="📅 Planning Style">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#3C271A" }}>Shopping day</label>
              <select value={(prefs.shopping_day as string) || "sunday"} onChange={e => setPrefs(p => ({...p, shopping_day: e.target.value}))} style={{ ...inputStyle, appearance: "none" }}>
                {DAY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#3C271A" }}>Week start</label>
              <select value={(prefs.week_start_day as string) || "monday"} onChange={e => setPrefs(p => ({...p, week_start_day: e.target.value}))} style={{ ...inputStyle, appearance: "none" }}>
                {DAY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { key: "meal_prep_enabled", label: "🥡 Meal prep mode" },
              { key: "leftovers_for_lunch", label: "🍱 Leftovers for lunch" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: "#FAF0DE" }}>
                <span className="text-sm font-medium" style={{ color: "#3C271A" }}>{label}</span>
                <button onClick={() => setPrefs(p => ({...p, [key]: !p?.[key]}))}
                  className="w-10 h-6 rounded-full transition-colors relative"
                  style={{ backgroundColor: (prefs[key] as boolean) ? "#D96B3D" : "#DDB99A" }}>
                  <span className="absolute top-1 transition-transform w-4 h-4 rounded-full bg-white shadow" style={{ left: (prefs[key] as boolean) ? "calc(100% - 20px)" : "4px" }} />
                </button>
              </div>
            ))}
          </div>
        </Section>

        {/* Stores */}
        <Section title="🛒 Preferred Stores">
          <div className="flex flex-wrap gap-2">
            {POPULAR_STORES.map(s => <Pill key={s} label={s} selected={((prefs.preferred_stores as string[]) || []).includes(s)} onClick={() => togglePref("preferred_stores", s)} />)}
          </div>
        </Section>

        {/* Notifications */}
        <Section title="📧 Notifications">
          <div className="space-y-3">
            {[
              { key: "email_notifications", label: "📧 Email", desc: "Weekly meal plan & shopping list" },
              { key: "sms_notifications", label: "📱 SMS", desc: "Text with link to your shopping list" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: "#FAF0DE" }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "#3C271A" }}>{label}</p>
                  <p className="text-xs" style={{ color: "#AD7B54" }}>{desc}</p>
                </div>
                <button onClick={() => setProfile(p => p ? {...p, [key]: !p[key as keyof typeof p]} : p)}
                  className="w-10 h-6 rounded-full transition-colors relative flex-shrink-0"
                  style={{ backgroundColor: profile[key as keyof typeof profile] ? "#D96B3D" : "#DDB99A" }}>
                  <span className="absolute top-1 transition-transform w-4 h-4 rounded-full bg-white shadow" style={{ left: profile[key as keyof typeof profile] ? "calc(100% - 20px)" : "4px" }} />
                </button>
              </div>
            ))}
            {profile.sms_notifications && (
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#3C271A" }}>Phone number</label>
                <input type="tel" style={inputStyle} value={profile.phone_number || ""} onChange={e => setProfile(p => p ? {...p, phone_number: e.target.value} : p)} placeholder="+1 (555) 000-0000" />
              </div>
            )}
          </div>
        </Section>
      </div>

      {/* Bottom save */}
      <div className="mt-8 flex justify-end">
        <button onClick={saveAll} disabled={saving} className="text-white font-semibold px-6 py-3 rounded-xl disabled:opacity-60" style={{ backgroundColor: saved ? "#5A8A56" : "#D96B3D" }}>
          {saving ? "Saving…" : saved ? "✓ All saved!" : "Save all changes"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-5" style={{ backgroundColor: "#FFFDF9", borderColor: "#F0E4D7" }}>
      <h2 className="font-semibold mb-4" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>{title}</h2>
      {children}
    </div>
  );
}
