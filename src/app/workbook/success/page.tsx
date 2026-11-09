"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmailSignupForm } from "@/components/EmailSignupForm";
import { pushEvent } from "@/lib/analytics";
import { workbookProduct } from "@/lib/workbook";

function WorkbookSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"idle" | "ready" | "error">("idle");
  const purchaseTracked = useRef(false);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }
    setStatus("ready");
    if (!purchaseTracked.current) {
      purchaseTracked.current = true;
      pushEvent("purchase", { transaction_id: sessionId, value: 39, currency: "usd" });
    }
  }, [sessionId]);

  if (status === "idle") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-12">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-8" />
        <h1 className="text-3xl font-display italic text-on-surface">Preparing Your Download...</h1>
      </div>
    );
  }

  if (status === "error" || !sessionId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-12">
        <h1 className="text-4xl font-display italic text-error mb-6">Download Reference Missing</h1>
        <p className="text-on-surface/60 max-w-md mb-8">
          This page needs the reference from a completed checkout. If Stripe shows a payment, please do not pay again. Contact Kali with your receipt.
        </p>
        <Button variant="primary" onClick={() => (window.location.href = "/workbook")}>
          Back to the workbook
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:px-12">
      <header className="mb-12 text-center">
        <p className="mb-5 text-xs uppercase tracking-[.2em] text-primary">Payment received</p>
        <h1 className="mb-6 font-serif text-5xl leading-tight">Your workbook is ready.</h1>
        <p className="mx-auto max-w-xl text-lg leading-relaxed text-on-surface/70">
          {workbookProduct.title}. Download your copy below — the link is verified against your payment.
        </p>
      </header>

      <div className="rounded-2xl bg-surface-container-low p-8 text-center">
        <a
          href={`/api/workbook/download?session_id=${encodeURIComponent(sessionId)}`}
          className="inline-flex items-center justify-center rounded-[0.5rem] bg-primary px-10 py-6 font-label text-lg uppercase tracking-[0.05em] text-on-primary-fixed transition-all duration-250 ease-snappy hover:bg-primary/90"
        >
          Download the workbook (PDF)
        </a>
        <p className="mt-4 text-xs leading-relaxed text-on-surface/50">
          A printable PDF. Use a notebook for your responses, and save a personal copy before you begin.
        </p>
      </div>

      <section className="mt-14">
        <h2 className="mb-4 font-serif text-3xl">Keep the practice going — Letters from Kali</h2>
        <p className="mb-6 max-w-xl leading-relaxed text-on-surface/70">
          A free three-part discernment guide, a welcome letter and weekly reflections on fear, ego and intuition.
        </p>
        <div className="max-w-xl">
          <EmailSignupForm source="workbook-buyer" />
        </div>
      </section>

      <section className="mt-14 rounded-2xl bg-surface-container-low p-8 text-center">
        <h2 className="mb-4 font-serif text-3xl">Take the question further — a reading with room for you.</h2>
        <p className="mx-auto mb-6 max-w-md leading-relaxed text-on-surface/70">
          A private online reading gives the question an hour of tarot, conversation and reflection.
        </p>
        <Link href="/readings" className="underline underline-offset-4">Book a reading →</Link>
        <p className="mt-6 text-xs leading-relaxed text-on-surface/50">{"Tarot readings are offered for reflection and personal insight. They don't predict outcomes and aren't a substitute for medical, mental health, legal or financial advice."}</p>
      </section>
    </div>
  );
}

export default function WorkbookSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-12">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-8" />
          <h1 className="text-3xl font-display italic text-on-surface">Loading...</h1>
        </div>
      }
    >
      <WorkbookSuccessContent />
    </Suspense>
  );
}
