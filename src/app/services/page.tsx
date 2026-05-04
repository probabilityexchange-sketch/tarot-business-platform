import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services | Kali Meister — Tarot, Lenormand, Astrology & More",
  description:
    "Explore KaliMeister's full range of intuitive services: tarot readings, Lenormand, astrology, channeling, oracle cards, and spiritual counseling for high-achievers.",
  openGraph: {
    title: "Services | Kali Meister — Intuitive Services",
    description:
      "Elite intuitive services: tarot, Lenormand, astrology, channeling, oracle, and spiritual counseling for high-achievers.",
    type: "website",
  },
};

const services = [
  {
    id: "tarot",
    name: "Personal Tarot Reading",
    price: "From $250",
    duration: "60 min",
    description:
      "A deep-dive session using the Rider-Waite-Smith tarot deck. We explore your question, identify patterns, and find clarity on your path forward. Includes video recording and post-session PDF.",
    features: [
      "Video recording included",
      "Post-session PDF summary",
      "Follow-up messaging (48 hrs)",
    ],
    highlight: "Most popular",
  },
  {
    id: "lenormand",
    name: "Lenormand Reading",
    price: "From $200",
    duration: "45 min",
    description:
      "Precise, grounded, and highly practical. The 36-card Lenormand deck offers a different kind of clarity than tarot — more concrete, more everyday, surprisingly accurate for relationships and timing questions.",
    features: [
      "Grand Tableau analysis",
      "Timing indicators",
      "Detailed PDF report",
    ],
    highlight: null,
  },
  {
    id: "astrology",
    name: "Astrology Reading",
    price: "From $250",
    duration: "75 min",
    description:
      "A full exploration of your birth chart — planets, houses, aspects, and transits. Ideal for those who want to understand their cosmic blueprint and how current skies are affecting them.",
    features: [
      "Birth chart interpretation",
      "Current transit analysis",
      "Recorded session",
    ],
    highlight: null,
  },
  {
    id: "channeling",
    name: "Spirit Channeling Session",
    price: "From $400",
    duration: "60 min",
    description:
      "Direct communication with spirit guides, passed loved ones, or higher self. Kali acts as conduit, delivering messages with compassion and precision. For those ready for direct spiritual contact.",
    features: [
      "Guide communication",
      "Loved one connections",
      "Channeled readings",
    ],
    highlight: "Advanced",
  },
  {
    id: "oracle",
    name: "Oracle Card Reading",
    price: "From $150",
    duration: "45 min",
    description:
      "A lighter, often faster form of guidance using oracle decks. Perfect for quick pivots, small decisions, or those new to card readings. Still deep, still insightful — just more accessible.",
    features: [
      "Multi-deck spreads",
      "Intuitive message delivery",
      "Actionable guidance",
    ],
    highlight: null,
  },
  {
    id: "spiritual-counseling",
    name: "Spiritual Counseling",
    price: "From $300",
    duration: "60 min",
    description:
      "Not a reading — a conversation. For those processing spiritual experiences, navigating psychic sensitivity, or seeking guidance on their spiritual path without the card interface.",
    features: [
      "Energy clearing",
      "Psychic protection",
      "Personalized guidance",
    ],
    highlight: null,
  },
];

export default function ServicesPage() {
  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-surface-container-low py-24 px-6 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-[max(50%,25rem)] h-[64rem] w-[128rem] -translate-x-1/2 stroke-primary/10 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]">
            <svg className="[mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]" aria-hidden="true">
              <defs>
                <pattern id="grid" width="200" height="200" x="50%" y="-1" patternUnits="userSpaceOnUse">
                  <path d="M.5 200V.5H200" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" strokeWidth="0" fill="url(#grid)" />
            </svg>
          </div>
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-block font-label text-xs uppercase tracking-[0.2em] text-secondary mb-6 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
            Services
          </span>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-on-surface mb-6 leading-tight">
            Choose Your{" "}
            <span className="text-primary italic">Path</span>
          </h1>
          <p className="text-xl text-on-surface/60 font-body max-w-2xl mx-auto">
            Each service is tailored to your question, your energy, and your
            pace. All sessions include a recording.
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="rounded-xl bg-surface-container-high p-8 flex flex-col hover:bg-surface-container-highest transition-colors duration-250"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="font-label text-xs uppercase tracking-widest text-secondary">
                  {String(index + 1).padStart(2, "0")} / Service
                </span>
                {service.highlight && (
                  <span className="text-xs font-label uppercase tracking-wider text-tertiary px-3 py-1 rounded-full bg-tertiary/10 border border-tertiary/20">
                    {service.highlight}
                  </span>
                )}
              </div>
              <h2 className="font-display text-2xl italic text-on-surface mb-2">
                {service.name}
              </h2>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-display text-xl text-primary">
                  {service.price}
                </span>
                <span className="text-sm text-on-surface/40 font-label">
                  {service.duration}
                </span>
              </div>
              <p className="text-on-surface/60 leading-relaxed font-body text-sm flex-1 mb-6">
                {service.description}
              </p>
              <ul className="space-y-2 mb-8">
                {service.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-on-surface/50">
                    <span className="text-secondary">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/readings"
                className="mt-auto inline-flex items-center justify-center rounded-[0.5rem] font-label uppercase tracking-[0.05em] bg-primary text-[#21005d] hover:bg-primary/90 px-6 py-3 text-sm w-full transition-opacity"
              >
                Book Now
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison note */}
      <section className="bg-surface-container-low px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h3 className="font-display text-2xl text-on-surface mb-4">
            Not sure which service is right for you?
          </h3>
          <p className="text-on-surface/60 font-body mb-6">
            Most new clients start with a Personal Tarot Reading. If you have a
            specific question — timing, relationships, career — a Lenormand
            reading may be more precise. Reach out and we&apos;ll figure it out
            together.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-[0.5rem] font-label uppercase tracking-[0.05em] border border-secondary/30 text-secondary hover:bg-secondary/10 px-8 py-4 text-sm transition-colors"
          >
            Ask Before You Book
          </Link>
        </div>
      </section>

      {/* Footer nav */}
      <section className="py-16 px-6 text-center border-t border-outline-variant/10">
        <Link
          href="/about"
          className="text-secondary hover:text-primary transition-colors font-label text-sm uppercase tracking-widest"
        >
          Learn More About Kali &rarr;
        </Link>
      </section>
    </main>
  );
}
