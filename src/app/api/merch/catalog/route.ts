import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { getMerchConnection } from "@/lib/printify";
import { merchSalesEnabled } from "@/lib/merch-orders";

export const dynamic = "force-dynamic";
const publicProducts = unstable_cache(async function () {
  const connection = await getMerchConnection();
  return connection.products.filter((product) => product.connected).map((product) => ({
    id: product.productId, slug: product.slug, name: product.name, priceCents: product.priceCents,
    variants: product.variants.filter((variant) => variant.available).map((variant) => ({ id: variant.id, title: variant.title })),
  }));
}, ["merch-public-catalog-v1"], { revalidate: 60 });

export async function GET() {
  return NextResponse.json({ enabled: merchSalesEnabled(), products: await publicProducts() }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } });
}
