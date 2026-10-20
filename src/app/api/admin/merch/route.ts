import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { getMerchConnection, quoteMerchandise } from "@/lib/printify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!(await verifyAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await getMerchConnection(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Unable to check Printify. Please try again." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await quoteMerchandise(await request.json()), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Unable to quote this order. Check the address and current variant availability." }, { status: 400 });
  }
}
