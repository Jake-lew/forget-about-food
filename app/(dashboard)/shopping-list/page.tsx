"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, getEmojiForCategory, capitalizeFirst } from "@/lib/utils";
import type { ShoppingList, ShoppingItem } from "@/types";

export default function ShoppingListPage() {
  const [list, setList] = useState<ShoppingList | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"category" | "store">("category");
  const supabase = createClient();

  useEffect(() => { loadList(); }, []);

  const loadList = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: sl } = await supabase.from("shopping_lists").select("*").eq("user_id", user.id).eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (sl) {
      setList(sl as ShoppingList);
      const { data: si } = await supabase.from("shopping_items").select("*").eq("shopping_list_id", sl.id).order("category").order("name");
      setItems((si as ShoppingItem[]) || []);
    }
    setLoading(false);
  };

  const toggleItem = async (id: string, checked: boolean) => {
    await supabase.from("shopping_items").update({ checked }).eq("id", id);
    setItems(items => items.map(i => i.id === id ? { ...i, checked } : i));
  };

  const checkAll = async (groupItems: ShoppingItem[], checked: boolean) => {
    const ids = groupItems.map(i => i.id);
    await supabase.from("shopping_items").update({ checked }).in("id", ids);
    setItems(items => items.map(i => ids.includes(i.id) ? { ...i, checked } : i));
  };

  const totalCost = items.filter(i => !i.in_pantry && !i.checked).reduce((sum, i) => sum + (i.estimated_cost || 0), 0);
  const checkedCount = items.filter(i => i.checked).length;
  const progress = items.length > 0 ? (checkedCount / items.length) * 100 : 0;

  const grouped: Record<string, ShoppingItem[]> = {};
  items.forEach(item => {
    const key = view === "category" ? (item.category || "other") : (item.preferred_store || "Any Store");
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  if (loading) return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="skeleton h-10 w-64 mb-8 rounded-2xl" />
      {[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-2xl mb-3" />)}
    </div>
  );

  if (!list) return (
    <div className="max-w-4xl mx-auto px-6 py-16 text-center">
      <div className="text-6xl mb-4">🛒</div>
      <h2 className="text-2xl font-bold mb-3" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>No shopping list yet</h2>
      <p style={{ color: "#72492C" }}>Generate a meal plan first and your shopping list will appear here.</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>Shopping List 🛒</h1>
          <p style={{ color: "#72492C" }}>{items.length} items · {checkedCount} checked off</p>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: "#AD7B54" }}>Remaining cost</p>
          <p className="text-2xl font-bold" style={{ color: "#5A8A56", fontFamily: "'Playfair Display', serif" }}>{formatCurrency(totalCost)}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6 rounded-2xl p-4 border" style={{ backgroundColor: "#FFFDF9", borderColor: "#F0E4D7" }}>
        <div className="flex justify-between text-sm mb-2">
          <span style={{ color: "#72492C" }}>Shopping progress</span>
          <span className="font-semibold" style={{ color: "#D96B3D" }}>{checkedCount}/{items.length}</span>
        </div>
        <div className="h-3 rounded-full" style={{ backgroundColor: "#F0E4D7" }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: progress === 100 ? "#5A8A56" : "#D96B3D" }} />
        </div>
        {progress === 100 && <p className="text-sm text-center mt-2 font-medium" style={{ color: "#5A8A56" }}>🎉 Shopping complete!</p>}
      </div>

      {/* View toggle */}
      <div className="flex gap-2 mb-6">
        {(["category","store"] as const).map(v => (
          <button key={v} onClick={() => setView(v)} className="px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize"
            style={view === v ? { backgroundColor: "#FAE5DB", borderColor: "#D96B3D", color: "#9E4226" } : { backgroundColor: "#FFFDF9", borderColor: "#F0E4D7", color: "#72492C" }}>
            {v === "category" ? "🏷️ By Category" : "🏪 By Store"}
          </button>
        ))}
      </div>

      {/* Items grouped */}
      <div className="space-y-4">
        {Object.entries(grouped).sort(([a],[b]) => a.localeCompare(b)).map(([group, groupItems]) => {
          const allChecked = groupItems.every(i => i.checked);
          const someChecked = groupItems.some(i => i.checked);

          return (
            <div key={group} className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "#FFFDF9", borderColor: "#F0E4D7" }}>
              <div className="flex items-center justify-between px-5 py-3 border-b" style={{ backgroundColor: "#FAF0DE", borderColor: "#F0E4D7" }}>
                <div className="flex items-center gap-2">
                  <span>{getEmojiForCategory(group)}</span>
                  <span className="font-semibold text-sm" style={{ color: "#3C271A" }}>{capitalizeFirst(group)}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F0E4D7", color: "#72492C" }}>
                    {groupItems.filter(i => !i.checked).length} left
                  </span>
                </div>
                <button onClick={() => checkAll(groupItems, !allChecked)} className="text-xs font-medium" style={{ color: someChecked ? "#D96B3D" : "#AD7B54" }}>
                  {allChecked ? "Uncheck all" : "Check all"}
                </button>
              </div>
              <ul className="divide-y" style={{ borderColor: "#F0E4D7" }}>
                {groupItems.map(item => (
                  <li key={item.id} className="flex items-center gap-4 px-5 py-3 transition-all" style={{ opacity: item.checked ? 0.5 : 1 }}>
                    <button onClick={() => toggleItem(item.id, !item.checked)}
                      className="w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all"
                      style={item.checked ? { backgroundColor: "#5A8A56", borderColor: "#5A8A56" } : { borderColor: "#DDB99A" }}>
                      {item.checked && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12"><path d="M10 3L5 8.5 2 5.5l-1 1 4 4 6-6.5-1-1z"/></svg>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#3C271A", textDecoration: item.checked ? "line-through" : "none" }}>
                        {item.name}
                      </p>
                      {item.meal_names && item.meal_names.length > 0 && (
                        <p className="text-xs truncate" style={{ color: "#AD7B54" }}>For: {item.meal_names.slice(0,2).join(", ")}{item.meal_names.length > 2 ? ` +${item.meal_names.length-2}` : ""}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium" style={{ color: "#3C271A" }}>{item.quantity} {item.unit}</p>
                      {item.estimated_cost > 0 && <p className="text-xs" style={{ color: "#AD7B54" }}>{formatCurrency(item.estimated_cost)}</p>}
                    </div>
                    {item.in_pantry && <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#E2EDE1", color: "#345531" }}>In pantry ✓</span>}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
