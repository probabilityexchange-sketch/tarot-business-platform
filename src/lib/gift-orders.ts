import { createHash } from "node:crypto";
import type Stripe from "stripe";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { getStripe } from "@/lib/stripe";
import { getGiftTierById } from "@/lib/gift";
import { trackBrevoEvent } from "@/lib/brevo-events";

const collections = { giftCards: "gift_cards" } as const;

type GiftFulfillment =
  | { status: "unpaid" }
  | { status: "recorded"; code: string; tierTitle: string; priceCents: number };

export async function fulfillGiftPurchase(session: Stripe.Checkout.Session): Promise<GiftFulfillment> {
  if (session.payment_status !== "paid") return { status: "unpaid" };
  const tier = session.metadata?.kind === "gift" ? getGiftTierById(session.metadata.giftTier ?? "") : undefined;
  if (!tier || session.amount_total !== tier.priceCents || session.currency !== "usd") {
    throw new Error("Invalid gift payment.");
  }

  const db = getAdminDb();
  const ref = db.collection(collections.giftCards).doc(session.id);

  // Read first: fulfillment is idempotent, so an existing record always wins.
  const existing = (await ref.get()).data();
  if (existing) {
    return {
      status: "recorded",
      code: String(existing.code),
      tierTitle: String(existing.tierTitle),
      priceCents: Number(existing.priceCents),
    };
  }

  // Deterministic human code: retries of the same session produce the same code, and
  // Stripe idempotency keys make coupon/promotion creation safe to retry after failure.
  const humanCode = "KALI-" + createHash("sha256").update(session.id).digest("hex").slice(0, 8).toUpperCase();
  const coupon = await getStripe().coupons.create(
    {
      amount_off: tier.priceCents,
      currency: "usd",
      duration: "once",
      max_redemptions: 1,
      name: `Gift ${tier.title} — ${session.id}`,
    },
    { idempotencyKey: `gift-coupon-${session.id}` }
  );
  const promo = await getStripe().promotionCodes.create(
    { promotion: { type: "coupon", coupon: coupon.id }, code: humanCode, max_redemptions: 1 },
    { idempotencyKey: `gift-promo-${session.id}` }
  );
  const purchaserEmail = session.customer_details?.email ?? session.customer_email ?? null;

  // Create-if-still-missing. If a concurrent fulfillment wrote the record first, keep
  // its values: idempotency keys prevent duplicate coupons on retry, and races are
  // near-impossible because each checkout session fulfills only once.
  const recorded = await db.runTransaction(async (transaction) => {
    const current = (await transaction.get(ref)).data();
    if (current) {
      return {
        code: String(current.code),
        tierTitle: String(current.tierTitle),
        priceCents: Number(current.priceCents),
        created: false,
      };
    }
    transaction.create(ref, {
      code: promo.code,
      couponId: coupon.id,
      tierId: tier.id,
      tierTitle: tier.title,
      priceCents: tier.priceCents,
      purchaserEmail,
      stripeSessionId: session.id,
      redeemed: false,
      createdAt: Timestamp.now(),
    });
    return { code: promo.code, tierTitle: tier.title, priceCents: tier.priceCents, created: true };
  });

  // Event failures are never fatal: Brevo automations listen for this event, but the
  // gift code is already recorded and usable.
  if (recorded.created && purchaserEmail) {
    try {
      await trackBrevoEvent("gift_purchased", purchaserEmail, {
        GIFT_CODE: recorded.code,
        GIFT_TIER: recorded.tierTitle,
      });
    } catch (error) {
      console.error("Gift purchase event tracking failed", error);
    }
  }

  return { status: "recorded", code: recorded.code, tierTitle: recorded.tierTitle, priceCents: recorded.priceCents };
}
