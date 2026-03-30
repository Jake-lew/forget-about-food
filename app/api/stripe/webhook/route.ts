import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  const supabase = await createClient();

  const getTierFromPriceId = (priceId: string) => {
    if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return "starter";
    if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
    if (priceId === process.env.STRIPE_CHEF_PRICE_ID) return "chef";
    return "starter";
  };

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      if (!userId) break;

      const priceId = sub.items.data[0]?.price.id;
      const tier = getTierFromPriceId(priceId);
      const isActive = sub.status === "active" || sub.status === "trialing";

      await supabase.from("profiles").update({
        subscription_tier: isActive ? tier : "starter",
        stripe_subscription_id: sub.id,
      }).eq("id", userId);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      if (!userId) break;
      await supabase.from("profiles").update({
        subscription_tier: "starter",
        stripe_subscription_id: null,
      }).eq("id", userId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
