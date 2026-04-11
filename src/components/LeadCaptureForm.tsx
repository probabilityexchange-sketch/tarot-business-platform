"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  source?: string;
  className?: string;
  variant?: "default" | "compact";
};

export function LeadCaptureForm({ source = "homepage", className = "", variant = "default" }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message || "Guide sent! Check your inbox.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Failed to connect. Please try again.");
    }
  };

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 bg-surface-container-high border-none px-4 py-3 rounded-lg font-body text-on-surface placeholder:text-on-surface/40 focus:ring-2 focus:ring-primary/40 outline-none"
          required
        />
        <Button 
          variant="primary" 
          type="submit"
          disabled={status === "loading"}
          className="whitespace-nowrap"
        >
          {status === "loading" ? "Sending..." : "Get Guide"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="w-full bg-surface-container-high border-none p-4 rounded-xl font-body text-on-surface placeholder:text-on-surface/40 focus:ring-2 focus:ring-primary/40 transition-all outline-none"
        required
      />
      <Button 
        variant="primary" 
        size="lg" 
        type="submit"
        disabled={status === "loading"}
        className="w-full"
      >
        {status === "loading" ? "Sending..." : "Get Your Free Guide"}
      </Button>
      
      {message && (
        <p className={`text-sm font-label ${
          status === "success" ? "text-green-400" : 
          status === "error" ? "text-red-400" : "text-on-surface/60"
        }`}>
          {message}
        </p>
      )}
      
      <p className="text-xs text-on-surface/40 font-label">
        No spam. Unsubscribe anytime. Instant delivery.
      </p>
    </form>
  );
}