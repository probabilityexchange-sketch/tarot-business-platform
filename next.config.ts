import type { NextConfig } from 'next';
import { SERVICES, CITIES } from "@/lib/pseo-data";

const legacyCityRedirects = [
  { source: "la", target: "los-angeles-ca" },
  { source: "sf", target: "san-francisco-ca" },
  { source: "nyc", target: "new-york-ny" },
];

const redirects = async () => {
  const entries: Array<{ source: string; destination: string; permanent: true }> = [];

  for (const { source, target } of legacyCityRedirects) {
    for (const service of Object.keys(SERVICES)) {
      entries.push({
        source: `/readings/${service}/${source}`,
        destination: `/readings/${service}/${target}`,
        permanent: true,
      });
    }
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
