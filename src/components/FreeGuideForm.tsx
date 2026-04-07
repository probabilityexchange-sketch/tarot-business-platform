"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function FreeGuideForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setErrorMessage("Please enter your email");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/free-guide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send guide");
      }

      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
      setStatus("error");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading" || status === "success"}
          className="w-full bg-surface-container-high border-none p-4 rounded-xl font-body text-on-surface placeholder:text-on-surface/40 focus:ring-2 focus:ring-primary/40 transition-all outline-none disabled:opacity-50"
          required
        />
      </div>
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        disabled={status === "loading" || status === "success"}
        type="submit"
      >
        {status === "loading" && "Sending..."}
        {status === "success" && "✓ Sent! Check your email"}
        {status === "error" && "Try again"}
        {status === "idle" && "Get Your Free Guide"}
      </Button>
      {errorMessage && (
        <p className="text-sm text-error">{errorMessage}</p>
      )}
      <p className="text-xs text-on-surface/40 font-label">
        No spam. Unsubscribe anytime. Instant delivery.
      </p>
    </form>
  );
}
