const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const esbuild = require("esbuild");
const Stripe = require("stripe");
const { Timestamp } = require("firebase-admin/firestore");
const { createHash } = require("node:crypto");
const out = fs.mkdtempSync(path.join(__dirname, "../../node_modules/.recovery-tests-"));
const records = new Map();
let queue = Promise.resolve();
function ref(collection, id) {
  const key = `${collection}/${id}`;
  return {
    id,
    async get() { return { exists: records.has(key), data: () => records.has(key) ? { ...records.get(key) } : undefined }; },
    async create(data) { assert.ok(!records.has(key)); records.set(key, { ...data }); },
    async set(data, options) { records.set(key, options?.merge ? { ...records.get(key), ...data } : { ...data }); },
    async update(data) { assert.ok(records.has(key)); records.set(key, { ...records.get(key), ...data }); },
  };
}
global.__recoveryDb = { collection(name) { return { doc(id) { return ref(name, id); } }; }, runTransaction(callback) { const task = queue.then(() => callback({ async get(r) { return r.get(); }, create(r, data) { return r.create(data); }, update(r, data) { return r.update(data); }, set(r, data, options) { return r.set(data, options); } })); queue = task.catch(() => {}); return task; } };
const stripe = new Stripe("sk_test_placeholder");
let checkoutCalls = 0;
let checkoutInput;
const couponCalls = [];
const promotionCodeCalls = [];
global.__recoveryStripe = {
  webhooks: stripe.webhooks,
  checkout: { sessions: {
    async create(input) { checkoutCalls++; checkoutInput = input; return { id: "cs_test_created", url: "https://checkout.stripe.test/session" }; },
  } },
  coupons: {
    async create(input, options) { couponCalls.push({ input, options }); return { id: "coupon_recovery" }; },
  },
  promotionCodes: {
    async create(input, options) { promotionCodeCalls.push({ input, options }); return { id: "promo_recovery", code: input.code }; },
  },
};
const fetchCalls = [];
global.fetch = async (url, options) => {
  fetchCalls.push({ url: String(url), body: options && options.body ? JSON.parse(options.body) : null });
  return { ok: true, status: 200 };
};
const mocks = {
  "@/lib/firebase-admin": "export function getAdminDb(){ return globalThis.__recoveryDb; }",
  "@/lib/stripe": "export function getStripe(){ return globalThis.__recoveryStripe; }",
  "@/lib/calcom": "export async function createCalComBooking(params){ if (params.attendee.name === \"Calendar Failure\") throw new Error(\"Cal.com unavailable\"); return { uid: \"cal-recovery\" }; } export async function deleteCalComReservation(){}",
};
async function bundle(file, name) {
  const output = path.join(out, name + ".cjs");
  await esbuild.build({ entryPoints: [path.join(__dirname, "../..", file)], outfile: output, platform: "node", format: "cjs", bundle: true, packages: "external", plugins: [{ name: "mocks", setup(build) {
    build.onResolve({ filter: /^@\/lib\// }, args => mocks[args.path] ? { path: args.path, namespace: "mock" } : undefined);
    build.onLoad({ filter: /.*/, namespace: "mock" }, args => ({ contents: mocks[args.path], loader: "js" }));
  } }] });
  return require(output);
}
function request(body) { return new Request("https://kalimeister.com/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); }
const token = "a".repeat(64);
const hash = value => createHash("sha256").update(value).digest("hex");
function hold(id, offeringId = "narrative-session", duration = 60) {
  records.set("booking_slots/" + id, { offeringId, slotStart: "2026-11-01T15:00:00Z", slotDuration: duration, tokenHash: hash(token), expiresAt: Timestamp.fromMillis(Date.now() + 45 * 60 * 1000) });
}
const payload = { offeringId: "narrative-session", offeringName: "Forged offer", price: "$0.01", duration: "1 Minute", reservationUid: "hold-1", reservationToken: token, slotStart: "2026-11-01T15:00:00Z", slotDuration: 60, customerName: "Recovery Tester", customerEmail: "recover@example.com", customerTimezone: "America/New_York", notes: "" };
function hook(event) {
  const body = JSON.stringify(event);
  return new Request("https://kalimeister.com/api/stripe/webhook", { method: "POST", headers: { "stripe-signature": stripe.webhooks.generateTestHeaderString({ payload: body, secret: process.env.STRIPE_WEBHOOK_SECRET }) }, body });
}
(async () => {
  process.env.BREVO_API_KEY = "x-recovery-test";
  process.env.OWNER_ALERT_EMAILS = "owner@example.com, Second@Example.com";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_recovery_test";

  const checkout = await bundle("src/app/api/checkout/route.ts", "checkout");
  hold("hold-1");
  const started = await checkout.POST(request({ ...payload, utm: { utm_source: "instagram", utm_medium: "social" } }));
  assert.equal(started.status, 200);
  assert.ok((await started.json()).url);
  assert.equal(checkoutInput.allow_promotion_codes, true);
  const lead = records.get("booking_leads/cs_test_created");
  assert.equal(lead.status, "checkout_started");
  assert.equal(lead.email, "recover@example.com");
  assert.equal(lead.name, "Recovery Tester");
  assert.equal(lead.offeringId, "narrative-session");
  assert.equal(lead.offeringName, "The Narrative Deep-Dive");
  assert.equal(lead.slotStart, "2026-11-01T15:00:00Z");
  assert.equal(lead.utmSource, "instagram");
  assert.equal(lead.utmMedium, "social");
  assert.ok(!("utmCampaign" in lead));
  assert.ok(lead.createdAt.toMillis() <= Date.now());
  assert.ok(lead.deleteAfter.toMillis() > Date.now() + 29 * 24 * 60 * 60000);
  const retry = await checkout.POST(request({ ...payload, utm: { utm_source: "instagram", utm_medium: "social" } }));
  assert.equal(retry.status, 200);
  assert.equal((await retry.json()).url, "https://checkout.stripe.test/session");
  assert.equal(checkoutCalls, 1);
  assert.equal([...records.keys()].filter(key => key.startsWith("booking_leads/")).length, 1);
  console.log("PASS: booking checkout enables promotion codes and records one recovery lead per new session");

  const fulfillment = await bundle("src/lib/booking-fulfillment.ts", "fulfillment");
  records.set("booking_leads/cs_test_giftpaid", { email: "gifted@example.com", status: "checkout_started" });
  const zeroSession = { id: "cs_test_giftpaid", payment_status: "no_payment_required", amount_total: 0, total_details: { amount_discount: 25000 }, currency: "usd", payment_intent: "pi_zero", metadata: { offeringId: "narrative-session", offeringName: "The Narrative Deep-Dive", reservationUid: "hold-1", slotStart: "2026-11-01T15:00:00Z", slotDuration: "60", priceCents: "25000", customerName: "Gifted Recipient", customerEmail: "gifted@example.com", customerTimezone: "America/New_York" } };
  const redeemed = await fulfillment.fulfillBooking(zeroSession);
  assert.equal(redeemed.status, "success");
  assert.equal(records.get("bookings/cs_test_giftpaid").priceCents, 0);
  assert.equal(records.get("bookings/cs_test_giftpaid").paidWithGiftCode, true);
  assert.equal(records.get("bookings/cs_test_giftpaid").status, "confirmed");
  assert.equal(records.get("booking_leads/cs_test_giftpaid").status, "paid");
  await assert.rejects(() => fulfillment.fulfillBooking({ ...zeroSession, id: "cs_test_zero", total_details: { amount_discount: 0 } }), /Invalid paid booking metadata/);
  assert.ok(!records.has("bookings/cs_test_zero"));
  const ownerAlerts = () => fetchCalls.filter(call => call.url.endsWith("/v3/smtp/email"));
  assert.equal(ownerAlerts().length, 1);
  const confirmedAlert = ownerAlerts()[0].body;
  assert.deepEqual(confirmedAlert.to, [{ email: "owner@example.com" }, { email: "second@example.com" }]);
  assert.ok(confirmedAlert.subject.startsWith("New booking: Gifted Recipient"));
  assert.ok(confirmedAlert.textContent.includes("gifted@example.com"));
  assert.ok(confirmedAlert.textContent.includes("(gift code redeemed)"));
  assert.ok(confirmedAlert.textContent.includes("cal-recovery"));
  assert.equal(confirmedAlert.htmlContent, undefined);
  assert.equal((await fulfillment.fulfillBooking(zeroSession)).status, "success");
  assert.equal(ownerAlerts().length, 1);
  console.log("PASS: fulfillment honors a fully-redeemed gift code, flags the booking, marks the lead paid and alerts the owner exactly once");

  records.set("booking_leads/cs_test_partial", { email: "partial@example.com", status: "checkout_started" });
  assert.equal((await fulfillment.fulfillBooking({ ...zeroSession, id: "cs_test_nopay_nonzero", amount_total: 25000, total_details: { amount_discount: 0 } })).status, "unpaid");
  assert.ok(!records.has("bookings/cs_test_nopay_nonzero"));
  const partialSession = { ...zeroSession, payment_status: "paid", id: "cs_test_partial", amount_total: 22500, total_details: { amount_discount: 2500 }, payment_intent: "pi_partial", metadata: { ...zeroSession.metadata, customerName: "Partial Promo", customerEmail: "partial@example.com" } };
  const partial = await fulfillment.fulfillBooking(partialSession);
  assert.equal(partial.status, "success");
  assert.equal(records.get("bookings/cs_test_partial").priceCents, 22500);
  assert.notEqual(records.get("bookings/cs_test_partial").paidWithGiftCode, true);
  assert.equal(records.get("bookings/cs_test_partial").status, "confirmed");
  assert.equal(ownerAlerts().length, 2);
  const failedSession = { ...zeroSession, payment_status: "paid", id: "cs_test_calfail", amount_total: 25000, total_details: { amount_discount: 0 }, metadata: { ...zeroSession.metadata, customerName: "Calendar Failure", customerEmail: "calfail@example.com" } };
  assert.equal((await fulfillment.fulfillBooking(failedSession)).status, "pending");
  assert.equal(records.get("bookings/cs_test_calfail").fulfillmentState, "needs_attention");
  assert.equal(ownerAlerts().length, 3);
  assert.ok(ownerAlerts()[2].body.subject.startsWith("ACTION NEEDED"));
  assert.ok(ownerAlerts()[2].body.textContent.includes("Cal.com unavailable"));
  assert.equal((await fulfillment.fulfillBooking(failedSession)).status, "pending");
  assert.equal(ownerAlerts().length, 3);
  console.log("PASS: fulfillment accepts a partial promo discount and records the discounted price without the gift flag");
  console.log("PASS: a paid booking that cannot reach Cal.com is flagged and sends one ACTION NEEDED owner alert");

  const webhook = await bundle("src/app/api/stripe/webhook/route.ts", "webhook");
  const giftSession = { id: "cs_test_giftweb", payment_status: "paid", metadata: { kind: "gift", giftTier: "gift-60" }, currency: "usd", amount_total: 25000, payment_intent: "pi_giftweb", customer_details: { email: "giver@example.com" }, customer_email: null };
  const giftEvent = { id: "evt_giftweb", type: "checkout.session.completed", data: { object: giftSession } };
  assert.equal((await webhook.POST(hook(giftEvent))).status, 200);
  assert.ok(records.has("gift_cards/cs_test_giftweb"));
  assert.equal(records.get("gift_cards/cs_test_giftweb").redeemed, false);
  assert.equal(couponCalls.length, 1);
  assert.equal(promotionCodeCalls.length, 1);
  assert.equal((await webhook.POST(hook(giftEvent))).status, 200);
  assert.equal([...records.keys()].filter(key => key.startsWith("gift_cards/")).length, 1);
  assert.equal(couponCalls.length, 1);
  console.log("PASS: webhook fulfills gift purchases from authentic signatures and stays idempotent on replay");

  records.set("booking_leads/cs_test_expired", { email: "gone@example.com", status: "checkout_started" });
  const expiredSession = { id: "cs_test_expired", payment_status: "unpaid", metadata: { offeringId: "narrative-session", offeringName: "The Narrative Deep-Dive", customerEmail: "gone@example.com", slotStart: "2026-11-01T15:00:00Z" } };
  const expiredEvent = { id: "evt_expired", type: "checkout.session.expired", data: { object: expiredSession } };
  assert.equal((await webhook.POST(hook(expiredEvent))).status, 200);
  assert.equal(records.get("booking_leads/cs_test_expired").status, "abandoned");
  assert.ok(records.get("booking_leads/cs_test_expired").abandonedAt);
  const abandoned = fetchCalls.find(call => call.body && call.body.event_name === "booking_abandoned");
  assert.ok(abandoned);
  assert.ok(abandoned.url.includes("/v3/events"));
  assert.deepEqual(abandoned.body.identifiers, { email_id: "gone@example.com" });
  assert.equal(abandoned.body.event_properties.OFFERING, "The Narrative Deep-Dive");
  assert.equal(abandoned.body.event_properties.SLOT, "2026-11-01T15:00:00Z");
  const abandonedCount = () => fetchCalls.filter(call => call.body && call.body.event_name === "booking_abandoned").length;
  assert.equal(abandonedCount(), 1);
  assert.equal((await webhook.POST(hook(expiredEvent))).status, 200);
  assert.equal(abandonedCount(), 1);
  const noLeadEvent = { id: "evt_nolead", type: "checkout.session.expired", data: { object: { ...expiredSession, id: "cs_test_nolead" } } };
  assert.equal((await webhook.POST(hook(noLeadEvent))).status, 200);
  assert.equal(abandonedCount(), 1);
  console.log("PASS: expired checkouts mark the lead abandoned and fire booking_abandoned exactly once (replays and missing leads send nothing)");
  console.log("All recovery tests passed. Stripe, Firestore, Cal.com and Brevo were mocked; no charges.");
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { fs.rmSync(out, { recursive: true, force: true }); });
