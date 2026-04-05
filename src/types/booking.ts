import type { Timestamp } from "firebase-admin/firestore";

export type BookingStatus =
  | "tentative_hold"
  | "payment_pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "expired";

export type BookingFollowUpStatus = "none" | "draft" | "sent";

export type Booking = {
  id: string;
  offeringId: string;
  customerEmail: string;
  customerName: string;
  customerTimezone: string;
  scheduledAt: Timestamp;
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
  cancellationDeadline: Timestamp;
  cancelledAt?: Timestamp;
  completedAt?: Timestamp;
  expiredAt?: Timestamp;
};

export type BookingSlot = {
  start: string;
  end: string;
  available: boolean;
  holdExpiresAt?: string;
};

export type BookingNote = {
  id: string;
  bookingId: string;
  summary: string;
  themes: string[];
  actionItems: string;
  followUpStatus: BookingFollowUpStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
