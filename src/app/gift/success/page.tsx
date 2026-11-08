"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { pushEvent } from "@/lib/analytics";

type GiftReady = {
  code: string;
  tierTitle: string;
  priceCents: number;
};

function GiftSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "ready" | "unpaid" | "error">("loading");
  const [gift, setGift] = useState<GiftReady | null>(null);
  const purchaseTracked = useRef(false);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }
    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function poll() {
      try {
        const response = await fetch(`/api/gift/status?session_id=${encodeURIComponent(sessionId ?? "")}`);
        const data = (await response.json()) as {
          status?: string;
          code?: string;
          tierTitle?: string;
          priceCents?: number;
        };
        if (cancelled) return;
        if (response.ok && data.status === "ready" && data.code && data.tierTitle && typeof data.priceCents === "number") {
          setGift({ code: data.code, tierTitle: data.tierTitle, priceCents: data.priceCents });
          setStatus("ready");
          if (!purchaseTracked.current) {
            purchaseTracked.current = true;
            pushEvent("purchase", { transaction_id: sessionId, value: data.priceCents / 100, currency: "usd" });
          }
          return;
        }
        if (response.ok && data.status === "unpaid") {
          setStatus("unpaid");
          return;
        }
        if (response.status === 400 || response.status === 403) {
          setStatus("error");
          return;
        }
        throw new Error("Gift status temporarily unavailable");
      } catch {
        if (cancelled) return;
        attempts += 1;
        if (attempts >= 5) {
          setStatus("error");
          return;
        }
        timer = setTimeout(() => void poll(), 2000);
      }
    }

    void poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-12">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-8" />
        <h1 className="text-3xl font-display italic text-on-surface">Preparing Your Gift...</h1>
      </div>
    );
  }

  if (status === "unpaid") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-12">
        <h1 className="text-4xl font-display italic text-on-surface mb-6">Payment Not Completed</h1>
        <p className="text-on-surface/60 max-w-md mb-8">
          That payment wasn&apos;t completed, so no gift code was created. Nothing was charged — you can start again whenever you&apos;re ready.
        </p>
        <Button variant="primary" onClick={() => (window.location.href = "/gift")}>
          Back to gift readings
        </Button>
      </div>
    );
  }

  if (status === "error" || !gift) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-12">
        <h1 className="text-4xl font-display italic text-error mb-6">Gift Reference Missing</h1>
        <p className="text-on-surface/60 max-w-md mb-8">
          This page needs the reference from a completed checkout. If Stripe shows a payment, please do not pay again. Contact Kali with your receipt.
        </p>
        <Button variant="primary" onClick={() => (window.location.href = "/gift")}>
          Back to gift readings
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:px-12">
      <header className="mb-12 text-center">
        <p className="mb-5 text-xs uppercase tracking-[.2em] text-primary">Payment received</p>
        <h1 className="mb-6 font-serif text-5xl leading-tight">Your gift is ready.</h1>
        <p className="mx-auto max-w-xl text-lg leading-relaxed text-on-surface/70">
          {gift.tierTitle} — ${(gift.priceCents / 100).toFixed(0)}. The code below takes the gift amount off any reading the recipient books.
        </p>
      </header>

      <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-10 text-center">
        <p className="mb-4 font-label text-xs uppercase tracking-[0.2em] text-secondary">Gift code</p>
        <p className="font-serif text-4xl tracking-widest text-on-surface">{gift.code}</p>
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-on-surface/70">
          A printable gift note is on its way to the purchaser&apos;s inbox. You can also share this code directly — the recipient enters it at checkout when they book.
        </p>
      </div>

      <div className="mt-14 space-y-4 border-t border-current/15 pt-8 text-center">
        <p><Link href="/" className="underline underline-offset-4">Back to kalimeister.com →</Link></p>
        <p className="text-xs leading-relaxed text-on-surface/50">{"Tarot readings are offered for reflection and personal insight. They don't predict outcomes and aren't a substitute for medical, mental health, legal or financial advice."}</p>
      </div>
    </div>
  );
}

export default function GiftSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-12">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-8" />
          <h1 className="text-3xl font-display italic text-on-surface">Loading...</h1>
        </div>
      }
    >
      <GiftSuccessContent />
    </Suspense>
  );
}
