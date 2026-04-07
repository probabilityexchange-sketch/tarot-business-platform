import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Digital Alchemist | Psychological Tarot Journal & Insights",
  description: "Explore deep inquiries into psychological tarot, archetypes, and narrative therapy. Read our latest insights on shadow work and self-reflection.",
};

// Mock data for initial structure
const posts = [
  {
    slug: "shadow-work-and-the-moon",
    title: "Shadow Work & The Moon: Dismantling the Night",
    excerpt: "Exploring the psychological depths of the Moon archetype and its role in narrative therapy and subconscious unveiling.",
    date: "March 20, 2026",
    category: "Archetypes",
    image: "/images/courses-placeholder.svg"
  },
  {
    slug: "tarot-as-narrative-mirror",
    title: "The Tarot as a Narrative Mirror",
    excerpt: "How we use external symbols to reflect internal stories, and why the deck is the ultimate tool for personal agency.",
    date: "March 15, 2026",
    category: "Theory",
    image: "/images/readings-placeholder.svg"
  },
  {
    slug: "psychology-of-the-fool",
    title: "The Psychology of the Fool: Embracing the Void",
    excerpt: "The Fool isn't about stupidity; it's about the psychological necessity of the 'zero state' before transformation.",
    date: "March 10, 2026",
    category: "Psychology",
    image: "/images/guide-placeholder.svg"
  }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12 lg:mb-32">
          <div className="max-w-3xl">
            <span className="font-label text-xs uppercase tracking-[0.2em] text-secondary mb-6 block">Journal / Insights</span>
            <h1 className="text-6xl md:text-8xl font-display leading-[0.9] -ml-1">
              The <span className="text-primary italic">Digital Alchemist</span>
            </h1>
          </div>
          <div className="md:text-right">
            <p className="text-lg text-on-surface/50 font-label uppercase tracking-widest max-w-xs md:ml-auto leading-relaxed">
              Mapping the intersections of psychology, archetype, and the modern self.
            </p>
          </div>
        </header>

        {/* Featured Post */}
        <section className="mb-32" aria-labelledby="featured-post-heading">
          <h2 id="featured-post-heading" className="sr-only">Featured Inquiry</h2>
          <Link href={`/blog/${posts[0].slug}`} className="group block" aria-label={`Read featured post: ${posts[0].title}`}>
            <Card surface="low" className="p-0 overflow-hidden border-none bg-surface-container-low hover:surface transition-all duration-300 ease-in-out hover:shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative aspect-square lg:aspect-auto grayscale group-hover:grayscale-0 transition-all duration-700">
                  <Image 
                    src={posts[0].image} 
                    alt={posts[0].title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="p-8 lg:p-20 flex flex-col justify-center">
                  <span className="font-label text-xs uppercase tracking-[0.2em] text-tertiary mb-8 block">{posts[0].category} — {posts[0].date}</span>
                  <h2 className="text-4xl lg:text-5xl font-display mb-8 italic group-hover:text-primary transition-colors duration-300 leading-tight">
                    {posts[0].title}
                  </h2>
                  <p className="text-xl text-on-surface/60 font-body leading-relaxed mb-12">
                    {posts[0].excerpt}
                  </p>
                  <span className="text-tertiary font-label text-sm uppercase tracking-widest group-hover:translate-x-2 transition-transform duration-300 inline-block">
                    Read Inquiry →
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        </section>

        {/* Grid of Posts */}
        <section aria-labelledby="latest-posts-heading">
          <h2 id="latest-posts-heading" className="sr-only">Latest Inquiries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
            {posts.slice(1).map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block" aria-label={`Read post: ${post.title}`}>
                <div className="mb-8 relative aspect-video grayscale group-hover:grayscale-0 transition-all duration-500 overflow-hidden group-hover:shadow-lg">
                  <Image 
                    src={post.image} 
                    alt={post.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary block">{post.category}</span>
                  <span className="w-1 h-1 rounded-full bg-on-surface/20" aria-hidden="true" />
                  <time dateTime={post.date} className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/40 block">{post.date}</time>
                </div>
                <h3 className="text-3xl font-display mb-4 italic group-hover:text-primary transition-colors duration-300">
                  {post.title}
                </h3>
                <p className="text-on-surface/50 font-body leading-relaxed">
                  {post.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-40 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>
    </div>
  );
}
