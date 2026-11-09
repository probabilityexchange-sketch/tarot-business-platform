const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const esbuild = require("esbuild");
const Stripe = require("stripe");
const out = fs.mkdtempSync(path.join(__dirname, "../../node_modules/.workbook-tests-"));
const records = new Map();
let queue = Promise.resolve();
function ref(collection, id) {
  const key = `${collection}/${id}`;
  return { id, async get() { return { data: () => records.get(key) }; }, async create(data) { assert.ok(!records.has(key)); records.set(key, data); }, async update(data) { assert.ok(records.has(key)); records.set(key, { ...records.get(key), ...data }); } };
}
global.__workbookDb = { collection(name) { return { doc(id) { return ref(name, id); } }; }, runTransaction(callback) { const task = queue.then(() => callback({ async get(r) { return r.get(); }, create(r, data) { return r.create(data); }, update(r, data) { return r.update(data); } })); queue = task.catch(() => {}); return task; } };
const stripe = new Stripe("sk_test_placeholder");
const checkoutCalls = [];
const sessionsById = new Map();
global.__workbookStripe = {
  webhooks: stripe.webhooks,
  checkout: { sessions: {
    async create(input, options) {
      if (sessionsById.has(options.idempotencyKey)) return sessionsById.get(options.idempotencyKey);
      checkoutCalls.push({ input, options });
      const session = { id: `cs_test_workbook${checkoutCalls.length}`, url: "https://checkout.stripe.test/workbook", status: "open" };
      sessionsById.set(options.idempotencyKey, session);
      return session;
    },
    async retrieve(id) {
      if (!sessionsById.has(id)) throw new Error(`No such checkout session: ${id}`);
      return sessionsById.get(id);
    },
  } },
};
const mocks = {
  "@/lib/firebase-admin": "export function getAdminDb(){ return globalThis.__workbookDb; }",
  "@/lib/stripe": "export function getStripe(){ return globalThis.__workbookStripe; }",
  "@/lib/calcom": "export async function createCalComBooking(){ throw new Error(\"calcom is not used in workbook tests\"); } export async function deleteCalComReservation(){}",
};
async function bundle(file, name) {
  const output = path.join(out, name + ".cjs");
  await esbuild.build({ entryPoints: [path.join(__dirname, "../..", file)], outfile: output, platform: "node", format: "cjs", bundle: true, packages: "external", plugins: [{ name: "mocks", setup(build) {
    build.onResolve({ filter: /^@\/lib\// }, args => mocks[args.path] ? { path: args.path, namespace: "mock" } : undefined);
    build.onLoad({ filter: /.*/, namespace: "mock" }, args => ({ contents: mocks[args.path], loader: "js" }));
  } }] });
  return require(output);
}
(async () => {
  const checkout = await bundle("src/app/api/workbook/checkout/route.ts", "checkout");
  delete process.env.WORKBOOK_SALES_ENABLED;
  const closed = await checkout.POST(new Request("https://kalimeister.com/api/workbook/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ purchaseId: "buyer-closed" }) }));
  assert.equal(closed.status, 503);
  assert.ok((await closed.json()).error.includes("isn't available yet"));
  process.env.WORKBOOK_SALES_ENABLED = "false";
  assert.equal((await checkout.POST(new Request("https://kalimeister.com/api/workbook/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ purchaseId: "buyer-closed" }) }))).status, 503);
  assert.equal(checkoutCalls.length, 0);
  console.log("PASS: workbook checkout refuses payment while WORKBOOK_SALES_ENABLED is not \"true\"");

  process.env.WORKBOOK_SALES_ENABLED = "true";
  const response = await checkout.POST(new Request("https://kalimeister.com/api/workbook/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ purchaseId: "buyer-1" }) }));
  assert.equal(response.status, 200);
  const firstUrl = (await response.json()).url;
  assert.ok(firstUrl);
  const created = checkoutCalls[0];
  assert.equal(created.input.mode, "payment");
  assert.equal(created.input.payment_method_types, undefined, "Stripe selects eligible payment methods from Dashboard settings");
  assert.equal(created.input.line_items[0].quantity, 1);
  assert.equal(created.input.line_items[0].price_data.unit_amount, 3900);
  assert.equal(created.input.line_items[0].price_data.currency, "usd");
  assert.equal(created.input.line_items[0].price_data.product_data.name, "The Art of Discernment");
  assert.equal(created.input.metadata.kind, "workbook");
  assert.ok(created.input.success_url.includes("/workbook/success"));
  assert.ok(created.input.success_url.includes("session_id={CHECKOUT_SESSION_ID}"));
  assert.ok(created.input.cancel_url.endsWith("/workbook"));
  assert.equal(created.options.idempotencyKey, "workbook-buyer-1");
  const again = await checkout.POST(new Request("https://kalimeister.com/api/workbook/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ purchaseId: "buyer-1" }) }));
  assert.equal(again.status, 200);
  assert.equal((await again.json()).url, firstUrl);
  assert.equal(checkoutCalls.length, 1);
  const anon = await checkout.POST(new Request("https://kalimeister.com/api/workbook/checkout", { method: "POST" }));
  assert.equal(anon.status, 400);
  assert.equal(checkoutCalls.length, 1);
  const bad = await checkout.POST(new Request("https://kalimeister.com/api/workbook/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{not-json" }));
  assert.equal(bad.status, 400);
  const wrongShape = await checkout.POST(new Request("https://kalimeister.com/api/workbook/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ purchaseId: "x".repeat(65) }) }));
  assert.equal(wrongShape.status, 400);
  console.log("PASS: workbook checkout creates a verified $39 session with idempotency and rejects malformed bodies");

  const orders = await bundle("src/lib/workbook-orders.ts", "orders");
  const paidSession = { id: "cs_test_workbookpaid", payment_status: "paid", metadata: { kind: "workbook" }, currency: "usd", amount_total: 3900, payment_intent: "pi_workbook", customer_details: { email: "buyer@example.com" }, customer_email: null };
  assert.equal((await orders.recordWorkbookPurchase({ ...paidSession, payment_status: "unpaid" })).status, "unpaid");
  await assert.rejects(() => orders.recordWorkbookPurchase({ ...paidSession, amount_total: 25000 }), /Invalid workbook payment/);
  await assert.rejects(() => orders.recordWorkbookPurchase({ ...paidSession, metadata: { kind: "merch" } }), /Invalid workbook payment/);
  assert.equal((await orders.recordWorkbookPurchase(paidSession)).status, "recorded");
  assert.equal(records.get("workbook_buyers/cs_test_workbookpaid").email, "buyer@example.com");
  assert.equal(records.get("workbook_buyers/cs_test_workbookpaid").amountCents, 3900);
  assert.equal(records.get("workbook_buyers/cs_test_workbookpaid").paymentIntentId, "pi_workbook");
  assert.equal((await orders.recordWorkbookPurchase(paidSession)).status, "recorded");
  assert.equal([...records.keys()].filter(key => key.startsWith("workbook_buyers/")).length, 1);
  console.log("PASS: workbook purchase recording validates payment and stays idempotent");

  const webhook = await bundle("src/app/api/stripe/webhook/route.ts", "webhook");
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_workbook_test";
  const hookSession = { id: "cs_test_workbookhook", payment_status: "paid", metadata: { kind: "workbook" }, currency: "usd", amount_total: 3900, payment_intent: "pi_hook", customer_details: { email: "hook@example.com" }, customer_email: null };
  const event = JSON.stringify({ id: "evt_workbook", type: "checkout.session.completed", data: { object: hookSession } });
  const signature = stripe.webhooks.generateTestHeaderString({ payload: event, secret: process.env.STRIPE_WEBHOOK_SECRET });
  assert.equal((await webhook.POST(new Request("https://kalimeister.com/api/stripe/webhook", { method: "POST", headers: { "stripe-signature": signature }, body: event }))).status, 200);
  assert.ok(records.has("workbook_buyers/cs_test_workbookhook"));
  assert.equal(records.get("workbook_buyers/cs_test_workbookhook").email, "hook@example.com");
  console.log("PASS: workbook webhook records paid sessions from authentic signatures");

  const originalCwd = process.cwd();
  const downloadTestDir = path.join(out, "download-fixture");
  fs.mkdirSync(downloadTestDir);
  process.chdir(downloadTestDir);
  const download = await bundle("src/app/api/workbook/download/route.ts", "download");
  assert.equal((await download.GET(new Request("https://kalimeister.com/api/workbook/download?session_id=nope"))).status, 403);
  sessionsById.set("cs_test_unpaid", { id: "cs_test_unpaid", payment_status: "unpaid", metadata: { kind: "workbook" }, currency: "usd", amount_total: 3900 });
  const unpaid = await download.GET(new Request("https://kalimeister.com/api/workbook/download?session_id=cs_test_unpaid"));
  assert.equal(unpaid.status, 403);
  assert.equal((await unpaid.json()).error, "This download link is not valid for a paid workbook purchase.");
  sessionsById.set("cs_test_paiddownload", { id: "cs_test_paiddownload", payment_status: "paid", metadata: { kind: "workbook" }, currency: "usd", amount_total: 3900 });
  const missing = await download.GET(new Request("https://kalimeister.com/api/workbook/download?session_id=cs_test_paiddownload"));
  assert.equal(missing.status, 503);
  assert.ok((await missing.json()).error.includes("being finalized"));
  const assetsDir = path.join(process.cwd(), "private-assets");
  fs.mkdirSync(assetsDir, { recursive: true });
  const pdfPath = path.join(assetsDir, "discernment-workbook.pdf");
  fs.writeFileSync(pdfPath, "%PDF-1.4 workbook test\n");
  try {
    const served = await download.GET(new Request("https://kalimeister.com/api/workbook/download?session_id=cs_test_paiddownload"));
    assert.equal(served.status, 200);
    assert.equal(served.headers.get("Content-Type"), "application/pdf");
    assert.ok((served.headers.get("Content-Disposition") || "").includes("attachment"));
    assert.ok((await served.text()).startsWith("%PDF-1.4"));
  } finally {
    fs.rmSync(pdfPath, { force: true });
    process.chdir(originalCwd);
  }
  console.log("PASS: workbook download verifies payment, handles a missing PDF gracefully and streams the file");
  console.log("All workbook tests passed. Stripe, Firestore and Cal.com were mocked; no charges.");
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { fs.rmSync(out, { recursive: true, force: true }); });
