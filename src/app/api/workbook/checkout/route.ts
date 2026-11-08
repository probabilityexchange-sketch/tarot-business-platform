import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { isWorkbookSaleEnabled, workbookProduct } from "@/lib/workbook";

const purchaseSchema = z.object({ purchaseId: z.string().min(1).max(64) }).strict();

export async function POST(request: Request) {
  if (!isWorkbookSaleEnabled()) {
    return NextResponse.json(
      { error: "The workbook isn't available yet. Join Letters from Kali to hear when it's ready." },
      { status: 503 }
    );
  }
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
    const base = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;

    const session = await getStripe().checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: workbookProduct.title,
              description: workbookProduct.description,
            },
            unit_amount: workbookProduct.priceCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        kind: "workbook",
      },
      success_url: `${base}/workbook/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/workbook`,
    }, { idempotencyKey: `workbook-${parsed.data.purchaseId}` });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Workbook checkout error:", error);
    const message = "Unable to start checkout. Please try again or contact Kali.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
