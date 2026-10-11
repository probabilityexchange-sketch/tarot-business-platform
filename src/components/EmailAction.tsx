"use client";

import { useState } from "react";

export function EmailAction({ token, action }: { token: string; action: "confirm" | "unsubscribe" }) {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  async function submit() {
    setStatus("loading");
    try {
      const response = await fetch(`/api/email/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setStatus("success");
      setMessage(action === "confirm" ? "You’re subscribed. Your guide is on its way. Check your inbox and spam folder." : "You have been unsubscribed from Kali’s emails.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to connect. Please try again.");
    }
  }
  return <div className="space-y-5"><button onClick={() => void submit()} disabled={!token || status === "loading" || status === "success"} className="rounded-lg bg-primary px-6 py-3 text-on-primary-fixed disabled:opacity-50">{status === "loading" ? "Working…" : action === "confirm" ? "Confirm my email" : "Unsubscribe"}</button><p role="status">{message}</p><a href="/contact" className="underline">Contact Kali</a></div>;
}
