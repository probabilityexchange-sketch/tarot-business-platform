import { allowPublicRequest } from "@/lib/request-limit";
import { getStripe } from "@/lib/stripe";
import { fulfillGiftPurchase } from "@/lib/gift-orders";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id") ?? "";
  if (!sessionId.startsWith("cs_")) {
    return Response.json({ error: "This gift link is not valid." }, { status: 400 });
  }
  if (!(await allowPublicRequest("gift-status", 300))) {
    return Response.json({ error: "Please try again later." }, { status: 429 });
  }
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const result = await fulfillGiftPurchase(session);
    if (result.status === "unpaid") {
      return Response.json({ status: "unpaid" });
    }
    return Response.json({
      status: "ready",
      code: result.code,
      tierTitle: result.tierTitle,
      priceCents: result.priceCents,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid gift payment.") {
      return Response.json({ error: "This gift link is not valid." }, { status: 403 });
    }
    console.error("Gift status error:", error);
    return Response.json({ error: "Gift status is temporarily unavailable." }, { status: 500 });
  }
}
