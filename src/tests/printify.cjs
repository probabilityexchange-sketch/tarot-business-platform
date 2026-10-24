const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const esbuild = require("esbuild");
const output = fs.mkdtempSync(path.join(__dirname, "../../node_modules/.printify-tests-"));
esbuild.buildSync({ entryPoints: [path.join(__dirname, "../lib/printify.ts")], outfile: path.join(output, "client.cjs"), platform: "node", format: "cjs", bundle: true, tsconfig: path.join(__dirname, "../../tsconfig.json") });
esbuild.buildSync({ entryPoints: [path.join(__dirname, "../lib/merch-products.ts")], outfile: path.join(output, "products.cjs"), platform: "node", format: "cjs", bundle: true, tsconfig: path.join(__dirname, "../../tsconfig.json") });
const client = require(path.join(output, "client.cjs"));
const { merchProducts } = require(path.join(output, "products.cjs"));
const productId = "6ad179eb85955f92a50529a4";
const taurusAllowlistedIds = [78991, 78992, 78993, 78994, 78995, 79142, 101450];
const input = { items: [{ productId, variantId: 100, quantity: 2 }], address: { first_name: "Test", last_name: "Buyer", email: "buyer@example.com", country: "US", region: "TN", address1: "1 Test Street", city: "Chattanooga", zip: "37402" } };
let calls = [];
let unavailable = false;
let wrongId = false;
let failed = false;
let testAllowlistedVariants = false;
const originalFetch = global.fetch;
const oldToken = process.env.PRINTIFY_API_TOKEN;
const oldShop = process.env.PRINTIFY_SHOP_ID;
global.fetch = async (url, options) => {
  calls.push({ url, options });
  if (failed) return new Response("Private provider error", { status: 429 });
  if (url.endsWith("orders/shipping.json")) return Response.json({ standard: 829 });
  if (testAllowlistedVariants) {
    const match = url.match(/products\/([^.]+)\.json$/);
    const requestedId = match ? match[1] : productId;
    if (requestedId === productId) {
      return Response.json({
        id: productId,
        title: "Taurus",
        variants: [
          ...taurusAllowlistedIds.map((id, idx) => ({
            id,
            title: `Size ${idx + 1} / Ivory`,
            cost: 1500,
            is_enabled: id === 79142,
            is_available: !unavailable,
          })),
          { id: 999999, title: "Unlisted / Black", cost: 1500, is_enabled: false, is_available: true },
        ],
      });
    }
    return Response.json({
      id: requestedId,
      title: "Catalog Item",
      variants: [{ id: 200, title: "Standard", cost: 1200, is_enabled: true, is_available: true }],
    });
  }
  return Response.json({ id: wrongId ? "wrong-product" : productId, title: "Taurus", variants: [{ id: 100, title: "Ivory / 3XL", cost: 1603, is_enabled: true, is_available: !unavailable }] });
};
(async () => {
  assert.equal(merchProducts.length, 18);
  const publicDir = path.join(__dirname, "../../public");
  for (const item of merchProducts) {
    const imageRel = item.slug.endsWith("-shirt")
      ? `/images/merch/zodiac-${item.slug.replace(/-shirt$/, "")}.webp`
      : `/images/merch/${item.slug.replace(/-candle$/, "")}-candle.webp`;
    const imagePath = path.join(publicDir, imageRel);
    assert.ok(fs.existsSync(imagePath), `Missing merch artwork image on disk: ${imageRel}`);
  }
  const taurusDef = merchProducts.find((item) => item.productId === productId);
  assert.deepEqual(taurusDef.allowedVariantIds, taurusAllowlistedIds);

  delete process.env.PRINTIFY_API_TOKEN;
  assert.equal(client.printifyConfigured(), false);
  assert.equal((await client.getMerchConnection()).checkoutEnabled, false);
  process.env.PRINTIFY_API_TOKEN = "test-token-not-a-real-secret";
  process.env.PRINTIFY_SHOP_ID = "12345";
  const quote = await client.quoteMerchandise(input);
  assert.equal(quote.subtotalCents, 6800);
  assert.equal(quote.shippingCents, 829);
  assert.equal(quote.totalBeforeTaxCents, 7629);
  assert.equal(quote.approval, "manual");
  assert.equal(quote.checkoutEnabled, false);
  assert.equal(calls[0].options.headers["User-Agent"], "KaliMeisterShop/1.0");
  assert.equal(calls[0].options.cache, "no-store");
  assert.deepEqual(JSON.parse(calls.at(-1).options.body).line_items, [{ product_id: productId, variant_id: 100, quantity: 2 }]);

  testAllowlistedVariants = true;
  const connection = await client.getMerchConnection();
  const connectedTaurus = connection.products.find((item) => item.productId === productId);
  assert.deepEqual(connectedTaurus.variants.map((v) => v.id), taurusAllowlistedIds);
  for (const allowlistedId of taurusAllowlistedIds) {
    const allowlistedQuote = await client.quoteMerchandise({
      items: [{ productId, variantId: allowlistedId, quantity: 1 }],
      address: input.address,
    });
    assert.equal(allowlistedQuote.subtotalCents, 3400);
  }
  await assert.rejects(
    () => client.quoteMerchandise({ items: [{ productId, variantId: 999999, quantity: 1 }], address: input.address }),
    /not currently available/
  );
  testAllowlistedVariants = false;

  await assert.rejects(() => client.quoteMerchandise({ ...input, priceCents: 1 }));
  await assert.rejects(() => client.quoteMerchandise({ ...input, items: [{ ...input.items[0], quantity: 0 }] }));
  await assert.rejects(() => client.quoteMerchandise({ ...input, items: [input.items[0], input.items[0]] }));
  await assert.rejects(() => client.quoteMerchandise({ ...input, address: { ...input.address, country: "CA" } }));
  const before = calls.length;
  await assert.rejects(() => client.quoteMerchandise({ ...input, items: [{ ...input.items[0], productId: "unlisted" }] }));
  assert.equal(calls.length, before);
  unavailable = true;
  await assert.rejects(() => client.quoteMerchandise(input), /not currently available/);
  unavailable = false;
  wrongId = true;
  await assert.rejects(() => client.quoteMerchandise(input), /different product/);
  wrongId = false;
  failed = true;
  await assert.rejects(() => client.quoteMerchandise(input), /429/);
  assert.ok(calls.every(({ url }) => !url.includes("send_to_production") && !url.endsWith("orders.json")));
  console.log("PASS: approved server prices, exact shipping, product allowlist, Taurus 7-variant allowlist, 18 artwork .webp files verified, stock checks, malformed/duplicate input rejection, provider errors; no order creation or production calls.");
})().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => {
  global.fetch = originalFetch;
  if (oldToken === undefined) delete process.env.PRINTIFY_API_TOKEN; else process.env.PRINTIFY_API_TOKEN = oldToken;
  if (oldShop === undefined) delete process.env.PRINTIFY_SHOP_ID; else process.env.PRINTIFY_SHOP_ID = oldShop;
  fs.rmSync(output, { recursive: true, force: true });
});
