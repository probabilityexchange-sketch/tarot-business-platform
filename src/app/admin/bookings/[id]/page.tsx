"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useParams, useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-client";
import { getOfferingById } from "@/lib/offerings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";

type BookingStatus = "tentative_hold" | "payment_pending" | "confirmed" | "cancelled" | "completed" | "expired";
type BookingFollowUpStatus = "none" | "draft" | "sent";

type BookingDetail = {
  id: string;
  offeringId: string;
  customerName: string;
  customerEmail: string;
  customerTimezone: string;
  scheduledAt: string;
  durationMinutes: number;
  priceCents: number;
  status: BookingStatus;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  calComEventId?: string;
  holdEventId?: string;
  notesSummary: string;
  notesThemes: string[];
  notesActionItems: string;
  followUpStatus: BookingFollowUpStatus;
  createdAt: string;
  updatedAt: string;
  cancellationDeadline: string;
  cancelledAt?: string;
  completedAt?: string;
  expiredAt?: string;
};

type Slot = {
  start: string;
  end: string;
  available: boolean;
};

type BookingResponse = {
  booking: BookingDetail;
};

const statusOptions: BookingStatus[] = ["tentative_hold", "payment_pending", "confirmed", "cancelled", "completed", "expired"];
const followUpOptions: BookingFollowUpStatus[] = ["none", "draft", "sent"];

