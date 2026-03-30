import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Tarot as Narrative Therapy",
  description: "Psychological tarot readings and creative writing workshops for self-discovery.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <header className="border-b border-slate-800 py-4 px-6 flex justify-between items-center sticky top-0 bg-slate-950/50 backdrop-blur-md z-50">
          <div className="font-bold text-xl tracking-tight text-pink-500">
            Psychological Tarot
          </div>
          <nav className="flex gap-6 text-sm font-medium">
            <a href="/readings" className="hover:text-pink-400 transition-colors">Readings</a>
            <a href="/courses" className="hover:text-pink-400 transition-colors">Courses</a>
            <a href="/blog" className="hover:text-pink-400 transition-colors">Journal</a>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="border-t border-slate-800 py-8 px-6 text-center text-slate-500 text-sm">
          © {new Date().getFullYear()} Tarot as Narrative Therapy. All rights reserved.
        </footer>
      </body>
    </html>
  );
}