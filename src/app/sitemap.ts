import { MetadataRoute } from "next";
import { getAllPublishedSlugs } from "@/lib/blog";

const PSEO_SERVICES = [
  "tarot-reading",
  "astrology-reading",
  "lenormand-reading",
  "oracle-reading",
  "channeling-session",
] as const;

const PSEO_CITIES = [
  "albuquerque-nm",
  "arlington-tx",
  "atlanta-ga",
  "austin-tx",
  "baltimore-md",
  "boston-ma",
  "charlotte-nc",
  "chicago-il",
  "cleveland-oh",
  "colorado-springs-co",
  "columbus-oh",
  "dallas-tx",
  "denver-co",
  "el-paso-tx",
  "fort-worth-tx",
  "fresno-ca",
  "houston-tx",
  "indianapolis-in",
  "jacksonville-fl",
  "kansas-city-mo",
  "las-vegas-nv",
  "long-beach-ca",
  "los-angeles-ca",
  "louisville-ky",
  "memphis-tn",
  "mesa-az",
  "miami-fl",
  "milwaukee-wi",
  "minneapolis-mn",
  "nashville-tn",
  "new-orleans-la",
  "new-york-ny",
  "oakland-ca",
  "oklahoma-city-ok",
  "omaha-ne",
  "philadelphia-pa",
  "phoenix-az",
  "portland-or",
  "raleigh-nc",
  "sacramento-ca",
  "san-antonio-tx",
  "san-diego-ca",
  "san-francisco-ca",
  "seattle-wa",
  "tampa-fl",
  "tucson-az",
  "tulsa-ok",
  "virginia-beach-va",
  "washington-dc",
  "wichita-ks",
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