function formatDateTime(value: string, timeZone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(new Date(value));
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

async function fetchBooking(id: string): Promise<BookingDetail> {
  const res = await adminFetch(`/api/admin/bookings/${id}`);
  const data = (await res.json()) as BookingResponse & { error?: string };

  if (!res.ok) {
    throw new Error(data.error || "Failed to load booking");
  }

  return data.booking;
}

async function saveBooking(id: string, payload: Partial<Pick<BookingDetail, "status" | "notesSummary" | "notesThemes" | "notesActionItems" | "followUpStatus">>) {
  const res = await adminFetch(`/api/admin/bookings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as BookingResponse & { error?: string };

  if (!res.ok) {
    throw new Error(data.error || "Failed to save booking");
  }

  return data.booking;
}

async function fetchRescheduleSlots(booking: BookingDetail, title?: string): Promise<Slot[]> {
  const searchParams = new URLSearchParams({
    duration: String(booking.durationMinutes),
    timeZone: booking.customerTimezone,
    bookingUidToReschedule: booking.calComEventId ?? "",
  });

  if (title) {
    searchParams.set("title", title);
  }

  const res = await adminFetch(`/api/availability?${searchParams.toString()}`);
  const data = (await res.json()) as { slots?: Slot[]; error?: string };

  if (!res.ok) {
    throw new Error(data.error || "Failed to load reschedule slots");
  }

  return (data.slots ?? []).filter((slot) => slot.available);
}

async function cancelBooking(id: string, cancellationReason: string) {
  const res = await adminFetch(`/api/admin/bookings/${id}/cancel`, {
    method: "POST",
    body: JSON.stringify({ cancellationReason }),
  });

  const data = (await res.json()) as { booking?: BookingDetail; error?: string };

  if (!res.ok || !data.booking) {
    throw new Error(data.error || "Failed to cancel booking");
  }

  return data.booking;
}

async function rescheduleBooking(
  id: string,
  payload: {
    start: string;
    rescheduledBy: string;
    reschedulingReason: string;
  }
) {
  const res = await adminFetch(`/api/admin/bookings/${id}/reschedule`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as { booking?: BookingDetail; error?: string };

  if (!res.ok || !data.booking) {
    throw new Error(data.error || "Failed to reschedule booking");
  }

  return data.booking;
}

export default function BookingDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [status, setStatus] = useState<BookingStatus>("confirmed");
  const [followUpStatus, setFollowUpStatus] = useState<BookingFollowUpStatus>("none");
  const [notesSummary, setNotesSummary] = useState("");
  const [notesThemes, setNotesThemes] = useState("");
  const [notesActionItems, setNotesActionItems] = useState("");
  const [rescheduleSlots, setRescheduleSlots] = useState<Slot[]>([]);
  const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState("");
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const offering = useMemo(() => getOfferingById(booking?.offeringId ?? ""), [booking?.offeringId]);

  useEffect(() => {
    if (!loading && user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    let cancelled = false;

    async function loadBooking() {
      try {
        setLoadingBooking(true);
        setError(null);
        const nextBooking = await fetchBooking(id);
        if (!cancelled) {
          setBooking(nextBooking);
          setStatus(nextBooking.status);
          setFollowUpStatus(nextBooking.followUpStatus ?? "none");
          setNotesSummary(nextBooking.notesSummary ?? "");
          setNotesThemes((nextBooking.notesThemes ?? []).join(", "));
          setNotesActionItems(nextBooking.notesActionItems ?? "");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load booking");
        }
      } finally {
        if (!cancelled) {
          setLoadingBooking(false);
        }
      }
    }

    if (!loading && user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && id) {
      void loadBooking();
    }

    return () => {
      cancelled = true;
    };
  }, [id, loading, user]);

  useEffect(() => {
    let cancelled = false;

    async function loadRescheduleOptions() {
      if (!booking || !booking.calComEventId || booking.status !== "confirmed") {
        return;
      }

      try {
        setRescheduleLoading(true);
        setActionError(null);
        const nextSlots = await fetchRescheduleSlots(booking, offering?.title);
        if (!cancelled) {
          setRescheduleSlots(nextSlots);
          setSelectedRescheduleSlot(nextSlots[0]?.start ?? "");
        }
      } catch (loadError) {
        if (!cancelled) {
          setActionError(loadError instanceof Error ? loadError.message : "Failed to load reschedule options");
        }
      } finally {
        if (!cancelled) {
          setRescheduleLoading(false);
        }
      }
    }

    void loadRescheduleOptions();

    return () => {
      cancelled = true;
    };
  }, [booking, offering?.title]);

  const themesCount = useMemo(() => {
    return notesThemes
      .split(",")
      .map((theme) => theme.trim())
      .filter(Boolean).length;
  }, [notesThemes]);

  if (loading || loadingBooking) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-on-surface/60">
        Loading...
      </div>
    );
  }

  if (user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return null;
  }

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-error">{error ?? "Booking not found"}</p>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      setSaving(true);
      const nextBooking = await saveBooking(booking.id, {
        status,
        followUpStatus,
        notesSummary,
        notesThemes: notesThemes
          .split(",")
          .map((theme) => theme.trim())
          .filter(Boolean),
        notesActionItems,
      });
      setBooking(nextBooking);
      setStatus(nextBooking.status);
      setFollowUpStatus(nextBooking.followUpStatus ?? "none");
      setNotesSummary(nextBooking.notesSummary ?? "");
      setNotesThemes((nextBooking.notesThemes ?? []).join(", "));
      setNotesActionItems(nextBooking.notesActionItems ?? "");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save booking");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!booking) {
      return;
    }

    if (!window.confirm("Cancel this booking? This will mark the session cancelled in Cal.com and admin.")) {
      return;
    }

    try {
      setCancelling(true);
      setActionError(null);
      const nextBooking = await cancelBooking(
        booking.id,
        `Cancelled by admin ${user?.email ?? "unknown"}`
      );
      setBooking(nextBooking);
      setStatus(nextBooking.status);
    } catch (cancelError) {
      setActionError(cancelError instanceof Error ? cancelError.message : "Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  const handleReschedule = async () => {
    if (!booking) {
      return;
    }

    if (!selectedRescheduleSlot) {
      setActionError("Pick a new time before rescheduling.");
      return;
    }

    try {
      setRescheduling(true);
      setActionError(null);
      const nextBooking = await rescheduleBooking(booking.id, {
        start: selectedRescheduleSlot,
        rescheduledBy: user?.email ?? "admin",
        reschedulingReason: `Rescheduled by admin ${user?.email ?? "unknown"}`,
      });
      setBooking(nextBooking);
      setStatus(nextBooking.status);
      setRescheduleSlots([]);
      setSelectedRescheduleSlot("");
    } catch (rescheduleError) {
      setActionError(
        rescheduleError instanceof Error ? rescheduleError.message : "Failed to reschedule booking"
      );
    } finally {
      setRescheduling(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <Link href="/admin/bookings" className="inline-flex items-center gap-2 text-sm text-on-surface/60 hover:text-on-surface">
          <ArrowLeft size={16} />
          Back to Bookings
        </Link>
        <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-3xl text-on-surface">{booking.customerName}</h1>
            <p className="text-on-surface/60 mt-2">
              {offering?.title ?? booking.offeringId} · {formatDateTime(booking.scheduledAt, booking.customerTimezone)}
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save size={16} className="mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
        {error ? <p className="text-error mt-4 text-sm">{error}</p> : null}
        {actionError ? <p className="text-error mt-4 text-sm">{actionError}</p> : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-6">
        <Card className="border-none space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-tertiary mb-2 font-label">Session</p>
              <div className="space-y-2 text-on-surface/80">
                <p>{formatDateTime(booking.scheduledAt, booking.customerTimezone)}</p>
                <p>{booking.durationMinutes} minutes</p>
                <p>{booking.customerTimezone}</p>
                <p>{formatCurrency(booking.priceCents)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-tertiary mb-2 font-label">Payment</p>
              <div className="space-y-2 text-on-surface/80">
                <p>Status: {booking.status === "confirmed" || booking.status === "completed" ? "paid" : "pending"}</p>
                <p>Stripe session: {booking.stripeSessionId}</p>
                <p>Payment intent: {booking.stripePaymentIntentId ?? "n/a"}</p>
                <p>Cal.com booking: {booking.calComEventId ?? "n/a"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-tertiary mb-2 font-label">Client</p>
              <div className="space-y-2 text-on-surface/80">
                <p>{booking.customerName}</p>
                <p>{booking.customerEmail}</p>
                <p>Offering: {booking.offeringId}</p>
                <p>Hold: {booking.holdEventId ?? "none"}</p>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-tertiary mb-2 font-label">Lifecycle</p>
              <div className="space-y-2 text-on-surface/80">
                <p>Created: {formatDateTime(booking.createdAt, booking.customerTimezone)}</p>
                <p>Updated: {formatDateTime(booking.updatedAt, booking.customerTimezone)}</p>
                <p>Cancellation deadline: {formatDateTime(booking.cancellationDeadline, booking.customerTimezone)}</p>
                <p>Theme count: {themesCount}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-none space-y-6">
          <div>
            <label className="block text-sm font-label uppercase tracking-wider text-on-surface/60 mb-2">Status</label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as BookingStatus)}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-label uppercase tracking-wider text-on-surface/60 mb-2">
              Follow-up Status
            </label>
            <select
              value={followUpStatus}
              onChange={(event) => setFollowUpStatus(event.target.value as BookingFollowUpStatus)}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
            >
              {followUpOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-label uppercase tracking-wider text-on-surface/60 mb-2">
              Session Summary
            </label>
            <textarea
              value={notesSummary}
              onChange={(event) => setNotesSummary(event.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface placeholder:text-on-surface/40 focus:outline-none focus:border-primary resize-none"
              placeholder="Short summary of the session..."
            />
          </div>

          <div>
            <label className="block text-sm font-label uppercase tracking-wider text-on-surface/60 mb-2">
              Themes
            </label>
            <textarea
              value={notesThemes}
              onChange={(event) => setNotesThemes(event.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface placeholder:text-on-surface/40 focus:outline-none focus:border-primary resize-none"
              placeholder="Comma-separated themes..."
            />
          </div>

          <div>
            <label className="block text-sm font-label uppercase tracking-wider text-on-surface/60 mb-2">
              Action Items
            </label>
            <textarea
              value={notesActionItems}
              onChange={(event) => setNotesActionItems(event.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface placeholder:text-on-surface/40 focus:outline-none focus:border-primary resize-none"
              placeholder="Next steps or client follow-up notes..."
              />
          </div>

          <div className="pt-4 border-t border-outline-variant space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-tertiary mb-2 font-label">Service Actions</p>
                <p className="text-sm text-on-surface/60">
                  Cancel the booking or move it to a new slot in Cal.com.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={handleCancel}
                disabled={cancelling || booking.status === "cancelled" || booking.status === "completed" || booking.status === "expired"}
              >
                {cancelling ? "Cancelling..." : "Cancel Booking"}
              </Button>
            </div>

            <div className="rounded-2xl bg-surface-container-low p-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-tertiary mb-2 font-label">Reschedule</p>
                  <p className="text-sm text-on-surface/60">
                    {booking.calComEventId
                      ? "Choose a new slot. The current booking time stays available while you reschedule."
                      : "No Cal.com booking reference is available for rescheduling."}
                  </p>
                </div>
                <Button
                  onClick={handleReschedule}
                  disabled={
                    rescheduling ||
                    rescheduleLoading ||
                    !selectedRescheduleSlot ||
                    !booking.calComEventId ||
                    booking.status !== "confirmed"
                  }
                >
                  {rescheduling ? "Rescheduling..." : "Reschedule"}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rescheduleSlots.map((slot) => {
                  const active = slot.start === selectedRescheduleSlot;

                  return (
                    <button
                      key={slot.start}
                      type="button"
                      onClick={() => setSelectedRescheduleSlot(slot.start)}
                      className={`rounded-xl border px-4 py-4 text-left transition-all ${active ? "border-primary bg-primary/10" : "border-outline-variant bg-surface-container-low hover:border-primary/40"}`}
                    >
                      <span className="block text-sm font-display text-on-surface">
                        {formatDateTime(slot.start, booking.customerTimezone)}
                      </span>
                      <span className="block text-xs uppercase tracking-widest text-on-surface/40 mt-1">
                        Until {formatDateTime(slot.end, booking.customerTimezone)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {!rescheduleLoading && !rescheduleSlots.length ? (
                <p className="text-sm text-on-surface/50">
                  No reschedule slots found right now.
                </p>
              ) : null}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
