import { Metadata } from "next";
import BookingOfferings from "@/components/BookingOfferings";

export const metadata: Metadata = {
  title: "Psychological Tarot Readings | Shadow Work & Narrative Deep-Dive",
  description: "Book a private psychological tarot session for shadow work and self-discovery. 1:1 narrative deep-dives for professional seekers.",
  keywords: ["psychological tarot reading", "shadow work intensive", "narrative deep-dive", "tarot consultation", "self-reflection session"],
};

const offerings = [
  {
    id: "narrative-session",
    title: "The Narrative Deep-Dive",
    duration: "50 Minutes",
    price: "$250",
    description: "A comprehensive psychological exploration. We use the tarot archetypes to dismantle current life narratives and rebuild them with agency and insight.",
    features: [
      "In-depth psychological mapping",
      "Video recording of the session",
      "Post-session integration PDF",
      "Private follow-up messaging"
    ]
  },
  {
    id: "shadow-reading",
    title: "Shadow Work Intensive",
    duration: "90 Minutes",
    price: "$450",
    description: "Our most intensive offering. Specifically designed for those in transition, using Jungian concepts and tarot to uncover the hidden parts of the self.",
    features: [
      "Jungian shadow work focus",
      "Extended archetypal analysis",
      "Guided reflective exercises",
      "Priority scheduling"
    ]
  }
];

export default function ReadingsPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20 lg:mb-32">
          <span className="font-label text-xs uppercase tracking-[0.2em] text-tertiary mb-6 block">Offerings / High-Ticket Services</span>
          <h1 className="text-5xl md:text-7xl font-display mb-8 max-w-4xl leading-[1.1]">
            Archetypal Insight for the <br />
            <span className="text-primary italic">Professional Seeker</span>
          </h1>
          <p className="text-xl text-on-surface/60 max-w-2xl font-body leading-relaxed lg:text-2xl">
            These are not standard readings. They are 1:1 psychological consultations designed to shift your perspective and reveal the architecture of your subconscious.
          </p>
        </header>

        <BookingOfferings offerings={offerings} />

        <div className="mt-40 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        
        <section className="mt-40 max-w-3xl" aria-labelledby="philosophy-heading">
          <h2 id="philosophy-heading" className="text-4xl font-display mb-8 italic">The Philosophy of Process</h2>
          <div className="text-lg text-on-surface/60 font-body leading-relaxed space-y-6">
            <p>All sessions require pre-payment and are non-refundable. This ensures a commitment to the work and filters for those truly ready for psychological transformation.</p>
            <p>Once payment is secured via Stripe, you will receive a secure link to schedule your session via Cal.com.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
