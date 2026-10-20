import { NextResponse } from "next/server";
import { allowPublicRequest } from "@/lib/request-limit";
import { createMerchCheckout, merchSalesEnabled } from "@/lib/merch-orders";

export async function POST(request: Request) {
  if (!merchSalesEnabled()) return NextResponse.json({ error: "The shop is not open for payments yet." }, { status: 503 });
  if (!(await allowPublicRequest("merch-checkout", 300))) return NextResponse.json({ error: "Please try again later." }, { status: 429 });
  try { return NextResponse.json(await createMerchCheckout(await request.json()), { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ error: "Checkout could not start. Request a fresh shipping quote and try again." }, { status: 400 }); }
}
