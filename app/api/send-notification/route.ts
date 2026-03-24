import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { NextResponse } from "next/server";
import { formatCurrency, formatShortDate } from "@/lib/utils";

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY || "placeholder");
  const supabase = await createClient();
  const { userId, mealPlanId, shoppingListId } = await request.json();

  const [{ data: profile }, { data: plan }, { data: meals }, { data: shoppingItems }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("meal_plans").select("*").eq("id", mealPlanId).single(),
    supabase.from("planned_meals").select("*").eq("meal_plan_id", mealPlanId).order("day").order("meal_type"),
    shoppingListId ? supabase.from("shopping_items").select("*").eq("shopping_list_id", shoppingListId).eq("in_pantry", false).order("category").order("name") : { data: [] },
  ]);

  if (!profile || !plan) {
    return NextResponse.json({ error: "Data not found" }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://forgetaboutfood.app";
  const firstName = profile.full_name?.split(" ")[0] || "there";

  // Group meals by day
  type MealEntry = { meal_name: string; prep_time: number; cook_time: number; estimated_cost: number; meal_type: string };
  const mealsByDay: Record<string, MealEntry[]> = {};
  const dayOrder = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

  dayOrder.forEach(day => { mealsByDay[day] = []; });
  meals?.forEach((meal: MealEntry & { day: string }) => {
    if (mealsByDay[meal.day]) mealsByDay[meal.day].push(meal);
  });

  // Group shopping items by category
  type ShoppingEntry = { name: string; quantity: string; unit: string; category: string };
  const itemsByCategory: Record<string, ShoppingEntry[]> = {};
  (shoppingItems as ShoppingEntry[] || []).forEach(item => {
    const key = item.category || "other";
    if (!itemsByCategory[key]) itemsByCategory[key] = [];
    itemsByCategory[key].push(item);
  });

  const categoryEmojis: Record<string, string> = {
    produce: "🥦", meat_seafood: "🥩", dairy_eggs: "🥛", pantry: "🫙",
    frozen: "🧊", bakery: "🍞", beverages: "🥤", condiments: "🫙", spices: "🌿", other: "📦"
  };

  const mealTypeEmojis: Record<string, string> = {
    breakfast: "🌅", lunch: "☀️", dinner: "🌙", snack: "🍎"
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your Meal Plan for ${formatShortDate(plan.week_start)}</title>
</head>
<body style="margin:0;padding:0;background-color:#FDF8F0;font-family:'Inter',Arial,sans-serif;color:#3C271A;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FDF8F0;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#D96B3D,#E8874F);border-radius:24px 24px 0 0;padding:32px;text-align:center;">
          <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0 0 8px;">🍽️ Forget About Food</p>
          <h1 style="color:white;font-size:28px;margin:0 0 8px;font-family:Georgia,serif;">Hey ${firstName}! Your meal plan is ready 🎉</h1>
          <p style="color:rgba(255,255,255,0.85);font-size:16px;margin:0;">Week of ${formatShortDate(plan.week_start)} – ${formatShortDate(plan.week_end)}</p>
        </td></tr>

        <!-- Budget banner -->
        <tr><td style="background:#FAE5DB;padding:16px 32px;text-align:center;border-left:1px solid #F5C9B6;border-right:1px solid #F5C9B6;">
          <p style="margin:0;font-size:14px;color:#72492C;">Estimated grocery cost this week</p>
          <p style="margin:4px 0 0;font-size:32px;font-weight:bold;color:#D96B3D;font-family:Georgia,serif;">${formatCurrency(plan.total_estimated_cost)}</p>
        </td></tr>

        <!-- Main content -->
        <tr><td style="background:#FFFDF9;border:1px solid #F0E4D7;border-top:none;border-radius:0 0 24px 24px;padding:32px;">

          <!-- Meal plan section -->
          <h2 style="font-size:20px;color:#3C271A;margin:0 0 20px;font-family:Georgia,serif;">📅 Your Week</h2>

          ${dayOrder.map(day => {
            const dayMeals = mealsByDay[day];
            if (!dayMeals || dayMeals.length === 0) return "";
            return `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;border:1px solid #F0E4D7;border-radius:16px;overflow:hidden;">
            <tr><td style="background:#FAF0DE;padding:12px 16px;">
              <p style="margin:0;font-size:12px;font-weight:bold;color:#D96B3D;text-transform:uppercase;letter-spacing:1px;">${day.toUpperCase()}</p>
            </td></tr>
            <tr><td style="padding:12px 16px;">
              ${dayMeals.map((meal: MealEntry) => `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;last-child:margin-bottom:0;">
                <tr>
                  <td width="24" style="vertical-align:top;padding-top:2px;">${mealTypeEmojis[meal.meal_type] || "🍽️"}</td>
                  <td>
                    <p style="margin:0;font-size:14px;font-weight:600;color:#3C271A;">${meal.meal_name}</p>
                    <p style="margin:0;font-size:12px;color:#AD7B54;">${meal.prep_time + meal.cook_time} min · ${formatCurrency(meal.estimated_cost)}</p>
                  </td>
                </tr>
              </table>
              `).join("")}
            </td></tr>
          </table>`;
          }).join("")}

          <!-- Divider -->
          <hr style="border:none;border-top:2px solid #F0E4D7;margin:28px 0;">

          <!-- Shopping list section -->
          <h2 style="font-size:20px;color:#3C271A;margin:0 0 20px;font-family:Georgia,serif;">🛒 Shopping List</h2>
          <p style="font-size:14px;color:#72492C;margin:0 0 20px;">${(shoppingItems as ShoppingEntry[] || []).length} items to pick up this week</p>

          ${Object.entries(itemsByCategory).map(([category, catItems]) => `
          <div style="margin-bottom:20px;">
            <p style="margin:0 0 10px;font-size:13px;font-weight:bold;color:#72492C;text-transform:uppercase;letter-spacing:0.5px;">
              ${categoryEmojis[category] || "📦"} ${category.replace(/_/g," ").toUpperCase()}
            </p>
            ${catItems.map((item: ShoppingEntry) => `
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:6px;">
              <tr>
                <td width="16" style="vertical-align:middle;">
                  <div style="width:14px;height:14px;border-radius:4px;border:1.5px solid #DDB99A;display:inline-block;"></div>
                </td>
                <td style="padding-left:10px;">
                  <span style="font-size:14px;color:#3C271A;">${item.name}</span>
                  ${item.quantity || item.unit ? `<span style="font-size:13px;color:#AD7B54;margin-left:8px;">${item.quantity} ${item.unit}</span>` : ""}
                </td>
              </tr>
            </table>`).join("")}
          </div>`).join("")}

          <!-- CTA Button -->
          <div style="text-align:center;margin:32px 0 0;">
            <a href="${appUrl}/shopping-list" style="display:inline-block;background-color:#D96B3D;color:white;font-size:16px;font-weight:600;padding:14px 32px;border-radius:16px;text-decoration:none;">
              Open Full Shopping List →
            </a>
          </div>

        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px;text-align:center;">
          <p style="font-size:12px;color:#AD7B54;margin:0 0 8px;">Forget About Food · Your stress-free meal planner</p>
          <p style="font-size:12px;color:#C7A07E;margin:0;">
            <a href="${appUrl}/settings" style="color:#D96B3D;text-decoration:none;">Manage notifications</a> ·
            <a href="${appUrl}/settings" style="color:#D96B3D;text-decoration:none;margin-left:8px;">Unsubscribe</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: "Forget About Food <meals@forgetaboutfood.app>",
      to: profile.email,
      subject: `🍽️ Your meal plan for ${formatShortDate(plan.week_start)} is ready!`,
      html,
    });

    // Send SMS if enabled
    if (profile.sms_notifications && profile.phone_number) {
      // Twilio SMS
      const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

      if (twilioAccountSid && twilioAuthToken && twilioPhone) {
        const message = `🍽️ Hey ${firstName}! Your Forget About Food meal plan for the week of ${formatShortDate(plan.week_start)} is ready.\n\nView your plan & shopping list: ${appUrl}/meal-plan\n\nEst. grocery cost: ${formatCurrency(plan.total_estimated_cost)}`;

        await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
          method: "POST",
          headers: {
            "Authorization": "Basic " + Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: profile.phone_number,
            From: twilioPhone,
            Body: message,
          }),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notification error:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
