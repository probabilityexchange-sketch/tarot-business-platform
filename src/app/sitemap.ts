import { MetadataRoute } from "next";
import { getAllPublishedSlugs } from "@/lib/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPublishedSlugs();
  
  return [
    {
      url: "https://psychologicaltarot.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://psychologicaltarot.com/blog",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...posts.map((post) => ({
      url: `https://psychologicaltarot.com/blog/${post.slug}`,
      lastModified: new Date(post.lastmod || Date.now()),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
