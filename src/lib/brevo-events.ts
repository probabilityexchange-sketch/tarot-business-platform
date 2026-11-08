export async function trackBrevoEvent(
  eventName: string,
  email: string,
  properties: Record<string, string>
): Promise<void> {
  if (!process.env.BREVO_API_KEY) throw new Error("Email service unavailable");
  const response = await fetch("https://api.brevo.com/v3/events", {
    method: "POST",
    headers: { "api-key": process.env.BREVO_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ event_name: eventName, identifiers: { email_id: email }, event_properties: properties }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
}
