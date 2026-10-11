import { createHash } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getStripe } from "@/lib/stripe";
import { bookingCollections, bookingCheckoutSchema, parseCurrencyToCents } from "@/lib/booking";
import { getOfferingById } from "@/lib/offerings";

export async function POST(request: Request) {
  try {
    const parsed = bookingCheckoutSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid booking details" }, { status: 400 });
    }
    const payload = parsed.data;
    const offering = getOfferingById(payload.offeringId);
    if (!offering) {
      return NextResponse.json({ error: "Unknown offering" }, { status: 400 });
    }
    const slotDuration = Number.parseInt(offering.duration, 10);
    if (payload.slotDuration !== slotDuration) {
      return NextResponse.json({ error: "Invalid session duration" }, { status: 400 });
    }
    const amount = parseCurrencyToCents(offering.price);
    const holdRef = getAdminDb().collection(bookingCollections.slots).doc(payload.reservationUid);
    const tokenHash = createHash("sha256").update(payload.reservationToken).digest("hex");
    const fingerprint = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    const valid = await getAdminDb().runTransaction(async (transaction) => {
      const hold = (await transaction.get(holdRef)).data();
      if (!hold || hold.tokenHash !== tokenHash || hold.offeringId !== offering.id ||
          hold.slotStart !== payload.slotStart || hold.slotDuration !== slotDuration ||
          !(hold.expiresAt instanceof Timestamp) || hold.expiresAt.toMillis() < Date.now() + 31 * 60 * 1000 ||
          (hold.checkoutFingerprint && hold.checkoutFingerprint !== fingerprint)) return null;
      const checkoutExpiresAt = hold.checkoutExpiresAt || Math.floor(Date.now() / 1000) + 31 * 60;
      transaction.update(holdRef, { checkoutFingerprint: fingerprint, notes: payload.notes, checkoutExpiresAt });
      return { checkoutExpiresAt, checkoutUrl: hold.checkoutUrl as string | undefined };
    });
    if (!valid) return NextResponse.json({ error: "Your reservation expired or changed. Please choose the time again." }, { status: 409 });
    if (valid.checkoutUrl) return NextResponse.json({ url: valid.checkoutUrl });
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: offering.title,
              description: `${offering.duration} Psychological Tarot Consultation`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: payload.customerEmail,
      expires_at: valid.checkoutExpiresAt,
      success_url: `${baseUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/readings`,
      metadata: {
        offeringId: payload.offeringId,
        offeringName: offering.title,
        reservationUid: payload.reservationUid,
        slotStart: payload.slotStart,
        slotDuration: String(slotDuration),
        priceCents: String(amount),
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        customerTimezone: payload.customerTimezone,
      },
    }, { idempotencyKey: `booking-${payload.reservationUid}` });

    await holdRef.update({ checkoutUrl: session.url, stripeSessionId: session.id });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    const message = "Unable to start checkout. Please try again or contact Kali.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
