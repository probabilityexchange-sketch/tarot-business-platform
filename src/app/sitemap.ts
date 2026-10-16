import type { MetadataRoute } from "next";
import { getPublicPosts } from "@/lib/published-blog";
import { getCityReadingPath, retainedTarotCities } from "@/lib/city-pages";

export const dynamic = "force-dynamic";
const baseUrl = "https://kalimeister.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublicPosts();
  return [
    ...["", "/readings", "/about", "/services", "/courses", "/contact", "/blog", "/letters"].map((path) => ({ url: `${baseUrl}${path}` })),
    ...posts.map((post) => ({ url: `${baseUrl}/blog/${post.slug}`, lastModified: new Date(post.updatedAt) })),
    ...Object.keys(retainedTarotCities).map((city) => ({ url: `${baseUrl}${getCityReadingPath(city)}` })),
  ];
}
