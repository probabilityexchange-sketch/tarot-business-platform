"use client";

import { useId, useState } from "react";

export function EmailSignupForm({ source = "homepage", label = "Get the free guide", className = "" }: { source?: string; label?: string; className?: string }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, consent, source, website }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to sign up. Please try again.");
      setMessage(data.message);
      setStatus("success");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to connect. Please try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <label htmlFor={`${id}-email`} className="block text-sm">Email address</label>
      <input id={`${id}-email`} type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} disabled={status === "loading" || status === "success"} placeholder="you@example.com" className="w-full rounded-lg border border-current/25 bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-current" />
      <label className="flex items-start gap-3 text-sm leading-relaxed">
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required className="mt-1 h-4 w-4 shrink-0" />
        <span>I’d like Kali’s free guide and occasional emails about her writing, readings, events and shop news. I can unsubscribe anytime.</span>
      </label>
      <label className="hidden" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></label>
      <button type="submit" disabled={!consent || status === "loading" || status === "success"} className="w-full rounded-lg bg-[#653c56] px-5 py-3 text-white transition-opacity hover:opacity-90 disabled:opacity-60">{status === "loading" ? "Sending…" : status === "success" ? "Check your inbox" : label}</button>
      {message && <p role={status === "error" ? "alert" : "status"} className="text-sm leading-relaxed">{message}</p>}
    </form>
  );
}
