import type { Metadata } from "next";
import Link from "next/link";
import { WorkbookBuyButton } from "@/app/workbook/WorkbookBuyButton";
import { isWorkbookSaleEnabled, workbookProduct } from "@/lib/workbook";

export const metadata: Metadata = {
  title: "The Art of Discernment | Kali Meister",
  description: "A downloadable workbook for writing through a question or a decision. Teaching pages and guided exercises on intuition, fear, relationships and inner authority, at your own pace.",
  alternates: { canonical: "/workbook" },
  openGraph: { title: "The Art of Discernment | Kali Meister", description: "Teaching pages and guided writing exercises for working through a question or a decision.", url: "/workbook", type: "website" },
  twitter: { card: "summary_large_image", title: "The Art of Discernment | Kali Meister", description: "A downloadable workbook for writing through a question or a decision." },
};

export default function WorkbookPage() {
  const onSale = isWorkbookSaleEnabled();
  return <div className="mx-auto max-w-4xl px-6 py-20 lg:px-12">
    <header className="mb-14 max-w-3xl">
      <p className="mb-5 text-xs uppercase tracking-[.2em] text-primary">A workbook for discernment</p>
      <h1 className="mb-7 font-serif text-5xl leading-tight sm:text-6xl">The Art of Discernment.</h1>
      <p className="text-xl leading-relaxed text-on-surface/70">A strong feeling can be a place to begin. This workbook gives a question somewhere to land: teaching pages and guided writing exercises on intuition, fear, relationships and inner authority, with room on the page for “I don’t know yet.”</p>
    </header>
    <section className="mb-12 rounded-2xl bg-surface-container-low p-8">
      <h2 className="mb-4 font-serif text-3xl">What’s inside</h2>
      <ul className="space-y-3">
        {workbookProduct.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 leading-relaxed">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-tertiary" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>
    </section>
    <section className="mb-12 max-w-3xl">
      <h2 className="mb-5 font-serif text-3xl">Who it’s for</h2>
      <p className="mb-5 leading-relaxed">For reflective people working through a question or a decision at their own pace. No tarot experience is needed; the exercises begin with ordinary situations and honest writing.</p>
      <p className="leading-relaxed">Reflective writing, not a diagnostic tool or a method for proving psychic ability.</p>
    </section>
    <section className="rounded-2xl bg-surface-container-high p-8">
      {onSale ? (
        <div className="flex flex-wrap items-center justify-between gap-8">
          <div>
            <p className="font-serif text-5xl">{workbookProduct.price}</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-on-surface/70">Instant download after checkout. Secure payment through Stripe; your download link is verified against your purchase.</p>
          </div>
          <div className="w-full max-w-xs">
            <WorkbookBuyButton />
          </div>
        </div>
      ) : (
        <div className="max-w-xl">
          <p className="mb-3 text-xs uppercase tracking-[.2em] text-primary">Coming soon</p>
          <p className="mb-6 leading-relaxed">The workbook is being finalized. Join Letters from Kali to hear when it’s ready.</p>
          <Link href="/letters" className="underline underline-offset-4">Join Letters from Kali →</Link>
        </div>
      )}
    </section>
    <div className="mt-16 max-w-3xl space-y-4 border-t border-current/15 pt-8">
      <p><Link href="/letters" className="underline underline-offset-4">Start free instead — Letters from Kali →</Link></p>
      <p><Link href="/readings" className="underline underline-offset-4">Prefer to talk it through? Book a reading →</Link></p>
      <p className="text-xs leading-relaxed text-on-surface/50">{"Tarot readings are offered for reflection and personal insight. They don't predict outcomes and aren't a substitute for medical, mental health, legal or financial advice."}</p>
    </div>
  </div>;
}
