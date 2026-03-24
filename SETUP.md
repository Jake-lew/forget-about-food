# 🍽️ Forget About Food — Setup Guide

## Prerequisites
- Node.js 18+
- A Supabase account (free tier works)
- An Anthropic API key
- A Resend account (for emails)
- A Twilio account (for SMS, optional)

---

## Step 1: Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/forget-about-food.git
cd forget-about-food
npm install
```

---

## Step 2: Set Up Supabase

1. Go to [app.supabase.com](https://app.supabase.com) and create a new project
2. In the SQL Editor, paste and run the contents of `supabase/schema.sql`
3. Copy your **Project URL** and **anon key** from Settings → API

---

## Step 3: Configure Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `RESEND_API_KEY` | [resend.com](https://resend.com) |
| `TWILIO_ACCOUNT_SID` | [console.twilio.com](https://console.twilio.com) |
| `TWILIO_AUTH_TOKEN` | Twilio Console |
| `TWILIO_PHONE_NUMBER` | Twilio → Phone Numbers |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL once deployed |

---

## Step 4: Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Step 5: Deploy to Vercel

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit - Forget About Food"
git remote add origin https://github.com/YOUR_USERNAME/forget-about-food.git
git push -u origin main
```

2. In Vercel:
   - Connect your GitHub repo
   - Add all environment variables from `.env.local`
   - Deploy!

3. Update `NEXT_PUBLIC_APP_URL` in Vercel to your production URL

---

## Step 6: Set Up Email Sending (Resend)

1. Add your domain in [Resend](https://resend.com/domains) (e.g. `forgetaboutfood.app`)
2. Add the DNS records they give you
3. Update the `from` email in `app/api/send-notification/route.ts` to match your domain

> **For testing:** You can use `onboarding@resend.dev` as the from address without domain verification

---

## App Features

### What works out of the box:
- ✅ Landing page
- ✅ Email/password authentication
- ✅ 8-step onboarding wizard
- ✅ AI meal plan generation (Claude claude-opus-4-6)
- ✅ Weekly meal view with recipe options (2-3 per slot)
- ✅ Meal swapping (pick which recipe option you want)
- ✅ Shopping list sorted by category or store
- ✅ Check-off shopping items
- ✅ Pantry tracking
- ✅ Budget tracking
- ✅ Meal rating (👍/👎 for AI learning)
- ✅ Beautiful weekly email with meal plan + shopping list
- ✅ SMS notifications with app link
- ✅ Full settings page

### Architecture
```
forget-about-food/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── (auth)/login                # Login
│   ├── (auth)/signup               # Signup
│   ├── onboarding/                 # 8-step onboarding wizard
│   ├── (dashboard)/dashboard       # Main dashboard
│   ├── (dashboard)/meal-plan       # Weekly meal plan view
│   ├── (dashboard)/shopping-list   # Shopping list
│   ├── (dashboard)/pantry          # Pantry management
│   ├── (dashboard)/settings        # User settings
│   ├── api/generate-meal-plan      # AI generation endpoint
│   ├── api/send-notification       # Email + SMS endpoint
│   └── api/swap-meal               # Recipe option swapping
├── components/
│   ├── layout/Navbar.tsx
│   └── ui/                         # Button, Card, Input, etc.
├── lib/
│   ├── supabase/                   # Supabase client + server
│   └── utils.ts                    # Helpers + constants
├── types/index.ts                  # TypeScript types
└── supabase/schema.sql             # Full DB schema
```

---

## Tips

- **Regenerate any time:** The dashboard has a "Regenerate Plan" button
- **Recipe options:** Click any meal in the plan view to see 2-3 recipe options and swap
- **Pantry:** Keep this updated — the AI uses pantry items first, saving you money
- **Rating meals:** Thumbs up/down trains the AI over time
- **Mobile:** The app is fully responsive with a bottom nav bar on mobile
