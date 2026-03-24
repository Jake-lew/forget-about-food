import Link from "next/link";

const features = [
  { emoji: "🤖", title: "AI-Powered Meal Planning", desc: "Claude AI generates a personalized weekly menu based on your taste, budget, equipment, and time—so you never have to think about what to cook." },
  { emoji: "🛒", title: "Smart Shopping Lists", desc: "Automatically organized by store and aisle. Checks against your pantry, avoids duplicates, and tracks your actual spend vs. budget." },
  { emoji: "⏱️", title: "Time-Aware Planning", desc: "Set weekday vs. weekend cook-time limits. We plan meals that fit your schedule—including batch prep sessions." },
  { emoji: "🫙", title: "Pantry Intelligence", desc: "Tell us what you have. We'll use it first, saving you money and reducing waste every single week." },
  { emoji: "📧", title: "Email & Text Delivery", desc: "Get your beautiful meal plan and shopping list delivered to your inbox and phone every week—before your shopping day." },
  { emoji: "📊", title: "Budget Tracking", desc: "Set a weekly food budget. We plan within it, show estimated costs per meal, and learn from your actual spending over time." },
];

const howItWorks = [
  { step: "1", title: "Tell us about yourself", desc: "Dietary needs, allergies, equipment, budget, favorite cuisines, and the stores you shop at." },
  { step: "2", title: "We plan your week", desc: "AI generates a full weekly menu—breakfast, lunch, dinner, snacks—tailored entirely to you." },
  { step: "3", title: "Get your shopping list", desc: "A smart, organized list lands in your inbox and on your phone before your shopping day." },
  { step: "4", title: "Cook, eat, repeat", desc: "Rate meals, update your pantry, and we get smarter every week. Your plan keeps improving." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FDF8F0" }}>
      {/* Header */}
      <header style={{ backgroundColor: "rgba(255,253,249,0.92)", backdropFilter: "blur(8px)", borderBottom: "1px solid #F0E4D7" }} className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: "#D96B3D" }}>
              <span className="text-lg">🍽️</span>
            </div>
            <span className="font-bold text-lg" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>
              Forget About Food
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium transition-colors" style={{ color: "#72492C" }}>
              Sign in
            </Link>
            <Link href="/signup" className="text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-sm" style={{ backgroundColor: "#D96B3D" }}>
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-full mb-6" style={{ backgroundColor: "#FAE5DB", color: "#9E4226" }}>
            <span>✨</span> AI-powered meal planning
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>
            Stop wondering{" "}
            <span className="italic" style={{ background: "linear-gradient(135deg, #D96B3D, #F59E0B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              what&apos;s for dinner.
            </span>
          </h1>
          <p className="text-xl max-w-2xl mx-auto leading-relaxed mb-10" style={{ color: "#72492C" }}>
            Forget About Food plans your entire week of meals, builds your shopping list, tracks your budget,
            and delivers it all to your inbox — automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="text-white text-lg font-semibold px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2 justify-center" style={{ backgroundColor: "#D96B3D" }}>
              Start planning for free <span>→</span>
            </Link>
            <Link href="/login" className="text-lg font-medium px-8 py-4 rounded-2xl transition-all inline-flex items-center gap-2 justify-center" style={{ border: "2px solid #F0E4D7", color: "#72492C", backgroundColor: "#FFFDF9" }}>
              Sign in
            </Link>
          </div>
          <p className="mt-6 text-sm" style={{ color: "#AD7B54" }}>
            Free to start · No credit card required · Takes 3 minutes to set up
          </p>
        </div>
      </section>

      {/* Meal Plan Preview Mockup */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl border overflow-hidden shadow-2xl" style={{ backgroundColor: "#FFFDF9", borderColor: "#F0E4D7" }}>
            <div className="px-8 py-6" style={{ backgroundColor: "#D96B3D" }}>
              <div className="flex items-center justify-between text-white">
                <div>
                  <p className="text-sm" style={{ opacity: 0.8 }}>Week of March 23 – 29</p>
                  <h3 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Your Meal Plan 🍽️</h3>
                </div>
                <div className="text-right">
                  <p className="text-sm" style={{ opacity: 0.8 }}>Est. budget</p>
                  <p className="text-2xl font-bold">$87.40</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { day: "Monday", meals: [["🌅 Breakfast","Greek Yogurt Parfait 🫐"],["☀️ Lunch","Leftover pasta 🍝"],["🌙 Dinner","Lemon Herb Chicken 🍋"]] },
                  { day: "Tuesday", meals: [["🌅 Breakfast","Avocado Toast 🥑"],["☀️ Lunch","Chicken Salad Wrap 🌯"],["🌙 Dinner","Shrimp Stir Fry 🍤"]] },
                  { day: "Wednesday", meals: [["🌅 Breakfast","Overnight Oats 🌾"],["☀️ Lunch","Leftover stir fry 🥢"],["🌙 Dinner","Homemade Pizza 🍕"]] },
                ].map((d) => (
                  <div key={d.day} className="rounded-2xl p-4" style={{ backgroundColor: "#FAF0DE" }}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#D96B3D" }}>{d.day}</p>
                    {d.meals.map(([label, meal]) => (
                      <div key={label} className="mb-2 last:mb-0">
                        <p className="text-xs" style={{ color: "#AD7B54" }}>{label}</p>
                        <p className="text-sm font-medium" style={{ color: "#3C271A" }}>{meal}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-5 flex items-center justify-between" style={{ borderTop: "1px solid #F0E4D7" }}>
                <div className="flex items-center gap-6">
                  {[["34 items","Grocery items"],["2h Sunday","Prep time"],["8 items ✓","Pantry used"]].map(([val, lbl]) => (
                    <div key={lbl}>
                      <p className="text-xs" style={{ color: "#AD7B54" }}>{lbl}</p>
                      <p className="text-lg font-bold" style={{ color: "#3C271A" }}>{val}</p>
                    </div>
                  ))}
                </div>
                <div className="text-white text-sm font-medium px-5 py-2.5 rounded-xl hidden sm:block" style={{ backgroundColor: "#D96B3D" }}>
                  View shopping list →
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24" style={{ backgroundColor: "#FAF0DE" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>
              Everything you need to eat well
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#72492C" }}>Built around the way real people actually cook, shop, and eat.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl p-6 border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg" style={{ backgroundColor: "#FFFDF9", borderColor: "#F0E4D7" }}>
                <div className="text-3xl mb-4">{f.emoji}</div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#72492C" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>How it works</h2>
            <p className="text-lg" style={{ color: "#72492C" }}>Set up once. Let it run every week.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {howItWorks.map((s) => (
              <div key={s.step} className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#FAE5DB" }}>
                  <span className="text-xl font-bold" style={{ color: "#D96B3D", fontFamily: "'Playfair Display', serif" }}>{s.step}</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1.5" style={{ color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#72492C" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24" style={{ backgroundColor: "#D96B3D" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ready to forget about food?
          </h2>
          <p className="text-lg mb-8" style={{ color: "#FAE5DB" }}>
            Join thousands of people who&apos;ve taken the stress out of meal planning.
          </p>
          <Link href="/signup" className="font-semibold text-lg px-8 py-4 rounded-2xl transition-colors shadow-lg inline-flex items-center gap-2" style={{ backgroundColor: "white", color: "#D96B3D" }}>
            Get started free <span>→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12" style={{ backgroundColor: "#3C271A" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <span className="font-bold text-white text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>Forget About Food</span>
          </div>
          <p className="text-sm" style={{ color: "#AD7B54" }}>© {new Date().getFullYear()} Forget About Food. Made with 🧡 for home cooks everywhere.</p>
          <div className="flex gap-4 text-sm" style={{ color: "#AD7B54" }}>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
