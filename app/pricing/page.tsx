"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const plans = [
  {
    tier: "starter",
    name: "Starter",
    price: "$4.99",
    period: "/month",
    tagline: "Perfect for getting started",
    regen: "2 meal plan generations per week",
    features: [
      "2 meal plan generations per week",
      "Full weekly meal plan",
      "Smart shopping list",
      "Pantry tracker",
      "Dietary restriction support",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    tier: "pro",
    name: "Pro",
    price: "$9.99",
    period: "/month",
    tagline: "For the intentional home cook",
    regen: "5 meal plan generations per week",
    features: [
      "5 meal plan generations per week",
      "Full weekly meal plan",
      "Smart shopping list",
      "Pantry tracker",
      "Dietary restriction support",
      "Meal history & preferences",
      "Priority support",
    ],
    cta: "Go Pro",
    highlight: true,
  },
  {
    tier: "chef",
    name: "Chef",
    price: "$14.99",
    period: "/month",
    tagline: "Unlimited for the dedicated household",
    regen: "Unlimited generations",
    features: [
      "Unlimited meal plan generations",
      "Full weekly meal plan",
      "Smart shopping list",
      "Pantry tracker",
      "Dietary restriction support",
      "Meal history & preferences",
      "Priority support",
      "Early access to new features",
    ],
    cta: "Go Chef",
    highlight: false,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleSubscribe = async (tier: string) => {
    setLoading(tier);
    try {
      const resp = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const { url, error } = await resp.json();
      if (error) {
        if (resp.status === 401) router.push("/login");
        else alert(error);
        return;
      }
      window.location.href = url;
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FDF8F0", fontFamily: "'Inter', sans-serif" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #E8D5C4", backgroundColor: "#FDF8F0" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "18px", color: "#3C271A", textDecoration: "none" }}>
            Forget About Food
          </Link>
          <Link href="/dashboard" style={{ fontSize: "14px", color: "#72492C", textDecoration: "none" }}>
            Back to dashboard
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 24px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <p style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#D96B3D", marginBottom: "12px" }}>
            Simple, transparent pricing
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: "#3C271A", marginBottom: "16px" }}>
            Choose your plan
          </h1>
          <p style={{ fontSize: "17px", color: "#72492C", maxWidth: "480px", margin: "0 auto", lineHeight: "1.7" }}>
            Every plan includes the full meal planning experience. Upgrade for more flexibility.
          </p>
        </div>

        {/* Plans grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", alignItems: "start" }}>
          {plans.map((plan) => (
            <div
              key={plan.tier}
              style={{
                borderRadius: "20px",
                border: plan.highlight ? "2px solid #D96B3D" : "1px solid #E8D5C4",
                backgroundColor: plan.highlight ? "#FDF0E8" : "#FFFDF9",
                padding: "36px 32px",
                position: "relative",
              }}
            >
              {plan.highlight && (
                <div style={{
                  position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)",
                  backgroundColor: "#D96B3D", color: "#fff", fontSize: "12px", fontWeight: 600,
                  padding: "4px 16px", borderRadius: "20px", letterSpacing: "0.05em", whiteSpace: "nowrap"
                }}>
                  Most Popular
                </div>
              )}

              <div style={{ marginBottom: "24px" }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#AD7B54", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                  {plan.name}
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "8px" }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "40px", fontWeight: 700, color: "#3C271A" }}>{plan.price}</span>
                  <span style={{ fontSize: "15px", color: "#AD7B54" }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: "14px", color: "#72492C" }}>{plan.tagline}</p>
              </div>

              <button
                onClick={() => handleSubscribe(plan.tier)}
                disabled={loading === plan.tier}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: loading === plan.tier ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: "15px",
                  marginBottom: "28px",
                  backgroundColor: plan.highlight ? "#D96B3D" : "#3C271A",
                  color: "#fff",
                  opacity: loading === plan.tier ? 0.7 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                {loading === plan.tier ? "Redirecting..." : plan.cta}
              </button>

              <div style={{ borderTop: "1px solid #E8D5C4", paddingTop: "24px" }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
                    <div style={{ width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#5A8A56", flexShrink: 0, marginTop: "1px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: "14px", color: "#3C271A", lineHeight: "1.5" }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: "13px", color: "#AD7B54", marginTop: "40px" }}>
          Cancel anytime. No contracts. Questions? <a href="mailto:support@forgetaboutfood.app" style={{ color: "#D96B3D", textDecoration: "none" }}>Contact us</a>
        </p>
      </div>
    </div>
  );
}
