import type { Metadata } from "next";
import BookingOfferings from "@/components/BookingOfferings";
import { readingsOfferings } from "@/lib/offerings";

export const metadata: Metadata = {
  title: "Private Tarot Readings | Kali Meister",
  description: "Book a private tarot reading with Kali Meister. Choose a 60-minute or 90-minute online session for conversation and spiritual reflection.",
  alternates: { canonical: "/readings" },
  openGraph: { title: "Private Tarot Readings | Kali Meister", description: "Private online readings for thoughtful questions and spiritual reflection.", url: "/readings", type: "website" },
  twitter: { card: "summary_large_image", title: "Private Tarot Readings | Kali Meister", description: "Choose a private online reading with Kali Meister." },
};

export default function ReadingsPage() {
  return <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12"><header className="mb-14 max-w-3xl"><p className="mb-5 text-xs uppercase tracking-[.2em] text-primary">Private readings</p><h1 className="mb-7 font-serif text-5xl leading-tight sm:text-7xl">A reading with room for you.</h1><p className="text-xl leading-relaxed text-on-surface/70">Bring a question, a decision or a story you’re ready to explore. Kali’s private online readings offer space for tarot, conversation and spiritual reflection.</p></header>
    <BookingOfferings offerings={readingsOfferings} />
    <section className="mt-16 max-w-3xl"><h2 className="mb-5 font-serif text-3xl">What to expect</h2><p className="mb-5 leading-relaxed">Choose a 60-minute session for $250 or a 90-minute session for $450. Sessions take place online. Bring a specific question or an area of your life you’d like to reflect on.</p><p className="mb-5 leading-relaxed">Select an available time before checkout. After payment, your booking is confirmed and Cal.com sends your calendar invitation.</p><h2 className="mb-5 mt-10 font-serif text-3xl">Booking and rescheduling</h2><p className="leading-relaxed">Sessions require payment in advance and are non-refundable. If you need to reschedule, contact us at least 48 hours before your appointment.</p></section>
    <section className="mt-16 max-w-3xl"><h2 className="mb-10 font-serif text-3xl">Questions, answered</h2><div className="space-y-10"><div><h3 className="mb-3 font-serif text-2xl">What happens in a session?</h3><p className="leading-relaxed">A private conversation around the question you bring, with tarot to give it shape. You set the agenda — what we explore and how far we go. There is room to pause, think and change direction.</p></div><div><h3 className="mb-3 font-serif text-2xl">How should I prepare?</h3><p className="leading-relaxed">Bring a question, a decision or a situation you’d like to look at. Nothing else is required — no experience with tarot and no notes, unless you want them.</p></div><div><h3 className="mb-3 font-serif text-2xl">Are online readings as personal?</h3><p className="leading-relaxed">Sessions are live and one-to-one over video, with the same time and attention as sitting across a table. Many people find that being at home makes the conversation easier.</p></div><div><h3 className="mb-3 font-serif text-2xl">What if I need to reschedule?</h3><p className="leading-relaxed">Contact us at least 48 hours before your appointment and we’ll find a new time. Sessions are prepaid and non-refundable.</p></div></div></section>
    <p className="mt-16 max-w-3xl border-t border-current/15 pt-6 text-xs leading-relaxed text-on-surface/50">{"Tarot readings are offered for reflection and personal insight. They don't predict outcomes and aren't a substitute for medical, mental health, legal or financial advice."}</p>
  </div>;
}
