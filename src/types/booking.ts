import type { Timestamp } from "firebase-admin/firestore";

export type BookingStatus = "pending_payment" | "confirmed" | "cancelled" | "completed";

export type Booking = {
  id: string;
  userId: string;
  customerEmail: string;
  customerName: string;
  scheduledAt: Timestamp;
  duration: number;
  price: number;
  status: BookingStatus;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  calComEventId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  cancellationDeadline: Timestamp;
  cancelledAt?: Timestamp;
};

export type BookingSlot = {
  start: string;
  end: string;
  available: boolean;
};
