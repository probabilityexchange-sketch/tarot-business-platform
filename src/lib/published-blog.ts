import { z } from "zod";
import { getAdminDb } from "@/lib/firebase-admin";
import type { BlogPost } from "@/types/blog";

export const postInputSchema = z.object({
  title: z.string().trim().min(1).max(180),
  slug: z.string().trim().min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  content: z.string().min(1).max(200000).refine((value) => value.replace(/<[^>]*>/g, "").trim().length > 0, "Write some content first"),
  excerpt: z.string().trim().min(1).max(1000),
  category: z.string().trim().min(1).max(100),
  coverImageUrl: z.string().max(2000).optional().default("").refine((value) => !value || /^\/(?!\/)/.test(value) || /^https:\/\//.test(value), "Use a local image or HTTPS URL"),
  status: z.enum(["draft", "published"]),
});

export function normalizePost(id: string, value: Record<string, unknown>): BlogPost | null {
  const result = postInputSchema.safeParse(value);
  if (!result.success || result.data.status !== "published" || typeof value.publishedAt !== "string" || !Number.isFinite(Date.parse(value.publishedAt))) return null;
  return { ...result.data, id, publishedAt: new Date(value.publishedAt).toISOString(), createdAt: typeof value.createdAt === "string" ? value.createdAt : value.publishedAt, updatedAt: typeof value.updatedAt === "string" && Number.isFinite(Date.parse(value.updatedAt)) ? new Date(value.updatedAt).toISOString() : value.publishedAt };
}

export async function getPublicPosts() {
  const snapshot = await getAdminDb().collection("blog_posts").where("status", "==", "published").get();
  return snapshot.docs.map((document) => normalizePost(document.id, document.data())).filter((post): post is BlogPost => post !== null).sort((a, b) => Date.parse(b.publishedAt!) - Date.parse(a.publishedAt!));
}

export async function getPublicPost(slug: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  const snapshot = await getAdminDb().collection("blog_posts").where("slug", "==", slug).get();
  return snapshot.docs.map((document) => normalizePost(document.id, document.data())).find((post) => post !== null) || null;
}

export async function savePost(input: unknown, id?: string) {
  const parsed = postInputSchema.safeParse(input);
  if (!parsed.success) return { error: "Check the title, URL slug, excerpt, category and article content.", status: 400 };
  if (id && !/^[A-Za-z0-9_-]+$/.test(id)) return { error: "Invalid post id", status: 400 };
  const posts = getAdminDb().collection("blog_posts");
  const ref = id ? posts.doc(id) : posts.doc();
  return getAdminDb().runTransaction(async (transaction) => {
    const existing = await transaction.get(ref);
    if (id && !existing.exists) return { error: "Post not found", status: 404 };
    const matches = await transaction.get(posts.where("slug", "==", parsed.data.slug));
    if (matches.docs.some((document) => document.id !== ref.id)) return { error: "That URL slug is already in use.", status: 409 };
    const now = new Date().toISOString();
    const previous = existing.data();
    transaction.set(ref, { ...parsed.data, publishedAt: parsed.data.status === "published" ? previous?.publishedAt || now : previous?.publishedAt || null, createdAt: previous?.createdAt || now, updatedAt: now });
    return { id: ref.id, status: 200 };
  });
}

export function safeArticleHtml(html: string) {
  const allowed = new Set(["p", "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "strong", "em", "b", "i", "br", "hr", "a", "img", "pre", "code"]);
  return html.replace(/<(script|style|iframe|object|svg|math)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "").replace(/<!--[\s\S]*?-->/g, "").split(/(<[^>]*>)/g).map((part) => {
    if (!part.startsWith("<")) return part.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const match = part.match(/^<(\/?)([a-z0-9]+)(?:\s[^>]*)?\/?\s*>$/i);
    if (!match || !allowed.has(match[2].toLowerCase())) return "";
    const tag = match[2].toLowerCase();
    if (match[1]) return `</${tag}>`;
    if (tag === "img") {
      const source = part.match(/\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
      const url = source?.[1] ?? source?.[2] ?? "";
      if (!/^(https:\/\/|\/(?!\/))/i.test(url) || /[\u0000-\u0020]/.test(url)) return "";
      return `<img src="${url.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}" alt="" loading="lazy">`;
    }
    if (tag === "a") {
      const href = part.match(/\shref\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
      const url = href?.[1] ?? href?.[2] ?? "";
      if (!/^(https?:\/\/|\/(?!\/)|#)/i.test(url) || /[\u0000-\u0020]/.test(url)) return "<a>";
      return `<a href="${url.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}" rel="noopener noreferrer">`;
    }
    return `<${tag}>`;
  }).join("");
}
