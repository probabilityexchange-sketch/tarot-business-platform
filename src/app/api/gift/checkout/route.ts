import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { getGiftTierById } from "@/lib/gift";

const purchaseSchema = z
  .object({ tierId: z.string().max(40), purchaseId: z.string().min(1).max(64) })
  .strict();

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    let input: unknown = {};
    if (raw.trim()) {
      try {
        input = JSON.parse(raw);
      } catch {
        return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
      }
    }
    const parsed = purchaseSchema.safeParse(input);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
    }
    const tier = getGiftTierById(parsed.data.tierId);
    if (!tier) {
      return NextResponse.json({ error: "Unknown gift option." }, { status: 400 });
    }
    const base = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;

    const session = await getStripe().checkout.sessions.create(
      {
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: tier.title,
                description: tier.description,
              },
              unit_amount: tier.priceCents,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        metadata: {
          kind: "gift",
          giftTier: tier.id,
        },
        success_url: `${base}/gift/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/gift`,
      },
      { idempotencyKey: `gift-${tier.id}-${parsed.data.purchaseId}` }
    );
    if (!session.url) throw new Error("Stripe did not return a checkout URL");

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Gift checkout error:", error);
    const message = "Unable to start checkout. Please try again or contact Kali.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
