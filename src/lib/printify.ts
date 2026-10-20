import { z } from "zod";
import type { MerchProduct } from "@/lib/merch-products";
import { merchProducts } from "@/lib/merch-products";

const variantSchema = z.object({
  id: z.number().int().positive(), title: z.string(), cost: z.number().int().nonnegative(),
  is_enabled: z.boolean(), is_available: z.boolean().optional().default(false),
});
type CatalogEntry = MerchProduct & { connected: boolean; variants: { id: number; title: string; available: boolean; productionCostCents: number; priceCents: number; contributionBeforeShippingAndFeesCents: number }[] };

const productSchema = z.object({ id: z.string(), title: z.string(), variants: z.array(variantSchema) });

export function printifyConfigured() {
  return Boolean(process.env.PRINTIFY_API_TOKEN && /^\d+$/.test(process.env.PRINTIFY_SHOP_ID || ""));
}

async function printifyRequest(path: string, body?: Record<string, unknown>) {
  if (!printifyConfigured()) throw new Error("Printify connection is not configured.");
  const response = await fetch(`https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}/${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}`, "User-Agent": "KaliMeisterShop/1.0", "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Printify request failed (${response.status}).`);
  return await response.json() as unknown;
}

export async function getPrintifyProduct(productId: string) {
  if (!merchProducts.some((product) => product.productId === productId)) throw new Error("Unknown merchandise product.");
  const product = productSchema.parse(await printifyRequest(`products/${productId}.json`));
  if (product.id !== productId) throw new Error("Printify returned a different product.");
  return product;
}

export async function getMerchConnection() {
  if (!printifyConfigured()) return { configured: false, checkoutEnabled: false, approval: "manual", products: [] };
  const products: CatalogEntry[] = [];
  for (let index = 0; index < merchProducts.length; index += 4) {
    const batch = merchProducts.slice(index, index + 4);
    const results = await Promise.allSettled(batch.map(async (item) => {
      const product = await getPrintifyProduct(item.productId);
      const variants = product.variants.filter((variant) => variant.is_enabled).map((variant) => ({
        id: variant.id, title: variant.title, available: variant.is_available,
        productionCostCents: variant.cost, priceCents: item.priceCents,
        contributionBeforeShippingAndFeesCents: item.priceCents - variant.cost,
      }));
      return { ...item, connected: true, variants };
    }));
    results.forEach((result, offset) => products.push(result.status === "fulfilled" ? result.value : { ...batch[offset], connected: false, variants: [] }));
  }
  return { configured: true, checkoutEnabled: false, approval: "manual", products };
}

export const merchQuoteSchema = z.object({
  items: z.array(z.object({ productId: z.string(), variantId: z.number().int().positive(), quantity: z.number().int().min(1).max(10) }).strict()).min(1).max(10),
  address: z.object({
    first_name: z.string().trim().min(1).max(80), last_name: z.string().trim().min(1).max(80),
    email: z.string().trim().email().max(254), phone: z.string().trim().max(30).optional(),
    country: z.literal("US"), region: z.string().regex(/^[A-Z]{2}$/),
    address1: z.string().trim().min(1).max(200), address2: z.string().trim().max(200).optional(),
    city: z.string().trim().min(1).max(100), zip: z.string().regex(/^\d{5}(-\d{4})?$/),
  }).strict(),
}).strict().refine((value) => value.items.reduce((sum, item) => sum + item.quantity, 0) <= 20, "Maximum 20 items per quote.");

export async function quoteMerchandise(input: unknown) {
  const data = merchQuoteSchema.parse(input);
  const keys = data.items.map((item) => `${item.productId}:${item.variantId}`);
  if (new Set(keys).size !== keys.length) throw new Error("Combine duplicate items before requesting a quote.");
  let subtotalCents = 0;
  const lines: { productId: string; variantId: number; quantity: number; name: string; variant: string; priceCents: number }[] = [];
  for (const item of data.items) {
    const definition = merchProducts.find((product) => product.productId === item.productId);
    if (!definition) throw new Error("Unknown merchandise product.");
    const product = await getPrintifyProduct(item.productId);
    const variant = product.variants.find((variant) => variant.id === item.variantId && variant.is_enabled && variant.is_available);
    if (!variant) throw new Error("This size or scent is not currently available.");
    if (variant.cost >= definition.priceCents) throw new Error("This variant needs a price review before sale.");
    subtotalCents += definition.priceCents * item.quantity;
    lines.push({ ...item, name: definition.name, variant: variant.title, priceCents: definition.priceCents });
  }
  const lineItems = data.items.map((item) => ({ product_id: item.productId, variant_id: item.variantId, quantity: item.quantity }));
  const shipping = z.object({ standard: z.number().int().nonnegative() }).parse(await printifyRequest("orders/shipping.json", { line_items: lineItems, address_to: data.address }));
  return { lines, currency: "usd", subtotalCents, shippingCents: shipping.standard, totalBeforeTaxCents: subtotalCents + shipping.standard, checkoutEnabled: false, approval: "manual" };
}

const printifyOrderSchema = z.object({ id: z.string().min(1), status: z.string(), metadata: z.object({ shop_order_id: z.union([z.string(), z.number()]).optional() }).optional() });

export async function findPrintifyOrder(externalId: string) {
  for (let page = 1; page <= 20; page++) {
    const result = z.object({ data: z.array(printifyOrderSchema), last_page: z.number().int().positive() }).parse(await printifyRequest(`orders.json?limit=100&page=${page}`));
    const order = result.data.find((item) => String(item.metadata?.shop_order_id) === externalId);
    if (order) return { id: order.id, status: order.status };
    if (page >= result.last_page) return null;
  }
  throw new Error("Order reconciliation needs a manual Printify search.");
}

export async function createHeldPrintifyOrder(externalId: string, input: unknown) {
  const data = merchQuoteSchema.parse(input);
  if (!data.items.every((item) => merchProducts.some((product) => product.productId === item.productId))) throw new Error("Unknown merchandise product.");
  const result = printifyOrderSchema.parse(await printifyRequest("orders.json", {
    external_id: externalId, label: externalId, shipping_method: 1, send_shipping_notification: false,
    line_items: data.items.map((item) => ({ product_id: item.productId, variant_id: item.variantId, quantity: item.quantity })),
    address_to: data.address,
  }));
  return { id: result.id, status: result.status };
}
