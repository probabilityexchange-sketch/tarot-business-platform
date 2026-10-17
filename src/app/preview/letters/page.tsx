import type { Metadata } from "next";
import { LettersContent } from "@/components/LettersContent";

export const metadata: Metadata = {
  title: "Letters illustration preview | Kali Meister",
  robots: { index: false, follow: false },
};

export default function LettersArtPreview() {
  return <><div className="bg-[#653c56] px-6 py-2 text-center text-xs text-[#f5f0e8]">Design preview · Journal &amp; botanical illustration</div><LettersContent illustrated /></>;
}
