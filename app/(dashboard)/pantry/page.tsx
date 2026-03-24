"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getEmojiForCategory, capitalizeFirst } from "@/lib/utils";
import type { PantryItem } from "@/types";

export default function PantryPage() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", quantity: "", unit: "", category: "pantry", expiry_date: "" });
  const supabase = createClient();

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("pantry_items").select("*").eq("user_id", user.id).order("category").order("name");
    setItems((data as PantryItem[]) || []);
    setLoading(false);
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("pantry_items").insert({ ...newItem, user_id: user.id, expiry_date: newItem.expiry_date || null }).select().single();
    if (data) { setItems(items => [...items, data as PantryItem]); }
    setNewItem({ name: "", quantity: "", unit: "", category: "pantry", expiry_date: "" });
    setAdding(false);
  };

  const deleteItem = async (id: string) => {
    await supabase.from("pantry_items").delete().eq("id", id);
    setItems(items => items.filter(i => i.id !== id));
  };

  const grouped: Record<string, PantryItem[]> = {};
  items.forEach(item => {
    const key = item.category || "other";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  const CATEGORIES = ["produce","meat_seafood","dairy_eggs","pantry","frozen","bakery","spices","condiments","other"];
  const inputStyle = { backgroundColor: "#FFFDF9", borderColor: "#F0E4D7", color: "#3C271A", border: "1px solid #F0E4D7", borderRadius: "0.75rem", padding: "0.5rem 0.75rem", fontSize: "0.875rem", outline: "none" };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>Pantry 🫙</h1>
          <p style={{ color: "#72492C" }}>{items.length} items tracked · We&apos;ll use these before adding to your shopping list</p>
        </div>
        <button onClick={() => setAdding(true)} className="text-white text-sm font-medium px-4 py-2.5 rounded-xl" style={{ backgroundColor: "#D96B3D" }}>
          + Add item
        </button>
      </div>

      {/* Add item form */}
      {adding && (
        <div className="rounded-2xl border p-5 mb-6" style={{ backgroundColor: "#FFFDF9", borderColor: "#D96B3D" }}>
          <h3 className="font-semibold mb-4" style={{ color: "#3C271A" }}>Add pantry item</h3>
          <form onSubmit={addItem} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="Item name*" value={newItem.name} onChange={e => setNewItem(n => ({...n, name: e.target.value}))} style={inputStyle} className="col-span-2" />
              <input placeholder="Quantity" value={newItem.quantity} onChange={e => setNewItem(n => ({...n, quantity: e.target.value}))} style={inputStyle} />
              <input placeholder="Unit (cups, lbs…)" value={newItem.unit} onChange={e => setNewItem(n => ({...n, unit: e.target.value}))} style={inputStyle} />
              <select value={newItem.category} onChange={e => setNewItem(n => ({...n, category: e.target.value}))} style={{ ...inputStyle, appearance: "none" }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{capitalizeFirst(c)}</option>)}
              </select>
              <input type="date" value={newItem.expiry_date} onChange={e => setNewItem(n => ({...n, expiry_date: e.target.value}))} style={inputStyle} placeholder="Expiry date (optional)" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="text-white text-sm font-medium px-4 py-2 rounded-xl" style={{ backgroundColor: "#D96B3D" }}>Add item</button>
              <button type="button" onClick={() => setAdding(false)} className="text-sm px-4 py-2 rounded-xl border" style={{ borderColor: "#F0E4D7", color: "#72492C" }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🫙</div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>Your pantry is empty</h3>
          <p className="mb-6" style={{ color: "#72492C" }}>Add items you already have at home — we&apos;ll factor them into your meal plan.</p>
          <button onClick={() => setAdding(true)} className="text-white text-sm font-medium px-5 py-2.5 rounded-xl" style={{ backgroundColor: "#D96B3D" }}>Add your first item</button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([group, groupItems]) => (
            <div key={group} className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "#FFFDF9", borderColor: "#F0E4D7" }}>
              <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ backgroundColor: "#FAF0DE", borderColor: "#F0E4D7" }}>
                <span>{getEmojiForCategory(group)}</span>
                <span className="font-semibold text-sm" style={{ color: "#3C271A" }}>{capitalizeFirst(group)}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F0E4D7", color: "#72492C" }}>{groupItems.length}</span>
              </div>
              <ul className="divide-y" style={{ borderColor: "#F0E4D7" }}>
                {groupItems.map(item => {
                  const isExpiringSoon = item.expiry_date && new Date(item.expiry_date) < new Date(Date.now() + 3 * 86400000);
                  return (
                    <li key={item.id} className="flex items-center gap-4 px-5 py-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: "#3C271A" }}>{item.name}</p>
                        {(item.quantity || item.unit) && <p className="text-xs" style={{ color: "#AD7B54" }}>{item.quantity} {item.unit}</p>}
                        {item.expiry_date && (
                          <p className="text-xs" style={{ color: isExpiringSoon ? "#EF4444" : "#AD7B54" }}>
                            {isExpiringSoon ? "⚠️ " : ""}Expires {new Date(item.expiry_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <button onClick={() => deleteItem(item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-100 opacity-30" style={{ color: "#EF4444" }}>
                        ×
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
