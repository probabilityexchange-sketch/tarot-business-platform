import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Kali Meister | Writer & Spiritual Practitioner",
  description: "Meet Kali Meister, a writer and spiritual practitioner with a master’s degree in creative writing from Goddard College and an undergraduate degree in psychology from the University of Tennessee.",
  alternates: { canonical: "/about" },
  openGraph: { title: "About Kali Meister", description: "Writing, tarot and spiritual reflection with Kali Meister.", url: "/about", type: "profile" },
  twitter: { card: "summary_large_image", title: "About Kali Meister", description: "Writer and spiritual practitioner. Creative writing and psychology inform her work." },
};

export default function AboutPage() {
  return <div className="mx-auto max-w-6xl px-6 py-20 lg:px-12"><p className="mb-5 text-xs uppercase tracking-[.2em] text-primary">Meet Kali</p><h1 className="mb-10 font-serif text-5xl sm:text-6xl">About Kali Meister</h1><div className="grid gap-12 md:grid-cols-2"><img src="/images/kali-meister.jpg" alt="Kali Meister, writer and spiritual practitioner" className="h-auto w-full rounded-2xl" /><div className="space-y-6 text-lg leading-relaxed"><h2 className="font-serif text-3xl">A writer’s eye. An intuitive’s ear.</h2><p>Kali Meister is a writer and spiritual practitioner whose work brings together creative expression, tarot and reflection.</p><p>She holds a master’s degree in creative writing from Goddard College and an undergraduate degree in psychology from the University of Tennessee.</p><p>Her work invites people to look closely at their experiences, explore the stories they tell about their lives, and make room for thoughtful questions.</p><p>Through private readings and Letters from Kali, she explores discernment, intuition and spiritual reflection.</p><div className="flex flex-wrap gap-6 pt-4"><Link href="/readings" className="underline underline-offset-4">Explore private readings</Link><Link href="/blog" className="underline underline-offset-4">Read her writing</Link></div></div></div></div>;
}
