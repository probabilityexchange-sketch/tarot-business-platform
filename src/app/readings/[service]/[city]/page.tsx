import { Metadata } from "next";
import { SERVICES, CITIES } from "@/lib/pseo-data";
import { PSEO_CONTENT } from "@/lib/pseo-generated-content";
import Link from "next/link";
import { Card } from "@/components/ui/card";

function generateSchema(service: string, city: string, svc: any, cityData: any) {
  const schemaKey = `${service}:${city}`;
  const schemaContent = PSEO_CONTENT[schemaKey];

  const faqSchema = schemaContent && schemaContent.faq ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": schemaContent.faq.map((faq: any) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;
  
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `${svc.label} in ${cityData.city}, ${cityData.state}`,
    "provider": {
      "@type": "Person",
      "name": "Kali Meister"
    },
    "areaServed": {
      "@type": "City",
      "name": cityData.city,
      "containedInPlace": {
        "@type": "State",
        "name": cityData.state
      }
    },
    "serviceType": svc.label,
    "priceRange": "$$",
    "url": `https://kalimeister.com/readings/${service}/${city}`
  };
  
  return { serviceSchema, faqSchema };
}

export function generateStaticParams() {
  const params: { service: string; city: string }[] = [];

  for (const service of Object.keys(SERVICES)) {
    for (const city of Object.keys(CITIES)) {
      params.push({ service, city });
    }
  }

  return params;
}

