import type { Metadata } from "next";
import { LettersContent } from "@/components/LettersContent";

const description = "Begin with a free three-part guide to discernment. Receive writing and reflection from Kali Meister on fear, ego and intuition.";

export const metadata: Metadata = {
  title: "Letters from Kali | A Free Guide to Discernment",
  description,
  alternates: { canonical: "/letters" },
  openGraph: { title: "A strong feeling is a place to begin.", description, url: "/letters", type: "website" },
  twitter: { card: "summary_large_image", title: "Letters from Kali", description },
};


export default function LettersPage() {
  return <LettersContent />;
}
