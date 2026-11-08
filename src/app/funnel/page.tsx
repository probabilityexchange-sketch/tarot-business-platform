import type { Metadata } from "next";
import Link from "next/link";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";

const description =
  "A free three-part guide to discernment from Kali Meister. Explore fear, ego and intuition with writing prompts, a welcome letter and short weekly reflections.";

export const metadata: Metadata = {
  title: "Free Guide to Discernment | Kali Meister",
  description,
  robots: { index: false, follow: true },
  alternates: { canonical: "/funnel" },
  openGraph: {
    title: "Free Guide to Discernment | Kali Meister",
    description,
    url: "https://kalimeister.com/funnel",
    type: "website",
    locale: "en_US",
    siteName: "Kali Meister",
    images: [
      {
        url: "https://kalimeister.com/images/kali-meister.jpg",
        width: 1200,
        height: 630,
        alt: "Kali Meister",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Guide to Discernment | Kali Meister",
    description,
    images: ["https://kalimeister.com/images/kali-meister.jpg"],
  },
};

const guidePoints = [
  "Three short parts, one at a time",
  "Writing prompts you can use the same day",
  "A welcome letter, then short weekly reflections",
  "No cost. Unsubscribe anytime.",
];

const steps = [
  {
    step: "01",
    title: "Enter your email",
    desc: "Add your email address above. No cost, no card — just your inbox.",
  },
  {
    step: "02",
    title: "Check your inbox",
    desc: "Your guide and welcome letter arrive by email. If a confirmation email appears, click the link inside.",
  },
  {
    step: "03",
    title: "The guide arrives in three parts",
    desc: "One part at a time, followed by a welcome letter and short weekly reflections.",
  },
];

export default function FunnelPage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] text-[#302731]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#302731]/15 bg-[#f5f0e8]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-12">
          <Link href="/" className="font-serif text-2xl tracking-tight">
            Kali Meister
          </Link>
          <Link
            href="/readings"
            className="rounded-full bg-[#653c56] px-5 py-2.5 text-sm text-white transition-opacity hover:opacity-90"
          >
            Book a Reading
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.1fr_.9fr] lg:gap-20 lg:px-12 lg:py-24">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[.22em] text-[#744b65]">Free guide</p>
            <h1 className="font-serif text-5xl leading-[1.08] tracking-tight sm:text-6xl">
              A strong feeling.
              <br />
              <span className="italic text-[#744b65]">A thoughtful next step.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#655b61]">
              Is it fear, ego, desire — or intuition? The free guide to discernment gives the
              question a little room on the page. Three parts on fear, ego and intuition, followed
              by a welcome letter and short weekly reflections from Kali.
            </p>
            <ul className="mt-9 space-y-3">
              {guidePoints.map((point) => (
                <li key={point} className="flex items-baseline gap-3 text-[#655b61]">
                  <span aria-hidden="true" className="text-[#744b65]">
                    —
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <aside className="self-start rounded-2xl border border-[#744b65]/20 bg-[#fcf9f4] p-7 sm:p-9">
            <h2 className="mb-4 font-serif text-3xl">Begin with the free guide.</h2>
            <p className="mb-7 text-sm leading-relaxed text-[#655b61]">
              Enter your email and confirm your signup. The guide arrives in three parts, one at a
              time.
            </p>
            <LeadCaptureForm source="funnel" />
            <p className="mt-5 text-xs leading-relaxed text-[#655b61]">
              You can unsubscribe using the link in any email.
            </p>
          </aside>
        </section>

        {/* How it works */}
        <section className="border-t border-[#302731]/15 bg-[#efe5d6]/40 px-6 py-16 lg:px-12 lg:py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center font-serif text-4xl italic text-[#744b65]">
              How it works
            </h2>
            <div className="grid gap-10 md:grid-cols-3">
              {steps.map((item) => (
                <div key={item.step} className="text-center">
                  <div className="mb-4 font-serif text-5xl text-[#744b65]/40">{item.step}</div>
                  <h3 className="mb-2 font-serif text-2xl">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-[#655b61]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upsell strip */}
        <section className="mx-auto max-w-6xl px-6 py-16 text-center lg:px-12 lg:py-20">
          <h2 className="mb-4 font-serif text-4xl italic">Ready for a full reading?</h2>
          <p className="mx-auto mb-8 max-w-xl leading-relaxed text-[#655b61]">
            The guide is a beginning. When you want more room, book a private online reading — 60 or
            90 minutes of tarot and conversation around the question you bring.
          </p>
          <Link
            href="/readings"
            className="inline-block rounded-full bg-[#653c56] px-8 py-4 text-sm text-white transition-opacity hover:opacity-90"
          >
            Book a Reading — From $250
          </Link>
          <p className="mx-auto mt-8 max-w-xl text-xs leading-relaxed text-[#655b61]">
            {
              "Tarot readings are offered for reflection and personal insight. They don't predict outcomes and aren't a substitute for medical, mental health, legal or financial advice."
            }
          </p>
        </section>
      </main>

      {/* Minimal footer */}
      <footer className="border-t border-[#302731]/15 px-6 py-10 text-center">
        <p className="text-xs text-[#655b61]">
          © {new Date().getFullYear()} Kali Meister ·{" "}
          <Link href="/readings" className="underline underline-offset-4 hover:text-[#744b65]">
            Book a Reading
          </Link>{" "}
          ·{" "}
          <Link href="/contact" className="underline underline-offset-4 hover:text-[#744b65]">
            Contact
          </Link>
        </p>
      </footer>
    </div>
  );
}
