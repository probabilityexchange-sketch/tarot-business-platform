import type { MetadataRoute } from "next";
import { getPublicPosts } from "@/lib/published-blog";
import { SERVICES, CITIES } from "@/lib/pseo-data";

export const dynamic = "force-dynamic";
const baseUrl = "https://kalimeister.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublicPosts();
  return [
    ...["", "/readings", "/about", "/services", "/courses", "/contact", "/blog"].map((path) => ({ url: `${baseUrl}${path}` })),
    ...posts.map((post) => ({ url: `${baseUrl}/blog/${post.slug}`, lastModified: new Date(post.updatedAt) })),
    ...Object.keys(SERVICES).flatMap((service) => Object.keys(CITIES).map((city) => ({ url: `${baseUrl}/readings/${service}/${city}` }))),
  ];
}
