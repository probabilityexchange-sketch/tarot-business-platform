import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { bookingCollections } from "@/lib/booking";
import { createCalComBooking, deleteCalComReservation } from "@/lib/calcom";
import { getAdminDb } from "@/lib/firebase-admin";
import { getStripe } from "@/lib/stripe";

const confirmSchema = z.object({
  sessionId: z.string().min(1),
});

function parseDuration(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error("Invalid slot duration");
  }

  return parsed;
}

function isCalComSlotConflict(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes("already has booking at this time") ||
      error.message.includes("is not available"))
  );
}

function serializeBookingRecord(booking: Record<string, unknown>) {
  const toIso = (value: unknown) => {
    if (value && typeof value === "object" && "toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function") {
      return (value as { toDate: () => Date }).toDate().toISOString();
    }

    return typeof value === "string" ? value : "";
  };

  return {
    ...booking,
    scheduledAt: toIso(booking.scheduledAt),
    createdAt: toIso(booking.createdAt),
    updatedAt: toIso(booking.updatedAt),
    cancellationDeadline: toIso(booking.cancellationDeadline),
    cancelledAt: toIso(booking.cancelledAt) || undefined,
    completedAt: toIso(booking.completedAt) || undefined,
    expiredAt: toIso(booking.expiredAt) || undefined,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = confirmSchema.parse(await request.json());
    const stripeSession = await getStripe().checkout.sessions.retrieve(sessionId);

    if (stripeSession.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 409 });
    }

    const metadata = stripeSession.metadata ?? {};
    const reservationUid = metadata.reservationUid;
    const existingRef = getAdminDb().collection(bookingCollections.bookings).doc(sessionId);
    const existingSnap = await existingRef.get();

    if (existingSnap.exists) {
      return NextResponse.json({
        status: "success",
        booking: serializeBookingRecord(existingSnap.data() as Record<string, unknown>),
      });
    }

    const slotStart = metadata.slotStart;
    const slotDuration = parseDuration(metadata.slotDuration);
    const customerName = metadata.customerName;
    const customerEmail = metadata.customerEmail;
    const customerTimezone = metadata.customerTimezone;
    const offeringId = metadata.offeringId;

    if (!slotStart || !customerName || !customerEmail || !customerTimezone || !offeringId) {
      return NextResponse.json({ error: "Missing booking metadata" }, { status: 400 });
    }

    const bookingInput = {
      start: slotStart,
      title: metadata.offeringName,
      attendee: {
        name: customerName,
        email: customerEmail,
        timeZone: customerTimezone,
      },
      bookingFieldsResponses: {
        notes: metadata.notes ?? "",
        timezone: customerTimezone,
      },
      metadata: {
        offeringId,
        stripeSessionId: sessionId,
        reservationUid: reservationUid ?? "",
      },
    };

    let calBooking;
    try {
      calBooking = await createCalComBooking(bookingInput);
    } catch (error) {
      if (!reservationUid || !isCalComSlotConflict(error)) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
      calBooking = await createCalComBooking(bookingInput);
    }

    const now = Timestamp.now();
    const scheduledAt = Timestamp.fromDate(new Date(slotStart));
    const cancellationDeadline = Timestamp.fromDate(
      new Date(new Date(slotStart).getTime() - 24 * 60 * 60 * 1000)
    );

    const bookingRecord = {
      id: sessionId,
      offeringId,
      customerName,
      customerEmail,
      customerTimezone,
      scheduledAt,
      durationMinutes: slotDuration,
      priceCents:
        Number.parseInt(metadata.priceCents ?? "", 10) ||
        (stripeSession.amount_total ?? 0),
      status: "confirmed",
      stripeSessionId: sessionId,
      stripePaymentIntentId:
        typeof stripeSession.payment_intent === "string" ? stripeSession.payment_intent : undefined,
      calComEventId: calBooking.uid,
      holdEventId: reservationUid ?? undefined,
      notesSummary: metadata.notes ?? "",
      notesThemes: [],
      notesActionItems: "",
      followUpStatus: "none",
      createdAt: now,
      updatedAt: now,
      cancellationDeadline,
    };

    await existingRef.set(bookingRecord);

    if (reservationUid) {
      try {
        await deleteCalComReservation(reservationUid);
      } catch (error) {
        console.error("Failed to delete Cal.com reservation after booking creation:", error);
      }
    }

    return NextResponse.json({
      status: "success",
      booking: {
        ...bookingRecord,
        scheduledAt: scheduledAt.toDate().toISOString(),
        cancellationDeadline: cancellationDeadline.toDate().toISOString(),
        createdAt: now.toDate().toISOString(),
        updatedAt: now.toDate().toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to confirm booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
