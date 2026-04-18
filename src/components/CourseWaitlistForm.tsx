"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CourseWaitlistForm() {
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
      const response = await fetch("/api/course-waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join waitlist");
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
    <form className="flex flex-col sm:flex-row gap-4" onSubmit={handleSubmit}>
      <input 
        type="email"
        placeholder="YOUR_EMAIL@VOICE.COM"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === "loading" || status === "success"}
        className="bg-surface-container-highest border-none p-4 rounded-full flex-grow font-label text-sm uppercase tracking-widest focus:ring-1 focus:ring-secondary/40 transition-all outline-none disabled:opacity-50"
        required
      />
      <Button 
        variant="primary" 
        className="px-12 whitespace-nowrap py-4"
        disabled={status === "loading" || status === "success"}
        type="submit"
      >
        {status === "loading" && "Joining..."}
        {status === "success" && "✓ Added!"}
        {status === "error" && "Try again"}
        {status === "idle" && "Join Waitlist"}
      </Button>
      {errorMessage && (
        <p className="text-sm text-error w-full">{errorMessage}</p>
      )}
    </form>
  );
}
