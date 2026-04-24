import { MetadataRoute } from "next";
import { getAllPublishedSlugs } from "@/lib/blog";

const PSEO_SERVICES = [
  "executive-tarot-advising",
  "intuitive-business-consulting",
  "private-tarot-reading",
  "psychic-life-coaching",
  "spiritual-counseling",
] as const;

const PSEO_CITIES = [
  "aspen",
  "atlanta",
  "austin",
  "beverly-hills",
  "boston",
  "chicago",
  "dallas",
  "greenwich",
  "houston",
  "jackson-hole",
  "la",
  "malibu",
  "miami",
  "nashville",
  "nyc",
  "palm-beach",
  "santa-monica",
  "scarsdale",
  "seattle",
  "sf",
] as const;

const BASE_URL = "https://kalimeister.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let posts: { slug: string; lastmod?: string }[] = [];
  try {
    posts = await getAllPublishedSlugs();
  } catch {
    // Blog may not be configured yet
  }

  const pseoEntries: MetadataRoute.Sitemap = PSEO_SERVICES.flatMap(
    (service) =>
      PSEO_CITIES.map((city) => ({
        url: `${BASE_URL}/${service}/${city}`,
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
