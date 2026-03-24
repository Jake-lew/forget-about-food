"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.session) {
      router.push("/onboarding");
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#FDF8F0" }}>
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">📬</div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>
            Check your email!
          </h2>
          <p style={{ color: "#72492C" }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account and get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#FDF8F0" }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ backgroundColor: "#5A8A56" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <span className="text-xl">🍽️</span>
          </div>
          <span className="font-bold text-white text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>Forget About Food</span>
        </div>
        <div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Never ask<br />&quot;what&apos;s for<br />dinner?&quot; again.
          </h2>
          <p className="text-lg" style={{ color: "#C3D9C1" }}>
            Takes 3 minutes to set up. Your first meal plan is ready the moment you finish.
          </p>
          <div className="mt-8 space-y-3">
            {["✅ Personalized to your tastes","✅ Smart shopping lists","✅ Budget-aware planning","✅ Delivered to your inbox"].map((f) => (
              <p key={f} className="text-white text-sm">{f}</p>
            ))}
          </div>
        </div>
        <div className="text-sm" style={{ color: "#C3D9C1" }}>Free to start · No credit card needed</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#D96B3D" }}>
              <span className="text-lg">🍽️</span>
            </div>
            <span className="font-bold text-lg" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>Forget About Food</span>
          </div>

          <h1 className="text-3xl font-bold mb-2" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>Create your account</h1>
          <p className="mb-8" style={{ color: "#72492C" }}>Start your stress-free meal planning journey</p>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            {[
              { label: "Your name", type: "text", value: name, set: setName, placeholder: "Jake" },
              { label: "Email address", type: "email", value: email, set: setEmail, placeholder: "you@example.com" },
              { label: "Password", type: "password", value: password, set: setPassword, placeholder: "At least 8 characters" },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#3C271A" }}>{f.label}</label>
                <input
                  type={f.type}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  required
                  minLength={f.type === "password" ? 8 : undefined}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all"
                  style={{ backgroundColor: "#FFFDF9", borderColor: "#F0E4D7", color: "#3C271A" }}
                  onFocus={(e) => { e.target.style.borderColor = "#D96B3D"; e.target.style.boxShadow = "0 0 0 3px rgba(217,107,61,0.15)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#F0E4D7"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60"
              style={{ backgroundColor: "#D96B3D" }}
            >
              {loading ? "Creating account…" : "Create account — it's free →"}
            </button>
          </form>

          <p className="mt-6 text-xs text-center" style={{ color: "#AD7B54" }}>
            By signing up you agree to our{" "}
            <Link href="/terms" className="underline">Terms</Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>
          </p>

          <p className="mt-4 text-sm text-center" style={{ color: "#AD7B54" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "#D96B3D" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
