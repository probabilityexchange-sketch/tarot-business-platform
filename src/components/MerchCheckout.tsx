"use client";

import { useEffect, useState } from "react";

type Product = { id: string; name: string; priceCents: number; variants: { id: number; title: string }[] };
type CartItem = { productId: string; variantId: number; quantity: number };
type Quote = { id: string; token: string; subtotalCents: number; shippingCents: number; lines: { name: string; variant: string; quantity: number; priceCents: number }[] };
const fields = [
  ["first_name", "First name", "given-name"], ["last_name", "Last name", "family-name"], ["email", "Email address", "email"],
  ["address1", "Street address", "address-line1"], ["address2", "Apartment or suite (optional)", "address-line2"], ["city", "City", "address-level2"],
  ["region", "State (two-letter code)", "address-level1"], ["zip", "ZIP code", "postal-code"], ["phone", "Phone (optional)", "tel"],
] as const;
function money(cents: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100); }

export function MerchCheckout() {
  const [products, setProducts] = useState<Product[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState("");
  const [variant, setVariant] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState<Record<string, string>>({ country: "US" });
  const [quote, setQuote] = useState<Quote | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    fetch("/api/merch/catalog").then(async (response) => {
      if (!response.ok) throw new Error("The catalog is temporarily unavailable.");
      const data = await response.json();
      if (active) { setProducts(data.products); setEnabled(data.enabled); setLoaded(true); }
    }).catch(() => { if (active) { setLoaded(true); setMessage("The catalog could not load. Please refresh to try again."); } });
    return () => { active = false; };
  }, []);
  const product = products.find((item) => item.id === selected);
  function add() {
    if (!product || !product.variants.some((item) => item.id === Number(variant))) return;
    setCart((items) => {
      const existing = items.find((item) => item.productId === selected && item.variantId === Number(variant));
      if (existing) return items.map((item) => item === existing ? { ...item, quantity: Math.min(10, item.quantity + quantity) } : item);
      return [...items, { productId: selected, variantId: Number(variant), quantity }];
    });
    setQuote(null);
  }
  async function calculate(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage(""); setQuote(null);
    try {
      const response = await fetch("/api/merch/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: cart, address }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setQuote(data);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to calculate shipping."); }
    finally { setBusy(false); }
  }
  async function pay() {
    if (!quote) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/merch/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: quote.id, token: quote.token }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const url = new URL(data.url);
      if (url.origin !== "https://checkout.stripe.com") throw new Error("Unable to open secure checkout.");
      window.location.assign(url.href);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to start checkout."); setBusy(false); }
  }
  const inputStyle = "mt-2 w-full rounded-lg border border-[#653c56]/25 bg-white/50 px-4 py-3";
  return <div className="mx-auto max-w-5xl px-6 py-14 text-[#302731]">
    <p className="text-xs uppercase tracking-[.2em] text-[#744b65]">The Kali Meister collection</p>
    <h1 className="mt-5 font-serif text-5xl">A little something for your story.</h1>
    {loaded && !enabled && <p className="mt-7 rounded-xl border border-[#653c56]/20 bg-[#efe5d6] p-5">Checkout preview · Payments are not open yet. You can explore the products and available variants while we finish launch setup.</p>}
    <div className="mt-10 grid gap-10 lg:grid-cols-2">
      <section className="space-y-5"><h2 className="font-serif text-3xl">Your collection</h2>
        <label className="block">Choose a design<select value={selected} onChange={(event) => { setSelected(event.target.value); setVariant(""); }} className={inputStyle}><option value="">{loaded ? "Select a shirt or candle" : "Loading the collection…"}</option>{products.map((item) => <option key={item.id} value={item.id}>{item.name} — {money(item.priceCents)}</option>)}</select></label>
        <label className="block">Size or scent<select value={variant} onChange={(event) => setVariant(event.target.value)} disabled={!product} className={inputStyle}><option value="">Select an available variant</option>{product?.variants.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
        <label className="block">Quantity<input className={inputStyle} type="number" min="1" max="10" value={quantity} onChange={(event) => setQuantity(Math.max(1, Math.min(10, Number(event.target.value) || 1)))} /></label>
        <button type="button" onClick={add} disabled={!variant || busy || cart.length >= 10} className="rounded-full border border-[#653c56] px-6 py-3 disabled:opacity-50">Add to your order</button>
        <ul className="divide-y divide-[#653c56]/20">{cart.map((item, index) => { const p = products.find((candidate) => candidate.id === item.productId); return <li key={`${item.productId}-${item.variantId}`} className="py-4"><strong>{p?.name}</strong><p className="mt-1 text-sm">{p?.variants.find((candidate) => candidate.id === item.variantId)?.title} · Qty {item.quantity} · {money((p?.priceCents || 0) * item.quantity)}</p><button type="button" onClick={() => { setCart(cart.filter((_, position) => position !== index)); setQuote(null); }} className="mt-2 text-sm underline">Remove {p?.name}</button></li>; })}</ul>
        <p className="text-sm leading-relaxed text-[#655b61]">Shirts $34 · Candles $28 · Shipping additional. Made to order and shipped by our print-on-demand partner. Items may arrive separately. Candles do not include a personal blessing.</p>
      </section>
      <section><h2 className="font-serif text-3xl">Where should it go?</h2><p className="mt-3 text-sm text-[#655b61]">U.S. delivery. We’ll use this address to quote shipping and fulfill your order. To change it after quoting, edit it here and request a fresh quote.</p>
        <form onSubmit={(event) => void calculate(event)} className="mt-6 space-y-4">
          {fields.map(([key, label, autocomplete]) => <label key={key} className="block text-sm">{label}<input value={address[key] || ""} disabled={busy} required={key !== "address2" && key !== "phone"} autoComplete={autocomplete} type={key === "email" ? "email" : key === "phone" ? "tel" : "text"} maxLength={key === "region" ? 2 : 200} pattern={key === "region" ? "[A-Z]{2}" : key === "zip" ? "[0-9]{5}(-[0-9]{4})?" : undefined} onChange={(event) => { setAddress({ ...address, [key]: key === "region" ? event.target.value.toUpperCase() : event.target.value }); setQuote(null); }} className={inputStyle} /></label>)}
          <button disabled={!enabled || cart.length === 0 || busy} className="rounded-full bg-[#653c56] px-6 py-3 text-white disabled:opacity-50">{busy ? "Working…" : "Calculate shipping"}</button>
        </form>
        {quote && <div className="mt-7 space-y-3 rounded-xl border border-[#653c56]/20 p-5"><h3 className="font-serif text-2xl">Review your order</h3><p>Items: {money(quote.subtotalCents)}</p><p>Standard shipping: {money(quote.shippingCents)}</p><p>Before tax: {money(quote.subtotalCents + quote.shippingCents)}</p><p className="text-sm">Applicable tax and the final total appear in Stripe before you pay. Your payment reserves the order for manual review; it does not start production.</p><button disabled={busy} onClick={() => void pay()} className="rounded-full bg-[#653c56] px-6 py-3 text-white disabled:opacity-50">Continue to secure payment</button></div>}
        {message && <p role="alert" className="mt-5">{message}</p>}
      </section>
    </div>
  </div>;
}
