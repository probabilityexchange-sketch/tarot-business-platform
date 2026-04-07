import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "The Psychological Tarot Method | Professional Certification Course",
  description: "Join our 8-week certification for therapists, writers, and seekers. Master the art of psychological tarot and narrative therapy.",
  keywords: ["psychological tarot course", "tarot certification", "archetypal psychology course", "narrative therapy training", "shadow work education"],
};

export default function CoursePage() {
  const modules = [
    {
      id: "01",
      title: "The Architecture of Archetypes",
      description: "Understanding the collective unconscious and how it manifests through the 22 Major Arcana."
    },
    {
      id: "02",
      title: "The Narrative Mirror",
      description: "Technical skills for using tarot as a prompt for deep psychological self-reflection and story-breaking."
    },
    {
      id: "03",
      title: "Shadow & Light",
      description: "Integrating Jungian concepts to identify and dismantle internal resistance using the Minor Arcana."
    },
    {
      id: "04",
      title: "The Professional Alchemist",
      description: "How to facilitate psychological tarot sessions for others with ethics and therapeutic boundaries."
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Sales Header */}
        <header className="mb-24 lg:mb-40">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-end">
            <div>
              <span className="font-label text-xs uppercase tracking-[0.2em] text-tertiary mb-6 block">Education / Deep Mastery</span>
              <h1 className="text-6xl md:text-8xl font-display leading-[0.9] mb-12 -ml-1">
                The <span className="text-primary italic">Psychological</span> <br />
                Tarot Method
              </h1>
              <p className="text-2xl text-on-surface/70 max-w-3xl font-body leading-relaxed lg:text-3xl">
                A comprehensive, 8-week certification for therapists, writers, and deep seekers. 
                Moving beyond fortune-telling into the realm of radical self-agency.
              </p>
            </div>
            <Card surface="high" className="relative overflow-hidden min-h-[24rem] border-none">
              <Image
                src="/images/courses-hero.svg"
                alt="Abstract course hero illustration"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </Card>
          </div>
        </header>

        {/* Curriculum Grid */}
        <section className="mb-40" aria-labelledby="curriculum-heading">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
            <div className="md:sticky md:top-40 h-fit">
              <h2 id="curriculum-heading" className="text-4xl lg:text-5xl font-display italic mb-8">The Curriculum</h2>
              <p className="text-on-surface/50 font-label uppercase tracking-widest text-sm max-w-xs leading-loose">
                A structured journey from theory to professional practice.
              </p>
            </div>
            <div className="space-y-12 lg:space-y-20">
              {modules.map((module) => (
                <div key={module.id} className="group border-b border-on-surface/5 pb-12 transition-all hover:border-primary/20">
                  <span className="font-label text-xs text-secondary mb-4 block tracking-widest">{module.id}</span>
                  <h3 className="text-3xl font-display mb-4 italic group-hover:text-primary transition-colors duration-300">{module.title}</h3>
                  <p className="text-on-surface/60 font-body leading-relaxed text-lg">{module.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Waitlist / CTA */}
        <section className="bg-surface-container-low p-8 lg:p-24 rounded-2xl relative overflow-hidden transition-all duration-500 hover:shadow-2xl" aria-labelledby="waitlist-heading">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48" />
          
          <div className="max-w-3xl relative z-10">
            <h2 id="waitlist-heading" className="text-4xl md:text-5xl font-display italic mb-8 leading-tight">
              Join the Autumn Cohort <br />
              <span className="text-primary italic">Waitlist</span>
            </h2>
            <p className="text-xl text-on-surface/70 mb-12 font-body leading-relaxed">
              We only accept 15 students per cohort to ensure deep integration and 1:1 supervision. 
              The next cycle begins October 2026.
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="YOUR_EMAIL@VOICE.COM"
                className="bg-surface-container-highest border-none p-4 rounded-full flex-grow font-label text-sm uppercase tracking-widest focus:ring-1 focus:ring-secondary/40 transition-all outline-none"
              />
              <Button variant="primary" className="px-12 whitespace-nowrap py-4">
                Join Waitlist
              </Button>
            </form>
          </div>
        </section>

        <div className="mt-40 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>
    </div>
  );
}
