import Link from "next/link";

export default function NotFound() {
  return <div className="mx-auto max-w-3xl px-6 py-20 lg:py-28"><p className="mb-5 text-xs uppercase tracking-[.2em] text-primary">Page not found · 404</p><h1 className="mb-7 font-serif text-4xl sm:text-6xl">Let’s find your next step.</h1><p className="mb-6 text-lg leading-relaxed text-on-surface/70">This page may have moved or is no longer available. Kali currently offers private online tarot readings, along with writing and reflection through her journal and email letters.</p><div className="flex flex-wrap gap-6"><Link href="/readings" className="rounded-full bg-primary px-6 py-3 text-on-primary">Explore private tarot readings</Link><Link href="/" className="self-center underline underline-offset-4">Return to the homepage</Link></div></div>;
}
