import type { NextConfig } from "next";

const PSEO_SERVICES = [
  "executive-tarot-advising",
  "intuitive-business-consulting",
  "private-tarot-reading",
  "psychic-life-coaching",
  "spiritual-counseling",
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
    ],
  },
  // Redirect clean pSEO URLs to .html files in public/
  async redirects() {
    return PSEO_SERVICES.flatMap((service) => [
      {
        source: `/${service}/:city`,
        destination: `/${service}/:city.html`,
        permanent: true,
      },
    ]);
  },
};

export default nextConfig;
