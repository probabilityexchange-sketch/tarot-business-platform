import type Stripe from "stripe";
import { Timestamp } from "firebase-admin/firestore";
import { bookingCollections, parseCurrencyToCents } from "@/lib/booking";
import { createCalComBooking, deleteCalComReservation } from "@/lib/calcom";
import { getAdminDb } from "@/lib/firebase-admin";
import { getOfferingById } from "@/lib/offerings";
import { alertBookingConfirmed, alertBookingNeedsAttention, type BookingAlertDetails } from "@/lib/owner-alerts";

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
  // A checkout fully covered by a promotion code (e.g. a gift code) completes with
  // payment_status "no_payment_required" and amount_total 0. Treat only that exact case
  // as settled; amountValid below still requires the discount to cover the full price.
  const settled = session.payment_status === "paid" ||
    (session.payment_status === "no_payment_required" && session.amount_total === 0);
  if (!settled) return { status: "unpaid" } as const;
  const metadata = session.metadata ?? {};
  const offering = getOfferingById(metadata.offeringId);
  if (!offering) throw new Error("Unknown paid offering");
  const durationMinutes = Number.parseInt(metadata.slotDuration ?? "", 10);
  const start = new Date(metadata.slotStart);
  const priceCents = parseCurrencyToCents(offering.price);
  const discount = session.total_details?.amount_discount ?? 0;
  // A $0 checkout whose discount covers the full price means a gift promotion code was
  // applied. Stripe enforces the code's single redemption, so no gift_cards record is
  // updated here — reconciliation stays an admin concern.
  const paidWithGiftCode = session.amount_total === 0 && discount >= priceCents;
  const amountValid = typeof session.amount_total === "number" && session.amount_total >= 0 && discount >= 0 && session.amount_total === priceCents - discount;
  if (!metadata.customerName || !metadata.customerEmail || !metadata.customerTimezone ||
      !Number.isFinite(start.getTime()) || durationMinutes !== Number.parseInt(offering.duration, 10) ||
      !amountValid || session.currency !== "usd") {
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
      ...(paidWithGiftCode ? { paidWithGiftCode: true } : {}),
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
  // Only the call that claimed the booking reaches this point, so each alert is sent once.
  const alertDetails: BookingAlertDetails = {
    offeringName: offering.title,
    customerName: metadata.customerName,
    customerEmail: metadata.customerEmail,
    customerTimezone: metadata.customerTimezone,
    slotStart: metadata.slotStart,
    durationMinutes,
    amountCents: session.amount_total ?? 0,
    paidWithGiftCode,
    stripeSessionId: session.id,
  };
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
    const confirmed = { ...claim.record, status: "confirmed", fulfillmentState: "complete", calComEventId: booking.uid, notesSummary: hold?.notes ?? metadata.notes ?? "", ...(paidWithGiftCode ? { paidWithGiftCode: true } : {}), updatedAt: Timestamp.now() };
    await ref.set(confirmed);
    // Best-effort recovery-lead update: a missing lead (or any failure here) must never
    // turn a confirmed booking into a reconciliation case.
    try {
      const leadRef = getAdminDb().collection("booking_leads").doc(session.id);
      const lead = await leadRef.get();
      if (lead.exists) await leadRef.update({ status: "paid" });
    } catch {
      console.error("Booking lead status update failed", session.id);
    }
    if (metadata.reservationUid) {
      try {
        await deleteCalComReservation(metadata.reservationUid);
      } catch {
        console.error("Reservation cleanup failed", session.id);
      }
    }
    await alertBookingConfirmed({ ...alertDetails, calComEventId: booking.uid, notes: String(confirmed.notesSummary || "") });
    return { status: "success", booking: publicBooking(confirmed) } as const;
  } catch (error) {
    console.error("Paid booking requires reconciliation", session.id, error);
    // Alert first so the owner hears about it even if the status write below fails.
    await alertBookingNeedsAttention(alertDetails, error instanceof Error ? error.message : String(error));
    await ref.update({ fulfillmentState: "needs_attention", updatedAt: Timestamp.now() });
    return { status: "pending" } as const;
  }
}
