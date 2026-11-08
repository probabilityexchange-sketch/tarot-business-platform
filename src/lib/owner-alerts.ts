// Owner-only operational alerts (new bookings, bookings that need attention).
//
// This is the single, deliberate exception to "the website never sends email": these
// messages go only to the business owner's own addresses, never to customers or
// subscribers. Subscriber/marketing email stays in Brevo automations.
//
// Recipients: OWNER_ALERT_EMAILS (comma-separated), falling back to ADMIN_EMAIL, then
// NEXT_PUBLIC_ADMIN_EMAIL. Sender: BREVO_FROM_EMAIL (a verified Brevo sender).
// Alerts are best-effort: they never throw, so a mail outage can't break a booking.

function ownerRecipients(): string[] {
  const raw = process.env.OWNER_ALERT_EMAILS || process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";
  return [...new Set(raw.split(",").map((value) => value.trim().toLowerCase()).filter((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)))];
}

export async function sendOwnerAlert(subject: string, lines: string[]): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  const recipients = ownerRecipients();
  const sender = process.env.BREVO_FROM_EMAIL || "noreply@kalimeister.com";
  if (!apiKey || recipients.length === 0) {
    console.error("Owner alert not sent: BREVO_API_KEY or owner recipients missing", subject);
    return false;
  }
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: "Kali Meister website", email: sender },
        to: recipients.map((email) => ({ email })),
        subject,
        // Plain text only: customer-supplied values are never rendered as HTML.
        textContent: lines.join("\n"),
        tags: ["owner-alert"],
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      console.error("Owner alert rejected by email provider", response.status, subject);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Owner alert failed", subject, error);
    return false;
  }
}

function formatWhen(iso: string, timeZone: string) {
  try {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeStyle: "short", timeZone }).format(new Date(iso)) + ` (${timeZone})`;
  } catch {
    return iso;
  }
}

export type BookingAlertDetails = {
  offeringName: string;
  customerName: string;
  customerEmail: string;
  customerTimezone: string;
  slotStart: string;
  durationMinutes: number;
  amountCents: number;
  paidWithGiftCode: boolean;
  stripeSessionId: string;
  calComEventId?: string;
  notes?: string;
};

function bookingLines(details: BookingAlertDetails) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://kalimeister.com";
  return [
    `Reading: ${details.offeringName} (${details.durationMinutes} minutes)`,
    `When: ${formatWhen(details.slotStart, details.customerTimezone)}`,
    `UTC: ${details.slotStart}`,
    `Client: ${details.customerName} <${details.customerEmail}>`,
    `Paid: $${(details.amountCents / 100).toFixed(2)}${details.paidWithGiftCode ? " (gift code redeemed)" : ""}`,
    ...(details.notes ? [`Client notes: ${details.notes}`] : []),
    `Stripe session: ${details.stripeSessionId}`,
    ...(details.calComEventId ? [`Cal.com booking: ${details.calComEventId}`] : []),
    `Admin: ${baseUrl}/admin/bookings`,
  ];
}

export function alertBookingConfirmed(details: BookingAlertDetails) {
  return sendOwnerAlert(
    `New booking: ${details.customerName} — ${details.offeringName}`,
    ["A reading was booked and paid on kalimeister.com.", "", ...bookingLines(details)]
  );
}

export function alertBookingNeedsAttention(details: BookingAlertDetails, reason: string) {
  return sendOwnerAlert(
    `ACTION NEEDED: paid booking not on the calendar — ${details.customerName}`,
    [
      "A client paid for a reading, but the booking could not be created in Cal.com.",
      "It is NOT on the calendar yet. Book the time manually or contact the client.",
      "",
      ...bookingLines(details),
      `Error: ${reason}`,
    ]
  );
}
