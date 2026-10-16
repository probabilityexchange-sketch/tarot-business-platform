import type { Metadata } from "next";
import { Newsreader, Inter, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { Providers } from "@/components/Providers";
import { Analytics } from "@/components/Analytics";
import "../styles/globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
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
  metadataBase: new URL("https://kalimeister.com"),
  title: "Kali Meister | Writing, Tarot & Spiritual Work",
  description: "Writing, private tarot readings and spiritual work with Kali Meister. Explore her journal and receive Letters from Kali.",
  keywords: ["tarot reader", "spiritual reflection", "creative writing", "discernment", "Chattanooga", "East Tennessee"],
  authors: [{ name: "Kali Meister" }],
  openGraph: {
    title: "Kali Meister | Writing, Tarot & Spiritual Work",
    description: "Writing, private tarot readings and spiritual work with Kali Meister. Explore her journal and receive Letters from Kali.",
    url: "https://kalimeister.com",
    type: "website",
    locale: "en_US",
    siteName: "Kali Meister",
    images: [
      {
        url: "https://kalimeister.com/images/kali-meister.jpg",
        width: 1200,
        height: 630,
        alt: "Kali Meister - Writer & Spiritual Practitioner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kali Meister | Writing, Tarot & Spiritual Work",
    description: "Writing, private tarot readings and spiritual reflection with Kali Meister.",
    images: ["https://kalimeister.com/images/kali-meister.jpg"],
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${newsreader.variable} ${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="has-[.brand-preview]:[&>header]:hidden has-[.brand-preview]:[&>footer]:hidden antialiased min-h-screen bg-surface text-on-surface font-body selection:bg-primary/30 selection:text-primary-container">
        <Analytics />
        <header className="border-b border-on-surface/15 bg-surface">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-6 py-6 lg:px-12">
            <Link href="/" className="font-serif text-3xl tracking-tight">
              Kali Meister<span className="mt-1 block font-body text-[10px] uppercase tracking-[.22em]">Writing · Tarot · Spiritual Work</span>
            </Link>
            <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-5 text-sm">
              <Link href="/readings">Private readings</Link>
              <Link href="/blog">Writing</Link>
              <Link href="/#gatherings">Gatherings</Link>
              <Link href="/shop">Shop</Link>
              <Link href="/#letters" className="rounded-full border border-primary px-5 py-2">Letters from Kali</Link>
            </nav>
          </div>
        </header>
        <Providers>
          <main className="has-[.brand-preview]:pt-0">{children}</main>
        </Providers>
        <footer className="py-16 px-6 text-center">
          <div className="max-w-7xl mx-auto">
            <p className="font-label text-lg tracking-[0.05em] uppercase text-primary mb-4">Kali Meister</p>
            <p className="text-on-surface/40 text-sm font-label tracking-[0.05em] uppercase mb-8">Writer & Spiritual Practitioner</p>
            <div className="flex flex-wrap justify-center gap-8 text-sm font-label tracking-[0.05em] uppercase mb-8">
              <Link href="/readings" className="text-on-surface/40 hover:text-secondary transition-colors">Readings</Link>
              <Link href="/courses" className="text-on-surface/40 hover:text-secondary transition-colors">Resources</Link>
              <Link href="/blog" className="text-on-surface/40 hover:text-secondary transition-colors">Journal</Link>
              <Link href="/shop" className="text-on-surface/40 hover:text-secondary transition-colors">Shop</Link>
              <Link href="/contact" className="text-on-surface/40 hover:text-secondary transition-colors">Contact</Link>
            </div>
            <div className="flex justify-center gap-6 mb-8">
              <a 
                href="https://instagram.com/kalimeister" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-on-surface/40 hover:text-secondary transition-colors"
                aria-label="Follow on Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
            <p className="text-on-surface/30 text-xs font-label">© {new Date().getFullYear()} Kali Meister. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
