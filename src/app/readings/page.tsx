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
  </div>;
}
