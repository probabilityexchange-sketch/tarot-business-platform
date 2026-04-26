import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { bookingCheckoutSchema, parseCurrencyToCents } from "@/lib/booking";

export async function POST(request: Request) {
  try {
    const payload = bookingCheckoutSchema.parse(await request.json());
    const amount = parseCurrencyToCents(payload.price);
    const baseUrl = new URL(request.url).origin;

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: payload.offeringName,
              description: `${payload.duration} Psychological Tarot Consultation`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/readings`,
      metadata: {
        offeringId: payload.offeringId,
        offeringName: payload.offeringName,
        reservationUid: payload.reservationUid,
        slotStart: payload.slotStart,
        slotDuration: String(payload.slotDuration),
        priceCents: String(amount),
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        customerTimezone: payload.customerTimezone,
        notes: payload.notes,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    const message = error instanceof Error ? error.message : "Failed to create checkout session";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
