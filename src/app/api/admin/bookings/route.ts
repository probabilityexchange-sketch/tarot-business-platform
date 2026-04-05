import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { bookingCollections } from "@/lib/booking";
import { serializeAdminBooking } from "@/lib/admin-bookings";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase-admin";
import type { BookingStatus, BookingFollowUpStatus } from "@/types/booking";

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
  cancelledAt?: string;
  completedAt?: string;
  expiredAt?: string;
};

const bookingsQuerySchema = z.object({
  q: z.string().trim().optional(),
  status: z.string().trim().optional(),
});

function matchesQuery(booking: BookingSummary, query: string): boolean {
  const haystack = [
    booking.customerName,
    booking.customerEmail,
    booking.offeringId,
    booking.status,
    booking.stripeSessionId,
    booking.calComEventId ?? "",
    booking.notesSummary ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

function isUpcoming(booking: BookingSummary): boolean {
  return booking.status === "confirmed" && new Date(booking.scheduledAt).getTime() >= Date.now();
}

export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = bookingsQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  const snap = await getAdminDb()
    .collection(bookingCollections.bookings)
    .orderBy("scheduledAt", "desc")
    .limit(250)
    .get();

  let bookings = snap.docs.map((doc) =>
    serializeAdminBooking(doc.id, doc.data() as Record<string, unknown>)
  );

  if (query.status === "upcoming") {
    bookings = bookings.filter(isUpcoming);
  } else if (query.status && query.status !== "all") {
    bookings = bookings.filter((booking) => booking.status === query.status);
  }

  if (query.q) {
    bookings = bookings.filter((booking) => matchesQuery(booking, query.q ?? ""));
  }

  const upcomingCount = bookings.filter(isUpcoming).length;
  const confirmedCount = bookings.filter((booking) => booking.status === "confirmed").length;
  const totalRevenueCents = bookings
    .filter((booking) => booking.status === "confirmed")
    .reduce((sum, booking) => sum + booking.priceCents, 0);

  return NextResponse.json({
    bookings,
    totals: {
      upcomingCount,
      confirmedCount,
      totalRevenueCents,
    },
  });
}
