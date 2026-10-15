import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicPost, safeArticleHtml } from "@/lib/published-blog";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicPost(slug);
  if (!post) notFound();
  return { title: `${post.title} | Kali Meister`, description: post.excerpt, alternates: { canonical: `/blog/${slug}` }, authors: [{ name: "Kali Meister", url: "https://kalimeister.com/about" }], openGraph: { title: post.title, description: post.excerpt, url: `/blog/${slug}`, type: "article", publishedTime: post.publishedAt!, modifiedTime: post.updatedAt, ...(post.coverImageUrl ? { images: [{ url: post.coverImageUrl, alt: post.title }] } : {}) } };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublicPost(slug);
  if (!post) notFound();
  const schema = { "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: post.excerpt, datePublished: post.publishedAt, dateModified: post.updatedAt, author: { "@type": "Person", "@id": "https://kalimeister.com/#person", name: "Kali Meister", url: "https://kalimeister.com/about" }, mainEntityOfPage: `https://kalimeister.com/blog/${post.slug}`, ...(post.coverImageUrl ? { image: new URL(post.coverImageUrl, "https://kalimeister.com").href } : {}) };
  return <article className="mx-auto max-w-3xl px-6 py-20">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <Link href="/blog" className="mb-8 inline-block underline underline-offset-4">← Back to the journal</Link>
    <p className="mb-5 text-sm text-primary">{post.category} · <time dateTime={post.publishedAt!}>{new Date(post.publishedAt!).toLocaleDateString("en-US", { dateStyle: "long", timeZone: "America/New_York" })}</time></p>
    <h1 className="mb-6 font-serif text-4xl leading-tight sm:text-6xl">{post.title}</h1>
    <p className="mb-8">By <Link href="/about" className="underline">Kali Meister</Link></p>
    {post.coverImageUrl && <img src={post.coverImageUrl} alt={post.title} className="mb-10 h-auto w-full rounded-xl" />}
    <div className="text-lg leading-relaxed [&_p]:mb-6 [&_h2]:mb-5 [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-3xl [&_h3]:mb-4 [&_h3]:mt-8 [&_h3]:font-serif [&_h3]:text-2xl [&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:underline [&_blockquote]:my-8 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-6 [&_blockquote]:italic" dangerouslySetInnerHTML={{ __html: safeArticleHtml(post.content) }} />
    <footer className="mt-14 border-t border-on-surface/15 pt-8"><h2 className="mb-4 font-serif text-3xl">Keep the conversation going.</h2><p className="mb-5">Receive Letters from Kali for more writing and reflection prompts.</p><Link href="/#letters" className="underline underline-offset-4">Join the letters →</Link></footer>
  </article>;
}
