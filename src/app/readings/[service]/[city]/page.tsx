import { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { readingsOfferings } from "@/lib/offerings";

const SERVICES: Record<string, { label: string; description: string; slug: string }> = {
  "tarot-reading": {
    label: "Tarot Reading",
    description: "Classic Rider-Waite deck with intuitive guidance for insight and direction.",
    slug: "tarot-reading",
  },
  "astrology-reading": {
    label: "Astrology Reading",
    description: "Full natal chart analysis with Solar Fire software for precision.",
    slug: "astrology-reading",
  },
  "lenormand-reading": {
    label: "Lenormand Reading",
    description: "Precise, grounded predictions using the 36-card Lenormand deck.",
    slug: "lenormand-reading",
  },
  "oracle-reading": {
    label: "Oracle Reading",
    description: "Intuitive guidance through beautifully illustrated oracle decks.",
    slug: "oracle-reading",
  },
  "channeling-session": {
    label: "Channeling Session",
    description: "Connect with spirit guides and loved ones for healing messages.",
    slug: "channeling-session",
  },
};

const CITIES: Record<string, { city: string; state: string; metro: string }> = {
  "albuquerque-nm": { city: "Albuquerque", state: "NM", metro: "915K metro area" },
  "arlington-tx": { city: "Arlington", state: "TX", metro: "4.2M Dallas-Fort Worth metro" },
  "atlanta-ga": { city: "Atlanta", state: "GA", metro: "6M metro area" },
  "austin-tx": { city: "Austin", state: "TX", metro: "2.2M metro area" },
  "baltimore-md": { city: "Baltimore", state: "MD", metro: "2.8M metro area" },
  "boston-ma": { city: "Boston", state: "MA", metro: "4.9M metro area" },
  "charlotte-nc": { city: "Charlotte", state: "NC", metro: "2.7M metro area" },
  "chicago-il": { city: "Chicago", state: "IL", metro: "9.5M metro area" },
  "cleveland-oh": { city: "Cleveland", state: "OH", metro: "2M metro area" },
  "colorado-springs-co": { city: "Colorado Springs", state: "CO", metro: "760K metro area" },
  "columbus-oh": { city: "Columbus", state: "OH", metro: "2.1M metro area" },
  "dallas-tx": { city: "Dallas", state: "TX", metro: "7.5M metro area" },
  "denver-co": { city: "Denver", state: "CO", metro: "3M metro area" },
  "el-paso-tx": { city: "El Paso", state: "TX", metro: "868K metro area" },
  "fort-worth-tx": { city: "Fort Worth", state: "TX", metro: "4.2M Dallas-Fort Worth metro" },
  "fresno-ca": { city: "Fresno", state: "CA", metro: "1M metro area" },
  "houston-tx": { city: "Houston", state: "TX", metro: "7.2M metro area" },
  "indianapolis-in": { city: "Indianapolis", state: "IN", metro: "2.1M metro area" },
  "jacksonville-fl": { city: "Jacksonville", state: "FL", metro: "1.6M metro area" },
  "kansas-city-mo": { city: "Kansas City", state: "MO", metro: "2.2M metro area" },
  "las-vegas-nv": { city: "Las Vegas", state: "NV", metro: "2.3M metro area" },
  "long-beach-ca": { city: "Long Beach", state: "CA", metro: "13M Los Angeles metro" },
  "los-angeles-ca": { city: "Los Angeles", state: "CA", metro: "13M metro area" },
  "louisville-ky": { city: "Louisville", state: "KY", metro: "1.3M metro area" },
  "memphis-tn": { city: "Memphis", state: "TN", metro: "1.3M metro area" },
  "mesa-az": { city: "Mesa", state: "AZ", metro: "5.1M Phoenix metro" },
  "miami-fl": { city: "Miami", state: "FL", metro: "6.2M metro area" },
  "milwaukee-wi": { city: "Milwaukee", state: "WI", metro: "1.7M metro area" },
  "minneapolis-mn": { city: "Minneapolis", state: "MN", metro: "3.7M metro area" },
  "nashville-tn": { city: "Nashville", state: "TN", metro: "2.1M metro area" },
  "new-orleans-la": { city: "New Orleans", state: "LA", metro: "1.3M metro area" },
  "new-york-ny": { city: "New York", state: "NY", metro: "20M metro area" },
  "oakland-ca": { city: "Oakland", state: "CA", metro: "7.8M San Francisco Bay Area" },
  "oklahoma-city-ok": { city: "Oklahoma City", state: "OK", metro: "1.4M metro area" },
  "omaha-ne": { city: "Omaha", state: "NE", metro: "944K metro area" },
  "philadelphia-pa": { city: "Philadelphia", state: "PA", metro: "6.2M metro area" },
  "phoenix-az": { city: "Phoenix", state: "AZ", metro: "5.1M metro area" },
  "portland-or": { city: "Portland", state: "OR", metro: "2.5M metro area" },
  "raleigh-nc": { city: "Raleigh", state: "NC", metro: "1.4M metro area" },
  "sacramento-ca": { city: "Sacramento", state: "CA", metro: "2.4M metro area" },
  "san-antonio-tx": { city: "San Antonio", state: "TX", metro: "2.5M metro area" },
  "san-diego-ca": { city: "San Diego", state: "CA", metro: "3.3M metro area" },
  "san-francisco-ca": { city: "San Francisco", state: "CA", metro: "7.8M Bay Area metro" },
  "seattle-wa": { city: "Seattle", state: "WA", metro: "4M metro area" },
  "tampa-fl": { city: "Tampa", state: "FL", metro: "3.3M metro area" },
  "tucson-az": { city: "Tucson", state: "AZ", metro: "1M metro area" },
  "tulsa-ok": { city: "Tulsa", state: "OK", metro: "1M metro area" },
  "virginia-beach-va": { city: "Virginia Beach", state: "VA", metro: "1.8M Hampton Roads" },
  "washington-dc": { city: "Washington", state: "DC", metro: "6.3M metro area" },
  "wichita-ks": { city: "Wichita", state: "KS", metro: "645K metro area" },
};

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

  const title = `${svc.label} in ${cityData.city}, ${cityData.state} | KaliMeister`;
  const description = `Professional ${svc.label.toLowerCase()} services in ${cityData.city}, ${cityData.state}. ${cityData.metro} residents trust Kali Meister for intuitive spiritual guidance.`;

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

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 lg:px-12">
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

            {/* Serving notice */}
            <div className="p-8 rounded-2xl bg-surface-container-low border border-outline/5">
              <p className="text-on-surface/60 font-body leading-relaxed">
                <strong className="text-on-surface">Serving {cityData.city}, {cityData.state}</strong> — the {cityData.metro} has access to our full range of spiritual services.
                {cityData.city === "Nashville" && " Located just 2 hours from Nashville, Kali brings deep familiarity with the Tennessee spiritual community."}
                {cityData.city === "Memphis" && " Memphis has a rich tradition of spiritual seekers — we honor that lineage."}
              </p>
            </div>

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
