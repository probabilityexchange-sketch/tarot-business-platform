"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type BookingResponse = {
  status: "success";
  booking: {
    customerName: string;
    customerEmail: string;
    customerTimezone: string;
    scheduledAt: string;
    durationMinutes: number;
    priceCents: number;
    calComEventId?: string;
  };
};

function formatBookingTime(value: string, timeZone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(new Date(value));
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [booking, setBooking] = useState<BookingResponse["booking"] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const confirmBooking = useCallback(async () => {
    if (!sessionId) {
      setErrorMessage("Missing booking session reference.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    const response = await fetch("/api/bookings/confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId }),
    });

    const data = (await response.json()) as BookingResponse | { error?: string };

    if (!response.ok || !("booking" in data)) {
      setErrorMessage("We couldn't confirm the booking yet.");
      setStatus("error");
      return;
    }

    setBooking(data.booking);
    setStatus("success");
  }, [sessionId]);

  useEffect(() => {
    void confirmBooking();
  }, [confirmBooking]);

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-12">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-8" />
        <h1 className="text-3xl font-display italic text-on-surface">Confirming Your Booking...</h1>
      </div>
    );
  }

  if (status === "error" || !booking) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-12">
        <h1 className="text-4xl font-display italic text-error mb-6">Booking Needs Attention</h1>
        <p className="text-on-surface/60 max-w-md mb-8">
          {errorMessage ?? "We couldn't confirm your booking automatically. Try again in a moment."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="primary" onClick={() => void confirmBooking()}>
            Retry confirmation
          </Button>
          <Button variant="secondary" onClick={() => (window.location.href = "/readings")}>
            Return to Readings
          </Button>
        </div>
        {sessionId ? (
          <p className="mt-8 text-xs uppercase tracking-[0.2em] text-tertiary font-label break-all">
            Reference {sessionId}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16 text-center">
          <span className="font-label text-xs uppercase tracking-[0.2em] text-tertiary mb-6 block">
            Payment Secured
          </span>
          <h1 className="text-5xl md:text-7xl font-display mb-8 leading-[1.1]">
            Your Session Is <br />
            <span className="text-primary italic">Confirmed</span>
          </h1>
          <p className="text-xl text-on-surface/60 max-w-2xl mx-auto font-body leading-relaxed">
            A confirmation has been sent to {booking.customerEmail}. Your reserved time is below.
          </p>
        </header>

        <Card surface="high" className="border-none p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10">
            <div className="space-y-4">
              <span className="font-label text-xs uppercase tracking-[0.2em] text-tertiary">Session Details</span>
              <h2 className="text-4xl font-display italic text-on-surface">
                {formatBookingTime(booking.scheduledAt, booking.customerTimezone)}
              </h2>
              <p className="text-on-surface/60 font-body leading-relaxed">
                Duration: {booking.durationMinutes} minutes
              </p>
              <p className="text-on-surface/60 font-body leading-relaxed">
                Timezone: {booking.customerTimezone}
              </p>
              <p className="text-on-surface/60 font-body leading-relaxed">
                Payment: ${(booking.priceCents / 100).toFixed(2)}
              </p>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl bg-surface-container-low p-6">
                <p className="text-sm font-label uppercase tracking-widest text-secondary mb-2">What happens next</p>
                <p className="text-on-surface/70 font-body leading-relaxed">
                  You&apos;re booked. If you don&apos;t see the email, check spam first. If you need to reschedule,
                  use the confirmation email before the cancellation deadline.
                </p>
              </div>

              <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-6">
                <p className="text-sm font-label uppercase tracking-widest text-secondary mb-2">Booking Reference</p>
                <p className="text-on-surface/70 font-mono text-sm break-all">{booking.calComEventId ?? sessionId}</p>
              </div>

              <Button variant="primary" className="w-full" onClick={() => (window.location.href = "/readings")}>
                Return to Readings
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-12">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-8" />
          <h1 className="text-3xl font-display italic text-on-surface">Initializing...</h1>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
