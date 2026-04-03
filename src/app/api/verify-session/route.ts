import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === "paid") {
      return NextResponse.json({ 
        status: "success",
        customerEmail: session.customer_details?.email,
        offeringId: session.metadata?.offeringId 
      });
    } else {
      return NextResponse.json({ status: "pending" });
    }
  } catch (error) {
    console.error("Stripe Verification Error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
