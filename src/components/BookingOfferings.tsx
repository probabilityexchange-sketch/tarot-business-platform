"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Offering } from "@/lib/offerings";

type Slot = {
  start: string;
  end: string;
  available: boolean;
};

type CalComEventTypeSummary = {
  id: number;
  title: string;
  slug: string;
  lengthInMinutes: number;
  hidden?: boolean;
};

type Props = {
  offerings: Offering[];
};

function parseDurationMinutes(duration: string): number {
  const match = duration.match(/\d+/);
  if (!match) {
    throw new Error("Invalid offering duration");
  }

  return Number.parseInt(match[0], 10);
}

function formatSlotTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function BookingOfferings({ offerings }: Props) {
  const [selectedOfferingId, setSelectedOfferingId] = useState(offerings[0]?.id ?? "");
  const selectedOffering = useMemo(
    () => offerings.find((offering) => offering.id === selectedOfferingId) ?? offerings[0],
    [offerings, selectedOfferingId]
  );
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [calComEventTypes, setCalComEventTypes] = useState<CalComEventTypeSummary[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerTimezone, setCustomerTimezone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    setCustomerTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedOffering) {
        return;
      }

      setSlotsLoading(true);
      setSlotsError(null);
      setSelectedSlot("");

      try {
        const durationMinutes = parseDurationMinutes(selectedOffering.duration);
        const response = await fetch(
          `/api/availability?duration=${durationMinutes}&title=${encodeURIComponent(selectedOffering.title)}`
        );
        const data = await response.json();

        if (!response.ok) {
          if (Array.isArray(data.calComEventTypes)) {
            setCalComEventTypes(data.calComEventTypes as CalComEventTypeSummary[]);
          } else {
            setCalComEventTypes([]);
          }
          throw new Error(data.error || "Failed to load availability");
        }

        setCalComEventTypes([]);
        const nextSlots = (data.slots ?? []).filter((slot: Slot) => slot.available);
        setSlots(nextSlots);
        setSelectedSlot(nextSlots[0]?.start ?? "");
      } catch (error) {
        setSlots([]);
        setSlotsError(error instanceof Error ? error.message : "Failed to load availability");
      } finally {
        setSlotsLoading(false);
      }
    };

    void loadSlots();
  }, [selectedOffering]);

  const handleBooking = async () => {
    if (!selectedOffering || !selectedSlot) {
      setBookingError("Select an offering and available time first.");
      return;
    }

    setSubmitting(true);
    setBookingError(null);

    const durationMinutes = parseDurationMinutes(selectedOffering.duration);
    const reservationDuration = 10;
    let reservationUid: string | null = null;

    try {
      const reservationResponse = await fetch("/api/availability/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
          body: JSON.stringify({
            slotStart: selectedSlot,
            slotDuration: durationMinutes,
            reservationDuration,
            title: selectedOffering.title,
          }),
        });

      const reservationData = await reservationResponse.json();

      if (!reservationResponse.ok || !reservationData.reservationUid) {
        throw new Error(reservationData.error || "Unable to reserve that time");
      }

      reservationUid = reservationData.reservationUid as string;

      const checkoutResponse = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
          body: JSON.stringify({
            offeringId: selectedOffering.id,
            offeringName: selectedOffering.title,
            price: selectedOffering.price,
            duration: selectedOffering.duration,
          reservationUid,
          slotStart: selectedSlot,
          slotDuration: durationMinutes,
          customerName,
          customerEmail,
          customerTimezone,
          notes,
        }),
      });

      const checkoutData = await checkoutResponse.json();

      if (!checkoutResponse.ok || !checkoutData.url) {
        throw new Error(checkoutData.error || "Failed to create checkout session");
      }

      window.location.href = checkoutData.url;
    } catch (error) {
      if (reservationUid) {
        await fetch(`/api/availability/reservations/${reservationUid}`, {
          method: "DELETE",
        });
      }

      setBookingError(error instanceof Error ? error.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = Boolean(
    selectedOffering &&
      selectedSlot &&
      customerName.trim() &&
      customerEmail.trim() &&
      customerTimezone.trim()
  );

  return (
    <div className="space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {offerings.map((offering) => {
          const active = offering.id === selectedOfferingId;

          return (
            <Card
              key={offering.id}
              surface="high"
              className={`flex flex-col h-full border-none p-8 lg:p-12 transition-all duration-300 ease-in-out group hover:shadow-2xl ${active ? "ring-1 ring-primary/40 shadow-2xl" : ""}`}
            >
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h3 className="text-4xl font-display text-on-surface mb-2 italic group-hover:text-primary transition-colors">
                    {offering.title}
                  </h3>
                  <span className="font-label text-sm uppercase tracking-widest text-secondary">
                    {offering.duration}
                  </span>
                </div>
                <div className="text-3xl font-display text-on-surface">{offering.price}</div>
              </div>

              <p className="text-lg text-on-surface/70 font-body leading-relaxed mb-12 flex-grow">
                {offering.description}
              </p>

              <div className="space-y-6 mb-12">
                {offering.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 text-on-surface/50 font-label text-xs uppercase tracking-widest"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-tertiary shadow-[0_0_8px_#98da27]"
                      aria-hidden="true"
                    />
                    {feature}
                  </div>
                ))}
              </div>

              <Button
                variant={active ? "secondary" : "primary"}
                className="w-full py-6 text-lg transition-all hover:scale-[1.02]"
                onClick={() => setSelectedOfferingId(offering.id)}
                aria-label={`Select ${offering.title}`}
              >
                {active ? "Selected" : "Choose This Offering"}
              </Button>
            </Card>
          );
        })}
      </div>

      <Card surface="high" className="border-none p-8 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12">
          <div className="space-y-6">
            <span className="font-label text-xs uppercase tracking-[0.2em] text-tertiary">Book Your Time</span>
            <h2 className="text-4xl font-display italic text-on-surface">
              {selectedOffering?.title ?? "Select an offering"}
            </h2>
            <p className="text-on-surface/60 font-body leading-relaxed">
              Pick a time, share your details, and we&apos;ll reserve the slot while checkout is in progress.
            </p>
            <div className="rounded-2xl bg-surface-container-low p-6 space-y-3">
              <p className="text-sm font-label uppercase tracking-widest text-secondary">Reservation Hold</p>
              <p className="text-on-surface/70 font-body leading-relaxed">
                Your selected time is held for 10 minutes while payment is completed.
              </p>
            </div>
            {slotsError ? <p className="text-sm text-error">{slotsError}</p> : null}
            {calComEventTypes.length > 0 ? (
              <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4 text-sm text-on-surface/70 space-y-2">
                <p className="text-xs uppercase tracking-widest text-secondary font-label">Cal.com event types found</p>
                <ul className="space-y-1">
                  {calComEventTypes.map((eventType) => (
                    <li key={eventType.id}>
                      #{eventType.id} · {eventType.title} · {eventType.lengthInMinutes} min · {eventType.slug}
                      {eventType.hidden ? " · hidden" : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {bookingError ? <p className="text-sm text-error">{bookingError}</p> : null}
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-widest font-label text-on-surface/50">Name</span>
                <input
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
                  placeholder="Your name"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-widest font-label text-on-surface/50">Email</span>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
                  placeholder="you@example.com"
                />
              </label>
            </div>

            <label className="space-y-2 block">
              <span className="text-xs uppercase tracking-widest font-label text-on-surface/50">Timezone</span>
              <input
                value={customerTimezone}
                onChange={(event) => setCustomerTimezone(event.target.value)}
                className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary"
                placeholder="America/New_York"
              />
            </label>

            <label className="space-y-2 block">
              <span className="text-xs uppercase tracking-widest font-label text-on-surface/50">Notes</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:border-primary resize-none"
                placeholder="What should Kali know before the session?"
              />
            </label>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest font-label text-on-surface/50">Available Times</span>
                {slotsLoading ? <span className="text-xs text-on-surface/40">Loading...</span> : null}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {slots.map((slot) => {
                  const active = slot.start === selectedSlot;

                  return (
                    <button
                      key={slot.start}
                      type="button"
                      onClick={() => setSelectedSlot(slot.start)}
                      className={`rounded-xl border px-4 py-4 text-left transition-all ${active ? "border-primary bg-primary/10" : "border-outline-variant bg-surface-container-low hover:border-primary/40"}`}
                    >
                      <span className="block text-sm font-display text-on-surface">
                        {formatSlotTime(slot.start)}
                      </span>
                      <span className="block text-xs uppercase tracking-widest text-on-surface/40 mt-1">
                        {formatSlotTime(slot.end)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {!slotsLoading && !slots.length ? (
                <p className="text-sm text-on-surface/50">
                  No slots are available right now. Please check back soon.
                </p>
              ) : null}
            </div>

            <Button
              variant="primary"
              className="w-full py-6 text-lg"
              onClick={() => void handleBooking()}
              disabled={!canSubmit || submitting || slotsLoading}
            >
              {submitting ? "Reserving Your Time..." : "Continue to Payment"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
