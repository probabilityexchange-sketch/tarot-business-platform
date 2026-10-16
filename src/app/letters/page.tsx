import type { Metadata } from "next";
import Link from "next/link";
import { EmailSignupForm } from "@/components/EmailSignupForm";

const description = "Begin with a free three-part guide to discernment. Receive writing and reflection from Kali Meister on fear, ego and intuition.";

export const metadata: Metadata = {
  title: "Letters from Kali | A Free Guide to Discernment",
  description,
  alternates: { canonical: "/letters" },
  openGraph: { title: "A strong feeling is a place to begin.", description, url: "/letters", type: "website" },
  twitter: { card: "summary_large_image", title: "Letters from Kali", description },
};

export default function LettersPage() {
  return (
    <div className="bg-[#f5f0e8] text-[#302731]">
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.1fr_.9fr] lg:gap-20 lg:py-24">
        <div>
          <p className="mb-6 text-xs uppercase tracking-[.22em] text-[#744b65]">Letters from Kali · A free guide to begin</p>
          <h1 className="font-serif text-5xl leading-[1.08] tracking-tight sm:text-6xl">A strong feeling.<br /><span className="italic text-[#744b65]">A thoughtful next step.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#655b61]">Is it fear, ego, desire—or intuition? You don’t have to turn every feeling into an answer. Begin by giving it a little room on the page.</p>
          <p className="mt-5 max-w-xl leading-relaxed text-[#655b61]">Join Letters from Kali and receive a free three-part discernment guide, with questions you can return to whenever a decision feels tangled.</p>
          <ol className="mt-9 space-y-5 border-l border-[#744b65]/30 pl-6">
            <li><h2 className="font-serif text-2xl">Notice the feeling.</h2><p className="mt-1 text-sm leading-relaxed text-[#655b61]">Separate what you observed from the story you’re telling about it.</p></li>
            <li><h2 className="font-serif text-2xl">Make room for another explanation.</h2><p className="mt-1 text-sm leading-relaxed text-[#655b61]">Explore fear, self-image, desire and intuition without forcing a label.</p></li>
            <li><h2 className="font-serif text-2xl">Choose one small next step.</h2><p className="mt-1 text-sm leading-relaxed text-[#655b61]">Gather information, write, and revisit what you learn.</p></li>
          </ol>
        </div>
        <aside className="self-start rounded-2xl border border-[#744b65]/20 bg-[#efe5d6] p-7 sm:p-9">
          <h2 className="mb-4 font-serif text-3xl">A little more room for reflection.</h2>
          <p className="mb-7 text-sm leading-relaxed text-[#655b61]">Your guide arrives by email after you confirm your address. The welcome letter follows, then a weekly discernment series, with occasional news about Kali’s work.</p>
          <EmailSignupForm source="letters-page" label="Send me the free guide" />
          <p className="mt-5 text-xs leading-relaxed text-[#655b61]">Look for a confirmation email from Kali Meister. You can unsubscribe using the link in any email.</p>
        </aside>
      </section>
      <section className="border-t border-[#302731]/15 px-6 py-12"><div className="mx-auto max-w-3xl"><h2 className="font-serif text-3xl">Writing and spiritual reflection, together.</h2><p className="mt-5 leading-relaxed text-[#655b61]">Kali Meister is a writer and spiritual practitioner with a master’s degree in creative writing from Goddard College and an undergraduate degree in psychology from the University of Tennessee. Her letters bring writing prompts and thoughtful questions to the practice of discernment.</p><Link href="/about" className="mt-5 inline-block text-sm underline underline-offset-4">Meet Kali →</Link></div></section>
    </div>
  );
}
