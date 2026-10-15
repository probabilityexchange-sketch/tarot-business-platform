import type { NextConfig } from "next";
import { cityRedirects } from "./src/lib/city-pages";

const legacyHtmlRedirects = [
  { source: "/about.html", target: "/about" },
  { source: "/contact.html", target: "/contact" },
  { source: "/services.html", target: "/services" },
  { source: "/funnel.html", target: "/funnel" },
  { source: "/index.html", target: "/" },
];

const redirects = async () => {
  return [
    ...cityRedirects(),
    { source: "/index", destination: "/", permanent: true as const },
    ...legacyHtmlRedirects.map(({ source, target }) => ({ source, destination: target, permanent: true as const })),
  ];
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
