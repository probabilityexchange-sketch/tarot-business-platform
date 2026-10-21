const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const esbuild = require("esbuild");
const { Timestamp } = require("firebase-admin/firestore");
const out = fs.mkdtempSync(path.join(__dirname, "../../node_modules/.merch-orders-tests-"));
const records = new Map();
let queue = Promise.resolve();
function ref(collection, id) {
  const key = `${collection}/${id}`;
  return { id, async get() { return { data: () => records.get(key) }; }, async create(data) { assert.ok(!records.has(key)); records.set(key, data); }, async update(data) { assert.ok(records.has(key)); records.set(key, { ...records.get(key), ...data }); } };
}
global.__merchDb = { collection(name) { return { doc(id) { return ref(name, id); } }; }, runTransaction(callback) { const task = queue.then(() => callback({ async get(r) { return r.get(); }, create(r, data) { assert.ok(!records.has(`merch_orders/${r.id}`)); records.set(`merch_orders/${r.id}`, data); }, update(r, data) { const key = [...records.keys()].find(k => k.endsWith(`/${r.id}`)); records.set(key, { ...records.get(key), ...data }); } })); queue = task.catch(() => {}); return task; } };
let quoteCalls = 0;
let shipping = 535;
let posts = 0;
let upstream = null;
let ambiguous = false;
let refunded = false;
let disputed = false;
const sessions = new Map();
const createInputs = [];
const customers = new Map();
global.__merchStripe = {
  customers: { async create(input, options) { customers.set(options.idempotencyKey, input); return { id: "cus_test" }; } },
  checkout: { sessions: {
    async create(input, options) {
      createInputs.push({ input, options });
      if (!sessions.has(options.idempotencyKey)) sessions.set(options.idempotencyKey, { id: `cs_test_${options.idempotencyKey.replaceAll("-", "")}`, url: "https://checkout.stripe.com/c/test", status: "open" });
      return sessions.get(options.idempotencyKey);
    },
    async retrieve(id) { return { ...global.__paidSession, id, status: "open", payment_intent: { id: "pi_merch", status: "succeeded" } }; },
  } },
  paymentIntents: { async retrieve() { return { latest_charge: { refunded, amount_refunded: refunded ? 1 : 0, disputed } }; } },
};
global.__merchPrintify = {
  merchQuoteSchema: require("zod").z.object({ items: require("zod").z.array(require("zod").z.object({ productId: require("zod").z.string(), variantId: require("zod").z.number(), quantity: require("zod").z.number() })), address: require("zod").z.record(require("zod").z.string(), require("zod").z.string()) }).strict(),
  async quoteMerchandise(data) { quoteCalls++; return { subtotalCents: 3400, shippingCents: shipping, lines: [{ ...data.items[0], name: "Taurus shirt", variant: "Ivory / 3XL", priceCents: 3400 }] }; },
  async findPrintifyOrder() { return upstream; },
  async createHeldPrintifyOrder() { posts++; upstream = { id: `printify-${posts}`, status: "on-hold" }; if (ambiguous) throw new Error("Ambiguous provider response"); return upstream; },
};
const mocks = {
  "@/lib/firebase-admin": "export function getAdminDb(){ return globalThis.__merchDb; }",
  "@/lib/stripe": "export function getStripe(){ return globalThis.__merchStripe; }",
  "@/lib/printify": "export const merchQuoteSchema=globalThis.__merchPrintify.merchQuoteSchema; export const quoteMerchandise=globalThis.__merchPrintify.quoteMerchandise; export const findPrintifyOrder=globalThis.__merchPrintify.findPrintifyOrder; export const createHeldPrintifyOrder=globalThis.__merchPrintify.createHeldPrintifyOrder;",
};
const entry = path.join(__dirname, "../lib/merch-orders.ts");
(async () => {
  await esbuild.build({ entryPoints: [entry], outfile: path.join(out, "orders.cjs"), platform: "node", format: "cjs", bundle: true, packages: "external", plugins: [{ name: "mocks", setup(build) {
    build.onResolve({ filter: /^@\/lib\// }, args => mocks[args.path] ? { path: args.path, namespace: "mock" } : undefined);
    build.onLoad({ filter: /.*/, namespace: "mock" }, args => ({ contents: mocks[args.path], loader: "js" }));
  } }] });
  const core = require(path.join(out, "orders.cjs"));
  const input = { items: [{ productId: "6ad179eb85955f92a50529a4", variantId: 1, quantity: 1 }], address: { first_name: "Test", last_name: "Buyer", email: "test@example.com", country: "US", region: "TN", address1: "1 Example Street", city: "Chattanooga", zip: "37402" } };
  process.env.MERCH_CHECKOUT_ENABLED = "false";
  process.env.MERCH_TAX_REVIEWED = "false";
  await assert.rejects(() => core.createMerchQuote(input), /not open/);
  assert.equal(quoteCalls, 0);
  process.env.MERCH_CHECKOUT_ENABLED = "true";
  await assert.rejects(() => core.createMerchQuote(input), /not open/);
  process.env.MERCH_TAX_REVIEWED = "true";
  const q = await core.createMerchQuote(input);
  assert.equal(records.get(`merch_quotes/${q.id}`).token, undefined);
  await assert.rejects(() => core.createMerchCheckout({ id: q.id, token: "0".repeat(64) }), /Invalid quote/);
  await assert.rejects(() => core.createMerchCheckout({ id: q.id, token: q.token, price: 1 }));
  const urls = await Promise.all([core.createMerchCheckout({ id: q.id, token: q.token }), core.createMerchCheckout({ id: q.id, token: q.token })]);
  assert.equal(urls[0].url, urls[1].url);
  assert.equal(customers.size, 1);
  assert.equal(sessions.size, 1);
  assert.equal(createInputs[0].input.line_items[0].price_data.unit_amount, 3400);
  assert.equal(createInputs[0].input.line_items[0].price_data.tax_behavior, "exclusive");
  assert.equal(createInputs[0].input.automatic_tax.enabled, true);
  assert.equal(createInputs[0].input.customer_update.shipping, "never");
  assert.equal(createInputs[0].input.payment_intent_data.shipping, undefined);
  assert.equal([...customers.values()][0].shipping.address.line1, input.address.address1);
  assert.equal(createInputs[0].input.shipping_address_collection, undefined);
  assert.ok(!JSON.stringify(createInputs[0].input.metadata).includes("test@example.com"));
  const quoteRecord = records.get(`merch_quotes/${q.id}`);
  const paid = { id: quoteRecord.stripeSessionId, payment_status: "paid", livemode: true, metadata: { kind: "merch", quoteId: q.id }, currency: "usd", amount_subtotal: 3400, amount_total: 4209, total_details: { amount_shipping: 535, amount_tax: 274 }, automatic_tax: { status: "complete" }, payment_intent: "pi_merch" };
  global.__paidSession = paid;
  assert.equal((await core.recordMerchPayment({ ...paid, payment_status: "unpaid" })).status, "unpaid");
  await assert.rejects(() => core.recordMerchPayment({ ...paid, amount_total: 1 }), /totals/);
  await assert.rejects(() => core.recordMerchPayment({ ...paid, automatic_tax: { status: "failed" } }), /totals/);
  await assert.rejects(() => core.recordMerchPayment({ ...paid, id: "cs_test_wrong" }), /totals/);
  const duplicate = await Promise.all([core.recordMerchPayment(paid), core.recordMerchPayment(paid)]);
  assert.equal(duplicate[0].status, "paid_awaiting_review");
  assert.equal(records.size, 2);
  assert.equal(posts, 0);
  const savedOrder = records.get(`merch_orders/${paid.id}`);
  records.set(`merch_orders/${paid.id}`, { ...savedOrder, livemode: false });
  await assert.rejects(() => core.transferMerchOrder(paid.id), /Test-mode/);
  assert.equal(posts, 0);
  records.set(`merch_orders/${paid.id}`, savedOrder);
  const transfers = await Promise.allSettled([core.transferMerchOrder(paid.id), core.transferMerchOrder(paid.id)]);
  assert.equal(transfers.filter(r => r.status === "fulfilled").length, 1);
  assert.equal(posts, 1);
  await core.transferMerchOrder(paid.id);
  assert.equal(posts, 1);
  const originalOrder = { ...records.get(`merch_orders/${paid.id}`), status: "paid_awaiting_review", printifyOrderId: undefined };
  records.set(`merch_orders/${paid.id}`, originalOrder); upstream = null; ambiguous = true;
  await assert.rejects(() => core.transferMerchOrder(paid.id));
  assert.equal(records.get(`merch_orders/${paid.id}`).status, "transfer_uncertain");
  await assert.rejects(() => core.transferMerchOrder(paid.id), /Reconcile/);
  await core.transferMerchOrder(paid.id, true);
  assert.equal(posts, 2);
  assert.equal(records.get(`merch_orders/${paid.id}`).status, "printify_on_hold");
  ambiguous = false; upstream = null; refunded = true;
  records.set(`merch_orders/${paid.id}`, originalOrder);
  await assert.rejects(() => core.transferMerchOrder(paid.id), /Refunded/);
  assert.equal(posts, 2);
  refunded = false; disputed = true;
  records.set(`merch_orders/${paid.id}`, originalOrder);
  await assert.rejects(() => core.transferMerchOrder(paid.id), /disputed/);
  disputed = false; shipping = 900;
  records.set(`merch_orders/${paid.id}`, originalOrder);
  await assert.rejects(() => core.transferMerchOrder(paid.id), /Shipping increased/);
  assert.equal(posts, 2);
  records.set(`merch_orders/${paid.id}`, { ...originalOrder, status: "transfer_uncertain" });
  await assert.rejects(() => core.transferMerchOrder(paid.id, true), /No matching/);
  assert.equal(posts, 2);
  shipping = 535;
  const expired = await core.createMerchQuote(input);
  records.get(`merch_quotes/${expired.id}`).expiresAt = Timestamp.fromMillis(Date.now() - 1);
  await assert.rejects(() => core.createMerchCheckout({ id: expired.id, token: expired.token }), /expired/);
  const stale = await core.createMerchQuote(input); shipping = 999;
  await assert.rejects(() => core.createMerchCheckout({ id: stale.id, token: stale.token }), /changed/);
  process.env.MERCH_CHECKOUT_ENABLED = "false";
  assert.equal((await core.recordMerchPayment(paid)).status, "transfer_uncertain");
  console.log("PASS: checkout launch/tax gates, quote ownership and expiry, server totals, fixed delivery address, Stripe idempotency, paid-only queue, duplicate webhooks, concurrent transfer, ambiguous reconciliation without resubmission, refunds/disputes and shipping changes. No real payments or orders.");
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { fs.rmSync(out, { recursive: true, force: true }); });
