import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

type StoredSubscriptionStatus = "inactive" | "active" | "canceled" | "past_due";

function toStoredStatus(status: Stripe.Subscription.Status): StoredSubscriptionStatus {
  if (status === "active") return "active";
  if (status === "past_due" || status === "unpaid") return "past_due";
  if (status === "canceled") return "canceled";
  return "inactive";
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new NextResponse("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return new NextResponse("Invalid webhook signature or payload", { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

      // Never grant a subscription from a non-subscription or unlinked checkout session.
      if (session.mode === "subscription" && session.status === "complete" && userId && subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const { error } = await admin.from("subscriptions").upsert(
          {
            user_id: userId,
            stripe_customer_id:
              typeof session.customer === "string" ? session.customer : null,
            stripe_subscription_id: subscription.id,
            status: toStoredStatus(subscription.status),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

        if (error) throw new Error("Subscription persistence failed.");
      }
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const status =
        event.type === "customer.subscription.deleted"
          ? "canceled"
          : toStoredStatus(subscription.status);

      const { error } = await admin
        .from("subscriptions")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", subscription.id);

      if (error) throw new Error("Subscription update failed.");
    }

    return new NextResponse("ok");
  } catch {
    // Return a retryable error if persistence fails; do not log customer or payment data.
    console.error("Stripe webhook processing failed.");
    return new NextResponse("Webhook processing failed", { status: 500 });
  }
}
