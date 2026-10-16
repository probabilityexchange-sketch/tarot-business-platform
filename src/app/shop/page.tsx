import type { Metadata } from "next";
import Image from "next/image";
import { EmailSignupForm } from "@/components/EmailSignupForm";
import { zodiacCollection } from "@/lib/merch";

export const metadata: Metadata = {
  title: "Shop preview | Kali Meister",
  description: "A first look at Kali Meister’s literary zodiac shirt collection.",
  robots: { index: false, follow: true },
};

export default function ShopPage() {
  return (
    <div className="bg-[#f5f0e8] text-[#302731]">
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-12 lg:py-24">
        <p className="mb-5 text-xs uppercase tracking-[.2em] text-[#744b65]">The Kali Meister collection · A first look</p>
        <h1 className="max-w-3xl font-serif text-5xl leading-tight sm:text-7xl">A little wit.<br /><span className="italic text-[#744b65]">Written in the stars.</span></h1>
        <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#655b61]">Twelve signs. Twelve knowing smiles. Literary humor and celestial illustrations, made to wear your own way.</p>
        <div className="mt-8 max-w-2xl rounded-xl border border-[#653c56]/20 bg-[#fcf9f4] p-5 text-sm leading-relaxed text-[#655b61]">Collection preview — not yet available to order. We’re checking our first sample before opening the shop. Images show design concepts; final shirt colors, sizing and prices will be confirmed at launch.</div>
        <a href="#shop-updates" className="mt-7 inline-flex rounded-full bg-[#653c56] px-6 py-3 text-sm text-white">Hear when the shop opens ↓</a>
      </section>
      <section aria-label="Zodiac shirt collection" className="mx-auto grid max-w-7xl gap-x-7 gap-y-12 px-6 pb-20 sm:grid-cols-2 lg:grid-cols-3 lg:px-12">
        {zodiacCollection.map(({ sign, saying }, index) => (
          <article key={sign}>
            <div className="overflow-hidden rounded-t-[80px] bg-[#fcf9f4]">
              <Image src={`/images/merch/zodiac-${sign.toLowerCase()}.webp`} alt={`${sign} shirt design concept: ${saying}`} width={800} height={850} priority={index === 0} className="aspect-[4/5] w-full object-cover" />
            </div>
            <div className="mt-5 flex items-center justify-between gap-3"><h2 className="font-serif text-3xl">{sign}</h2><span className="text-[10px] uppercase tracking-[.15em] text-[#744b65]">Coming soon</span></div>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#655b61]">{saying}</p>
          </article>
        ))}
      </section>
      <section aria-labelledby="candles-title" className="border-t border-[#302731]/15 bg-[#efe5d6] px-6 py-16 lg:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-20">
          <Image src="/images/merch/writing-hour-candle.webp" alt="The Writing Hour candle concept with an amber jar and cream botanical label" width={800} height={1000} className="aspect-[4/5] w-full rounded-t-[100px] object-cover" />
          <div><p className="mb-5 text-xs uppercase tracking-[.2em] text-[#744b65]">Candles · In development</p><h2 id="candles-title" className="font-serif text-4xl sm:text-5xl">The Writing Hour</h2><p className="mt-6 max-w-md text-lg leading-relaxed text-[#655b61]">A little light beside the page. A candle concept for the moments you set aside to write, reflect and begin again.</p><p className="mt-5 max-w-md text-sm leading-relaxed text-[#655b61]">Shown as a design concept. Scents, sizes and prices will be confirmed before release.</p><a href="#shop-updates" className="mt-8 inline-block border-b border-[#744b65] pb-1 text-sm">Get collection updates ↓</a></div>
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
