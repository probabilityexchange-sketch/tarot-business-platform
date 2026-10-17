import type { Metadata } from "next";
import { BrandHomepage } from "@/components/BrandHomepage";

export const metadata: Metadata = { title: "Homepage design preview | Kali Meister", robots: { index: false, follow: false } };

export default function HomepagePreview() {
  return <BrandHomepage preview illustrated />;
}
