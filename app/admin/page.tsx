"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type User = {
  id: string;
  full_name: string | null;
  email: string;
  subscription_tier: string;
  is_superadmin: boolean;
  trial_ends_at: string | null;
  created_at: string;
  stripe_customer_id: string | null;
};

const tierColors: Record<string, string> = {
  starter: "#AD7B54",
  pro: "#5A8A56",
  chef: "#D96B3D",
};

const tierBg: Record<string, string> = {
  starter: "#FAF0DE",
  pro: "#E2EDE1",
  chef: "#FAE5DB",
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [trialDays, setTrialDays] = useState<Record<string, string>>({});
  const supabase = createClient();

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, subscription_tier, is_superadmin, trial_ends_at, created_at, stripe_customer_id")
      .order("created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  const updateTier = async (userId: string, tier: string) => {
    setUpdating(userId + "-tier");
    await supabase.from("profiles").update({ subscription_tier: tier }).eq("id", userId);
    await loadUsers();
    setUpdating(null);
  };

  const grantTrial = async (userId: string) => {
    const days = parseInt(trialDays[userId] || "7");
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + days);
    setUpdating(userId + "-trial");
    await supabase.from("profiles").update({ trial_ends_at: trialEnd.toISOString() }).eq("id", userId);
    await loadUsers();
    setUpdating(null);
  };

  const revokeTrial = async (userId: string) => {
    setUpdating(userId + "-revoke");
    await supabase.from("profiles").update({ trial_ends_at: null }).eq("id", userId);
    await loadUsers();
    setUpdating(null);
  };

  const filtered = users.filter(u =>
    (u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    total: users.length,
    starter: users.filter(u => u.subscription_tier === "starter").length,
    pro: users.filter(u => u.subscription_tier === "pro").length,
    chef: users.filter(u => u.subscription_tier === "chef").length,
    trialing: users.filter(u => u.trial_ends_at && new Date(u.trial_ends_at) > new Date()).length,
  };

  const inputStyle = {
    padding: "8px 12px", borderRadius: "8px", border: "1px solid #E8D5C4",
    backgroundColor: "#FFFDF9", color: "#3C271A", fontSize: "13px",
    outline: "none", fontFamily: "inherit",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FAF7F2", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#3C271A", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ color: "#AD7B54", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Superadmin</p>
          <h1 style={{ color: "#FDF8F0", fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700 }}>Forget About Food — Control Panel</h1>
        </div>
        <a href="/dashboard" style={{ color: "#AD7B54", fontSize: "13px", textDecoration: "none" }}>Back to app</a>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px", marginBottom: "32px" }}>
          {[
            { label: "Total users", value: stats.total, color: "#3C271A" },
            { label: "Starter", value: stats.starter, color: "#AD7B54" },
            { label: "Pro", value: stats.pro, color: "#5A8A56" },
            { label: "Chef", value: stats.chef, color: "#D96B3D" },
            { label: "On trial", value: stats.trialing, color: "#8B5CF6" },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: "#FFFDF9", border: "1px solid #E8D5C4", borderRadius: "12px", padding: "20px" }}>
              <p style={{ fontSize: "12px", color: "#AD7B54", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>{s.label}</p>
              <p style={{ fontSize: "28px", fontWeight: 700, color: s.color, fontFamily: "'Playfair Display', serif" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom: "20px" }}>
          <input
            style={{ ...inputStyle, width: "320px", padding: "10px 16px", borderRadius: "10px", fontSize: "14px" }}
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div style={{ backgroundColor: "#FFFDF9", border: "1px solid #E8D5C4", borderRadius: "16px", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#FAF0DE", borderBottom: "1px solid #E8D5C4" }}>
                  {["User", "Plan", "Trial", "Change Plan", "Grant Trial", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#AD7B54", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#AD7B54" }}>Loading...</td></tr>
                ) : filtered.map((user, i) => {
                  const isTrialing = user.trial_ends_at && new Date(user.trial_ends_at) > new Date();
                  const trialExpiry = user.trial_ends_at ? new Date(user.trial_ends_at).toLocaleDateString() : null;
                  return (
                    <tr key={user.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F0E4D7" : "none" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <p style={{ fontSize: "14px", fontWeight: 500, color: "#3C271A", marginBottom: "2px" }}>
                          {user.full_name || "—"} {user.is_superadmin && <span style={{ fontSize: "10px", backgroundColor: "#3C271A", color: "#FDF8F0", padding: "2px 6px", borderRadius: "4px", marginLeft: "4px" }}>ADMIN</span>}
                        </p>
                        <p style={{ fontSize: "12px", color: "#AD7B54" }}>{user.email}</p>
                        <p style={{ fontSize: "11px", color: "#C9A882" }}>Joined {new Date(user.created_at).toLocaleDateString()}</p>
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, padding: "4px 10px", borderRadius: "20px", backgroundColor: tierBg[user.subscription_tier] || "#FAF0DE", color: tierColors[user.subscription_tier] || "#AD7B54", textTransform: "capitalize" }}>
                          {user.subscription_tier}
                        </span>
                        {user.stripe_customer_id && <p style={{ fontSize: "11px", color: "#C9A882", marginTop: "4px" }}>Stripe</p>}
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        {isTrialing ? (
                          <p style={{ fontSize: "12px", color: "#5A8A56", fontWeight: 500 }}>Active until {trialExpiry}</p>
                        ) : (
                          <p style={{ fontSize: "12px", color: "#C9A882" }}>No trial</p>
                        )}
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <select
                          value={user.subscription_tier}
                          onChange={e => updateTier(user.id, e.target.value)}
                          disabled={updating === user.id + "-tier"}
                          style={{ ...inputStyle, cursor: "pointer" }}
                        >
                          <option value="starter">Starter</option>
                          <option value="pro">Pro</option>
                          <option value="chef">Chef</option>
                        </select>
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <input
                            type="number"
                            min="1"
                            max="365"
                            placeholder="7"
                            value={trialDays[user.id] || ""}
                            onChange={e => setTrialDays(prev => ({ ...prev, [user.id]: e.target.value }))}
                            style={{ ...inputStyle, width: "56px", textAlign: "center" }}
                          />
                          <span style={{ fontSize: "12px", color: "#AD7B54" }}>days</span>
                          <button
                            onClick={() => grantTrial(user.id)}
                            disabled={updating === user.id + "-trial"}
                            style={{ padding: "6px 12px", borderRadius: "8px", border: "none", cursor: "pointer", backgroundColor: "#5A8A56", color: "#fff", fontSize: "12px", fontWeight: 500 }}
                          >
                            Grant
                          </button>
                        </div>
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        {isTrialing && (
                          <button
                            onClick={() => revokeTrial(user.id)}
                            disabled={updating === user.id + "-revoke"}
                            style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #E8D5C4", cursor: "pointer", backgroundColor: "transparent", color: "#AD7B54", fontSize: "12px" }}
                          >
                            Revoke trial
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
