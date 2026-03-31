import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";

// Mock data fetching for now
const posts = {
  "shadow-work-and-the-moon": {
    title: "Shadow Work & The Moon: Dismantling the Night",
    description: "Explore the psychological depths of the Moon archetype and its role in narrative therapy and shadow work.",
    date: "March 20, 2026",
    category: "Archetypes",
    image: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&q=80&w=1200",
    content: `
      <p>The Moon archetype is often misunderstood as a sign of confusion or deception. In psychological tarot, however, we view the Moon as the necessary threshold of the subconscious. It represents the "night sea journey" — the descent into the parts of our narrative that we have kept in the dark.</p>
      
      <h2>The Subconscious Architecture</h2>
      <p>When we pull the Moon in a session, we aren't looking for secrets; we are looking for patterns. The light of the Moon is reflected light, representing our intellectual understanding of our emotional states. It is dim, inconsistent, and requires a different kind of vision.</p>
      
      <p>Shadow work begins here. By acknowledging the distorted shapes in the moonlight, we begin to name our fears and the stories they tell us about who we are allowed to be.</p>
      
      <h2>Dismantling the Night</h2>
      <p>The goal of narrative therapy is not to destroy the darkness, but to populate it with agency. We don't fear the night when we know how to navigate it.</p>
    `
  },
  "tarot-as-narrative-mirror": {
    title: "The Tarot as a Narrative Mirror",
    description: "How we use external symbols to reflect internal stories, and why the deck is the ultimate tool for personal agency.",
    date: "March 15, 2026",
    category: "Theory",
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=1200",
    content: "<p>Theory of the narrative mirror...</p>"
  },
  "psychology-of-the-fool": {
    title: "The Psychology of the Fool: Embracing the Void",
    description: "The Fool isn't about stupidity; it's about the psychological necessity of the 'zero state' before transformation.",
    date: "March 10, 2026",
    category: "Psychology",
    image: "https://images.unsplash.com/photo-1490374722396-48c024ebd1a8?auto=format&fit=crop&q=80&w=1200",
    content: "<p>Psychology of the fool...</p>"
  }
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const post = posts[slug as keyof typeof posts];

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | Psychological Tarot Journal`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = posts[slug as keyof typeof posts];

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.description,
    "datePublished": post.date,
    "author": {
      "@type": "Organization",
      "name": "Tarot as Narrative Therapy"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://psychologicaltarot.com/blog/${slug}`
    }
  };

  return (
    <article className="min-h-screen pt-32 pb-40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full z-[60]" aria-hidden="true">
        <div className="ritual-progress w-1/3 h-1" /> {/* Visual simulation */}
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <header className="mb-20">
          <Link 
            href="/blog" 
            className="font-label text-xs uppercase tracking-[0.2em] text-on-surface/40 hover:text-secondary transition-colors mb-12 inline-block"
            aria-label="Back to all journal entries"
          >
            ← Back to Journal
          </Link>
          <div className="flex items-center gap-4 mb-8">
            <span className="font-label text-xs uppercase tracking-[0.2em] text-tertiary">{post.category}</span>
            <span className="w-1 h-1 rounded-full bg-on-surface/20" aria-hidden="true" />
            <time dateTime={post.date} className="font-label text-xs uppercase tracking-[0.2em] text-on-surface/40">{post.date}</time>
          </div>
          <h1 className="text-5xl md:text-7xl font-display leading-[1.1] italic mb-12">
            {post.title}
          </h1>
        </header>

        <div className="relative aspect-[16/9] bg-surface-container-highest mb-20 overflow-hidden rounded-xl grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl">
          <Image 
            src={post.image} 
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div 
          className="prose prose-invert prose-p:text-xl prose-p:leading-relaxed prose-p:text-on-surface/70 prose-h2:text-4xl prose-h2:font-display prose-h2:italic prose-h2:mt-16 prose-h2:mb-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Post Footer / CTA */}
        <footer className="mt-40 pt-20 border-t border-on-surface/5">
          <Card elevation="high" className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-12 bg-surface-container-low border-none transition-all hover:shadow-2xl">
            <div className="max-w-md">
              <h2 className="text-3xl font-display italic mb-4">Deepen the Inquiry</h2>
              <p className="text-on-surface/60 font-body leading-relaxed">
                If this exploration resonated, consider a private Narrative Deep-Dive session to map your own archetypes and discover hidden stories.
              </p>
            </div>
            <Link href="/readings" passHref>
              <Button variant="primary" size="lg" className="px-10 py-6" aria-label="Book a private reading session">
                Book a Reading
              </Button>
            </Link>
          </Card>
        </footer>
      </div>
    </article>
  );
}
