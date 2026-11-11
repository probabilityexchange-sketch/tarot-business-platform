import type Stripe from "stripe";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { isValidWorkbookPurchaseAmount } from "@/lib/workbook";

const collections = { buyers: "workbook_buyers" } as const;

export async function recordWorkbookPurchase(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return { status: "unpaid" };
  if (session.metadata?.kind !== "workbook" ||
      !isValidWorkbookPurchaseAmount(session.amount_total) ||
      session.currency !== "usd") throw new Error("Invalid workbook payment.");
  const ref = getAdminDb().collection(collections.buyers).doc(session.id);
  return getAdminDb().runTransaction(async (transaction) => {
    const existing = (await transaction.get(ref)).data();
    if (existing) return { status: "recorded" };
    transaction.create(ref, {
      stripeSessionId: session.id,
      paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
      email: session.customer_details?.email ?? session.customer_email ?? null,
      amountCents: session.amount_total,
      createdAt: Timestamp.now(),
    });
    return { status: "recorded" };
  });
}
