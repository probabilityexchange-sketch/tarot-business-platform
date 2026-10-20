"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { adminFetch } from "@/lib/admin-client";

type Connection = {
  configured: boolean;
  products: { slug: string; name: string; priceCents: number; connected: boolean; variants: { id: number; title: string; available: boolean; productionCostCents: number; contributionBeforeShippingAndFeesCents: number }[] }[];
};

function dollars(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export default function MerchAdminPage() {
  const { user, loading } = useAuth();
  const [connection, setConnection] = useState<Connection | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function check() {
    setBusy(true);
    setError("");
    try {
      const response = await adminFetch("/api/admin/merch");
      if (!response.ok) throw new Error("Unable to check the Printify connection.");
      setConnection(await response.json());
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to check Printify.");
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <p className="p-8">Loading…</p>;
  if (user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) return <p className="p-8">Sign in with Kali’s administrator account to manage merchandise.</p>;
  return <div className="mx-auto max-w-5xl space-y-7 px-6 py-12">
    <Link href="/admin" className="underline">← Admin</Link>
    <h1 className="font-serif text-4xl">Merchandise connection</h1>
    <p>Approved prices: $34 shirts and $28 candles, plus shipping. Production requires manual approval.</p>
    <div className="rounded-xl border border-current/20 p-5"><h2 className="font-serif text-2xl">Setup in progress</h2><p className="mt-3">Customer checkout is closed. This connection checks products and shipping costs; it cannot create orders or send anything to production. Confirm manual approval in Printify before enabling order import.</p></div>
    <button type="button" disabled={busy} onClick={() => void check()} className="rounded-full bg-[#653c56] px-6 py-3 text-white disabled:opacity-50">{busy ? "Checking products…" : "Check Printify connection"}</button>
    {error && <p role="alert">{error}</p>}
    {connection && <p role="status">{connection.configured ? `${connection.products.filter((product) => product.connected).length} of ${connection.products.length} products connected.` : "The private Printify API token and shop ID still need to be configured on the server."}</p>}
    {connection?.products.map((product) => <section key={product.slug} className="rounded-xl border border-current/20 p-5"><h2 className="font-serif text-2xl">{product.name} · {dollars(product.priceCents)}</h2>{!product.connected ? <p className="mt-3">Product could not be verified. Check the Printify draft before launch.</p> : <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Variant</th><th className="p-2">Stock</th><th className="p-2">Production</th><th className="p-2">Before shipping &amp; fees</th></tr></thead><tbody>{product.variants.map((variant) => <tr key={variant.id} className="border-t border-current/10"><td className="p-2">{variant.title}</td><td className="p-2">{variant.available ? "Available" : "Unavailable / unverified"}</td><td className="p-2">{dollars(variant.productionCostCents)}</td><td className="p-2">{dollars(variant.contributionBeforeShippingAndFeesCents)}</td></tr>)}</tbody></table></div>}</section>)}
  </div>;
}
