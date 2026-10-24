import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { merchSalesEnabled } from "@/lib/merch-orders";
import { EmailSignupForm } from "@/components/EmailSignupForm";
import { candleCollection, zodiacCollection } from "@/lib/merch";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop | Kali Meister",
  description: "Kali Meister’s literary zodiac shirts and intention candle collection.",
  robots: { index: true, follow: true },
};

export default function ShopPage() {
  const enabled = merchSalesEnabled();
  return (
    <div className="bg-[#f5f0e8] text-[#302731]">
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-12 lg:py-24">
        <p className="mb-5 text-xs uppercase tracking-[.2em] text-[#744b65]">{enabled ? "The Kali Meister collection" : "The Kali Meister collection · A first look"}</p>
        <h1 className="max-w-3xl font-serif text-5xl leading-tight sm:text-7xl">A little wit.<br /><span className="italic text-[#744b65]">Written in the stars.</span></h1>
        <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#655b61]">Twelve signs. Twelve knowing smiles. Literary humor and celestial illustrations, made to wear your own way.</p>
        <div className="mt-8 max-w-2xl rounded-xl border border-[#653c56]/20 bg-[#fcf9f4] p-5 text-sm leading-relaxed text-[#655b61]">{enabled ? "Shirts $34 · Candles $28 · Shipping and applicable tax are shown before payment. Orders are made to order and reviewed before production. Images show design concepts." : "Collection preview — not yet available to order. Shirts will be $34 and candles $28, plus shipping. We’re finishing launch setup and checking our first samples. Images show design concepts."}</div>
        {enabled ? (
          <div className="mt-7 flex flex-wrap gap-4">
            <Link href="/shop/checkout" className="inline-flex rounded-full bg-[#653c56] px-6 py-3 text-sm text-white">Shop the collection →</Link>
            <a href="#shop-updates" className="inline-flex rounded-full border border-[#653c56] px-6 py-3 text-sm text-[#653c56]">Get collection updates ↓</a>
          </div>
        ) : (
          <a href="#shop-updates" className="mt-7 inline-flex rounded-full bg-[#653c56] px-6 py-3 text-sm text-white">Hear when the shop opens ↓</a>
        )}
        <nav aria-label="Shop collections" className="mt-8 flex gap-6 text-sm text-[#653c56]"><a href="#shirts" className="border-b border-[#744b65] pb-1">Zodiac shirts ↓</a><a href="#candles" className="border-b border-[#744b65] pb-1">Candles ↓</a></nav>
      </section>
      <section id="shirts" aria-label="Zodiac shirt collection" className="mx-auto grid max-w-7xl gap-x-7 gap-y-12 px-6 pb-20 sm:grid-cols-2 lg:grid-cols-3 lg:px-12">
        {zodiacCollection.map(({ sign, saying }, index) => {
          const itemHref = `/shop/checkout?item=${sign.toLowerCase()}-shirt`;
          return (
            <article key={sign}>
              <Link href={itemHref} className="block overflow-hidden rounded-t-[80px] bg-[#fcf9f4]">
                <Image src={`/images/merch/zodiac-${sign.toLowerCase()}.webp`} alt={`${sign} shirt design concept: ${saying}`} width={800} height={850} priority={index === 0} className="aspect-[4/5] w-full object-cover transition duration-300 hover:scale-[1.02]" />
              </Link>
              <div className="mt-5 flex items-center justify-between gap-3"><h2 className="font-serif text-3xl">{sign}</h2>{enabled ? <Link href={itemHref} className="text-[10px] uppercase tracking-[.15em] text-[#744b65] underline underline-offset-4">$34 · Choose size →</Link> : <span className="text-[10px] uppercase tracking-[.15em] text-[#744b65]">Coming soon</span>}</div>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#655b61]">{saying}</p>
            </article>
          );
        })}
      </section>
      <section id="candles" aria-labelledby="candles-title" className="scroll-mt-6 border-t border-[#302731]/15 bg-[#efe5d6] px-6 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl lg:px-6">
          <p className="mb-5 text-xs uppercase tracking-[.2em] text-[#744b65]">The intention candle collection{enabled ? "" : " · Coming soon"}</p>
          <h2 id="candles-title" className="font-serif text-4xl sm:text-5xl">A little light.<br /><span className="italic text-[#744b65]">A moment for yourself.</span></h2>
          <p className="mt-6 max-w-2xl leading-relaxed text-[#655b61]">Six candle designs for writing, ritual and reflection. Prepared in amber jars with cream-and-plum botanical labels.</p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#655b61]">These images are design concepts, not final product photographs. Candles are $28 plus shipping. This collection is produced and shipped by our print-on-demand partner; a personal blessing by Kali is not included.</p>
          <div className="mt-10 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {candleCollection.map((candle) => {
              const candleHref = `/shop/checkout?item=${candle.slug}-candle`;
              return (
                <article key={candle.slug}>
                  <Link href={candleHref} className="block overflow-hidden rounded-t-[70px] bg-[#fcf9f4]"><Image src={`/images/merch/${candle.slug}-candle.webp`} alt={`${candle.name} candle design concept: ${candle.saying}`} width={800} height={900} className="aspect-[4/5] w-full object-cover transition duration-300 hover:scale-[1.02]" /></Link>
                  <div className="mt-5 flex items-center justify-between gap-3"><h3 className="font-serif text-3xl">{candle.name}</h3>{enabled ? <Link href={candleHref} className="shrink-0 text-[10px] uppercase tracking-[.15em] text-[#744b65] underline underline-offset-4">$28 · Choose scent →</Link> : <span className="shrink-0 text-[10px] uppercase tracking-[.15em] text-[#744b65]">Coming soon</span>}</div>
                  <p className="mt-2 font-serif text-base italic text-[#302731]">“{candle.saying}”</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#655b61]">{candle.description}</p>
                </article>
              );
            })}
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-sm">
            {enabled && <Link href="/shop/checkout?category=candle" className="border-b border-[#744b65] pb-1 font-medium text-[#653c56]">Order from the candle collection →</Link>}
            <a href="#shop-updates" className="border-b border-[#744b65] pb-1">Get collection updates ↓</a>
          </div>
        </div>
      </section>
      <section id="shop-updates" className="border-t border-[#302731]/15 bg-[#e8dedf] px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:gap-20">
          <div><p className="mb-4 text-xs uppercase tracking-[.2em] text-[#744b65]">Letters from Kali</p><h2 className="font-serif text-4xl">Be here for<br /><span className="italic">the first chapter.</span></h2><p className="mt-5 leading-relaxed text-[#655b61]">Join Letters from Kali for shop news, writing and invitations. You’ll also receive the free intuition guide and our welcome series.</p></div>
          <EmailSignupForm source="shop-preview" />
        </div>
      </section>
    </div>
  );
}
