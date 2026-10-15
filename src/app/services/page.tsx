import type { Metadata } from "next";
import Link from "next/link";
import { readingsOfferings } from "@/lib/offerings";

export const metadata: Metadata = {
  title: "Private Readings, Writing & Spiritual Reflection | Kali Meister",
  description: "Explore private tarot readings with Kali Meister, her writing, and upcoming gatherings centered on spiritual reflection.",
  alternates: { canonical: "/services" },
  openGraph: { title: "Work with Kali Meister", description: "Private readings, writing and spiritual reflection.", url: "/services", type: "website" },
  twitter: { card: "summary_large_image", title: "Work with Kali Meister", description: "Private readings, writing and spiritual reflection." },
};

export default function ServicesPage() {
  return <div className="mx-auto max-w-6xl px-6 py-20 lg:px-12"><p className="mb-5 text-xs uppercase tracking-[.2em] text-primary">Work with Kali</p><h1 className="mb-7 font-serif text-5xl sm:text-6xl">Space for your questions.</h1><p className="mb-12 max-w-2xl text-xl leading-relaxed text-on-surface/70">Private readings bring together tarot, conversation and spiritual reflection. Choose the time and space that suit what you’d like to explore.</p>
    <div className="mb-14 grid gap-8 md:grid-cols-2">{readingsOfferings.map((offering) => <section key={offering.id} className="rounded-2xl border border-on-surface/15 bg-surface-container-low p-8"><p className="mb-4 text-sm text-primary">{offering.duration} · {offering.price}</p><h2 className="mb-4 font-serif text-3xl">{offering.title}</h2><p className="mb-6 leading-relaxed">{offering.description}</p><Link href="/readings" className="underline underline-offset-4">Choose a time →</Link></section>)}</div>
    <section className="mb-10"><h2 className="mb-4 font-serif text-3xl">Writing, gatherings & resources</h2><p className="mb-5 leading-relaxed">Explore Kali’s journal and join her email list for reflection prompts and news about future workshops, resources and retreats. Details will be shared as plans are confirmed.</p><div className="flex flex-wrap gap-6"><Link href="/blog" className="underline">Read the journal</Link><Link href="/#letters" className="underline">Join Letters from Kali</Link></div></section>
    <Link href="/contact" className="underline">Ask a question about working with Kali →</Link>
  </div>;
}
