import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fulfillBooking } from "@/lib/booking-fulfillment";
import { getStripe } from "@/lib/stripe";

const confirmSchema = z.object({ sessionId: z.string().regex(/^cs_[a-zA-Z0-9_]+$/).max(255) });

export async function POST(request: NextRequest) {
  try {
    const parsed = confirmSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid booking reference" }, { status: 400 });
    const result = await fulfillBooking(await getStripe().checkout.sessions.retrieve(parsed.data.sessionId));
    return NextResponse.json(result, { status: result.status === "unpaid" ? 409 : result.status === "pending" ? 202 : 200 });
  } catch (error) {
    console.error("Booking confirmation failed", error);
    return NextResponse.json({ error: "Unable to confirm yet. Please contact Kali with your booking reference." }, { status: 503 });
  }
}
