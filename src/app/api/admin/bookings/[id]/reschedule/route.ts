import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { serializeAdminBooking } from "@/lib/admin-bookings";
import { bookingCollections } from "@/lib/booking";
import { rescheduleCalComBooking } from "@/lib/calcom";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase-admin";

const rescheduleSchema = z.object({
  start: z.string().datetime(),
  rescheduledBy: z.string().trim().min(1),
  reschedulingReason: z.string().trim().min(1).optional(),
});

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = rescheduleSchema.parse(await request.json());
  const docRef = getAdminDb().collection(bookingCollections.bookings).doc(id);
  const snap = await docRef.get();

  if (!snap.exists) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const booking = serializeAdminBooking(snap.id, snap.data() as Record<string, unknown>);

  if (booking.status !== "confirmed") {
    return NextResponse.json({ error: "Only confirmed bookings can be rescheduled" }, { status: 409 });
  }

  if (!booking.calComEventId) {
    return NextResponse.json({ error: "Missing Cal.com booking reference" }, { status: 400 });
  }

  const action = await rescheduleCalComBooking(booking.calComEventId, {
    start: body.start,
    rescheduledBy: body.rescheduledBy,
    reschedulingReason: body.reschedulingReason ?? "Rescheduled from admin",
  });

  const now = Timestamp.now();
  const scheduledAt = Timestamp.fromDate(new Date(body.start));
  const cancellationDeadline = Timestamp.fromDate(
    new Date(new Date(body.start).getTime() - 24 * 60 * 60 * 1000)
  );

  await docRef.update({
    scheduledAt,
    cancellationDeadline,
    calComEventId: action.uid ?? booking.calComEventId,
    status: "confirmed",
    cancelledAt: null,
    completedAt: null,
    expiredAt: null,
    updatedAt: now,
    rescheduledFromUid: booking.calComEventId,
    rescheduledToUid: action.uid ?? null,
    rescheduledBy: body.rescheduledBy,
    reschedulingReason: body.reschedulingReason ?? "Rescheduled from admin",
  });

  const nextSnap = await docRef.get();

  return NextResponse.json({
    booking: serializeAdminBooking(nextSnap.id, nextSnap.data() as Record<string, unknown>),
  });
}
