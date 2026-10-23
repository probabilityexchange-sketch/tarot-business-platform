"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Minus, Plus, ShoppingBag, Sparkles, Trash2 } from "lucide-react";
import { candleCollection, zodiacCollection } from "@/lib/merch";

type Variant = { id: number; title: string };
type Product = { id: string; slug: string; name: string; priceCents: number; variants: Variant[] };
type CartItem = { productId: string; variantId: number; quantity: number };
type Quote = {
  id: string;
  token: string;
  subtotalCents: number;
  shippingCents: number;
  lines: { name: string; variant: string; quantity: number; priceCents: number }[];
};

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];

const US_STATES = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"], ["CA", "California"],
  ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"], ["DC", "District of Columbia"], ["FL", "Florida"],
  ["GA", "Georgia"], ["HI", "Hawaii"], ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"],
  ["IA", "Iowa"], ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"],
  ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"], ["MS", "Mississippi"],
  ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"], ["NH", "New Hampshire"],
  ["NJ", "New Jersey"], ["NM", "New Mexico"], ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"],
  ["OH", "Ohio"], ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"],
  ["SC", "South Carolina"], ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"],
  ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"], ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
] as const;

function money(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function getProductMeta(slug: string) {
  if (slug.endsWith("-shirt")) {
    const signSlug = slug.replace(/-shirt$/, "");
    const match = zodiacCollection.find((item) => item.sign.toLowerCase() === signSlug);
    return {
      category: "shirt" as const,
      shortName: match?.sign || slug,
      subtitle: match?.saying || "Literary zodiac illustration on a soft garment-dyed tee.",
      image: `/images/merch/zodiac-${signSlug}.webp`,
    };
  }
  const candleSlug = slug.replace(/-candle$/, "");
  const match = candleCollection.find((item) => item.slug === candleSlug);
  return {
    category: "candle" as const,
    shortName: match?.name || slug,
    subtitle: match?.description || "Intention candle in an amber jar with a botanical label.",
    image: `/images/merch/${candleSlug}-candle.webp`,
  };
}

function parseVariant(title: string, category: "shirt" | "candle") {
  const parts = title.split(" / ").map((part) => part.trim());
  if (category === "shirt") {
    return {
      pillLabel: parts[0] || title,
      detailLabel: parts.slice(1).join(" · ") || "Garment-dyed tee",
    };
  }
  return {
    pillLabel: parts[parts.length - 1] || title,
    detailLabel: parts.slice(0, -1).join(" · ") || "9oz Amber Jar",
  };
}

function sortVariants(variants: Variant[], category: "shirt" | "candle") {
  if (category !== "shirt") return variants;
  return [...variants].sort((a, b) => {
    const sizeA = a.title.split(" / ")[0]?.trim() || "";
    const sizeB = b.title.split(" / ")[0]?.trim() || "";
    const indexA = SIZE_ORDER.indexOf(sizeA);
    const indexB = SIZE_ORDER.indexOf(sizeB);
    if (indexA === -1 && indexB === -1) return sizeA.localeCompare(sizeB);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}

export function MerchCheckout() {
  const [products, setProducts] = useState<Product[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<"all" | "shirt" | "candle">("all");
  const [selectedId, setSelectedId] = useState("");
  const [variantId, setVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState<Record<string, string>>({ country: "US" });
  const [editingAddress, setEditingAddress] = useState(true);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const requestedItem = params.get("item")?.trim().toLowerCase() || "";
    const requestedCategory = params.get("category")?.trim().toLowerCase() || "";
    if (requestedCategory === "shirt" || requestedCategory === "shirts") setCategoryFilter("shirt");
    if (requestedCategory === "candle" || requestedCategory === "candles") setCategoryFilter("candle");

    fetch("/api/merch/catalog")
      .then(async (response) => {
        if (!response.ok) throw new Error("The catalog is temporarily unavailable.");
        const data = (await response.json()) as { enabled: boolean; products: Product[] };
        if (!active) return;
        const list = data.products || [];
        setProducts(list);
        setEnabled(Boolean(data.enabled));
        setLoaded(true);

        const initialProduct =
          list.find((item) => item.slug === requestedItem || item.id === requestedItem) ||
          (requestedCategory === "candle" || requestedCategory === "candles"
            ? list.find((item) => item.slug.endsWith("-candle"))
            : list[0]);

        if (initialProduct) {
          setSelectedId(initialProduct.id);
          const meta = getProductMeta(initialProduct.slug);
          if (requestedItem) setCategoryFilter(meta.category);
          const sorted = sortVariants(initialProduct.variants, meta.category);
          const preferred =
            sorted.find((v) => v.title.startsWith("L / ") || v.title.startsWith("M / ")) || sorted[0];
          if (preferred) setVariantId(preferred.id);
        }
      })
      .catch(() => {
        if (active) {
          setLoaded(true);
          setMessage("The catalog could not load. Please refresh to try again.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (categoryFilter === "all") return true;
      return getProductMeta(item.slug).category === categoryFilter;
    });
  }, [products, categoryFilter]);

  const activeProduct = useMemo(() => {
    return (
      products.find((item) => item.id === selectedId) ||
      filteredProducts[0] ||
      products[0] ||
      null
    );
  }, [products, filteredProducts, selectedId]);

  const activeMeta = activeProduct ? getProductMeta(activeProduct.slug) : null;
  const activeVariants = useMemo(() => {
    if (!activeProduct || !activeMeta) return [];
    return sortVariants(activeProduct.variants, activeMeta.category);
  }, [activeProduct, activeMeta]);

  useEffect(() => {
    if (!activeProduct || activeVariants.length === 0) {
      setVariantId(null);
      return;
    }
    if (!activeVariants.some((v) => v.id === variantId)) {
      const preferred =
        activeVariants.find((v) => v.title.startsWith("L / ") || v.title.startsWith("M / ")) ||
        activeVariants[0];
      setVariantId(preferred ? preferred.id : null);
    }
  }, [activeProduct, activeVariants, variantId]);

  function selectProduct(item: Product) {
    setSelectedId(item.id);
    setQuantity(1);
    setJustAdded(false);
  }

  function addToBag() {
    if (!activeProduct || variantId === null) return;
    if (!activeProduct.variants.some((item) => item.id === variantId)) return;
    setCart((items) => {
      const existing = items.find(
        (item) => item.productId === activeProduct.id && item.variantId === variantId
      );
      if (existing) {
        return items.map((item) =>
          item === existing ? { ...item, quantity: Math.min(10, item.quantity + quantity) } : item
        );
      }
      if (items.length >= 10) return items;
      return [...items, { productId: activeProduct.id, variantId, quantity }];
    });
    setQuote(null);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
  }

  function updateCartQuantity(index: number, delta: number) {
    setCart((items) =>
      items
        .map((item, idx) =>
          idx === index ? { ...item, quantity: Math.min(10, Math.max(0, item.quantity + delta)) } : item
        )
        .filter((item) => item.quantity > 0)
    );
    setQuote(null);
  }

  function removeCartItem(index: number) {
    setCart((items) => items.filter((_, idx) => idx !== index));
    setQuote(null);
  }

  const bagCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const bagSubtotalCents = cart.reduce((sum, item) => {
    const p = products.find((candidate) => candidate.id === item.productId);
    return sum + (p?.priceCents || 0) * item.quantity;
  }, 0);

  async function calculate(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setQuote(null);
    try {
      const payloadAddress: Record<string, string> = {
        country: "US",
        first_name: (address.first_name || "").trim(),
        last_name: (address.last_name || "").trim(),
        email: (address.email || "").trim(),
        address1: (address.address1 || "").trim(),
        city: (address.city || "").trim(),
        region: (address.region || "").trim().toUpperCase(),
        zip: (address.zip || "").trim(),
      };
      if (address.address2?.trim()) payloadAddress.address2 = address.address2.trim();
      if (address.phone?.trim()) payloadAddress.phone = address.phone.trim();

      const response = await fetch("/api/merch/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, address: payloadAddress }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to calculate shipping.");
      setQuote(data);
      setEditingAddress(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to calculate shipping.");
    } finally {
      setBusy(false);
    }
  }

  async function pay() {
    if (!quote) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/merch/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: quote.id, token: quote.token }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to start checkout.");
      const url = new URL(data.url);
      if (url.origin !== "https://checkout.stripe.com") throw new Error("Unable to open secure checkout.");
      window.location.assign(url.href);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to start checkout.");
      setBusy(false);
    }
  }

  const inputStyle =
    "mt-1.5 w-full rounded-xl border border-[#302731]/20 bg-white px-3.5 py-2.5 text-sm text-[#302731] placeholder:text-[#655b61]/60 focus:border-[#653c56] focus:outline-none";

  const activeVariantObj = activeVariants.find((v) => v.id === variantId) || null;
  const activeVariantInfo =
    activeVariantObj && activeMeta ? parseVariant(activeVariantObj.title, activeMeta.category) : null;

  return (
    <div className="min-h-screen bg-[#f5f0e8] text-[#302731]">
      <header className="border-b border-[#302731]/15 bg-[#f5f0e8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5 lg:px-12">
          <div className="flex items-center gap-6">
            <Link href="/shop" className="text-sm text-[#653c56] hover:underline">
              ← Back to shop overview
            </Link>
            <span className="hidden text-[#302731]/25 sm:inline">|</span>
            <Link href="/" className="hidden font-serif text-xl sm:inline">
              Kali Meister
            </Link>
          </div>
          <a
            href="#order-bag"
            className="inline-flex items-center gap-2.5 rounded-full border border-[#653c56]/30 bg-[#fcf9f4] px-4 py-2 text-xs font-medium uppercase tracking-[.14em] text-[#653c56]"
          >
            <ShoppingBag size={15} />
            <span>
              Bag · {bagCount} {bagCount === 1 ? "item" : "items"}
            </span>
            {bagSubtotalCents > 0 && <span>· {money(bagSubtotalCents)}</span>}
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-12 lg:py-14">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[.2em] text-[#744b65]">The Kali Meister collection</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
            Choose your pieces.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#655b61]">
            Pick a zodiac shirt or intention candle below, tap your size or scent, and add it to your bag. Live U.S. shipping is calculated right in your order summary.
          </p>
        </div>

        {loaded && !enabled && (
          <p className="mt-6 rounded-xl border border-[#653c56]/20 bg-[#efe5d6] p-5 text-sm">
            Checkout preview · Payments are not open yet. You can explore the products and available variants while launch setup finishes.
          </p>
        )}

        <div className="mt-9 grid gap-10 lg:grid-cols-12 lg:items-start">
          {/* LEFT COLUMN: Visual Storefront & Variant Selector */}
          <div className="space-y-8 lg:col-span-7">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2.5" role="tablist" aria-label="Filter collection">
              {[
                { key: "all", label: "All pieces (18)" },
                { key: "shirt", label: "Zodiac Shirts · $34" },
                { key: "candle", label: "Intention Candles · $28" },
              ].map((tab) => {
                const active = categoryFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      const nextCat = tab.key as "all" | "shirt" | "candle";
                      setCategoryFilter(nextCat);
                      if (nextCat !== "all" && activeMeta && activeMeta.category !== nextCat) {
                        const firstMatch = products.find(
                          (item) => getProductMeta(item.slug).category === nextCat
                        );
                        if (firstMatch) selectProduct(firstMatch);
                      }
                    }}
                    className={`rounded-full px-5 py-2.5 text-xs uppercase tracking-[.15em] transition ${
                      active
                        ? "bg-[#653c56] text-white shadow-sm"
                        : "border border-[#302731]/20 bg-[#fcf9f4] text-[#302731] hover:border-[#653c56]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Active Piece Spotlight Card */}
            {!loaded ? (
              <div className="rounded-3xl border border-[#302731]/15 bg-[#fcf9f4] p-8 text-sm text-[#655b61]">
                Loading collection pieces…
              </div>
            ) : activeProduct && activeMeta ? (
              <section
                aria-label="Selected piece configuration"
                className="overflow-hidden rounded-3xl border border-[#302731]/15 bg-[#fcf9f4] p-6 shadow-sm sm:p-8"
              >
                <div className="grid gap-7 sm:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr]">
                  <div className="overflow-hidden rounded-2xl bg-[#f5f0e8]">
                    <Image
                      src={activeMeta.image}
                      alt={activeProduct.name}
                      width={520}
                      height={600}
                      className="aspect-[4/5] w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] uppercase tracking-[.18em] text-[#744b65]">
                          {activeMeta.category === "shirt" ? "Literary Zodiac Tee" : "Intention Candle"}
                          {activeVariantInfo ? ` · ${activeVariantInfo.detailLabel}` : ""}
                        </span>
                        <span className="font-serif text-2xl text-[#302731]">
                          {money(activeProduct.priceCents)}
                        </span>
                      </div>
                      <h2 className="mt-2 font-serif text-3xl sm:text-4xl">{activeMeta.shortName}</h2>
                      <p className="mt-2 text-sm italic leading-relaxed text-[#655b61]">
                        {activeMeta.category === "shirt" ? `“${activeMeta.subtitle}”` : activeMeta.subtitle}
                      </p>

                      {/* Pill Selector for Size or Scent */}
                      <div className="mt-6">
                        <div className="flex items-center justify-between text-xs uppercase tracking-[.14em] text-[#655b61]">
                          <span>
                            {activeMeta.category === "shirt" ? "Choose size" : "Choose scent"}
                          </span>
                          {activeVariantInfo && (
                            <span className="font-medium text-[#653c56]">
                              {activeVariantInfo.pillLabel}
                            </span>
                          )}
                        </div>
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {activeVariants.map((item) => {
                            const parsed = parseVariant(item.title, activeMeta.category);
                            const isSelected = item.id === variantId;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setVariantId(item.id)}
                                className={`rounded-xl px-4 py-2 text-xs font-medium transition ${
                                  isSelected
                                    ? "bg-[#653c56] text-white shadow-sm"
                                    : "border border-[#302731]/20 bg-white text-[#302731] hover:border-[#653c56]"
                                }`}
                              >
                                {parsed.pillLabel}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Stepper + Add to Bag Button */}
                    <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-[#302731]/10 pt-5">
                      <div
                        className="inline-flex items-center rounded-full border border-[#302731]/20 bg-white px-2 py-1"
                        aria-label="Quantity"
                      >
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="p-2 text-[#302731] hover:text-[#653c56]"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="min-w-8 text-center text-sm font-medium">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                          className="p-2 text-[#302731] hover:text-[#653c56]"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={addToBag}
                        disabled={variantId === null || busy || cart.length >= 10}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#653c56] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#4f3145] disabled:opacity-50"
                      >
                        {justAdded ? (
                          <>
                            <Check size={16} /> Added to your bag
                          </>
                        ) : (
                          <>
                            Add to bag · {money(activeProduct.priceCents * quantity)}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            {/* Visual Grid of All Collection Pieces */}
            <section aria-label="Browse collection pieces">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-serif text-2xl">
                  {categoryFilter === "shirt"
                    ? "Zodiac shirts"
                    : categoryFilter === "candle"
                      ? "Intention candles"
                      : "Browse all pieces"}
                </h3>
                <span className="text-xs text-[#655b61]">Tap any piece to choose sizes or scents</span>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {filteredProducts.map((item) => {
                  const meta = getProductMeta(item.slug);
                  const isCurrent = activeProduct?.id === item.id;
                  const countInBag = cart
                    .filter((line) => line.productId === item.id)
                    .reduce((sum, line) => sum + line.quantity, 0);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectProduct(item)}
                      className={`group relative flex flex-col overflow-hidden rounded-2xl border text-left transition ${
                        isCurrent
                          ? "border-[#653c56] bg-[#fcf9f4] ring-2 ring-[#653c56]/30"
                          : "border-[#302731]/15 bg-[#fcf9f4]/70 hover:border-[#653c56]/60 hover:bg-[#fcf9f4]"
                      }`}
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#efe5d6]">
                        <Image
                          src={meta.image}
                          alt={item.name}
                          width={360}
                          height={420}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                        />
                        {countInBag > 0 && (
                          <span className="absolute right-2.5 top-2.5 rounded-full bg-[#653c56] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white shadow">
                            In bag ({countInBag})
                          </span>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-between p-3.5">
                        <div>
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="font-serif text-lg leading-snug text-[#302731]">
                              {meta.shortName}
                            </p>
                            <span className="text-xs font-medium text-[#744b65]">
                              {money(item.priceCents)}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#655b61]">
                            {meta.subtitle}
                          </p>
                        </div>
                        <span className="mt-3 inline-block text-[11px] uppercase tracking-[.14em] text-[#653c56]">
                          {isCurrent ? "Selected ↑" : meta.category === "shirt" ? "Choose size →" : "Choose scent →"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Sticky Bag + Delivery & Stripe Checkout */}
          <aside
            id="order-bag"
            className="rounded-3xl border border-[#302731]/15 bg-[#fcf9f4] p-6 shadow-sm sm:p-8 lg:col-span-5 lg:sticky lg:top-8"
          >
            <div className="flex items-center justify-between border-b border-[#302731]/15 pb-4">
              <div>
                <p className="text-[11px] uppercase tracking-[.18em] text-[#744b65]">Order summary</p>
                <h2 className="mt-1 font-serif text-3xl">Your bag</h2>
              </div>
              <span className="rounded-full bg-[#efe5d6] px-3.5 py-1 text-xs font-medium text-[#653c56]">
                {bagCount} {bagCount === 1 ? "item" : "items"}
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="py-10 text-center">
                <Sparkles size={22} className="mx-auto text-[#744b65]" />
                <p className="mt-3 font-serif text-xl">Your bag is empty.</p>
                <p className="mt-2 text-sm leading-relaxed text-[#655b61]">
                  Select a zodiac shirt or intention candle on the left and tap{" "}
                  <strong>Add to bag</strong> to begin your order.
                </p>
              </div>
            ) : (
              <>
                {/* Bag Line Items */}
                <ul className="divide-y divide-[#302731]/10">
                  {cart.map((item, index) => {
                    const p = products.find((candidate) => candidate.id === item.productId);
                    const meta = p ? getProductMeta(p.slug) : null;
                    const variantTitle =
                      p?.variants.find((candidate) => candidate.id === item.variantId)?.title || "";
                    const parsed = meta ? parseVariant(variantTitle, meta.category) : null;

                    return (
                      <li key={`${item.productId}-${item.variantId}`} className="flex gap-4 py-4">
                        {meta && (
                          <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f5f0e8]">
                            <Image
                              src={meta.image}
                              alt={p?.name || "Item"}
                              width={120}
                              height={150}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-serif text-lg leading-tight">{ p?.name }</p>
                              <p className="mt-0.5 text-xs text-[#655b61]">
                                {parsed
                                  ? `${parsed.pillLabel} · ${parsed.detailLabel}`
                                  : variantTitle}
                              </p>
                            </div>
                            <span className="text-sm font-medium">
                              {money((p?.priceCents || 0) * item.quantity)}
                            </span>
                          </div>

                          <div className="mt-2.5 flex items-center justify-between">
                            <div className="inline-flex items-center rounded-full border border-[#302731]/20 bg-white px-1.5 py-0.5">
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(index, -1)}
                                className="p-1 text-[#302731] hover:text-[#653c56]"
                                aria-label={`Decrease quantity of ${p?.name || "item"}`}
                              >
                                <Minus size={12} />
                              </button>
                              <span className="min-w-6 text-center text-xs font-medium">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(index, 1)}
                                className="p-1 text-[#302731] hover:text-[#653c56]"
                                aria-label={`Increase quantity of ${p?.name || "item"}`}
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeCartItem(index)}
                              className="inline-flex items-center gap-1 text-xs text-[#655b61] hover:text-[#653c56]"
                            >
                              <Trash2 size={13} /> Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* Subtotal Banner */}
                <div className="border-t border-[#302731]/15 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#655b61]">Items subtotal</span>
                    <span className="font-serif text-xl">{money(bagSubtotalCents)}</span>
                  </div>
                </div>

                {/* Shipping & Payment Step */}
                <div className="mt-6 border-t border-[#302731]/15 pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-2xl">U.S. delivery</h3>
                    {quote && !editingAddress && (
                      <button
                        type="button"
                        onClick={() => setEditingAddress(true)}
                        className="text-xs font-medium text-[#653c56] underline"
                      >
                        Edit address
                      </button>
                    )}
                  </div>

                  {quote && !editingAddress ? (
                    <div className="mt-4 space-y-4">
                      <div className="rounded-2xl border border-[#302731]/15 bg-white p-4 text-xs leading-relaxed text-[#655b61]">
                        <p className="font-medium text-[#302731]">
                          {address.first_name} {address.last_name}
                        </p>
                        <p>
                          {address.address1}
                          {address.address2 ? `, ${address.address2}` : ""}
                        </p>
                        <p>
                          {address.city}, {address.region} {address.zip}
                        </p>
                        <p className="mt-1">{address.email}</p>
                      </div>

                      <div className="space-y-2.5 rounded-2xl border border-[#653c56]/25 bg-[#efe5d6]/60 p-5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#655b61]">Items subtotal</span>
                          <span>{money(quote.subtotalCents)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#655b61]">Standard U.S. shipping</span>
                          <span>{money(quote.shippingCents)}</span>
                        </div>
                        <div className="flex justify-between border-t border-[#302731]/15 pt-2.5 font-medium text-[#302731]">
                          <span>Total before tax</span>
                          <span className="font-serif text-xl">
                            {money(quote.subtotalCents + quote.shippingCents)}
                          </span>
                        </div>
                        <p className="pt-1 text-xs leading-relaxed text-[#655b61]">
                          Applicable sales tax appears in Stripe Checkout before you pay. Orders are reviewed before production begins.
                        </p>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void pay()}
                          className="mt-3 w-full rounded-full bg-[#653c56] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#4f3145] disabled:opacity-50"
                        >
                          {busy ? "Opening Stripe Checkout…" : "Continue to secure payment →"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={(event) => void calculate(event)} className="mt-3 space-y-3.5">
                      <p className="text-xs leading-relaxed text-[#655b61]">
                        Enter your U.S. delivery address to calculate live Printify shipping and proceed to Stripe Checkout.
                      </p>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block text-xs font-medium text-[#302731]">
                          First name
                          <input
                            required
                            disabled={busy}
                            autoComplete="given-name"
                            value={address.first_name || ""}
                            onChange={(e) => {
                              setAddress({ ...address, first_name: e.target.value });
                              setQuote(null);
                            }}
                            className={inputStyle}
                          />
                        </label>
                        <label className="block text-xs font-medium text-[#302731]">
                          Last name
                          <input
                            required
                            disabled={busy}
                            autoComplete="family-name"
                            value={address.last_name || ""}
                            onChange={(e) => {
                              setAddress({ ...address, last_name: e.target.value });
                              setQuote(null);
                            }}
                            className={inputStyle}
                          />
                        </label>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block text-xs font-medium text-[#302731]">
                          Email address
                          <input
                            required
                            type="email"
                            disabled={busy}
                            autoComplete="email"
                            value={address.email || ""}
                            onChange={(e) => {
                              setAddress({ ...address, email: e.target.value });
                              setQuote(null);
                            }}
                            className={inputStyle}
                          />
                        </label>
                        <label className="block text-xs font-medium text-[#302731]">
                          Phone <span className="font-normal text-[#655b61]">(optional)</span>
                          <input
                            type="tel"
                            disabled={busy}
                            autoComplete="tel"
                            value={address.phone || ""}
                            onChange={(e) => {
                              setAddress({ ...address, phone: e.target.value });
                              setQuote(null);
                            }}
                            className={inputStyle}
                          />
                        </label>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-[1.8fr_1fr]">
                        <label className="block text-xs font-medium text-[#302731]">
                          Street address
                          <input
                            required
                            disabled={busy}
                            autoComplete="address-line1"
                            value={address.address1 || ""}
                            onChange={(e) => {
                              setAddress({ ...address, address1: e.target.value });
                              setQuote(null);
                            }}
                            className={inputStyle}
                          />
                        </label>
                        <label className="block text-xs font-medium text-[#302731]">
                          Apt / suite <span className="font-normal text-[#655b61]">(opt.)</span>
                          <input
                            disabled={busy}
                            autoComplete="address-line2"
                            value={address.address2 || ""}
                            onChange={(e) => {
                              setAddress({ ...address, address2: e.target.value });
                              setQuote(null);
                            }}
                            className={inputStyle}
                          />
                        </label>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-[1.3fr_1.1fr_0.9fr]">
                        <label className="block text-xs font-medium text-[#302731]">
                          City
                          <input
                            required
                            disabled={busy}
                            autoComplete="address-level2"
                            value={address.city || ""}
                            onChange={(e) => {
                              setAddress({ ...address, city: e.target.value });
                              setQuote(null);
                            }}
                            className={inputStyle}
                          />
                        </label>
                        <label className="block text-xs font-medium text-[#302731]">
                          State
                          <select
                            required
                            disabled={busy}
                            autoComplete="address-level1"
                            value={address.region || ""}
                            onChange={(e) => {
                              setAddress({ ...address, region: e.target.value.toUpperCase() });
                              setQuote(null);
                            }}
                            className={inputStyle}
                          >
                            <option value="">Select state</option>
                            {US_STATES.map(([code, name]) => (
                              <option key={code} value={code}>
                                {code} — {name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block text-xs font-medium text-[#302731]">
                          ZIP code
                          <input
                            required
                            disabled={busy}
                            autoComplete="postal-code"
                            pattern="[0-9]{5}(-[0-9]{4})?"
                            placeholder="37402"
                            value={address.zip || ""}
                            onChange={(e) => {
                              setAddress({ ...address, zip: e.target.value });
                              setQuote(null);
                            }}
                            className={inputStyle}
                          />
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={!enabled || cart.length === 0 || busy}
                        className="mt-2 w-full rounded-full bg-[#653c56] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#4f3145] disabled:opacity-50"
                      >
                        {busy ? "Calculating live shipping…" : "Calculate shipping & review order →"}
                      </button>
                    </form>
                  )}
                </div>
              </>
            )}

            {message && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-[#653c56]/30 bg-[#efe5d6] p-3.5 text-xs text-[#302731]"
              >
                {message}
              </p>
            )}

            <p className="mt-6 border-t border-[#302731]/10 pt-4 text-xs leading-relaxed text-[#655b61]">
              Shirts $34 · Candles $28 · Made to order and shipped by our print-on-demand partner. Items may arrive in separate packages.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}
