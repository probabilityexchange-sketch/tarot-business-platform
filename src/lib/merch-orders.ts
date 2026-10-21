import type Stripe from "stripe";
import { createHash, randomBytes } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { getAdminDb } from "@/lib/firebase-admin";
import { merchProducts } from "@/lib/merch-products";
import { getStripe } from "@/lib/stripe";
import { createHeldPrintifyOrder, findPrintifyOrder, merchQuoteSchema, quoteMerchandise } from "@/lib/printify";

const collections = { quotes: "merch_quotes", orders: "merch_orders" };
const quoteKeySchema = z.object({ id: z.string().regex(/^[a-f0-9]{32}$/), token: z.string().regex(/^[a-f0-9]{64}$/) }).strict();
const lineSchema = z.object({ productId: z.string(), variantId: z.number().int(), quantity: z.number().int().positive(), name: z.string(), variant: z.string(), priceCents: z.number().int().positive() });
const storedQuoteSchema = z.object({
  items: merchQuoteSchema.shape.items, address: merchQuoteSchema.shape.address, lines: z.array(lineSchema),
  subtotalCents: z.number().int().nonnegative(), shippingCents: z.number().int().nonnegative(), tokenHash: z.string(),
  expiresAt: z.instanceof(Timestamp), stripeSessionId: z.string().optional(), checkoutUrl: z.string().optional(),
});

function digest(value: string) { return createHash("sha256").update(value).digest("hex"); }
export function merchSalesEnabled() {
  return process.env.MERCH_CHECKOUT_ENABLED === "true" && process.env.MERCH_TAX_REVIEWED === "true";
}

export async function createMerchQuote(input: unknown) {
  if (!merchSalesEnabled()) throw new Error("Merchandise checkout is not open yet.");
  const data = merchQuoteSchema.parse(input);
  const quote = await quoteMerchandise(data);
  const id = randomBytes(16).toString("hex");
  const token = randomBytes(32).toString("hex");
  await getAdminDb().collection(collections.quotes).doc(id).create({ ...data, lines: quote.lines, subtotalCents: quote.subtotalCents, shippingCents: quote.shippingCents, tokenHash: digest(token), createdAt: Timestamp.now(), deleteAfter: Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60000), expiresAt: Timestamp.fromMillis(Date.now() + 15 * 60000) });
  return { id, token, lines: quote.lines, subtotalCents: quote.subtotalCents, shippingCents: quote.shippingCents, expiresInSeconds: 900 };
}

export async function createMerchCheckout(input: unknown) {
  if (!merchSalesEnabled()) throw new Error("Merchandise checkout is not open yet.");
  const { id, token } = quoteKeySchema.parse(input);
  const ref = getAdminDb().collection(collections.quotes).doc(id);
  const quote = storedQuoteSchema.parse((await ref.get()).data());
  if (quote.tokenHash !== digest(token)) throw new Error("Invalid quote.");
  if (quote.stripeSessionId && quote.checkoutUrl) {
    const existing = await getStripe().checkout.sessions.retrieve(quote.stripeSessionId);
    if (existing.status !== "open") throw new Error("This checkout is no longer open. Request a fresh quote.");
    return { url: quote.checkoutUrl };
  }
  if (quote.expiresAt.toMillis() < Date.now()) throw new Error("Your quote expired. Please request another.");
  const refreshed = await quoteMerchandise({ items: quote.items, address: quote.address });
  if (refreshed.subtotalCents !== quote.subtotalCents || refreshed.shippingCents !== quote.shippingCents) throw new Error("The shipping quote changed. Please request another.");
  const a = quote.address;
  const address = { line1: a.address1, line2: a.address2 || "", city: a.city, state: a.region, postal_code: a.zip, country: a.country };
  const shipping = { name: `${a.first_name} ${a.last_name}`, address, ...(a.phone ? { phone: a.phone } : {}) };
  const customer = await getStripe().customers.create({ email: a.email, name: shipping.name, address, shipping }, { idempotencyKey: `merch-customer-${id}` });
  const localBase = process.env.NEXT_PUBLIC_BASE_URL || "";
  const base = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") && /^http:\/\/(localhost|127\.0\.0\.1):[0-9]+$/.test(localBase) ? localBase : "https://kalimeister.com";
  const session = await getStripe().checkout.sessions.create({
    mode: "payment", payment_method_types: ["card"], customer: customer.id,
    automatic_tax: { enabled: true }, customer_update: { address: "never", name: "never", shipping: "never" },
    line_items: quote.lines.map((line) => ({ quantity: line.quantity, price_data: { currency: "usd", unit_amount: line.priceCents, tax_behavior: "exclusive", product_data: { name: line.name, description: line.variant, tax_code: merchProducts.find((product) => product.productId === line.productId)?.kind === "shirt" ? "txcd_30011000" : "txcd_99999999" } } })),
    shipping_options: [{ shipping_rate_data: { display_name: "Standard shipping", type: "fixed_amount", fixed_amount: { amount: quote.shippingCents, currency: "usd" }, tax_behavior: "exclusive" } }],
    payment_intent_data: { receipt_email: a.email },
    custom_text: { submit: { message: "Ships to the address provided on Kali’s shop. Orders are reviewed before production. Made-to-order items may ship separately." } },
    metadata: { kind: "merch", quoteId: id },
    success_url: `${base}/shop/success?session_id={CHECKOUT_SESSION_ID}`, cancel_url: `${base}/shop/checkout`,
    expires_at: Math.floor(quote.expiresAt.toMillis() / 1000) + 31 * 60,
  }, { idempotencyKey: `merch-checkout-${id}` });
  if (!session.url) throw new Error("Checkout unavailable.");
  await ref.update({ stripeSessionId: session.id, checkoutUrl: session.url });
  return { url: session.url };
}

