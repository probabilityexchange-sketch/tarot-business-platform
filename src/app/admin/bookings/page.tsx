"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowLeft, Search, RefreshCw } from "lucide-react";

type BookingStatus = "tentative_hold" | "payment_pending" | "confirmed" | "cancelled" | "completed" | "expired";
type BookingFollowUpStatus = "none" | "draft" | "sent";

type BookingSummary = {
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
  notesSummary?: string;
  notesThemes?: string[];
  notesActionItems?: string;
  followUpStatus?: BookingFollowUpStatus;
  createdAt: string;
  updatedAt: string;
  cancellationDeadline: string;
};

type BookingResponse = {
  bookings: BookingSummary[];
  totals: {
    upcomingCount: number;
    confirmedCount: number;
    totalRevenueCents: number;
  };
};

type BookingFilter = "upcoming" | "all" | "confirmed" | "completed" | "cancelled";

const filters: { key: BookingFilter; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "all", label: "All" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDateTime(value: string, timeZone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(new Date(value));
}

function isUpcoming(booking: BookingSummary): boolean {
  return booking.status === "confirmed" && new Date(booking.scheduledAt).getTime() >= Date.now();
}

function getPaymentLabel(booking: BookingSummary): string {
  if (booking.status === "confirmed" || booking.status === "completed") {
    return "Paid";
  }

  if (booking.status === "cancelled") {
    return "Refund path";
  }

  return "Pending";
}

async function fetchBookings(): Promise<BookingResponse> {
  const res = await adminFetch("/api/admin/bookings");
  const data = (await res.json()) as BookingResponse & { error?: string };

  if (!res.ok) {
    throw new Error(data.error || "Failed to load bookings");
  }

  return data;
}

export default function BookingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [totals, setTotals] = useState<BookingResponse["totals"]>({
    upcomingCount: 0,
    confirmedCount: 0,
    totalRevenueCents: 0,
  });
  const [filter, setFilter] = useState<BookingFilter>("upcoming");
  const [search, setSearch] = useState("");
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    let cancelled = false;

    async function loadBookings() {
      try {
        setLoadingBookings(true);
        setError(null);
        const response = await fetchBookings();
        if (!cancelled) {
          setBookings(response.bookings);
          setTotals(response.totals);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load bookings");
        }
      } finally {
        if (!cancelled) {
          setLoadingBookings(false);
        }
      }
    }

    if (!loading && user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      void loadBookings();
    }

    return () => {
      cancelled = true;
    };
  }, [loading, user]);

  const visibleBookings = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    let next = bookings.filter((booking) => {
      if (filter === "upcoming") {
        return isUpcoming(booking);
      }

      if (filter !== "all" && booking.status !== filter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        booking.customerName,
        booking.customerEmail,
        booking.offeringId,
        booking.status,
        booking.notesSummary ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });

    return [...next].sort((a, b) => {
      const left = new Date(a.scheduledAt).getTime();
      const right = new Date(b.scheduledAt).getTime();

      if (filter === "upcoming") {
        return left - right;
      }

      return right - left;
    });
  }, [bookings, filter, search]);

  if (loading || loadingBookings) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-on-surface/60">
        Loading...
      </div>
    );
  }

  if (user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-on-surface/60 hover:text-on-surface">
            <ArrowLeft size={16} />
            Back to Admin
          </Link>
          <h1 className="font-display text-3xl text-on-surface mt-3">Booking Dashboard</h1>
          <p className="text-on-surface/60 mt-2">Upcoming sessions, payment state, and client notes in one place.</p>
        </div>
        <Button variant="secondary" onClick={() => router.refresh()}>
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none">
          <p className="text-xs uppercase tracking-[0.2em] text-tertiary mb-2 font-label">Upcoming</p>
          <p className="text-3xl font-display text-on-surface">{totals.upcomingCount}</p>
        </Card>
        <Card className="border-none">
          <p className="text-xs uppercase tracking-[0.2em] text-tertiary mb-2 font-label">Confirmed</p>
          <p className="text-3xl font-display text-on-surface">{totals.confirmedCount}</p>
        </Card>
        <Card className="border-none">
          <p className="text-xs uppercase tracking-[0.2em] text-tertiary mb-2 font-label">Revenue</p>
          <p className="text-3xl font-display text-on-surface">{formatCurrency(totals.totalRevenueCents)}</p>
        </Card>
      </div>

      <Card className="border-none">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, offering, or note..."
              className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface placeholder:text-on-surface/40 focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-label uppercase tracking-wider transition-colors border",
                  filter === tab.key
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-outline-variant text-on-surface/60 hover:text-on-surface hover:border-on-surface/30"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {error ? <p className="text-error mt-4 text-sm">{error}</p> : null}
      </Card>

      <Card className="overflow-hidden border-none p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container-low">
              <tr className="border-b border-outline-variant">
                <th className="text-left p-4 font-label text-xs uppercase tracking-wider text-on-surface/60">Client</th>
                <th className="text-left p-4 font-label text-xs uppercase tracking-wider text-on-surface/60">When</th>
                <th className="text-left p-4 font-label text-xs uppercase tracking-wider text-on-surface/60">Status</th>
                <th className="text-left p-4 font-label text-xs uppercase tracking-wider text-on-surface/60">Payment</th>
                <th className="text-right p-4 font-label text-xs uppercase tracking-wider text-on-surface/60">Open</th>
              </tr>
            </thead>
            <tbody>
              {visibleBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-outline-variant/50 last:border-0 hover:bg-surface-container-low/60">
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-on-surface">{booking.customerName}</div>
                      <div className="text-sm text-on-surface/60">{booking.customerEmail}</div>
                      <div className="text-xs uppercase tracking-wider text-on-surface/40 mt-1">{booking.offeringId}</div>
                    </div>
                  </td>
                  <td className="p-4 text-on-surface/80">
                    <div>{formatDateTime(booking.scheduledAt, booking.customerTimezone)}</div>
                    <div className="text-sm text-on-surface/50">{booking.customerTimezone}</div>
                  </td>
                  <td className="p-4">
                    <span
                      className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-xs uppercase tracking-wider font-label",
                        booking.status === "confirmed"
                          ? "bg-primary/15 text-primary"
                          : booking.status === "completed"
                            ? "bg-secondary/15 text-secondary"
                            : booking.status === "cancelled"
                              ? "bg-error/15 text-error"
                              : "bg-surface-container text-on-surface/60"
                      )}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="p-4 text-on-surface/80">{getPaymentLabel(booking)}</td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/bookings/${booking.id}`}>
                      <Button variant="tertiary" size="sm">
                        Details
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {visibleBookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface/60">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
