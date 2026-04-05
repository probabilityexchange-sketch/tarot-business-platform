import { Metadata } from "next";
import Image from "next/image";
import BookingOfferings from "@/components/BookingOfferings";
import { Card } from "@/components/ui/card";
import { readingsOfferings } from "@/lib/offerings";

export const metadata: Metadata = {
  title: "Psychological Tarot Readings | Shadow Work & Narrative Deep-Dive",
  description: "Book a private psychological tarot session for shadow work and self-discovery. 1:1 narrative deep-dives for professional seekers.",
  keywords: ["psychological tarot reading", "shadow work intensive", "narrative deep-dive", "tarot consultation", "self-reflection session"],
};

export default function ReadingsPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20 lg:mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-end">
            <div>
              <span className="font-label text-xs uppercase tracking-[0.2em] text-tertiary mb-6 block">Offerings / High-Ticket Services</span>
              <h1 className="text-5xl md:text-7xl font-display mb-8 max-w-4xl leading-[1.1]">
                Archetypal Insight for the <br />
                <span className="text-primary italic">Professional Seeker</span>
              </h1>
              <p className="text-xl text-on-surface/60 max-w-2xl font-body leading-relaxed lg:text-2xl">
                These are not standard readings. They are 1:1 psychological consultations designed to shift your perspective and reveal the architecture of your subconscious.
              </p>
            </div>
            <Card surface="high" className="relative overflow-hidden min-h-[22rem] border-none">
              <Image
                src="/images/readings-placeholder.svg"
                alt="Abstract tarot-inspired reading composition"
                fill
                className="object-cover"
                priority
              />
            </Card>
          </div>
        </header>

        <BookingOfferings offerings={readingsOfferings} />

        <div className="mt-40 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        
        {/* WHAT TO EXPECT SECTION */}
        <section className="mt-40 max-w-4xl" aria-labelledby="expect-heading">
          <h2 id="expect-heading" className="text-4xl font-display mb-8 italic">What to Expect</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-xl font-display text-on-surface mb-4">The Session Experience</h3>
              <p className="text-on-surface/60 font-body leading-relaxed">
                Your session is a sacred space for exploration. Using tarot archetypes as mirrors, we&apos;ll examine patterns in your life, unpack hidden beliefs, and illuminate paths forward. Sessions are conducted via video call and recorded for your review.
              </p>
              <p className="text-on-surface/60 font-body leading-relaxed">
                You&apos;ll receive a link to schedule immediately after payment. Choose any available time that works for you. Come with an open heart and a question or area of focus — though sometimes the most profound insights come when we don&apos;t know what we&apos;re looking for.
              </p>
            </div>
            <div className="space-y-6">
              <h3 className="text-xl font-display text-on-surface mb-4">After Your Session</h3>
              <div className="space-y-4">
                {[
                  { step: "1", text: "Within 24 hours, you'll receive a professional video recording of your session" },
                  { step: "2", text: "A detailed PDF integration guide with key takeaways and reflective exercises" },
                  { step: "3", text: "Access to private follow-up messaging for questions that arise after your reading" },
                  { step: "4", text: "Priority scheduling for future sessions if you wish to continue the work" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-label flex items-center justify-center flex-shrink-0 mt-0.5">{item.step}</span>
                    <p className="text-on-surface/60 font-body text-sm leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-12 p-8 rounded-2xl bg-surface-container border border-outline/10">
            <h3 className="text-xl font-display text-on-surface mb-4">How Payment Works</h3>
            <p className="text-on-surface/60 font-body leading-relaxed mb-4">
              All sessions require pre-payment via Stripe — this secures your time and ensures commitment to the work. Payments are processed securely through our Stripe-powered checkout.
            </p>
            <p className="text-on-surface/60 font-body leading-relaxed">
              <strong className="text-on-surface">Please note:</strong> Sessions are non-refundable. This is not a policy of convenience but a reflection of the preparation and energetic commitment involved. If you need to reschedule, please contact us at least 48 hours in advance.
            </p>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="mt-40 max-w-3xl" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-4xl font-display mb-12 italic">Common Questions</h2>
          <div className="space-y-8">
            {[
              {
                q: "I'm skeptical about tarot. Will this work for me?",
                a: "Skepticism is welcome. My approach is psychological rather than mystical — I use tarot archetypes as tools for self-reflection, not fortune-telling. Many of my most transformative sessions have been with skeptics who came with open minds."
              },
              {
                q: "What if the reading is wrong or doesn't resonate?",
                a: "Tarot doesn't predict the future — it reflects current patterns and potential paths. If something doesn't resonate, that's valuable information too. The goal is insight, not accuracy in the way weather forecasting is accurate."
              },
              {
                q: "What should I ask about in my reading?",
                a: "Bring whatever is alive for you — a decision you're facing, a relationship that feels stuck, a transition you're navigating. If you don't have a specific question, we can explore whatever emerges. Some of the most powerful sessions have no agenda going in."
              },
              {
                q: "How is this different from therapy?",
                a: "I'm not a therapist and this is not therapy. However, my background in psychology informs my approach. Think of it as spiritual exploration with psychological depth — we work with archetypes, narratives, and the unconscious rather than clinical frameworks."
              },
              {
                q: "Can you tell me about love/money/my future?",
                a: "I don't do fortune-telling. I won't predict whether you'll meet someone or win the lottery. What I can do is help you understand the patterns and beliefs that may be influencing your relationship with love, money, or any area of life — and help you shift them."
              },
              {
                q: "What if I need to cancel or reschedule?",
                a: "Contact at least 48 hours before your session for rescheduling. Cancellations within 48 hours cannot be refunded, as this time has been reserved for you. Emergency situations are handled case-by-case — reach out if something urgent comes up."
              },
            ].map((faq, i) => (
              <div key={i} className="border-b border-outline/10 pb-8">
                <h3 className="text-lg font-display text-on-surface mb-3">{faq.q}</h3>
                <p className="text-on-surface/60 font-body leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PHILOSOPHY SECTION */}
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
