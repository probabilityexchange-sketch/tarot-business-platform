import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { listMerchOrders, transferMerchOrder } from "@/lib/merch-orders";

export async function GET(request: NextRequest) {
  if (!(await verifyAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ orders: await listMerchOrders() }, { headers: { "Cache-Control": "no-store" } });
}
export async function POST(request: NextRequest) {
  if (!(await verifyAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = z.object({ id: z.string(), action: z.enum(["transfer", "reconcile"]), manualApprovalConfirmed: z.literal(true) }).strict().parse(await request.json());
    return NextResponse.json(await transferMerchOrder(body.id, body.action === "reconcile"));
  } catch { return NextResponse.json({ error: "Order was not transferred or its outcome needs review. Refresh, then use Check Printify before retrying. Do not create another copy manually." }, { status: 409 }); }
}
