import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Kali Meister | Book a Reading or Send an Inquiry",
  description:
    "Get in touch with Kali Meister to book a tarot reading, ask questions about services, or inquire about spiritual counseling. Response within 48 hours.",
  openGraph: {
    title: "Contact Kali Meister | Book a Reading",
    description:
      "Get in touch with Kali Meister for tarot readings, courses, and spiritual counseling inquiries.",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-surface-container-low py-24 px-6 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48" />
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-block font-label text-xs uppercase tracking-[0.2em] text-secondary mb-6 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
            Contact
          </span>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-on-surface mb-6 leading-tight">
            Get in{" "}
            <span className="text-primary italic">Touch</span>
          </h1>
          <p className="text-xl text-on-surface/60 font-body max-w-xl mx-auto">
            Ready to book or have questions? Fill out the form below and I will
            respond within 48 hours.
          </p>
        </div>
      </section>

      {/* Contact form + info */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Form */}
          <div className="bg-surface-container-high rounded-2xl p-8 lg:p-10">
            <h2 className="font-display text-2xl text-on-surface mb-2">
              Send a Message
            </h2>
            <p className="text-on-surface/50 font-body text-sm mb-8">
              All fields marked * are required.
            </p>
            <form
              action="https://formspree.io/f/maqvered"
              method="POST"
              className="space-y-6"
            >
              <div>
                <label
                  htmlFor="name"
                  className="block font-label text-xs uppercase tracking-widest text-on-surface/60 mb-2"
                >
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full bg-surface border border-outline-variant/30 text-on-surface p-4 rounded-lg font-body placeholder:text-on-surface/30 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block font-label text-xs uppercase tracking-widest text-on-surface/60 mb-2"
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full bg-surface border border-outline-variant/30 text-on-surface p-4 rounded-lg font-body placeholder:text-on-surface/30 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="service"
                  className="block font-label text-xs uppercase tracking-widest text-on-surface/60 mb-2"
                >
                  Service of Interest
                </label>
                <select
                  id="service"
                  name="service"
                  className="w-full bg-surface border border-outline-variant/30 text-on-surface p-4 rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                >
                  <option value="">Select a service...</option>
                  <option value="tarot">Personal Tarot Reading</option>
                  <option value="lenormand">Lenormand Reading</option>
                  <option value="astrology">Astrology Reading</option>
                  <option value="channeling">Spirit Channeling</option>
                  <option value="oracle">Oracle Card Reading</option>
                  <option value="counseling">Spiritual Counseling</option>
                  <option value="other">Other / Not Sure</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block font-label text-xs uppercase tracking-widest text-on-surface/60 mb-2"
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className="w-full bg-surface border border-outline-variant/30 text-on-surface p-4 rounded-lg font-body placeholder:text-on-surface/30 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none"
                  placeholder="Tell me a little about what you're looking for..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-[#21005d] hover:bg-primary/90 font-label uppercase tracking-widest text-sm px-8 py-5 rounded-lg transition-opacity"
              >
                Send Message
              </button>

              <p className="text-center text-on-surface/30 text-xs font-label">
                Your information is private and never shared.
              </p>
            </form>
          </div>

          {/* Direct contact */}
          <div className="space-y-10 lg:pt-4">
            <div>
              <h3 className="font-display text-2xl text-on-surface mb-6">
                Or reach out directly
              </h3>
              <div className="space-y-5">
                <a
                  href="mailto:kali@kalimeister.com"
                  className="flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-secondary group-hover:bg-secondary/10 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-label text-xs uppercase tracking-widest text-on-surface/40 mb-1">
                      Email
                    </p>
                    <p className="text-secondary group-hover:text-primary transition-colors font-body">
                      kali@kalimeister.com
                    </p>
                  </div>
                </a>

                <a
                  href="https://instagram.com/kalimeister"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-secondary group-hover:bg-secondary/10 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-label text-xs uppercase tracking-widest text-on-surface/40 mb-1">
                      Instagram
                    </p>
                    <p className="text-secondary group-hover:text-primary transition-colors font-body">
                      @kalimeister
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Response time */}
            <div className="bg-surface-container-high rounded-xl p-6 border border-outline-variant/10">
              <p className="font-label text-xs uppercase tracking-widest text-secondary mb-3">
                Response Time
              </p>
              <p className="text-on-surface/60 font-body">
                I personally read every message and respond within 48 hours. For
                urgent matters, Instagram DMs are checked more frequently.
              </p>
            </div>

            {/* Navigation */}
            <div className="space-y-3">
              <Link
                href="/readings"
                className="flex items-center gap-2 text-secondary hover:text-primary transition-colors font-label text-sm uppercase tracking-widest"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
                Book a Reading
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-2 text-secondary hover:text-primary transition-colors font-label text-sm uppercase tracking-widest"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
                About Kali
              </Link>
              <Link
                href="/services"
                className="flex items-center gap-2 text-secondary hover:text-primary transition-colors font-label text-sm uppercase tracking-widest"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
                All Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
