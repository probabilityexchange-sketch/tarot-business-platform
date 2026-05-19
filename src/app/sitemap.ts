import { MetadataRoute } from "next";
import { getAllPublishedSlugs } from "@/lib/blog";
import { SERVICES, CITIES } from "@/lib/pseo-data";

const BASE_URL = "https://kalimeister.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let posts: { slug: string; lastmod?: string }[] = [];
  try {
    posts = await getAllPublishedSlugs();
  } catch {
    // Blog may not be configured yet
  }

  const services = Object.keys(SERVICES);
  const cities = Object.keys(CITIES);

  const pseoEntries: MetadataRoute.Sitemap = services.flatMap((service) =>
    cities.map((city) => ({
      url: `${BASE_URL}/readings/${service}/${city}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  );

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/readings`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/courses`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.lastmod || Date.now()),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...pseoEntries,
  ];
}
