import { NextResponse } from "next/server";
import { allowPublicRequest } from "@/lib/request-limit";
import { getStripe } from "@/lib/stripe";
import { recordMerchPayment } from "@/lib/merch-orders";

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("session_id") || "";
  if (!/^cs_(test_|live_)?[A-Za-z0-9]{12,}$/.test(id)) return NextResponse.json({ error: "Invalid order reference." }, { status: 400 });
  if (!(await allowPublicRequest("merch-status", 300))) return NextResponse.json({ error: "Please try again later." }, { status: 429 });
  try {
    const session = await getStripe().checkout.sessions.retrieve(id);
    if (session.metadata?.kind !== "merch") return NextResponse.json({ error: "Order not found." }, { status: 404 });
    const result = await recordMerchPayment(session);
    return NextResponse.json({ paid: session.payment_status === "paid", status: result.status }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Payment confirmation is still being checked. Please try again." }, { status: 503 }); }
}
