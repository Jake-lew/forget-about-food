import { createClient } from "@/lib/supabase/server";
import { getStripeClient, PLANS, PlanTier } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tier } = await req.json() as { tier: PlanTier };
  if (!PLANS[tier]) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, email, full_name")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await getStripeClient().customers.create({
      email: user.email,
      name: profile?.full_name || undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://forget-about-food.vercel.app";

  const session = await getStripeClient().checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: PLANS[tier].priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?upgraded=true`,
    cancel_url: `${appUrl}/pricing`,
    subscription_data: {
      metadata: { supabase_user_id: user.id, tier },
    },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
