import type { BookingFollowUpStatus, BookingStatus } from "@/types/booking";

type TimestampLike = {
  toDate: () => Date;
};

export type AdminBookingRecord = {
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
  notesSummary: string;
  notesThemes: string[];
  notesActionItems: string;
  followUpStatus: BookingFollowUpStatus;
  createdAt: string;
  updatedAt: string;
  cancellationDeadline: string;
  cancelledAt?: string;
  completedAt?: string;
  expiredAt?: string;
};

function isTimestampLike(value: unknown): value is TimestampLike {
  return typeof value === "object" && value !== null && "toDate" in value;
}

function formatTimestamp(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (isTimestampLike(value)) {
    return value.toDate().toISOString();
  }

  return "";
}

export function serializeAdminBooking(id: string, data: Record<string, unknown>): AdminBookingRecord {
  return {
    id,
    offeringId: String(data.offeringId ?? ""),
    customerName: String(data.customerName ?? ""),
    customerEmail: String(data.customerEmail ?? ""),
    customerTimezone: String(data.customerTimezone ?? ""),
    scheduledAt: formatTimestamp(data.scheduledAt),
    durationMinutes: Number(data.durationMinutes ?? 0),
    priceCents: Number(data.priceCents ?? 0),
    status: String(data.status ?? "confirmed") as BookingStatus,
    stripeSessionId: String(data.stripeSessionId ?? ""),
    stripePaymentIntentId:
      typeof data.stripePaymentIntentId === "string" ? data.stripePaymentIntentId : undefined,
    calComEventId: typeof data.calComEventId === "string" ? data.calComEventId : undefined,
    holdEventId: typeof data.holdEventId === "string" ? data.holdEventId : undefined,
    notesSummary: typeof data.notesSummary === "string" ? data.notesSummary : "",
    notesThemes: Array.isArray(data.notesThemes)
      ? data.notesThemes.filter((theme): theme is string => typeof theme === "string")
      : [],
    notesActionItems: typeof data.notesActionItems === "string" ? data.notesActionItems : "",
    followUpStatus:
      typeof data.followUpStatus === "string"
        ? (data.followUpStatus as BookingFollowUpStatus)
        : "none",
    createdAt: formatTimestamp(data.createdAt),
    updatedAt: formatTimestamp(data.updatedAt),
    cancellationDeadline: formatTimestamp(data.cancellationDeadline),
    cancelledAt: formatTimestamp(data.cancelledAt) || undefined,
    completedAt: formatTimestamp(data.completedAt) || undefined,
    expiredAt: formatTimestamp(data.expiredAt) || undefined,
  };
}

export function formatBookingTimestamp(value: unknown): string {
  return formatTimestamp(value);
}

