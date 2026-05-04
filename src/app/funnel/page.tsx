import { Metadata } from "next";
import Link from "next/link";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";

export const metadata: Metadata = {
  title: "Free Mini Reading | Kali Meister",
  description: "Receive a personalized 3-card mini reading delivered in Kali's voice. Enter your email and discover what the cards have to say about you today.",
};

export default function FunnelPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-outline-variant/15">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex justify-between items-center">
          <Link href="/" className="font-label text-lg tracking-[0.05em] uppercase text-primary hover:text-secondary transition-colors duration-250 ease-snappy">
            Kali Meister
          </Link>
          <Link href="/readings">
            <button className="bg-primary text-[#21005d] px-6 py-2.5 rounded-full text-xs font-label uppercase tracking-widest hover:bg-primary/90 transition-opacity">
              Book Now
            </button>
          </Link>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero */}
        <section className="relative isolate overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
            <div className="absolute top-[40%] right-[-10%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px]" />
          </div>

          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left: Copy */}
              <div>
                <span className="inline-block font-label text-xs uppercase tracking-[0.2em] text-secondary mb-6 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
                  Limited Free Reading
                </span>
                <h1 className="text-5xl md:text-7xl font-display tracking-tight text-on-surface mb-6 leading-[1.1]">
                  What Do the Cards
                  <br />
                  <span className="text-primary italic">Have to Say About You?</span>
                </h1>
                <p className="text-xl text-on-surface/60 font-body leading-relaxed mb-4">
                  Receive a personalized 3-card mini reading — delivered as an audio message in Kali&apos;s voice.
                </p>
                <p className="text-lg text-on-surface/40 font-body leading-relaxed mb-8">
                  No fluff, no generic horoscopes. Pull three cards and get real insight into what&apos;s unfolding in your life right now.
                </p>

                {/* Bullets */}
                <ul className="space-y-3 mb-10">
                  {[
                    "3-card spread: Past, Present, Guidance",
                    "Recorded in Kali's voice — your own personal mini session",
                    "Instant delivery to your inbox",
                    "No commitment. No credit card. Just insight.",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-on-surface/60 font-body">
                      <span className="text-secondary">✦</span>
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Form */}
                <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-8">
                  <LeadCaptureForm source="funnel" />
                </div>
              </div>

              {/* Right: Visual */}
              <div className="relative hidden lg:block">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-container via-surface-container-high to-surface-container-low" />
                  {/* Tarot card visual — abstract gradient */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-48 h-72 rounded-xl bg-gradient-to-br from-primary/20 via-secondary/10 to-tertiary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_60px_rgba(208,188,255,0.1)]">
                      <div className="text-center">
                        <div className="text-6xl mb-4">🔮</div>
                        <div className="font-display italic text-primary text-lg">Your Reading Awaits</div>
                      </div>
                      {/* Floating card decorations */}
                      <div className="absolute -top-4 -right-4 w-20 h-28 rounded-lg bg-surface-container-high border border-primary/20 rotate-12 opacity-60" />
                      <div className="absolute -bottom-4 -left-4 w-20 h-28 rounded-lg bg-surface-container-high border border-secondary/20 -rotate-6 opacity-40" />
                    </div>
                  </div>
                  {/* Glow */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(208,188,255,0.08)_0%,transparent_70%)]" />
                </div>

                {/* Social proof badge */}
                <div className="absolute -bottom-6 -left-6 bg-surface-container-high border border-outline-variant/20 rounded-xl px-5 py-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {["Maria R.", "James T.", "Sarah M."].map((name, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-primary/20 border-2 border-surface-container-high flex items-center justify-center">
                          <span className="text-[10px] font-label text-primary">{name[0]}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-sm font-label text-on-surface">5,000+ readings given</div>
                      <div className="text-xs text-on-surface/40">Trusted worldwide</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-surface-container-low px-6 py-20 lg:px-12 border-t border-outline-variant/10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display text-on-surface mb-12 text-center italic">
              How Your Free Reading Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Enter Your Email",
                  desc: "Submit your email above. Takes 3 seconds. No spam, ever.",
                },
                {
                  step: "02",
                  title: "Receive Your Reading",
                  desc: "Within minutes, you'll get an audio mini reading in Kali's voice — a 3-card spread for your question or situation.",
                },
                {
                  step: "03",
                  title: "Go Deeper",
                  desc: "If you feel the spark, book a full 60-minute session for complete clarity on your path.",
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="font-display text-5xl text-primary/30 mb-4">{item.step}</div>
                  <h3 className="font-display italic text-xl text-on-surface mb-2">{item.title}</h3>
                  <p className="text-on-surface/50 font-body text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upsell strip */}
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-12 text-center">
          <h2 className="text-3xl md:text-4xl font-display text-on-surface mb-4 italic">
            Ready for a Full Reading?
          </h2>
          <p className="text-on-surface/50 font-body mb-8 max-w-xl mx-auto">
            Your mini reading is just the beginning. Book a 60-minute session for a complete 9-card deep dive into whatever is asking for your attention.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/readings">
              <button className="bg-primary text-[#21005d] px-8 py-4 rounded-full text-sm font-label uppercase tracking-widest hover:bg-primary/90 transition-opacity">
                Book a Full Reading — From $250
              </button>
            </Link>
            <Link href="/">
              <button className="glass border border-secondary/30 text-secondary px-8 py-4 rounded-full text-sm font-label uppercase tracking-widest hover:bg-secondary/10 transition-all">
                Back to Home
              </button>
            </Link>
          </div>
        </section>

        {/* Ritual progress bar */}
        <div className="ritual-progress w-full" />
      </main>

      {/* Minimal footer */}
      <footer className="py-10 px-6 text-center border-t border-outline-variant/10">
        <p className="text-on-surface/30 text-xs font-label">
          © {new Date().getFullYear()} Kali Meister ·{" "}
          <Link href="/readings" className="hover:text-secondary">Book a Reading</Link> ·{" "}
          <Link href="/contact" className="hover:text-secondary">Contact</Link>
        </p>
      </footer>
    </div>
  );
}
