import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { workbookProduct } from "@/lib/workbook";

export const runtime = "nodejs";

const invalidMessage = "This download link is not valid for a paid workbook purchase.";

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id") || "";
  if (!sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: invalidMessage }, { status: 403 });
  }
  let session: Stripe.Checkout.Session;
  try {
    session = await getStripe().checkout.sessions.retrieve(sessionId);
  } catch {
    return NextResponse.json({ error: invalidMessage }, { status: 403 });
  }
  if (session.payment_status !== "paid" ||
      session.metadata?.kind !== "workbook" ||
      session.amount_total !== workbookProduct.priceCents ||
      session.currency !== "usd") {
    return NextResponse.json({ error: invalidMessage }, { status: 403 });
  }
  let pdf: Buffer;
  try {
    pdf = await readFile(join(process.cwd(), "private-assets", "discernment-workbook.pdf"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ error: "Your workbook is being finalized. Please contact kali@kalimeister.com and we will send your copy personally." }, { status: 503 });
    }
    throw error;
  }
  return new Response(pdf as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=\"learning-to-listen-workbook.pdf\"",
      "Cache-Control": "no-store",
    },
  });
}