export async function recordMerchPayment(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return { status: "unpaid" };
  if (session.metadata?.kind !== "merch" || !/^[a-f0-9]{32}$/.test(session.metadata.quoteId || "")) throw new Error("Invalid merchandise payment.");
  const quoteRef = getAdminDb().collection(collections.quotes).doc(session.metadata.quoteId);
  const orderRef = getAdminDb().collection(collections.orders).doc(session.id);
  return getAdminDb().runTransaction(async (transaction) => {
    const existing = (await transaction.get(orderRef)).data();
    if (existing) return { status: String(existing.status) };
    const quote = storedQuoteSchema.parse((await transaction.get(quoteRef)).data());
    const tax = session.total_details?.amount_tax;
    if (session.currency !== "usd" || quote.stripeSessionId && quote.stripeSessionId !== session.id ||
      session.amount_subtotal !== quote.subtotalCents || session.total_details?.amount_shipping !== quote.shippingCents ||
      typeof tax !== "number" || tax < 0 || session.amount_total !== quote.subtotalCents + quote.shippingCents + tax || session.automatic_tax?.status !== "complete") throw new Error("Paid order totals could not be verified.");
    transaction.create(orderRef, { quoteId: session.metadata?.quoteId, stripeSessionId: session.id,
      paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
      items: quote.items, lines: quote.lines, address: quote.address, subtotalCents: quote.subtotalCents,
      shippingCents: quote.shippingCents, taxCents: tax, totalCents: session.amount_total,
      status: "paid_awaiting_review", livemode: session.livemode === true, createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
    });
    transaction.update(quoteRef, { stripeSessionId: session.id, paidAt: Timestamp.now() });
    return { status: "paid_awaiting_review" };
  });
}

export async function transferMerchOrder(id: string, reconcileOnly = false) {
  if (!/^cs_(test_|live_)?[A-Za-z0-9]+$/.test(id)) throw new Error("Invalid order.");
  const ref = getAdminDb().collection(collections.orders).doc(id);
  const claim = await getAdminDb().runTransaction(async (transaction) => {
    const record = (await transaction.get(ref)).data();
    if (!record) throw new Error("Order not found.");
    if (!record.livemode) throw new Error("Test-mode payments cannot create real Printify orders.");
    if (record.printifyOrderId) return { existing: true, record };
    if (record.status === "transfer_in_progress" || record.status === "transfer_uncertain") {
      if (!reconcileOnly) throw new Error("Reconcile this order before attempting anything else.");
      return { existing: false, record };
    }
    if (record.status !== "paid_awaiting_review" || reconcileOnly) throw new Error("Order is not eligible for transfer.");
    transaction.update(ref, { status: "transfer_in_progress", reviewedAt: Timestamp.now(), reviewedBy: process.env.ADMIN_EMAIL || "administrator", updatedAt: Timestamp.now() });
    return { existing: false, record };
  });
  if (claim.existing) return { status: "printify_on_hold" };
  try {
    const session = await getStripe().checkout.sessions.retrieve(id, { expand: ["payment_intent"] });
    const intent = session.payment_intent;
    if (session.payment_status !== "paid" || !intent || typeof intent === "string" || intent.status !== "succeeded" ||
      session.amount_total !== claim.record.totalCents || session.metadata?.quoteId !== claim.record.quoteId) throw new Error("Payment must be verified before transfer.");
    const intentWithCharge = await getStripe().paymentIntents.retrieve(intent.id, { expand: ["latest_charge"] });
    const charge = intentWithCharge.latest_charge;
    if (!charge || typeof charge === "string" || charge.refunded || charge.amount_refunded > 0 || charge.disputed) throw new Error("Refunded or disputed orders cannot be transferred.");
    const externalId = `kali-${id}`;
    let upstream = await findPrintifyOrder(externalId);
    if (!upstream && reconcileOnly) throw new Error("No matching Printify order found. Check Printify manually; this action will not resubmit.");
    if (!upstream) {
      const quote = await quoteMerchandise({ items: claim.record.items, address: claim.record.address });
      if (quote.shippingCents > Number(claim.record.shippingCents)) throw new Error("Shipping increased. Review the margin before proceeding.");
      upstream = await createHeldPrintifyOrder(externalId, { items: claim.record.items, address: claim.record.address });
    }
    const onHold = upstream.status === "on-hold";
    await ref.update({ printifyOrderId: upstream.id, status: onHold ? "printify_on_hold" : "printify_status_attention", printifyStatus: upstream.status, updatedAt: Timestamp.now() });
    return { status: onHold ? "printify_on_hold" : "printify_status_attention" };
  } catch (error) {
    await ref.update({ status: "transfer_uncertain", updatedAt: Timestamp.now() });
    throw error;
  }
}

export async function listMerchOrders() {
  const snapshot = await getAdminDb().collection(collections.orders).orderBy("createdAt", "desc").limit(100).get();
  return snapshot.docs.map((document) => {
    const value = document.data();
    return { ...value, id: document.id, createdAt: value.createdAt instanceof Timestamp ? value.createdAt.toDate().toISOString() : null, updatedAt: value.updatedAt instanceof Timestamp ? value.updatedAt.toDate().toISOString() : null };
  });
}
