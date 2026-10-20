import { NextResponse } from "next/server";
import { allowPublicRequest } from "@/lib/request-limit";
import { createMerchQuote, merchSalesEnabled } from "@/lib/merch-orders";

export async function POST(request: Request) {
  if (!merchSalesEnabled()) return NextResponse.json({ error: "The shop is not open for payments yet." }, { status: 503 });
  if (!(await allowPublicRequest("merch", 100))) return NextResponse.json({ error: "Please try again later." }, { status: 429 });
  try { return NextResponse.json(await createMerchQuote(await request.json()), { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ error: "We couldn’t quote this order. Check your address and selected variants." }, { status: 400 }); }
}
