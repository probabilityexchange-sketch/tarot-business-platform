const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const esbuild = require("esbuild");
const Stripe = require("stripe");
const out = fs.mkdtempSync(path.join(__dirname, "../../node_modules/.gift-tests-"));
const records = new Map();
let queue = Promise.resolve();
function ref(collection, id) {
  const key = `${collection}/${id}`;
  return { id, async get() { return { data: () => records.get(key) }; }, async create(data) { assert.ok(!records.has(key)); records.set(key, data); }, async update(data) { assert.ok(records.has(key)); records.set(key, { ...records.get(key), ...data }); }, async set(data) { records.set(key, { ...data }); } };
}
global.__giftDb = { collection(name) { return { doc(id) { return ref(name, id); } }; }, runTransaction(callback) { const task = queue.then(() => callback({ async get(r) { return r.get(); }, create(r, data) { return r.create(data); }, update(r, data) { return r.update(data); }, set(r, data) { return r.set(data); } })); queue = task.catch(() => {}); return task; } };
const stripe = new Stripe("sk_test_placeholder");
const checkoutCalls = [];
const sessionsById = new Map();
const idempotentSessions = new Map();
let couponCreateCalls = 0;
const promotionCodeCalls = [];
global.__giftStripe = {
  webhooks: stripe.webhooks,
  checkout: { sessions: {
    async create(input, options) {
      if (idempotentSessions.has(options.idempotencyKey)) return idempotentSessions.get(options.idempotencyKey);
      checkoutCalls.push({ input, options });
      const session = { id: `cs_test_gift${checkoutCalls.length}`, url: "https://checkout.stripe.test/gift", status: "open" };
      idempotentSessions.set(options.idempotencyKey, session);
      sessionsById.set(session.id, session);
      return session;
    },
    async retrieve(id) {
      if (!sessionsById.has(id)) throw new Error(`No such checkout session: ${id}`);
      return sessionsById.get(id);
    },
  } },
  coupons: {
    async create(input, options) {
      assert.ok(input.name.length <= 40, "Stripe coupon names must not exceed 40 characters");
      couponCreateCalls += 1;
      return { id: "coupon_1" };
    },
  },
  promotionCodes: {
    async create(input, options) {
      promotionCodeCalls.push({ input, options });
      return { id: "promo_1", code: input.code };
    },
  },
};
const fetchCalls = [];
let fetchShouldThrow = false;
global.fetch = async (url, options) => {
  fetchCalls.push({ url: String(url), body: options && options.body ? JSON.parse(options.body) : null });
  if (fetchShouldThrow) throw new Error("fetch unavailable");
  return { ok: true, status: 200 };
};
const mocks = {
  "@/lib/firebase-admin": "export function getAdminDb(){ return globalThis.__giftDb; }",
  "@/lib/stripe": "export function getStripe(){ return globalThis.__giftStripe; }",
};
async function bundle(file, name) {
  const output = path.join(out, name + ".cjs");
  await esbuild.build({ entryPoints: [path.join(__dirname, "../..", file)], outfile: output, platform: "node", format: "cjs", bundle: true, packages: "external", plugins: [{ name: "mocks", setup(build) {
    build.onResolve({ filter: /^@\/lib\// }, args => mocks[args.path] ? { path: args.path, namespace: "mock" } : undefined);
    build.onLoad({ filter: /.*/, namespace: "mock" }, args => ({ contents: mocks[args.path], loader: "js" }));
  } }] });
  return require(output);
}
function expectedCode(sessionId) {
  return "KALI-" + crypto.createHash("sha256").update(sessionId).digest("hex").slice(0, 8).toUpperCase();
}
(async () => {
  process.env.BREVO_API_KEY = "x-key-gift-test";

  const checkout = await bundle("src/app/api/gift/checkout/route.ts", "checkout");
  const response = await checkout.POST(new Request("https://kalimeister.com/api/gift/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tierId: "gift-60", purchaseId: "p1" }) }));
  assert.equal(response.status, 200);
  assert.ok((await response.json()).url);
  const created = checkoutCalls[0];
  assert.equal(created.input.mode, "payment");
  assert.equal(created.input.payment_method_types, undefined, "Stripe selects eligible payment methods from Dashboard settings");
  assert.equal(created.input.line_items[0].quantity, 1);
  assert.equal(created.input.line_items[0].price_data.unit_amount, 25000);
  assert.equal(created.input.line_items[0].price_data.currency, "usd");
  assert.equal(created.input.line_items[0].price_data.product_data.name, "The Narrative Deep-Dive — Gift");
  assert.equal(created.input.metadata.kind, "gift");
  assert.equal(created.input.metadata.giftTier, "gift-60");
  assert.ok(created.input.success_url.includes("/gift/success"));
  assert.ok(created.input.success_url.includes("session_id={CHECKOUT_SESSION_ID}"));
  assert.ok(created.input.cancel_url.endsWith("/gift"));
  assert.equal(created.options.idempotencyKey, "gift-gift-60-p1");
  const again = await checkout.POST(new Request("https://kalimeister.com/api/gift/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tierId: "gift-60", purchaseId: "p1" }) }));
  assert.equal(again.status, 200);
  assert.equal(checkoutCalls.length, 1);
  const unknownTier = await checkout.POST(new Request("https://kalimeister.com/api/gift/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tierId: "nope" }) }));
  assert.equal(unknownTier.status, 400);
  const missingTier = await checkout.POST(new Request("https://kalimeister.com/api/gift/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ purchaseId: "p2" }) }));
  assert.equal(missingTier.status, 400);
  console.log("PASS: gift checkout creates a verified session with tier metadata and rejects unknown tiers");

  const orders = await bundle("src/lib/gift-orders.ts", "orders");
  const paidSession = { id: "cs_test_giftpaid", payment_status: "paid", metadata: { kind: "gift", giftTier: "gift-60" }, currency: "usd", amount_total: 25000, payment_intent: "pi_gift", customer_details: { email: "giver@example.com" }, customer_email: null };
  assert.deepEqual(await orders.fulfillGiftPurchase({ ...paidSession, payment_status: "unpaid" }), { status: "unpaid" });
  await assert.rejects(() => orders.fulfillGiftPurchase({ ...paidSession, amount_total: 100 }), /Invalid gift payment/);
  await assert.rejects(() => orders.fulfillGiftPurchase({ ...paidSession, metadata: { kind: "workbook" } }), /Invalid gift payment/);
  const first = await orders.fulfillGiftPurchase(paidSession);
  assert.equal(first.status, "recorded");
  assert.equal(first.code, expectedCode("cs_test_giftpaid"));
  assert.equal(first.tierTitle, "The Narrative Deep-Dive — Gift");
  assert.equal(first.priceCents, 25000);
  const stored = records.get("gift_cards/cs_test_giftpaid");
  assert.equal(stored.redeemed, false);
  assert.equal(stored.code, expectedCode("cs_test_giftpaid"));
  assert.equal(stored.couponId, "coupon_1");
  assert.equal(stored.tierId, "gift-60");
  assert.equal(stored.purchaserEmail, "giver@example.com");
  assert.equal(couponCreateCalls, 1);
  assert.equal(promotionCodeCalls.length, 1);
  assert.equal(promotionCodeCalls[0].options.idempotencyKey, "gift-promo-cs_test_giftpaid");
  assert.deepEqual(promotionCodeCalls[0].input.promotion, { type: "coupon", coupon: "coupon_1" });
  assert.ok(!("coupon" in promotionCodeCalls[0].input));
  assert.equal(fetchCalls.length, 1);
  assert.ok(fetchCalls[0].url.includes("/v3/events"));
  assert.equal(fetchCalls[0].body.event_name, "gift_purchased");
  assert.deepEqual(fetchCalls[0].body.identifiers, { email_id: "giver@example.com" });
  assert.equal(fetchCalls[0].body.event_properties.GIFT_CODE, expectedCode("cs_test_giftpaid"));
  const second = await orders.fulfillGiftPurchase(paidSession);
  assert.equal(second.status, "recorded");
  assert.equal(second.code, expectedCode("cs_test_giftpaid"));
  assert.equal(couponCreateCalls, 1);
  assert.equal(fetchCalls.length, 1);
  assert.equal([...records.keys()].filter(key => key.startsWith("gift_cards/")).length, 1);
  fetchShouldThrow = true;
  const eventFails = await orders.fulfillGiftPurchase({ ...paidSession, id: "cs_test_gifteventfails" });
  assert.equal(eventFails.status, "recorded");
  assert.equal(eventFails.code, expectedCode("cs_test_gifteventfails"));
  fetchShouldThrow = false;
  console.log("PASS: gift fulfillment mints a deterministic code, records the gift card and swallows event failures");

  const status = await bundle("src/app/api/gift/status/route.ts", "status");
  sessionsById.set("cs_test_giftunpaid", { id: "cs_test_giftunpaid", payment_status: "unpaid", metadata: { kind: "gift", giftTier: "gift-60" }, currency: "usd", amount_total: 25000 });
  const unpaid = await status.GET(new Request("https://kalimeister.com/api/gift/status?session_id=cs_test_giftunpaid"));
  assert.equal(unpaid.status, 200);
  assert.deepEqual(await unpaid.json(), { status: "unpaid" });
  sessionsById.set("cs_test_giftstatus", { id: "cs_test_giftstatus", payment_status: "paid", metadata: { kind: "gift", giftTier: "gift-90" }, currency: "usd", amount_total: 45000, customer_details: { email: null }, customer_email: null });
  const ready = await status.GET(new Request("https://kalimeister.com/api/gift/status?session_id=cs_test_giftstatus"));
  assert.equal(ready.status, 200);
  const readyBody = await ready.json();
  assert.equal(readyBody.status, "ready");
  assert.equal(readyBody.code, expectedCode("cs_test_giftstatus"));
  assert.equal(readyBody.tierTitle, "Shadow Work Intensive — Gift");
  assert.equal(readyBody.priceCents, 45000);
  const missing = await status.GET(new Request("https://kalimeister.com/api/gift/status?session_id=cs_bad"));
  assert.equal(missing.status, 500);
  assert.equal((await missing.json()).error, "Gift status is temporarily unavailable.");
  const wrongShape = await status.GET(new Request("https://kalimeister.com/api/gift/status?session_id=nope"));
  assert.equal(wrongShape.status, 400);
  console.log("PASS: gift status fulfills paid sessions, reports unpaid ones and rejects malformed references");
  console.log("All gift tests passed. Stripe, Firestore and Brevo were mocked; no charges.");
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { fs.rmSync(out, { recursive: true, force: true }); });
