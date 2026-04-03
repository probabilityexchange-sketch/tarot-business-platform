import type { Metadata } from "next";
import { Newsreader, Inter, Space_Grotesk } from "next/font/google";
import Link from "next/link";
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
  title: "Kali Meister | Tarot Reader & Spiritual Healer",
  description: "Discover clarity, healing, and empowerment through tarot readings, spiritual counseling, and energy healing with over 40 years of intuitive practice. B.A. Psychology, M.A. Creative Writing.",
  keywords: ["tarot reader", "spiritual healer", "psychic reading", "reiki", "life coaching", "Chattanooga", "East Tennessee"],
  authors: [{ name: "Kali Meister" }],
  openGraph: {
    title: "Kali Meister | Tarot Reader & Spiritual Healer",
    description: "Discover clarity, healing, and empowerment through tarot readings, spiritual counseling, and energy healing.",
    type: "website",
    locale: "en_US",
    siteName: "Kali Meister",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kali Meister | Tarot Reader & Spiritual Healer",
    description: "Discover clarity, healing, and empowerment through tarot readings.",
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
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased min-h-screen bg-surface text-on-surface font-body selection:bg-primary/30 selection:text-primary-container">
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-outline-variant/15">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex justify-between items-center">
            <Link href="/" className="font-label text-lg tracking-[0.05em] uppercase text-primary hover:text-secondary transition-colors duration-250 ease-snappy">
              Kali Meister
            </Link>
            <nav className="flex gap-8 text-sm font-label tracking-[0.05em] uppercase">
              <Link href="/readings" className="text-on-surface hover:text-secondary transition-colors duration-250 ease-snappy">Readings</Link>
              <Link href="/courses" className="text-on-surface hover:text-secondary transition-colors duration-250 ease-snappy">Courses</Link>
              <Link href="/blog" className="text-on-surface hover:text-secondary transition-colors duration-250 ease-snappy">Journal</Link>
              <Link href="/#free-guide" className="text-secondary hover:text-primary transition-colors duration-250 ease-snappy">Free Guide</Link>
            </nav>
            <Link href="/readings">
              <button className="bg-gradient-to-br from-primary to-primary-container px-6 py-2.5 rounded-full text-on-primary-fixed text-xs font-label uppercase tracking-widest hover:opacity-90 transition-opacity">
                Book Now
              </button>
            </Link>
          </div>
        </header>
        <main className="pt-20">{children}</main>
        <footer className="py-16 px-12 text-center">
          <div className="max-w-7xl mx-auto">
            <p className="font-label text-lg tracking-[0.05em] uppercase text-primary mb-4">Kali Meister</p>
            <p className="text-on-surface/40 text-sm font-label tracking-[0.05em] uppercase mb-8">Tarot Reader & Spiritual Healer</p>
            <div className="flex justify-center gap-8 text-sm font-label tracking-[0.05em] uppercase mb-8">
              <Link href="/readings" className="text-on-surface/40 hover:text-secondary transition-colors">Readings</Link>
              <Link href="/courses" className="text-on-surface/40 hover:text-secondary transition-colors">Courses</Link>
              <Link href="/blog" className="text-on-surface/40 hover:text-secondary transition-colors">Journal</Link>
              <Link href="/contact" className="text-on-surface/40 hover:text-secondary transition-colors">Contact</Link>
            </div>
            <p className="text-on-surface/30 text-xs font-label">© {new Date().getFullYear()} Kali Meister. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
