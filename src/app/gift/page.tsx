import type { Metadata } from "next";
import Link from "next/link";
import { GiftBuyButton } from "@/app/gift/GiftBuyButton";
import { giftTiers } from "@/lib/gift";
import { isWorkbookSaleEnabled } from "@/lib/workbook";

export const metadata: Metadata = {
  title: "Give a Reading | Kali Meister",
  description: "Give a private online tarot reading with Kali Meister. You receive a personal gift code; the recipient chooses their own time and enters the code at checkout.",
  alternates: { canonical: "/gift" },
  openGraph: { title: "Give a Reading | Kali Meister", description: "A gifted private online reading — the recipient chooses their own time.", url: "/gift", type: "website" },
  twitter: { card: "summary_large_image", title: "Give a Reading | Kali Meister", description: "Give a private online reading. The recipient chooses their own time." },
};

export default function GiftPage() {
  return <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
    <header className="mb-14 max-w-3xl">
      <p className="mb-5 text-xs uppercase tracking-[.2em] text-primary">Give a reading</p>
      <h1 className="mb-7 font-serif text-5xl leading-tight sm:text-6xl">Room for someone you love.</h1>
      <p className="mb-5 text-xl leading-relaxed text-on-surface/70">A reading is time and space to think through a question, a decision or the story you’re living. A gift reading gives that room to someone else.</p>
      <p className="leading-relaxed text-on-surface/70">You buy the reading. You receive a personal gift code by email. The recipient chooses their own time online and enters the code at checkout — the $250 code covers a 60-minute reading in full; the $450 code covers any reading in full. Either code can be applied toward either session, and the recipient simply pays any difference.</p>
    </header>

    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
      {giftTiers.map((tier) => (
        <section key={tier.id} className="flex h-full flex-col rounded-2xl bg-surface-container-high p-8 lg:p-12">
          <div className="mb-8 flex items-start justify-between gap-6">
            <div>
              <p className="mb-2 font-label text-sm uppercase tracking-widest text-secondary">{tier.duration}</p>
              <h2 className="font-serif text-3xl leading-snug">{tier.title}</h2>
            </div>
            <p className="font-serif text-3xl">{tier.price}</p>
          </div>
          <p className="mb-10 flex-grow leading-relaxed text-on-surface/70">{tier.description}</p>
          <GiftBuyButton tierId={tier.id} label={`Give this reading — ${tier.price}`} value={tier.priceCents / 100} />
        </section>
      ))}
    </div>

    <section className="mt-16 max-w-3xl">
      <h2 className="mb-5 font-serif text-3xl">How it works</h2>
      <p className="mb-5 leading-relaxed">After checkout, a personal gift code is sent to the purchaser’s inbox, along with a printable gift note. Share the code however you like — the recipient books online and enters it at checkout, where the gift amount comes off any reading.</p>
      <p className="leading-relaxed">Gift readings are prepaid and non-refundable, the same as all readings. The code does not expire.</p>
    </section>

    <div className="mt-16 max-w-3xl space-y-4 border-t border-current/15 pt-8">
      {isWorkbookSaleEnabled() ? <p><Link href="/workbook" className="underline underline-offset-4">A smaller gift — The Art of Discernment, Kali’s $39 workbook →</Link></p> : null}
      <p><Link href="/readings" className="underline underline-offset-4">Booking for yourself instead? Book a reading →</Link></p>
      <p className="text-xs leading-relaxed text-on-surface/50">{"Tarot readings are offered for reflection and personal insight. They don't predict outcomes and aren't a substitute for medical, mental health, legal or financial advice."}</p>
    </div>
  </div>;
}
