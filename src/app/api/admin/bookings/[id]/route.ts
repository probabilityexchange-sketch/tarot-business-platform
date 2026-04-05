import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { serializeAdminBooking } from "@/lib/admin-bookings";
import { bookingCollections, bookingFollowUpStatuses, bookingStatuses } from "@/lib/booking";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase-admin";
import type { BookingFollowUpStatus, BookingStatus } from "@/types/booking";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const bookingUpdateSchema = z.object({
  status: z.enum(bookingStatuses).optional(),
  notesSummary: z.string().max(4000).optional(),
  notesThemes: z.array(z.string().max(120)).max(12).optional(),
  notesActionItems: z.string().max(4000).optional(),
  followUpStatus: z.enum(bookingFollowUpStatuses).optional(),
});


function getStatusTimestamps(status: BookingStatus) {
  const now = Timestamp.now();

  if (status === "cancelled") {
    return { cancelledAt: now, completedAt: null, expiredAt: null };
  }

  if (status === "completed") {
    return { cancelledAt: null, completedAt: now, expiredAt: null };
  }

  if (status === "expired") {
    return { cancelledAt: null, completedAt: null, expiredAt: now };
  }

  return { cancelledAt: null, completedAt: null, expiredAt: null };
}

export async function GET(request: NextRequest, context: RouteContext) {
  const isAdmin = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const snap = await getAdminDb().collection(bookingCollections.bookings).doc(id).get();

  if (!snap.exists) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({
    booking: serializeAdminBooking(snap.id, snap.data() as Record<string, unknown>),
  });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const isAdmin = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = bookingUpdateSchema.parse(await request.json());
  const docRef = getAdminDb().collection(bookingCollections.bookings).doc(id);
  const snap = await docRef.get();

  if (!snap.exists) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const nextStatus = body.status ?? (snap.data()?.status as BookingStatus | undefined) ?? "confirmed";
  const statusTimestamps = body.status ? getStatusTimestamps(body.status) : {};
  const now = Timestamp.now();

  const updatePayload = {
    ...(body.status ? { status: body.status } : {}),
    ...(body.notesSummary !== undefined ? { notesSummary: body.notesSummary } : {}),
    ...(body.notesThemes !== undefined ? { notesThemes: body.notesThemes } : {}),
    ...(body.notesActionItems !== undefined ? { notesActionItems: body.notesActionItems } : {}),
    ...(body.followUpStatus !== undefined ? { followUpStatus: body.followUpStatus } : {}),
    ...statusTimestamps,
    updatedAt: now,
  };

  await docRef.update(updatePayload);

  const nextSnap = await docRef.get();

  return NextResponse.json({
    booking: serializeAdminBooking(nextSnap.id, nextSnap.data() as Record<string, unknown>),
    status: nextStatus,
  });
}
