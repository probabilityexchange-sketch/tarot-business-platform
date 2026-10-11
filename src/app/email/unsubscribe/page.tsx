import type { Metadata } from "next";
import { EmailAction } from "@/components/EmailAction";

export const metadata: Metadata = { title: "Unsubscribe from emails | Kali Meister", robots: { index: false, follow: false } };

export default async function EmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <section className="mx-auto max-w-xl px-6 py-24 space-y-8"><h1 className="text-4xl font-display">Unsubscribe from emails</h1><EmailAction token={token || ""} action="unsubscribe" /></section>;
}
