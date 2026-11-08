import type { Metadata } from "next";
import Link from "next/link";
import { MerchPaymentStatus } from "@/components/MerchPaymentStatus";
import { EmailSignupForm } from "@/components/EmailSignupForm";

export const metadata: Metadata = { title: "Order confirmation | Kali Meister", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function MerchSuccess({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  return (
    <div className="mx-auto max-w-2xl space-y-7 px-6 py-20">
      <h1 className="font-serif text-4xl">Thank you for your order.</h1>
      {session_id ? (
        <>
          <MerchPaymentStatus sessionId={session_id} />
          <section className="rounded-xl border border-[#653c56]/20 bg-[#fcf9f4] p-6">
            <p className="mb-4 text-xs uppercase tracking-[.2em] text-[#744b65]">Go deeper</p>
            <h2 className="font-serif text-3xl">A reading with room for you.</h2>
            <p className="mt-4 leading-relaxed text-[#655b61]">
              Bring a question, a decision or a story you&apos;re ready to explore. Sessions are 60 minutes
              ($250) or 90 minutes ($450), held online.
            </p>
            <Link href="/readings" className="mt-5 inline-flex rounded-full bg-[#653c56] px-6 py-3 text-sm text-white">
              View available times →
            </Link>
            <p className="mt-5 text-xs leading-relaxed text-[#655b61]/80">
              Tarot readings are offered for reflection and personal insight. They don&apos;t predict outcomes and
              aren&apos;t a substitute for medical, mental health, legal or financial advice.
            </p>
          </section>
          <section className="border-t border-[#302731]/15 pt-7">
            <h2 className="font-serif text-3xl">Letters from Kali</h2>
            <p className="mt-3 leading-relaxed text-[#655b61]">
              A free three-part guide to discernment, followed by weekly reflections on fear, ego and intuition.
            </p>
            <EmailSignupForm source="shop-success" className="mt-5" />
          </section>
        </>
      ) : (
        <p>Use the confirmation link from your checkout, or contact us with your Stripe receipt.</p>
      )}
    </div>
  );
}
