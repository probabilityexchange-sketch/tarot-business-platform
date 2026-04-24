import type { NextConfig } from "next";

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
  // Rewrite clean pSEO URLs to the .html files in public/
  // e.g. /executive-tarot-advising/atlanta -> /executive-tarot-advising/atlanta.html
  async rewrites() {
    const services = [
      "executive-tarot-advising",
      "intuitive-business-consulting",
      "private-tarot-reading",
      "psychic-life-coaching",
      "spiritual-counseling",
    ];
    return services.map((service) => ({
      source: `/${service}/:city`,
      destination: `/${service}/:city.html`,
    }));
  },
};

export default nextConfig;
