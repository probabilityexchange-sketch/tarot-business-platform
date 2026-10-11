import type { Metadata } from "next";
import { BrandHomepage } from "@/components/BrandHomepage";

export const metadata: Metadata = {
  title: "Kali Meister | Writing, Tarot & Spiritual Work",
  description: "Writing, private tarot readings and spiritual work with Kali Meister. Explore her journal, book a reading, and receive Letters from Kali.",
  alternates: { canonical: "/" },
};

export default function Home() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://kalimeister.com/#person",
    name: "Kali Meister",
    url: "https://kalimeister.com",
    image: "https://kalimeister.com/images/kali-meister.jpg",
    jobTitle: "Writer & Spiritual Practitioner",
    knowsAbout: ["Writing", "Tarot", "Spiritual reflection"],
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><BrandHomepage /></>;
}