type Props = {
  params: Promise<{ service: string; city: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service, city } = await params;
  const svc = SERVICES[service];
  const cityData = CITIES[city];

  if (!svc || !cityData) {
    return { title: "Service Not Found | Kali Meister" };
  }

  const metaKey = `${service}:${city}`;
  const metaContent = PSEO_CONTENT[metaKey];

  const title = `${svc.label} ${cityData.city}, ${cityData.state} | Kali Meister — Book $250/hr`;
  const description = metaContent
    ? `Book a ${svc.label.toLowerCase()} in ${cityData.city} with Kali Meister. 10+ years intuitive experience. In-person or virtual sessions. ${metaContent.paragraph.slice(0, 120)}...`
    : `Professional ${svc.label.toLowerCase()} services in ${cityData.city}, ${cityData.state}. ${cityData.metro} residents trust Kali Meister for intuitive spiritual guidance.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    alternates: {
      canonical: `/readings/${service}/${city}`,
    },
  };
}

export default async function CityServicePage({ params }: Props) {
  const { service, city } = await params;
  const svc = SERVICES[service];
  const cityData = CITIES[city];

  if (!svc || !cityData) {
    return (
      <div className="min-h-screen pt-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-display mb-4">Page Not Found</h1>
          <p className="text-on-surface/60 mb-8">This service location page is not available.</p>
          <Link href="/readings" className="text-secondary hover:text-primary transition-colors">
            View all readings
          </Link>
        </div>
      </div>
    );
  }

  const otherServices = Object.values(SERVICES).filter((s) => s.slug !== service);
  const pageContentKey = `${service}:${city}`;
  const pageContent = PSEO_CONTENT[pageContentKey];

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 lg:px-12">
      {/* Schema Markup */}
      {(() => {
        const { serviceSchema, faqSchema } = generateSchema(service, city, svc, cityData);
        return (
          <>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />
            {faqSchema && (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
              />
            )}
          </>
        );
      })()}
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-label uppercase tracking-[0.15em] text-on-surface/40 mb-12" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-secondary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/readings" className="hover:text-secondary transition-colors">Readings</Link>
          <span>/</span>
          <Link href={`/readings/${service}`} className="hover:text-secondary transition-colors">{svc.label}</Link>
          <span>/</span>
          <span className="text-on-surface">{cityData.city}</span>
        </nav>

        {/* Hero */}
        <header className="mb-16">
          <div className="max-w-3xl">
            <span className="font-label text-xs uppercase tracking-[0.2em] text-secondary mb-4 block">
              {svc.label} · {cityData.city}, {cityData.state}
            </span>
            <h1 className="text-5xl md:text-6xl font-display mb-6 leading-[1.05]">
              {svc.label} in{" "}
              <span className="text-primary italic">{cityData.city}, {cityData.state}</span>
            </h1>
            <p className="text-xl text-on-surface/60 font-body leading-relaxed max-w-2xl">
              {cityData.metro} — connect with intuitive guidance for love, career, and life's biggest questions.
              Virtual sessions available for seekers everywhere.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Unique city content */}
            {pageContent && (
              <section>
                <h2 className="text-2xl font-display mb-4 italic text-primary">{svc.label} in {cityData.city}</h2>
                <p className="text-on-surface/60 font-body leading-relaxed text-lg">
                  {pageContent.paragraph}
                </p>
              </section>
            )}

            {/* About this service */}
            <section>
              <h2 className="text-2xl font-display mb-4 italic text-primary">About This Service</h2>
              <p className="text-on-surface/60 font-body leading-relaxed text-lg">
                {svc.description} Sessions are conducted via video call and recorded for your review.
                Whether you're new to divination or a seasoned seeker, each session is tailored to your
                questions and where you are in your journey.
              </p>
            </section>

            {/* What to expect */}
            <Card surface="high" className="border border-outline/10">
              <h2 className="text-2xl font-display mb-6 italic">What to Expect</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                {[
                  { icon: "📹", label: "Virtual", sub: "Zoom or phone, recorded" },
                  { icon: "⏱", label: "30–90 min", sub: "Flexible session lengths" },
                  { icon: "📝", label: "Full recording", sub: "PDF guide included" },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <span className="text-3xl">{item.icon}</span>
                    <span className="font-display text-lg text-on-surface">{item.label}</span>
                    <span className="text-xs font-label uppercase tracking-wider text-on-surface/40">{item.sub}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* FAQ Section */}
            {pageContent && pageContent.faq && pageContent.faq.length > 0 && (
              <section>
                <h2 className="text-2xl font-display mb-6 italic text-primary">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {pageContent.faq.map((faq: any, i: number) => (
                    <div key={i} className="p-6 rounded-xl bg-surface-container-low border border-outline/5">
                      <h3 className="font-display text-lg mb-2 text-on-surface">{faq.question}</h3>
                      <p className="text-on-surface/60 font-body leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* CTA */}
            <section className="rounded-2xl bg-gradient-to-br from-[#4a0e4e] to-[#2d0a30] p-10 text-center">
              <h2 className="text-3xl font-display text-white mb-3">Ready for Your Reading?</h2>
              <p className="text-white/70 font-body mb-6">
                Book your {svc.label.toLowerCase()} session today.
              </p>
              <Link
                href="/contact"
                className="inline-block bg-white text-[#4a0e4e] px-8 py-3 rounded-full text-sm font-label uppercase tracking-widest hover:bg-white/90 transition-opacity"
              >
                Book Now
              </Link>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Other services in this city */}
            <Card surface="high" className="border border-outline/10">
              <h3 className="font-display text-lg mb-4 italic text-primary">All Services in {cityData.city}</h3>
              <div className="space-y-3">
                {Object.values(SERVICES).map((s) => (
                  <Link
                    key={s.slug}
                    href={`/readings/${s.slug}/${city}`}
                    className={`block py-2 px-3 rounded-lg text-sm font-body transition-colors ${
                      s.slug === service
                        ? "bg-primary/10 text-primary"
                        : "text-on-surface/60 hover:bg-surface-container-low hover:text-on-surface"
                    }`}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </Card>

            {/* Other cities for this service */}
            <Card surface="high" className="border border-outline/10">
              <h3 className="font-display text-lg mb-4 italic text-primary">Other Cities</h3>
              <div className="space-y-1">
                {Object.entries(CITIES)
                  .filter(([slug]) => slug !== city)
                  .slice(0, 8)
                  .map(([slug, data]) => (
                    <Link
                      key={slug}
                      href={`/readings/${service}/${slug}`}
                      className="block py-1.5 px-3 rounded-lg text-sm font-body text-on-surface/60 hover:bg-surface-container-low hover:text-on-surface transition-colors"
                    >
                      {data.city}, {data.state}
                    </Link>
                  ))}
              </div>
            </Card>

            {/* Main readings link */}
            <div className="text-center">
              <Link href="/readings" className="text-xs font-label uppercase tracking-widest text-secondary hover:text-primary transition-colors">
                View All Readings →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
