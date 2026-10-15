import type { Metadata } from "next";
import Link from "next/link";
import { CourseWaitlistForm } from "@/components/CourseWaitlistForm";

export const metadata: Metadata = {
  title: "Writing & Reflection Resources | Kali Meister",
  description: "Future writing and reflection resources from Kali Meister. Join the interest list for updates as new offerings take shape.",
  alternates: { canonical: "/courses" },
  openGraph: { title: "Writing & Reflection Resources | Kali Meister", description: "Resources exploring writing, discernment and spiritual reflection are in development.", url: "/courses", type: "website" },
  twitter: { card: "summary_large_image", title: "Writing & Reflection Resources | Kali Meister", description: "Writing and reflection resources are in development." },
};

export default function CoursePage() {
  return <div className="mx-auto max-w-4xl px-6 py-20 lg:px-12">
    <p className="mb-5 text-xs uppercase tracking-[.2em] text-primary">Learning with Kali</p>
    <h1 className="mb-7 font-serif text-5xl sm:text-6xl">Writing & reflection resources</h1>
    <p className="mb-8 max-w-2xl text-xl leading-relaxed text-on-surface/70">We’re developing resources that bring together creative writing, discernment and spiritual reflection.</p>
    <section className="mb-12 rounded-2xl bg-surface-container-low p-8"><h2 className="mb-4 font-serif text-3xl">In development</h2><p className="leading-relaxed">Formats, release dates and prices will be shared when they’re confirmed. Join the interest list for new writing and updates as these offerings take shape.</p></section>
    <h2 className="mb-5 font-serif text-3xl">Stay in the conversation.</h2><CourseWaitlistForm />
    <p className="mt-10"><Link href="/readings" className="underline underline-offset-4">Explore private readings →</Link></p>
  </div>;
}
