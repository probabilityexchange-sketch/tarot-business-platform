import { z } from "zod";

export const bookingCollections = {
  slots: "booking_slots",
  bookings: "bookings",
  notes: "booking_notes",
} as const;

export const bookingStatuses = [
  "tentative_hold",
  "payment_pending",
  "confirmed",
  "cancelled",
  "completed",
  "expired",
] as const;

export const bookingStatusSchema = z.enum(bookingStatuses);

export const bookingFollowUpStatuses = ["none", "draft", "sent"] as const;

export const bookingFollowUpStatusSchema = z.enum(bookingFollowUpStatuses);

export const bookingIntakeSchema = z.object({
  offeringId: z.string().min(1),
  customerName: z.string().min(1).max(120),
  customerEmail: z.string().email(),
  customerTimezone: z.string().min(1),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().positive(),
  priceCents: z.number().int().positive(),
  notes: z.string().max(4000).optional().default(""),
});

export const bookingCheckoutSchema = z.object({
  offeringId: z.string().min(1),
  offeringName: z.string().min(1),
  price: z.string().min(1),
  duration: z.string().min(1),
  reservationUid: z.string().min(1),
  slotStart: z.string().min(1),
  slotDuration: z.coerce.number().int().positive(),
  customerName: z.string().min(1).max(120),
  customerEmail: z.string().email(),
  customerTimezone: z.string().min(1),
  notes: z.string().max(4000).optional().default(""),
});

export function parseCurrencyToCents(value: string): number {
  const normalized = value.replace(/[^0-9.]/g, "");
  const amount = Number.parseFloat(normalized);

  if (Number.isNaN(amount)) {
    throw new Error("Invalid price value");
  }

  return Math.round(amount * 100);
}
