import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative isolate">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1572025442646-866d16c84a54?auto=format&fit=crop&q=80&w=2000"
          alt="Atmospheric textured background"
          fill
          className="object-cover opacity-[0.03] grayscale"
          priority
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

      <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-12 lg:py-40">
        <div className="max-w-4xl">
          <h1 className="text-5xl font-display tracking-tight text-on-surface sm:text-7xl lg:text-8xl mb-10 leading-[1.1]">
            Psychological Tarot for <br />
            <span className="text-primary italic">Shadow Work & Narrative Therapy</span>
          </h1>
          <p className="max-w-2xl text-xl leading-relaxed text-on-surface/70 mb-12 font-body lg:text-2xl">
            Transform your internal dialogue through the intersection of narrative therapy and tarot archetypes. 
            Gifted insight meets professional psychological frameworks to help you 
            uncover the hidden narratives of your life and master the art of self-reflection.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/readings">
              <Button variant="primary" size="lg" className="px-10 py-6 text-lg transition-all duration-250 ease-snappy hover:scale-[1.02]" aria-label="Book a reading session">
                Book a Reading
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="tertiary" size="lg" className="text-lg" aria-label="Learn about the method">
                Discover the Method
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <section className="bg-surface-container-low px-6 py-24 sm:py-32 lg:px-12" aria-labelledby="services-heading">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16">
            <h2 id="services-heading" className="text-sm font-label uppercase tracking-widest text-primary mb-4">Core Offerings</h2>
            <p className="text-3xl font-display text-on-surface sm:text-4xl">Deepen your self-reflection journey.</p>
          </div>
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/readings">
              <Card surface="high" className="group flex flex-col overflow-hidden p-0 h-full transition-all duration-250 ease-snappy hover:surface-highest">
                <div className="relative h-52 w-full grayscale group-hover:grayscale-0 transition-all duration-500">
                  <Image 
                    src="https://images.unsplash.com/photo-1601314167099-232775b3d6fd?auto=format&fit=crop&q=80&w=800" 
                    alt="Tarot cards on a dark surface"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <span className="font-label text-xs uppercase tracking-[0.1em] text-secondary mb-4 block">01 / Readings</span>
                  <h3 className="text-2xl font-display mb-4 text-on-surface">Psychological Tarot</h3>
                  <p className="text-on-surface/60 leading-relaxed flex-1">50-minute deep-dive sessions combining narrative therapy with tarot archetypes for deep shadow work.</p>
                </div>
              </Card>
            </Link>
            
            <Link href="/courses">
              <Card surface="high" className="group flex flex-col overflow-hidden p-0 h-full transition-all duration-250 ease-snappy hover:surface-highest">
                <div className="relative h-52 w-full grayscale group-hover:grayscale-0 transition-all duration-500">
                  <Image 
                    src="https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=800" 
                    alt="Professional study with books and candles"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <span className="font-label text-xs uppercase tracking-[0.1em] text-secondary mb-4 block">02 / Education</span>
                  <h3 className="text-2xl font-display mb-4 text-on-surface">Signature Course</h3>
                  <p className="text-on-surface/60 leading-relaxed flex-1">Master the psychology of tarot at your own pace. Learn to use archetypes as a tool for personal transformation.</p>
                </div>
              </Card>
            </Link>
            
            <Link href="/blog">
              <Card surface="high" className="group flex flex-col overflow-hidden p-0 h-full transition-all duration-250 ease-snappy hover:surface-highest">
                <div className="relative h-52 w-full grayscale group-hover:grayscale-0 transition-all duration-500">
                  <Image 
                    src="https://images.unsplash.com/photo-1516414447565-b14be0adf13e?auto=format&fit=crop&q=80&w=800" 
                    alt="Journaling and creative writing tools"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <span className="font-label text-xs uppercase tracking-[0.1em] text-secondary mb-4 block">03 / Creation</span>
                  <h3 className="text-2xl font-display mb-4 text-on-surface">Creative Writing</h3>
                  <p className="text-on-surface/60 leading-relaxed flex-1">Workshops that use tarot as a catalyst for creative writing and unblocking your inner storyteller.</p>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      <div className="ritual-progress w-full" />
    </div>
  );
}
