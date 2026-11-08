"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { pushEvent } from "@/lib/analytics";

type GiftBuyButtonProps = {
  tierId: string;
  label: string;
  value: number;
};

export function GiftBuyButton({ tierId, label, value }: GiftBuyButtonProps) {
  const [purchaseId] = useState(() => crypto.randomUUID());
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleBuy() {
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/gift/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId, purchaseId }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Unable to start checkout. Please try again.");
      }
      pushEvent("begin_checkout", { value, currency: "usd", items: 1 });
      window.location.href = data.url;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to connect. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div>
      <Button variant="primary" className="w-full py-6 text-lg" onClick={() => void handleBuy()} disabled={status === "loading"}>
        {status === "loading" ? "Preparing checkout…" : label}
      </Button>
      {message ? <p role="alert" className="mt-3 text-sm text-error">{message}</p> : null}
    </div>
  );
}
