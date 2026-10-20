import type { Metadata } from "next";
import { MerchPaymentStatus } from "@/components/MerchPaymentStatus";
export const metadata: Metadata = { title: "Order confirmation | Kali Meister", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default async function MerchSuccess({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  return <div className="mx-auto max-w-2xl space-y-7 px-6 py-20"><h1 className="font-serif text-4xl">Thank you for your order.</h1>{session_id ? <MerchPaymentStatus sessionId={session_id} /> : <p>Use the confirmation link from your checkout, or contact us with your Stripe receipt.</p>}</div>;
}
