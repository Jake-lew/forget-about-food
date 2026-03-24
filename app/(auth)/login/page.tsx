"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#FDF8F0" }}>
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ backgroundColor: "#D96B3D" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <span className="text-xl">🍽️</span>
          </div>
          <span className="font-bold text-white text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>Forget About Food</span>
        </div>
        <div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your week.<br />Your meals.<br /><em>Zero stress.</em>
          </h2>
          <p className="text-lg" style={{ color: "#FAE5DB" }}>
            Sign back in and your meal plan is waiting for you.
          </p>
        </div>
        <div className="flex gap-4">
          {["🍝","🥗","🌮","🍕","🥘"].map((e,i) => (
            <div key={i} className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">{e}</div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#D96B3D" }}>
              <span className="text-lg">🍽️</span>
            </div>
            <span className="font-bold text-lg" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>Forget About Food</span>
          </div>

          <h1 className="text-3xl font-bold mb-2" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>Welcome back</h1>
          <p className="mb-8" style={{ color: "#72492C" }}>Sign in to your meal planning dashboard</p>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#3C271A" }}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all"
                style={{ backgroundColor: "#FFFDF9", borderColor: "#F0E4D7", color: "#3C271A" }}
                onFocus={(e) => { e.target.style.borderColor = "#D96B3D"; e.target.style.boxShadow = "0 0 0 3px rgba(217,107,61,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#F0E4D7"; e.target.style.boxShadow = "none"; }}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium" style={{ color: "#3C271A" }}>Password</label>
                <Link href="/forgot-password" className="text-xs" style={{ color: "#D96B3D" }}>Forgot password?</Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all"
                style={{ backgroundColor: "#FFFDF9", borderColor: "#F0E4D7", color: "#3C271A" }}
                onFocus={(e) => { e.target.style.borderColor = "#D96B3D"; e.target.style.boxShadow = "0 0 0 3px rgba(217,107,61,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#F0E4D7"; e.target.style.boxShadow = "none"; }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60"
              style={{ backgroundColor: "#D96B3D" }}
            >
              {loading ? "Signing in…" : "Sign in →"}
            </button>
          </form>

          <p className="mt-6 text-sm text-center" style={{ color: "#AD7B54" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold" style={{ color: "#D96B3D" }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
