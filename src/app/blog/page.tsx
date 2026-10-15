import type { Metadata } from "next";
import Link from "next/link";
import { getPublicPosts } from "@/lib/published-blog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Writing & Spiritual Reflection | Kali Meister’s Journal",
  description: "Writing from Kali Meister on discernment, intuition, tarot and spiritual reflection.",
  alternates: { canonical: "/blog" },
  openGraph: { title: "Kali Meister’s Journal", description: "Writing, discernment and spiritual reflection with Kali Meister.", url: "/blog", type: "website" },
};

export default async function BlogPage() {
  const posts = await getPublicPosts();
  return <div className="mx-auto max-w-6xl px-6 py-20 lg:px-12">
    <p className="mb-5 text-xs uppercase tracking-[.2em] text-primary">Writing from Kali</p>
    <h1 className="mb-7 font-serif text-5xl sm:text-7xl">The Journal</h1>
    <p className="mb-14 max-w-2xl text-lg leading-relaxed text-on-surface/70">A place for writing, questions and spiritual reflection. Explore discernment, intuition and the stories we tell about our lives.</p>
    {posts.length ? <div className="grid gap-8 md:grid-cols-2">{posts.map((post) => <article key={post.id} className="rounded-2xl border border-on-surface/15 bg-surface-container-low p-8">
      <p className="mb-4 text-sm text-primary">{post.category} · <time dateTime={post.publishedAt!}>{new Date(post.publishedAt!).toLocaleDateString("en-US", { dateStyle: "long", timeZone: "America/New_York" })}</time></p>
      <h2 className="mb-4 font-serif text-3xl"><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2>
      <p className="mb-6 leading-relaxed text-on-surface/70">{post.excerpt}</p><Link href={`/blog/${post.slug}`} className="underline underline-offset-4">Read the article →</Link>
    </article>)}</div> : <section className="rounded-2xl bg-surface-container-low p-8"><h2 className="mb-4 font-serif text-3xl">New writing is on its way.</h2><p className="mb-6 leading-relaxed">For now, receive Kali’s discernment letters and reflection prompts in your inbox.</p><Link href="/#letters" className="underline underline-offset-4">Join Letters from Kali →</Link></section>}
  </div>;
}
