const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const esbuild = require("esbuild");
const { Timestamp } = require("firebase-admin/firestore");
const { createHash } = require("node:crypto");
const Stripe = require("stripe");
const root = path.resolve(__dirname, "../..");
const out = fs.mkdtempSync(path.join(root, "node_modules", ".business-tests-"));
const records = new Map();
let queue = Promise.resolve();
function reference(collection, id) {
  const key = collection + "/" + id;
  const ref = {
    id,
    async get() { return { exists: records.has(key), ref, data: () => records.has(key) ? { ...records.get(key) } : undefined }; },
    async create(data) { assert.ok(!records.has(key)); records.set(key, { ...data }); },
    async set(data, options) { records.set(key, options?.merge ? { ...records.get(key), ...data } : { ...data }); },
    async update(data) { assert.ok(records.has(key)); records.set(key, { ...records.get(key), ...data }); },
    async delete() { records.delete(key); },
  };
  return ref;
}
function query(collection, filters = []) {
  return {
    doc: id => reference(collection, id),
    where: (field, operation, value) => query(collection, [...filters, [field, operation, value]]),
    limit: () => query(collection, filters),
    async get() {
      const docs = [];
      for (const [key, data] of records) {
        if (!key.startsWith(collection + "/") || !filters.every(([field, operation, value]) => operation === "==" && data[field] === value)) continue;
        const ref = reference(collection, key.slice(collection.length + 1));
        docs.push(await ref.get());
      }
      return { docs };
    },
  };
}
global.__db = {
  collection: name => query(name),
  runTransaction(callback) {
    const operation = queue.then(() => callback({ get: ref => ref.get(), create: (ref, data) => ref.create(data), update: (ref, data) => ref.update(data), set: (ref, data, options) => ref.set(data, options) }));
    queue = operation.catch(() => {});
    return operation;
  },
  batch() {
    const jobs = [];
    return { update: (ref, data) => jobs.push(() => ref.update(data)), commit: () => Promise.all(jobs.map(job => job())) };
  },
};
let checkoutCalls = 0;
let checkoutInput;
let checkoutOptions;
const stripe = new Stripe("sk_test_placeholder");
global.__stripe = {
  webhooks: stripe.webhooks,
  checkout: { sessions: { async create(input, options) { checkoutCalls++; checkoutInput = input; checkoutOptions = options; return { id: "cs_test_created", url: "https://checkout.stripe.test/session" }; } } },
};
let calCalls = 0;
let calFailure = false;
global.__cal = {
  async createCalComBooking() { calCalls++; await new Promise(resolve => setTimeout(resolve, 5)); if (calFailure) throw new Error("Ambiguous upstream failure"); return { uid: "cal-confirmed" }; },
  async deleteCalComReservation() {},
};
const mocks = {
  "@/lib/firebase-admin": "export function getAdminDb() { return globalThis.__db; }",
  "@/lib/stripe": "export function getStripe() { return globalThis.__stripe; }",
  "@/lib/calcom": "export async function createCalComBooking(input) { return globalThis.__cal.createCalComBooking(input); } export async function deleteCalComReservation(input) { return globalThis.__cal.deleteCalComReservation(input); }",
};
async function bundle(file, name) {
  const output = path.join(out, name + ".cjs");
  await esbuild.build({ entryPoints: [path.join(root, file)], outfile: output, platform: "node", format: "cjs", bundle: true, packages: "external", plugins: [{ name: "isolated-integrations", setup(build) {
    build.onResolve({ filter: /^@\/lib\// }, args => mocks[args.path] ? { path: args.path, namespace: "mock" } : undefined);
    build.onLoad({ filter: /.*/, namespace: "mock" }, args => ({ contents: mocks[args.path], loader: "js" }));
  } }] });
  return require(output);
}
function request(body, pathname = "checkout") { return new Request("https://kalimeister.com/api/" + pathname, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); }
const token = "a".repeat(64);
const hash = value => createHash("sha256").update(value).digest("hex");
function hold(id, offeringId = "narrative-session", duration = 60) {
  records.set("booking_slots/" + id, { offeringId, slotStart: "2026-11-01T15:00:00Z", slotDuration: duration, tokenHash: hash(token), expiresAt: Timestamp.fromMillis(Date.now() + 45 * 60 * 1000) });
}
const payload = { offeringId: "narrative-session", offeringName: "Forged offer", price: "$0.01", duration: "1 Minute", reservationUid: "hold-1", reservationToken: token, slotStart: "2026-11-01T15:00:00Z", slotDuration: 60, customerName: "Test", customerEmail: "test@example.com", customerTimezone: "America/New_York", notes: "n".repeat(4000) };
async function main() {
  require("./firebase-credentials.cjs")();
  const checkout = await bundle("src/app/api/checkout/route.ts", "checkout");
  hold("hold-1");
  assert.equal((await checkout.POST(request(payload))).status, 200);
  assert.equal(checkoutInput.line_items[0].price_data.unit_amount, 25000);
  assert.equal(checkoutInput.line_items[0].price_data.product_data.name, "The Narrative Deep-Dive");
  assert.ok(!("notes" in checkoutInput.metadata));
  assert.equal(checkoutOptions.idempotencyKey, "booking-hold-1");
  assert.equal(records.get("booking_slots/hold-1").notes.length, 4000);
  assert.equal((await checkout.POST(request(payload))).status, 200);
  assert.equal(checkoutCalls, 1);
  for (const change of [{ offeringId: "fake" }, { slotDuration: 1 }, { customerEmail: "invalid" }, { customerTimezone: "invalid-zone" }, { slotStart: "invalid-date" }]) assert.equal((await checkout.POST(request({ ...payload, ...change }))).status, 400);
  assert.equal((await checkout.POST(request({ ...payload, reservationToken: "b".repeat(64) }))).status, 409);
  assert.equal((await checkout.POST(request({ ...payload, slotStart: "2026-11-02T15:00:00Z" }))).status, 409);
  hold("shadow", "shadow-reading", 90);
  assert.equal((await checkout.POST(request({ ...payload, offeringId: "shadow-reading", slotDuration: 90, reservationUid: "shadow" }))).status, 200);
  assert.equal(checkoutInput.line_items[0].price_data.unit_amount, 45000);
  records.get("booking_slots/hold-1").expiresAt = Timestamp.fromMillis(Date.now() - 1);
  assert.equal((await checkout.POST(request(payload))).status, 409);
  console.log("PASS: prices, durations, reservation ownership, expiry binding, intake privacy and checkout retries");

  const fulfillment = await bundle("src/lib/booking-fulfillment.ts", "fulfillment");
  const session = { id: "cs_test_paid", payment_status: "paid", amount_total: 25000, currency: "usd", payment_intent: "pi_test", metadata: { ...payload, slotDuration: "60", offeringName: "The Narrative Deep-Dive", priceCents: "25000" } };
  const concurrent = await Promise.all([fulfillment.fulfillBooking(session), fulfillment.fulfillBooking(session)]);
  assert.equal(calCalls, 1);
  assert.ok(concurrent.some(item => item.status === "success"));
  const repeat = await fulfillment.fulfillBooking(session);
  assert.equal(repeat.status, "success");
  assert.equal(calCalls, 1);
  assert.ok(!("notesSummary" in repeat.booking));
  assert.equal(records.get("bookings/cs_test_paid").cancellationDeadline.toMillis(), Date.parse(payload.slotStart) - 48 * 60 * 60 * 1000);
  assert.equal((await fulfillment.fulfillBooking({ ...session, payment_status: "unpaid" })).status, "unpaid");
  calFailure = true;
  assert.equal((await fulfillment.fulfillBooking({ ...session, id: "cs_test_attention" })).status, "pending");
  assert.equal(records.get("bookings/cs_test_attention").fulfillmentState, "needs_attention");
  const before = calCalls;
  await fulfillment.fulfillBooking({ ...session, id: "cs_test_attention" });
  assert.equal(calCalls, before);
  console.log("PASS: concurrent fulfillment, duplicate delivery, unpaid rejection, 48-hour deadline and safe ambiguous failure");

  const webhook = await bundle("src/app/api/stripe/webhook/route.ts", "webhook");
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
  assert.equal((await webhook.POST(new Request("https://kalimeister.com/api/stripe/webhook", { method: "POST", body: "{}" }))).status, 400);
  assert.equal((await webhook.POST(new Request("https://kalimeister.com/api/stripe/webhook", { method: "POST", headers: { "stripe-signature": "fake" }, body: "{}" }))).status, 400);
  const event = JSON.stringify({ id: "evt_test", type: "checkout.session.completed", data: { object: session } });
  const signature = stripe.webhooks.generateTestHeaderString({ payload: event, secret: process.env.STRIPE_WEBHOOK_SECRET });
  assert.equal((await webhook.POST(new Request("https://kalimeister.com/api/stripe/webhook", { method: "POST", headers: { "stripe-signature": signature }, body: event }))).status, 200);
  console.log("PASS: webhook accepts authentic signatures and rejects forged or absent signatures");

  const signup = await bundle("src/lib/email-signup.ts", "signup");
  process.env.BREVO_API_KEY = "test-only";
  process.env.BREVO_LIST_ID = "5";
  const emails = [];
  let providerFails = false;
  global.fetch = async (url, options) => { emails.push({ url, body: JSON.parse(options.body) }); return new Response("{}", { status: providerFails ? 503 : 201 }); };
  assert.equal((await signup.requestSignup(request({ email: "test@example.com", consent: false }))).status, 400);
  assert.equal((await signup.requestSignup(request({ email: "bad", consent: true }))).status, 400);
  assert.equal(emails.length, 0);
  assert.equal((await signup.requestSignup(request({ email: " TEST@example.com ", consent: true }))).status, 200);
  const confirmToken = emails.at(-1).body.htmlContent.match(/token=([a-f0-9]{64})/)[1];
  assert.equal(records.get("subscribers/" + hash("test@example.com")).status, "pending");
  assert.equal((await signup.requestSignup(request({ email: "test@example.com", consent: true }))).status, 429);
  await signup.confirmSignup(confirmToken);
  assert.equal(records.get("subscribers/" + hash("test@example.com")).status, "active");
  assert.deepEqual(emails.at(-2).body.listIds, [5]);
  const unsubToken = emails.at(-1).body.htmlContent.match(/unsubscribe\?token=([a-f0-9]{64})/)[1];
  const sentCount = emails.length;
  await signup.confirmSignup(confirmToken);
  assert.equal(emails.length, sentCount);
  await signup.unsubscribe(unsubToken);
  assert.equal(records.get("subscribers/" + hash("test@example.com")).status, "unsubscribed");
  assert.equal(emails.at(-1).body.emailBlacklisted, true);
  await assert.rejects(() => signup.confirmSignup(confirmToken));
  providerFails = true;
  assert.equal((await signup.requestSignup(request({ email: "failed@example.com", consent: true }))).status, 503);
  console.log("PASS: explicit consent, normalized deduplication, confirmation, delivery errors, unsubscribe and invalidated confirmation");
  console.log("All business-flow tests passed. Stripe, Cal.com, Firestore and email delivery were mocked; no charges or real emails.");
}
const originalError = console.error;
console.error = () => {};
main().catch(error => { originalError(error); process.exitCode = 1; }).finally(() => { console.error = originalError; fs.rmSync(out, { recursive: true, force: true }); });
