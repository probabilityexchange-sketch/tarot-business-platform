import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FreeGuideForm } from "@/components/FreeGuideForm";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative isolate">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
            src="/images/courses-hero.svg"
          alt=""
          fill
          className="object-cover opacity-[0.03]"
          priority
          unoptimized
        />
        <svg
          className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-primary/10 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="pattern-grid"
              width={200}
              height={200}
              x="50%"
              y={-1}
              patternUnits="userSpaceOnUse"
            >
              <path d="M.5 200V.5H200" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" strokeWidth={0} fill="url(#pattern-grid)" />
        </svg>
      </div>

      {/* HERO SECTION */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-12 lg:py-40">
        <div className="max-w-4xl">
          <span className="inline-block font-label text-xs uppercase tracking-[0.2em] text-secondary mb-6 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
            40+ Years of Practice
          </span>
          <h1 className="text-5xl font-display tracking-tight text-on-surface sm:text-7xl lg:text-8xl mb-8 leading-[1.1]">
            Get Clarity on Your Life&apos;s <br />
            <span className="text-primary italic">Direction in 60 Minutes</span>
          </h1>
          <p className="max-w-2xl text-xl leading-relaxed text-on-surface/70 mb-10 font-body lg:text-2xl">
            Discover clarity, healing, and empowerment through tarot readings, spiritual counseling, and energy healing. B.A. Psychology, M.F.A. Creative Writing, 5,000+ readings given.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="#free-guide">
              <Button variant="secondary" size="lg" className="px-8 py-5 text-base">
                Get Free Intuition Guide
              </Button>
            </Link>
            <Link href="/readings">
              <Button variant="primary" size="lg" className="px-10 py-5 text-base">
                Book a Reading
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-on-surface/10">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-display text-primary">5,000+</span>
              <span className="text-sm text-on-surface/50 font-label uppercase tracking-wider">Readings</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-display text-primary">98%</span>
              <span className="text-sm text-on-surface/50 font-label uppercase tracking-wider">Satisfaction</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-display text-primary">40+</span>
              <span className="text-sm text-on-surface/50 font-label uppercase tracking-wider">Years</span>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BADGES / CREDENTIALS SECTION */}
      <section className="bg-surface-container-low px-6 py-16 sm:py-20 lg:px-12" aria-labelledby="credentials-heading">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <span className="text-sm font-label uppercase tracking-widest text-secondary mb-4 block">Credentials & Experience</span>
            <h2 id="credentials-heading" className="text-3xl font-display text-on-surface sm:text-4xl">Trusted by Seekers Worldwide</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { stat: "B.A.", label: "Psychology", sub: "University of Tennessee" },
              { stat: "M.F.A.", label: "Creative Writing", sub: "Goddard College" },
              { stat: "40+", label: "Years Practice", sub: "Since 1984" },
              { stat: "5,000+", label: "Readings Given", sub: "Satisfied Clients" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-display text-primary mb-2">{item.stat}</div>
                <div className="text-sm font-label uppercase tracking-wider text-on-surface mb-1">{item.label}</div>
                <div className="text-xs text-on-surface/40 font-label">{item.sub}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-12 pt-8 border-t border-on-surface/10">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface text-on-surface/50 text-xs font-label">
              <span className="text-secondary">✦</span> Reiki Master Certified
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface text-on-surface/50 text-xs font-label">
              <span className="text-secondary">✦</span> Jungian-trained
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface text-on-surface/50 text-xs font-label">
              <span className="text-secondary">✦</span> 98% Satisfaction Rate
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface text-on-surface/50 text-xs font-label">
              <span className="text-secondary">✦</span> Private & Confidential
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM / AGITATION SECTION */}
      <section className="bg-surface-container-low px-6 py-24 sm:py-32 lg:px-12" aria-labelledby="problems-heading">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <h2 id="problems-heading" className="text-sm font-label uppercase tracking-widest text-tertiary mb-4">Does This Sound Familiar?</h2>
            <p className="text-3xl font-display text-on-surface sm:text-4xl mb-12 leading-tight">
              Feeling stuck? Searching for meaning during a major life transition?
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Career Crossroads", desc: "Biggest decision of your life and no amount of LinkedIn stalking is helping." },
              { title: "Relationship Patterns", desc: "Same arguments, different year. Wondering why you keep attracting the same energy." },
              { title: "Spiritual Confusion", desc: "Drawn to tarot and spirituality but not sure what's real vs. wishful thinking." },
            ].map((item, i) => (
              <Card key={i} surface="high" className="p-8">
                <span className="text-3xl mb-4 block">✨</span>
                <h3 className="text-xl font-display italic mb-3 text-on-surface">{item.title}</h3>
                <p className="text-on-surface/60 leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AUTHORITY / ABOUT SECTION */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-12 lg:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
            <Image
              src="/images/kali-meister.jpg"
              alt="Kali Meister - Tarot Reader & Spiritual Healer"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface/60 to-transparent" />
          </div>
          <div>
            <span className="font-label text-xs uppercase tracking-[0.2em] text-secondary mb-4 block">About Kali</span>
            <h2 className="text-4xl font-display mb-6 text-on-surface sm:text-5xl leading-tight">
              Hi, I&apos;m Kali. I help people find <span className="text-primary italic"> clarity</span>.
            </h2>
            <div className="space-y-4 text-on-surface/70 font-body leading-relaxed text-lg">
              <p>
                With a B.A. in Psychology from University of Tennessee Knoxville and an M.F.A. in Creative Writing from Goddard College, I blend academic rigor with intuitive gift to offer something rare: readings that are both deeply spiritual and psychologically grounded.
              </p>
              <p>
                For over 40 years, I&apos;ve helped clients navigate career transitions, relationship challenges, grief, and spiritual awakening. My approach isn&apos;t about fortune-telling — it&apos;s about using tarot archetypes as mirrors for self-discovery.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 mt-8">
              <span className="px-4 py-2 rounded-full bg-surface-container text-on-surface/60 text-sm font-label">Master Tarot Reader</span>
              <span className="px-4 py-2 rounded-full bg-surface-container text-on-surface/60 text-sm font-label">Reiki Master</span>
              <span className="px-4 py-2 rounded-full bg-surface-container text-on-surface/60 text-sm font-label">Life Coach</span>
            </div>
          </div>
        </div>
      </section>

      {/* FREE GUIDE / LEAD MAGNET SECTION */}
      <section id="free-guide" className="bg-surface-container-low px-6 py-24 sm:py-32 lg:px-12 relative overflow-hidden" aria-labelledby="guide-heading">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48" />
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block font-label text-xs uppercase tracking-[0.2em] text-tertiary mb-4 px-3 py-1 rounded-full bg-tertiary/10 border border-tertiary/20">
                Free Guide
              </span>
              <h2 id="guide-heading" className="text-4xl font-display mb-6 text-on-surface sm:text-5xl leading-tight">
                Awaken Your <span className="text-primary italic">Intuition</span>
              </h2>
              <p className="text-xl text-on-surface/70 mb-8 font-body leading-relaxed">
                Download my exclusive PDF guide with 3 powerful steps to awaken your psychic abilities. Discover practical exercises to unlock your intuitive powers, plus exclusive spiritual wisdom delivered to your inbox.
              </p>
              <FreeGuideForm />
            </div>
            <div className="relative aspect-square rounded-2xl overflow-hidden hidden lg:block">
              <Image
                src="/images/guide-placeholder.svg"
                alt="Tarot cards with mystical lighting"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-12 lg:py-40" aria-labelledby="services-heading">
        <div className="mb-16">
          <span className="text-sm font-label uppercase tracking-widest text-secondary mb-4 block">Sacred Services</span>
          <h2 id="services-heading" className="text-4xl font-display text-on-surface sm:text-5xl">Choose Your Path</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Personal Tarot Reading",
              price: "From $250",
              desc: "Gain clarity and insight into your life's path with personalized tarot guidance. 50-minute deep-dive sessions.",
              features: ["Video recording included", "Post-session PDF", "Follow-up messaging"],
              cta: "Book Reading",
              href: "/readings"
            },
            {
              title: "Spiritual Healing",
              price: "From $350",
              desc: "Reiki energy healing to restore balance and promote spiritual wellness. In-person or virtual sessions.",
              features: ["Chakra balancing", "Energy cleansing", "Guided meditation"],
              cta: "Learn More",
              href: "/readings"
            },
            {
              title: "Psychic Life Coaching",
              price: "From $400",
              desc: "Intuitive guidance combined with practical coaching for life transformation and goal achievement.",
              features: ["Personalized roadmap", "Accountability", "Monthly packages"],
              cta: "Get Started",
              href: "/readings"
            }
          ].map((service, i) => (
            <Card key={i} surface="high" className="p-8 flex flex-col">
              <span className="font-label text-xs uppercase tracking-widest text-secondary mb-4">{String(i + 1).padStart(2, '0')} / Service</span>
              <h3 className="text-2xl font-display italic mb-2 text-on-surface">{service.title}</h3>
              <span className="text-lg font-display text-primary mb-4">{service.price}</span>
              <p className="text-on-surface/60 leading-relaxed mb-6 flex-1">{service.desc}</p>
              <ul className="space-y-2 mb-8">
                {service.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-on-surface/50">
                    <span className="text-secondary">✓</span> {feat}
                  </li>
                ))}
              </ul>
              <Link href={service.href}>
                <Button variant="primary" className="w-full">{service.cta}</Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="bg-surface-container-low px-6 py-24 sm:py-32 lg:px-12" aria-labelledby="testimonials-heading">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <span className="text-sm font-label uppercase tracking-widest text-secondary mb-4 block">Testimonials</span>
            <h2 id="testimonials-heading" className="text-4xl font-display text-on-surface sm:text-5xl">Souls Transformed</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Maria R.", role: "Client since 2019", quote: "Kali's readings have been incredibly accurate and life-changing. Her gentle wisdom helped me navigate through my divorce and find my true purpose.", stars: 5 },
              { name: "James T.", role: "Business Owner", quote: "The spiritual coaching sessions gave me the clarity I needed to make major business decisions. Kali's intuitive insights are remarkable.", stars: 5 },
              { name: "Sarah M.", role: "Therapist", quote: "As a mental health professional, I'm skeptical of psychics. Kali is different — she combines real psychological insight with spiritual wisdom. Highly recommend.", stars: 5 },
            ].map((t, i) => (
              <Card key={i} surface="high" className="p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.stars)].map((_, j) => (
                    <span key={j} className="text-primary">★</span>
                  ))}
                </div>
                <p className="text-on-surface/70 leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div>
                  <p className="font-display text-on-surface">{t.name}</p>
                  <p className="text-sm text-on-surface/40 font-label">{t.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-12 lg:py-40 text-center">
        <h2 className="text-4xl font-display mb-6 text-on-surface sm:text-6xl leading-tight">
          Ready for Your <span className="text-primary italic">Spiritual Journey</span>?
        </h2>
        <p className="text-xl text-on-surface/60 max-w-2xl mx-auto mb-10 font-body leading-relaxed">
          Connect with Kali for personalized guidance. Whether you need clarity, healing, or transformation — your path starts with a single conversation.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="#free-guide">
            <Button variant="secondary" size="lg" className="px-8">Get Free Guide</Button>
          </Link>
          <Link href="/readings">
            <Button variant="primary" size="lg" className="px-10">Book a Reading</Button>
          </Link>
        </div>
        <p className="text-on-surface/40 mt-8 font-label text-sm">✉️ kali@kalimeister.com</p>
      </section>

      <div className="ritual-progress w-full" />
    </div>
  );
}
