import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CITIES } from "@/lib/pseo-data";
import { retainedTarotCities, getCityReadingPath } from "@/lib/city-pages";
import { getCityContent } from "@/lib/service-page-content";
import { readingsOfferings } from "@/lib/offerings";

export const dynamicParams = false;
export function generateStaticParams() {
  return Object.entries(retainedTarotCities).map(([city, service]) => ({ city, service }));
}
type Props = { params: Promise<{ service: string; city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service, city } = await params;
  if (!getCityContent(service, city)) notFound();
  const location = CITIES[city];
  const title = `Online Tarot Readings for ${location.city}, ${location.state} | Kali Meister`;
  const description = `Join Kali Meister from ${location.city} for a private online tarot reading. Choose 60 minutes for $250 or 90 minutes for $450, and explore your questions through conversation and reflection.`;
  return { title, description, alternates: { canonical: getCityReadingPath(city)! }, openGraph: { title, description, url: getCityReadingPath(city)!, type: "website" }, twitter: { card: "summary_large_image", title, description } };
}

export default async function CityReadingPage({ params }: Props) {
  const { service, city } = await params;
  const content = getCityContent(service, city);
  if (!content) notFound();
  const location = CITIES[city];
  const url = `https://kalimeister.com${getCityReadingPath(city)}`;
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "Service", "@id": `${url}#service`, name: `Online tarot readings for ${location.city}`, serviceType: "Private online tarot readings", url, provider: { "@type": "Person", "@id": "https://kalimeister.com/#person", name: "Kali Meister" }, availableChannel: { "@type": "ServiceChannel", serviceUrl: "https://kalimeister.com/readings" }, offers: readingsOfferings.map((offering) => ({ "@type": "Offer", name: `${offering.title} — ${offering.duration}`, price: offering.price.replace("$", ""), priceCurrency: "USD", url: "https://kalimeister.com/readings" })) },
    { "@type": "FAQPage", mainEntity: content.faq.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://kalimeister.com" }, { "@type": "ListItem", position: 2, name: "Private readings", item: "https://kalimeister.com/readings" }, { "@type": "ListItem", position: 3, name: `${location.city}, ${location.state}`, item: url }] },
  ] };
  return <div className="mx-auto max-w-6xl px-6 py-16 lg:px-12">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <nav aria-label="Breadcrumb" className="mb-10 flex flex-wrap gap-2 text-sm"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/readings">Private readings</Link><span aria-hidden="true">/</span><span>{location.city}, {location.state}</span></nav>
    <header className="mb-12 max-w-3xl"><p className="mb-5 text-xs uppercase tracking-[.2em] text-primary">Private readings · Online</p><h1 className="mb-7 font-serif text-4xl leading-tight sm:text-6xl">Online tarot readings for {location.city}, {location.state}</h1><p className="text-xl leading-relaxed text-on-surface/70">Join from {location.city} for a private conversation with Kali. Bring a question, a decision or a story you’re ready to explore.</p></header>
    <section className="mb-12 max-w-3xl"><h2 className="mb-5 font-serif text-3xl">A reading with room for you.</h2><p className="mb-5 leading-relaxed">{content.paragraph}</p><p className="leading-relaxed">Choose an available time in the booking calendar before checkout. Your appointment confirmation shows your selected time. Online sessions let you take part from a private, comfortable place without travelling.</p></section>
    <section className="mb-14 grid gap-6 md:grid-cols-2" aria-label="Available readings">{readingsOfferings.map((offering) => <article key={offering.id} className="rounded-2xl border border-on-surface/15 bg-surface-container-low p-8"><p className="mb-4 text-sm text-primary">{offering.duration} · {offering.price}</p><h2 className="mb-4 font-serif text-3xl">{offering.title}</h2><p className="mb-6 leading-relaxed">{offering.description}</p><Link href="/readings" className="underline underline-offset-4">View available times →</Link></article>)}</section>
    <section className="mb-14 max-w-3xl"><h2 className="mb-6 font-serif text-3xl">Before you book</h2>{content.faq.map((faq) => <div key={faq.question} className="mb-6 border-b border-on-surface/15 pb-6"><h3 className="mb-3 text-lg font-medium">{faq.question}</h3><p className="leading-relaxed text-on-surface/70">{faq.answer}</p></div>)}</section>
    <section className="rounded-2xl bg-surface-container-low p-8"><h2 className="mb-4 font-serif text-3xl">Start with a letter.</h2><p className="mb-6 max-w-2xl leading-relaxed">Letters from Kali brings writing and reflection prompts on discernment, fear and intuition to your inbox.</p><Link href="/#letters" className="underline underline-offset-4">Join Letters from Kali →</Link></section>
  </div>;
}
