import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FDF8F0", fontFamily: "'Inter', sans-serif" }}>

      {/* ── NAV ── */}
      <header style={{ backgroundColor: "rgba(253,248,240,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid #EDD9C8", position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#D96B3D", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(217,107,61,0.35)" }}>
              <span style={{ fontSize: "17px" }}>🍽️</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: "17px", color: "#3C271A", fontFamily: "'Playfair Display', serif" }}>Forget About Food</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href="/login" style={{ fontSize: "14px", fontWeight: 500, color: "#72492C", textDecoration: "none" }}>Sign in</Link>
            <Link href="/signup" style={{ fontSize: "14px", fontWeight: 600, color: "#fff", backgroundColor: "#D96B3D", padding: "9px 20px", borderRadius: "10px", textDecoration: "none", boxShadow: "0 2px 8px rgba(217,107,61,0.4)" }}>
              Start free →
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ paddingTop: "140px", paddingBottom: "100px", paddingLeft: "1.5rem", paddingRight: "1.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: "780px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600, color: "#9E4226", backgroundColor: "#FAE5DB", padding: "6px 14px", borderRadius: "100px", marginBottom: "28px", letterSpacing: "0.02em" }}>
            ✦ AI-Powered Meal Planning
          </div>
          <h1 style={{ fontSize: "clamp(2.6rem, 6vw, 4.5rem)", fontWeight: 800, lineHeight: 1.1, color: "#3C271A", fontFamily: "'Playfair Display', serif", marginBottom: "24px" }}>
            Stop dreading<br />
            <span style={{ color: "#D96B3D" }}>"what's for dinner?"</span>
          </h1>
          <p style={{ fontSize: "1.2rem", color: "#72492C", lineHeight: 1.7, maxWidth: "560px", margin: "0 auto 40px" }}>
            Forget About Food plans your entire week — breakfast, lunch, dinner — builds your shopping list, and delivers it to your inbox. All you do is cook.
          </p>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <Link href="/signup" style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "17px", fontWeight: 700, color: "#fff", backgroundColor: "#D96B3D", padding: "16px 36px", borderRadius: "14px", textDecoration: "none", boxShadow: "0 4px 20px rgba(217,107,61,0.45)" }}>
              ✨ Get my first meal plan free
            </Link>
            <p style={{ fontSize: "13px", color: "#AD7B54" }}>No credit card · Ready in 3 minutes</p>
          </div>
        </div>

        {/* App preview card */}
        <div style={{ maxWidth: "900px", margin: "72px auto 0", borderRadius: "24px", overflow: "hidden", boxShadow: "0 24px 80px rgba(60,39,26,0.12), 0 4px 16px rgba(60,39,26,0.08)", border: "1px solid #EDD9C8" }}>
          <div style={{ backgroundColor: "#FFFDF9", padding: "20px 24px", borderBottom: "1px solid #F0E4D7", display: "flex", alignItems: "center", gap: "8px" }}>
            {["#FF6058","#FFBC2E","#28CA41"].map(c => <div key={c} style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: c }} />)}
            <span style={{ fontSize: "13px", color: "#AD7B54", marginLeft: "8px" }}>forget-about-food.vercel.app/dashboard</span>
          </div>
          <div style={{ backgroundColor: "#FAF5EE", padding: "32px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {[
              { day: "Monday", meals: ["🥣 Overnight Oats", "🥗 Grain Bowl", "🍝 Pasta Primavera"], cost: "$12" },
              { day: "Tuesday", meals: ["🍳 Veggie Scramble", "🥙 Turkey Wrap", "🌮 Fish Tacos"], cost: "$14" },
              { day: "Wednesday", meals: ["🫐 Smoothie Bowl", "♻️ Leftover Tacos", "🍛 Chicken Curry"], cost: "$16" },
            ].map(({ day, meals, cost }) => (
              <div key={day} style={{ backgroundColor: "#FFFDF9", borderRadius: "14px", padding: "16px", border: "1px solid #EDD9C8" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#3C271A" }}>{day}</span>
                  <span style={{ fontSize: "11px", color: "#5A8A56", fontWeight: 600, backgroundColor: "#E8F3E7", padding: "2px 8px", borderRadius: "100px" }}>{cost}</span>
                </div>
                {meals.map(m => (
                  <div key={m} style={{ fontSize: "12px", color: "#72492C", padding: "6px 10px", backgroundColor: "#FAF0DE", borderRadius: "8px", marginBottom: "6px" }}>{m}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAIN POINTS ── */}
      <section style={{ backgroundColor: "#3C271A", padding: "96px 1.5rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#D96B3D", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>Sound familiar?</p>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "#FDF8F0", fontFamily: "'Playfair Display', serif", lineHeight: 1.2 }}>
              The weekly dinner struggle is real
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
            {[
              { emoji: "😩", title: "The 6pm panic", desc: "It's dinnertime. You're staring into the fridge. Nobody can agree. You order takeout again and feel guilty about it." },
              { emoji: "🛒", title: "The wasted grocery run", desc: "You bought ingredients for meals you never made. That wilted spinach, the half-used jar of tahini... $40 in the bin." },
              { emoji: "🔁", title: "The same 5 meals forever", desc: "Spaghetti Monday. Taco Tuesday. You're out of ideas. Everyone at the table is bored but you don't know what else to make." },
              { emoji: "💸", title: "The budget mystery", desc: "You spend more than you planned, but you're not sure where the money went. Groceries feel like a guessing game every week." },
            ].map(({ emoji, title, desc }) => (
              <div key={title} style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "28px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ fontSize: "2rem", display: "block", marginBottom: "14px" }}>{emoji}</span>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#FDF8F0", marginBottom: "8px" }}>{title}</h3>
                <p style={{ fontSize: "14px", color: "#C4A882", lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "56px" }}>
            <p style={{ fontSize: "1.3rem", color: "#FDF8F0", fontFamily: "'Playfair Display', serif", fontStyle: "italic", opacity: 0.9 }}>
              "There has to be a better way."
            </p>
            <p style={{ fontSize: "14px", color: "#AD7B54", marginTop: "8px" }}>There is.</p>
          </div>
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section style={{ padding: "100px 1.5rem", backgroundColor: "#FDF8F0" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#D96B3D", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>The solution</p>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "#3C271A", fontFamily: "'Playfair Display', serif", marginBottom: "20px", lineHeight: 1.2 }}>
            Your personal chef,<br />powered by AI
          </h2>
          <p style={{ fontSize: "1.1rem", color: "#72492C", maxWidth: "540px", margin: "0 auto 72px", lineHeight: 1.7 }}>
            Tell us your taste, budget, and schedule once. Every week, we plan every meal, build your shopping list, and send it to you — without you lifting a finger.
          </p>

          {/* How it works steps */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", textAlign: "left" }}>
            {[
              { num: "01", title: "You tell us about yourself", desc: "Your household size, budget, allergies, cuisines you love, kitchen equipment, and how much time you have to cook." },
              { num: "02", title: "AI plans your entire week", desc: "Claude AI builds a personalized menu — breakfast through dinner — with 2–3 recipe options per meal slot so you stay in control." },
              { num: "03", title: "Your shopping list is ready", desc: "Consolidated, sorted by store and aisle, with pantry items auto-checked. Lands in your inbox before your shopping day." },
              { num: "04", title: "It gets smarter every week", desc: "Rate meals you loved or hated. Update your pantry. The AI learns your preferences and improves your plan automatically." },
            ].map(({ num, title, desc }) => (
              <div key={num} style={{ backgroundColor: "#FFFDF9", borderRadius: "16px", padding: "28px", border: "1px solid #EDD9C8" }}>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#D96B3D", letterSpacing: "0.08em", display: "block", marginBottom: "12px" }}>{num}</span>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#3C271A", marginBottom: "8px", lineHeight: 1.3 }}>{title}</h3>
                <p style={{ fontSize: "13px", color: "#72492C", lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ backgroundColor: "#FAF0DE", padding: "100px 1.5rem" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#D96B3D", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>Everything included</p>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "#3C271A", fontFamily: "'Playfair Display', serif", lineHeight: 1.2 }}>
              Built for real families,<br />real budgets, real kitchens
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {[
              { icon: "🤖", title: "Truly personalized AI", desc: "Not generic meal suggestions. Plans built around your exact dietary needs, allergies, disliked ingredients, and favorite cuisines." },
              { icon: "💰", title: "Budget-aware planning", desc: "Set your weekly grocery budget and we'll plan within it. See estimated costs per meal and track spending over time." },
              { icon: "⏱️", title: "Time-smart scheduling", desc: "Different time limits for weekdays and weekends. 20-minute weeknight meals and leisurely Sunday roasts — we handle both." },
              { icon: "🫙", title: "Pantry intelligence", desc: "Log what you have and we'll use it first. Reduce waste, save money, and never buy something you already own." },
              { icon: "♻️", title: "Leftovers & meal prep", desc: "Cook once, eat twice. We plan dinners that become next-day lunches and batch-cooking sessions that set you up for the week." },
              { icon: "📧", title: "Weekly delivery", desc: "A beautiful email with your full plan and a text with your shopping list — arrives before your shopping day, every week." },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ backgroundColor: "#FFFDF9", borderRadius: "16px", padding: "28px", border: "1px solid #EDD9C8", display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ fontSize: "2rem" }}>{icon}</span>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#3C271A", margin: 0 }}>{title}</h3>
                <p style={{ fontSize: "14px", color: "#72492C", lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section style={{ backgroundColor: "#FDF8F0", padding: "100px 1.5rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <p style={{ textAlign: "center", fontSize: "13px", fontWeight: 600, color: "#D96B3D", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "48px" }}>What people are saying</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
            {[
              { quote: "I used to spend Sunday mornings stressed about the week ahead. Now I wake up, my plan is in my inbox, and I feel completely in control.", name: "Sarah M.", detail: "Mom of 3 · Chicago" },
              { quote: "We've cut our grocery bill by almost $80 a month. The pantry tracking alone is worth it — we actually use what we buy now.", name: "Marcus T.", detail: "Couple · Austin" },
              { quote: "As someone with celiac disease and a nut allergy, finding meal plans I can actually use felt impossible. This just works.", name: "Priya K.", detail: "Single professional · NYC" },
            ].map(({ quote, name, detail }) => (
              <div key={name} style={{ backgroundColor: "#FFFDF9", borderRadius: "16px", padding: "28px 28px 24px", border: "1px solid #EDD9C8" }}>
                <p style={{ fontSize: "14px", color: "#3C271A", lineHeight: 1.7, marginBottom: "20px", fontStyle: "italic" }}>"{quote}"</p>
                <div style={{ borderTop: "1px solid #F0E4D7", paddingTop: "16px" }}>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#3C271A", margin: 0 }}>{name}</p>
                  <p style={{ fontSize: "12px", color: "#AD7B54", margin: "2px 0 0" }}>{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ backgroundColor: "#D96B3D", padding: "96px 1.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 800, color: "#fff", fontFamily: "'Playfair Display', serif", lineHeight: 1.2, marginBottom: "20px" }}>
            Ready to forget about food?
          </h2>
          <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.85)", marginBottom: "40px", lineHeight: 1.6 }}>
            Set up takes 3 minutes. Your first meal plan is waiting on the other side.
          </p>
          <Link href="/signup" style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "17px", fontWeight: 700, color: "#D96B3D", backgroundColor: "#fff", padding: "16px 40px", borderRadius: "14px", textDecoration: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
            ✨ Get started — it&apos;s free
          </Link>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginTop: "16px" }}>No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: "#3C271A", padding: "40px 1.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", backgroundColor: "#D96B3D", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "14px" }}>🍽️</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: "15px", color: "#FDF8F0", fontFamily: "'Playfair Display', serif" }}>Forget About Food</span>
          </div>
          <p style={{ fontSize: "13px", color: "#7A5C45" }}>© 2025 Forget About Food. All rights reserved.</p>
          <div style={{ display: "flex", gap: "24px" }}>
            {["Privacy", "Terms", "Contact"].map(link => (
              <Link key={link} href="#" style={{ fontSize: "13px", color: "#7A5C45", textDecoration: "none" }}>{link}</Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
