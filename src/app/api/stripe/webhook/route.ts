import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getStripe } from "@/lib/stripe";
import { getAdminDb } from "@/lib/firebase-admin";
import { recordMerchPayment } from "@/lib/merch-orders";
import { recordWorkbookPurchase } from "@/lib/workbook-orders";
import { fulfillBooking } from "@/lib/booking-fulfillment";
import { fulfillGiftPurchase } from "@/lib/gift-orders";
import { trackBrevoEvent } from "@/lib/brevo-events";

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
    if ((event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") && event.data.object.metadata?.kind === "merch") {
      await recordMerchPayment(event.data.object);
    }
    if ((event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") && event.data.object.metadata?.kind === "workbook") {
      await recordWorkbookPurchase(event.data.object);
    }
    if ((event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") && event.data.object.metadata?.kind === "gift") {
      await fulfillGiftPurchase(event.data.object);
    }
    if (event.type === "checkout.session.expired" && event.data.object.metadata?.offeringId) {
      const leadRef = getAdminDb().collection("booking_leads").doc(event.data.object.id);
      // Transition checkout_started -> abandoned exactly once; only that transition sends
      // the Brevo event, so replays, missing leads and already-paid leads send nothing.
      const transitioned = await getAdminDb().runTransaction(async (transaction) => {
        const lead = (await transaction.get(leadRef)).data();
        if (lead?.status !== "checkout_started") return false;
        transaction.update(leadRef, { status: "abandoned", abandonedAt: Timestamp.now() });
        return true;
      });
      const email = event.data.object.metadata?.customerEmail;
      if (transitioned && typeof email === "string" && email) {
        // Event failures are never fatal: the lead is already marked abandoned. A replay
        // will not resend; re-trigger from Brevo or reset the lead status if needed.
        try {
          await trackBrevoEvent("booking_abandoned", email, {
            OFFERING: String(event.data.object.metadata?.offeringName ?? ""),
            SLOT: String(event.data.object.metadata?.slotStart ?? ""),
          });
        } catch (error) {
          console.error("Abandoned booking event tracking failed", error);
        }
      }
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook failed", event.id, error);
    return NextResponse.json({ error: "Fulfillment unavailable" }, { status: 500 });
  }
}
