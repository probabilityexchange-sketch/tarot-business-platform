import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { fulfillBooking } from "@/lib/booking-fulfillment";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  let event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  try {
    if ((event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") && event.data.object.metadata?.offeringId) {
      await fulfillBooking(event.data.object);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook failed", event.id, error);
    return NextResponse.json({ error: "Fulfillment unavailable" }, { status: 500 });
  }
}
