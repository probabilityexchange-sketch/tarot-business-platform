"use client";
import { useEffect, useState } from "react";
export function MerchPaymentStatus({ sessionId }: { sessionId: string }) {
  const [message, setMessage] = useState("Checking your payment…");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    fetch(`/api/merch/status?session_id=${encodeURIComponent(sessionId)}`).then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      if (active) setMessage(result.paid ? "Your payment is confirmed. Your order is waiting for our review before production. Please keep your Stripe receipt as your payment reference." : "Your payment is not confirmed yet. Please check again shortly; do not pay a second time.");
    }).catch(() => { if (active) setMessage("We’re still confirming your order. Please check again or contact us with your Stripe receipt. Do not pay a second time."); });
    return () => { active = false; };
  }, [sessionId, attempt]);
  return <div className="space-y-6"><p role="status">{message}</p><button onClick={() => setAttempt(attempt + 1)} className="underline">Check again</button><p><a href="/contact" className="underline">Contact us about your order</a></p></div>;
}
