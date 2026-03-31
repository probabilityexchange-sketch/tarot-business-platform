import type { Metadata } from "next";
import { Newsreader, Inter, Space_Grotesk } from "next/font/google";
import "../styles/globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: "italic",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Psychological Tarot & Narrative Therapy | Self-Reflection & Shadow Work",
  description: "Transform your story with psychological tarot readings and narrative therapy. Specialized in shadow work, creative writing workshops, and self-reflection through tarot archetypes.",
  keywords: ["psychological tarot reading", "narrative therapy", "shadow work tarot", "tarot and creative writing", "self-reflection tarot", "tarot archetypes psychology"],
  authors: [{ name: "Tarot as Narrative Therapy" }],
  openGraph: {
    title: "Psychological Tarot & Narrative Therapy | Self-Reflection & Shadow Work",
    description: "Transform your story with psychological tarot readings and narrative therapy. Specialized in shadow work and self-reflection.",
    type: "website",
    locale: "en_US",
    siteName: "Psychological Tarot",
  },
  twitter: {
    card: "summary_large_image",
    title: "Psychological Tarot & Narrative Therapy",
    description: "Transform your story with psychological tarot readings and narrative therapy.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Psychological Tarot & Narrative Therapy",
    "description": "Professional psychological tarot readings and narrative therapy for self-discovery and shadow work.",
    "provider": {
      "@type": "Organization",
      "name": "Tarot as Narrative Therapy",
      "url": "https://psychologicaltarot.com"
    },
    "serviceType": "Psychological Counseling",
    "areaServed": "Worldwide",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Tarot Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Narrative Readings"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Signature Course"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Writing Workshops"
          }
        }
      ]
    }
  };

  return (
    <html lang="en" className={`${newsreader.variable} ${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased min-h-screen bg-surface text-on-surface font-body selection:bg-primary/30 selection:text-primary-container">
        {/* We'll refine the header/footer in a dedicated navigation component update */}
        <header className="py-8 px-12 flex justify-between items-center sticky top-0 bg-surface/60 backdrop-blur-[24px] z-50">
          <div className="font-label text-xl tracking-[0.05em] uppercase text-primary">
            Psychological Tarot
          </div>
          <nav className="flex gap-10 text-sm font-label tracking-[0.05em] uppercase">
            <a href="/readings" className="text-on-surface hover:text-secondary transition-colors duration-250 ease-snappy">Readings</a>
            <a href="/courses" className="text-on-surface hover:text-secondary transition-colors duration-250 ease-snappy">Courses</a>
            <a href="/blog" className="text-on-surface hover:text-secondary transition-colors duration-250 ease-snappy">Journal</a>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="py-20 px-12 text-center text-on-surface/40 text-sm font-label tracking-[0.05em] uppercase">
          © {new Date().getFullYear()} Tarot as Narrative Therapy. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
