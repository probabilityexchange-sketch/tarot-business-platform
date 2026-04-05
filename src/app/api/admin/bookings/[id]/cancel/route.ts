import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { serializeAdminBooking } from "@/lib/admin-bookings";
import { bookingCollections } from "@/lib/booking";
import { cancelCalComBooking, deleteCalComReservation } from "@/lib/calcom";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase-admin";

const cancelSchema = z.object({
  cancellationReason: z.string().trim().min(1).optional(),
});

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = cancelSchema.parse(await request.json());
  const docRef = getAdminDb().collection(bookingCollections.bookings).doc(id);
  const snap = await docRef.get();

  if (!snap.exists) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const booking = serializeAdminBooking(snap.id, snap.data() as Record<string, unknown>);
  const cancellationReason = body.cancellationReason ?? "Cancelled from admin";

  if (booking.status === "cancelled") {
    return NextResponse.json({ booking });
  }

  if (booking.status === "completed" || booking.status === "expired") {
    return NextResponse.json({ error: "Completed or expired bookings cannot be cancelled" }, { status: 409 });
  }

  if (booking.calComEventId) {
    await cancelCalComBooking(booking.calComEventId, cancellationReason);
  } else if (booking.holdEventId) {
    await deleteCalComReservation(booking.holdEventId);
  }

  const now = Timestamp.now();
  await docRef.update({
    status: "cancelled",
    cancelledAt: now,
    completedAt: null,
    expiredAt: null,
    updatedAt: now,
    cancellationReason,
  });

  const nextSnap = await docRef.get();

  return NextResponse.json({
    booking: serializeAdminBooking(nextSnap.id, nextSnap.data() as Record<string, unknown>),
  });
}
