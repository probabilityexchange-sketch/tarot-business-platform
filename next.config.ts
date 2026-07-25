import type { NextConfig } from 'next';
import { SERVICES, CITIES } from "@/lib/pseo-data";

const legacyCityRedirects = [
  { source: "la", target: "los-angeles-ca" },
  { source: "sf", target: "san-francisco-ca" },
  { source: "nyc", target: "new-york-ny" },
];

const legacyHtmlRedirects = [
  { source: "/about.html", target: "/about" },
  { source: "/contact.html", target: "/contact" },
  { source: "/services.html", target: "/services" },
  { source: "/funnel.html", target: "/funnel" },
  { source: "/index.html", target: "/" },
];

const redirects = async () => {
  const entries: Array<{ source: string; destination: string; permanent: true }> = [];

  for (const citySlug of Object.keys(CITIES)) {
    entries.push({
      source: `/${citySlug}`,
      destination: `/readings/tarot-reading/${citySlug}`,
      permanent: true,
    });
  }
  entries.push({
    source: "/index",
    destination: "/",
    permanent: true,
  });

  for (const { source, target } of legacyCityRedirects) {
    for (const service of Object.keys(SERVICES)) {
      entries.push({
        source: `/readings/${service}/${source}`,
        destination: `/readings/${service}/${target}`,
        permanent: true,
      });
    }
  }

  for (const { source, target } of legacyHtmlRedirects) {
    entries.push({ source, destination: target, permanent: true });
  }

  return entries;
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
    ],
  },
  async redirects() {
    return await redirects();
  },
};

export default nextConfig;
