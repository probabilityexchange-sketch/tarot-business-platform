import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Kali Meister | Intuitive Reader & Spiritual Counselor",
  description:
    "Kali Meister is a Tennessee-based intuitive reader with 40+ years of experience in tarot, Lenormand, astrology, and channeling. Serving high-achievers and spiritual seekers worldwide.",
  openGraph: {
    title: "About Kali Meister | Intuitive Reader & Spiritual Counselor",
    description:
      "Kali Meister is a Tennessee-based intuitive reader with 40+ years of experience in tarot, Lenormand, astrology, and channeling.",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-surface-container-low py-24 px-6 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 blur-[100px] rounded-full -ml-32 -mb-32" />
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-block font-label text-xs uppercase tracking-[0.2em] text-secondary mb-6 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
            About
          </span>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-on-surface mb-6 leading-tight">
            About{" "}
            <span className="text-primary italic">Kali Meister</span>
          </h1>
          <p className="text-xl md:text-2xl text-on-surface/60 font-body max-w-2xl mx-auto">
            Intuitive Reader, Channel & Spiritual Counselor
          </p>
        </div>
      </section>

      {/* Bio */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Image column */}
          <div className="relative">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
              <img
                src="/images/kali-meister.jpg"
                alt="Kali Meister - Tarot Reader & Spiritual Healer"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface/40 to-transparent" />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="px-4 py-2 rounded-full bg-surface-container text-secondary text-sm font-label">
                40+ Years Practice
              </span>
              <span className="px-4 py-2 rounded-full bg-surface-container text-secondary text-sm font-label">
                B.A. Psychology
              </span>
              <span className="px-4 py-2 rounded-full bg-surface-container text-secondary text-sm font-label">
                M.F.A. Creative Writing
              </span>
            </div>
          </div>

          {/* Text column */}
          <div className="space-y-6 lg:pt-8">
            <h2 className="font-display text-3xl md:text-4xl text-on-surface">
              Hi, I&apos;m Kali.
            </h2>
            <p className="text-lg text-on-surface/70 leading-relaxed font-body">
              I&apos;m a Tennessee-based intuitive reader with over four decades of
              practice in tarot, Lenormand, astrology, and channeling. My work
              sits at the intersection of deep spiritual wisdom and practical
              psychological insight — a rare blend that helps clients see their
              lives with startling clarity.
            </p>
            <p className="text-lg text-on-surface/70 leading-relaxed font-body">
              My credentials include a B.A. in Psychology from the University of
              Tennessee Knoxville and an M.F.A. in Creative Writing from Goddard
              College. I&apos;ve been a hospice counselor, a university instructor in
              writing and mythology, and a practicing channel for spirit guides
              and deceased loved ones since 2008.
            </p>

            {/* Highlight box */}
            <div className="border-l-4 border-primary bg-surface-container-low p-6 rounded-r-lg">
              <p className="text-lg text-primary italic font-display leading-relaxed">
                &ldquo;Tarot is not about predicting the future — it&apos;s about
                illuminating the present. Every card is a mirror. When you see
                yourself clearly, you can choose differently.&rdquo;
              </p>
            </div>

            <p className="text-lg text-on-surface/70 leading-relaxed font-body">
              I serve high-achievers, entrepreneurs, and spiritual seekers from
              all walks of life — people who are tired of surface-level advice
              and ready to do the deep work. Whether we&apos;re navigating a career
              crossroads, healing from grief, or exploring spiritual gifts, my
              role is to hold space and offer guidance that is both psychologically
              grounded and spiritually authentic.
            </p>

            <h3 className="font-display text-2xl text-on-surface pt-4">
              Disciplines & Training
            </h3>
            <div className="flex flex-wrap gap-3">
              {[
                "Tarot (40+ years)",
                "Lenormand",
                "Astrology",
                "Channeling",
                "Oracle Cards",
                "Reiki Master",
                "Hospice Counseling",
                "Jungian Mythology",
              ].map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 rounded-full bg-surface text-on-surface/70 text-sm font-label"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quote CTA */}
      <section className="bg-surface-container-low px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-display text-2xl md:text-3xl text-on-surface italic mb-8 leading-snug">
            &ldquo;Most people come to me when they&apos;ve exhausted every other
            option. That&apos;s exactly when they&apos;re ready.&rdquo;
          </p>
          <Link
            href="/readings"
            className="inline-flex items-center justify-center rounded-[0.5rem] font-label uppercase tracking-[0.05em] bg-primary text-[#21005d] hover:bg-primary/90 px-10 py-5 text-base transition-opacity"
          >
            Book a Reading
          </Link>
        </div>
      </section>

      {/* Footer nav */}
      <section className="py-16 px-6 text-center border-t border-outline-variant/10">
        <Link
          href="/contact"
          className="text-secondary hover:text-primary transition-colors font-label text-sm uppercase tracking-widest"
        >
          Questions? Get in Touch &rarr;
        </Link>
      </section>
    </main>
  );
}
