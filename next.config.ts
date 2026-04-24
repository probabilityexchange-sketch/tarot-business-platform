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
  // Firebase App Hosting automatically strips .html from public/ files,
  // so /executive-tarot-advising/atlanta.html is served at /executive-tarot-advising/atlanta
  // No redirects needed — adding them causes a .html.html redirect loop
};

export default nextConfig;
