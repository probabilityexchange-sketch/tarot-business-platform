"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [offeringId, setOfferingId] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/verify-session?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            setStatus("success");
            setOfferingId(data.offeringId);
          } else {
            setStatus("error");
          }
        })
        .catch(() => setStatus("error"));
    }
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-12">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-8" />
        <h1 className="text-3xl font-display italic text-on-surface">Verifying the Ritual...</h1>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-12">
        <h1 className="text-4xl font-display italic text-error mb-6">Verification Fragmented</h1>
        <p className="text-on-surface/60 max-w-md mb-8">We couldn't verify your payment session. If you believe this is an error, please contact support.</p>
        <Button variant="secondary" onClick={() => window.location.href = "/readings"}>
          Return to Readings
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-20 text-center">
          <span className="font-label text-xs uppercase tracking-[0.2em] text-tertiary mb-6 block">Payment Secured</span>
          <h1 className="text-5xl md:text-7xl font-display mb-8 leading-[1.1]">
            Step Two: <br />
            <span className="text-primary italic">Manifest Your Time</span>
          </h1>
          <p className="text-xl text-on-surface/60 max-w-2xl mx-auto font-body leading-relaxed">
            Your commitment is recognized. Use the calendar below to select a time for our archetypal deep-dive.
          </p>
        </header>

        <Card surface="high" className="p-0 overflow-hidden border-none bg-surface-container-highest/30 backdrop-blur-xl">
          <div className="aspect-[16/10] w-full bg-surface-container-lowest">
            {/* 
              Placeholder for Cal.com Embed. 
              In production, you would use the @calcom/embed-react library or an iframe.
              We'll use an iframe placeholder for the visual feel.
            */}
            <div className="w-full h-full flex items-center justify-center text-on-surface/20 font-label uppercase tracking-widest text-sm italic">
              [ Cal.com Secure Scheduler Loading... ]
            </div>
          </div>
        </Card>

        <div className="mt-20 text-center text-on-surface/40 font-label text-xs uppercase tracking-widest">
          A confirmation email has been sent to your inbox with these details.
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-12">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-8" />
        <h1 className="text-3xl font-display italic text-on-surface">Initializing...</h1>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
