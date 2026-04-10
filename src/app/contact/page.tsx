import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact | Kali Meister",
  description: "Get in touch with Kali Meister for tarot readings, courses, and spiritual counseling inquiries.",
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24">
      <h1 className="font-display text-4xl md:text-5xl text-primary mb-8">Contact</h1>
      <div className="space-y-6 text-slate-300">
        <p>
          Ready to book a reading or have questions about courses? Reach out directly:
        </p>
        <div className="space-y-4">
          <a 
            href="mailto:kalimeister@gmail.com" 
            className="block text-secondary hover:text-primary transition-colors"
          >
            kalimeister@gmail.com
          </a>
          <a 
            href="https://instagram.com/kalimeister" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-secondary hover:text-primary transition-colors"
          >
            @kalimeister on Instagram
          </a>
        </div>
        <p className="pt-8">
          <Link href="/readings" className="text-secondary hover:text-primary transition-colors">
            ← Book a Reading
          </Link>
        </p>
      </div>
    </div>
  );
}
