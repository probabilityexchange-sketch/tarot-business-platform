import type Stripe from "stripe";
import { Timestamp } from "firebase-admin/firestore";
import { bookingCollections, parseCurrencyToCents } from "@/lib/booking";
import { createCalComBooking, deleteCalComReservation } from "@/lib/calcom";
import { getAdminDb } from "@/lib/firebase-admin";
import { getOfferingById } from "@/lib/offerings";

export function publicBooking(record: Record<string, unknown>) {
  const scheduledAt = record.scheduledAt as Timestamp;
  return {
    customerName: record.customerName,
    customerEmail: record.customerEmail,
    customerTimezone: record.customerTimezone,
    scheduledAt: scheduledAt.toDate().toISOString(),
    durationMinutes: record.durationMinutes,
    priceCents: record.priceCents,
    calComEventId: record.calComEventId,
  };
}

export async function fulfillBooking(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return { status: "unpaid" } as const;
  const metadata = session.metadata ?? {};
  const offering = getOfferingById(metadata.offeringId);
  if (!offering) throw new Error("Unknown paid offering");
  const durationMinutes = Number.parseInt(metadata.slotDuration ?? "", 10);
  const start = new Date(metadata.slotStart);
  if (!metadata.customerName || !metadata.customerEmail || !metadata.customerTimezone ||
      !Number.isFinite(start.getTime()) || durationMinutes !== Number.parseInt(offering.duration, 10) ||
      session.amount_total !== parseCurrencyToCents(offering.price) || session.currency !== "usd") {
    throw new Error("Invalid paid booking metadata");
  }
  const ref = getAdminDb().collection(bookingCollections.bookings).doc(session.id);
  const claim = await getAdminDb().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const existing = snapshot.data();
    if (existing?.status === "confirmed") return { kind: "confirmed", record: existing } as const;
    if (existing) return { kind: "pending", record: existing } as const;
    const now = Timestamp.now();
    const record = {
      id: session.id,
      offeringId: offering.id,
      customerName: metadata.customerName,
      customerEmail: metadata.customerEmail,
      customerTimezone: metadata.customerTimezone,
      scheduledAt: Timestamp.fromDate(start),
      durationMinutes,
      priceCents: session.amount_total,
      stripeSessionId: session.id,
      stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
      holdEventId: metadata.reservationUid ?? null,
      status: "payment_pending",
      fulfillmentState: "creating",
      createdAt: now,
      updatedAt: now,
      cancellationDeadline: Timestamp.fromMillis(start.getTime() - 48 * 60 * 60 * 1000),
      notesSummary: "",
      notesThemes: [],
      notesActionItems: "",
      followUpStatus: "none",
    };
    transaction.create(ref, record);
    return { kind: "claimed", record } as const;
  });
  if (claim.kind === "confirmed") return { status: "success", booking: publicBooking(claim.record) } as const;
  if (claim.kind === "pending") return { status: "pending" } as const;
  try {
    const hold = metadata.reservationUid
      ? (await getAdminDb().collection(bookingCollections.slots).doc(metadata.reservationUid).get()).data()
      : undefined;
    const booking = await createCalComBooking({
      start: metadata.slotStart,
      lengthInMinutes: durationMinutes,
      title: metadata.offeringName,
      attendee: { name: metadata.customerName, email: metadata.customerEmail, timeZone: metadata.customerTimezone },
      metadata: { offeringId: offering.id, stripeSessionId: session.id, reservationUid: metadata.reservationUid ?? "" },
    });
    if (!booking.uid) throw new Error("Cal.com did not return a booking UID");
    const confirmed = { ...claim.record, status: "confirmed", fulfillmentState: "complete", calComEventId: booking.uid, notesSummary: hold?.notes ?? metadata.notes ?? "", updatedAt: Timestamp.now() };
    await ref.set(confirmed);
    if (metadata.reservationUid) {
      try {
        await deleteCalComReservation(metadata.reservationUid);
      } catch {
        console.error("Reservation cleanup failed", session.id);
      }
    }
    return { status: "success", booking: publicBooking(confirmed) } as const;
  } catch (error) {
    console.error("Paid booking requires reconciliation", session.id, error);
    await ref.update({ fulfillmentState: "needs_attention", updatedAt: Timestamp.now() });
    return { status: "pending" } as const;
  }
}
