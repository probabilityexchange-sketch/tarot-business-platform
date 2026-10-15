import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";
import { onSchedule } from "firebase-functions/v2/scheduler";

const brevoKey = defineSecret("BREVO_API_KEY");
const sequence = [8, 1, 3, 4, 5, 6, 7];
const day = 24 * 60 * 60 * 1000;

export function scheduledSteps(confirmedAt: number) {
  return sequence.map((templateId, step) => ({ templateId, step, scheduledFor: confirmedAt + (step === 0 ? 1 : step * 7) * day }));
}

export function eligibleSubscriber(record: Record<string, unknown> | undefined, confirmedAt?: number) {
  return Boolean(record && record.status === "active" && record.consentConfirmedAt instanceof Timestamp && record.guideSentAt instanceof Timestamp && typeof record.unsubscribeToken === "string" && /^[a-f0-9]{64}$/.test(record.unsubscribeToken) && (confirmedAt === undefined || record.consentConfirmedAt.toMillis() === confirmedAt));
}

export function renderLetter(html: string, token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) throw new Error("Invalid unsubscribe token");
  if (!html.includes("{{ unsubscribe }}")) throw new Error("Missing unsubscribe link");
  return html.split("{{ unsubscribe }}").join(`https://kalimeister.com/email/unsubscribe?token=${token}`);
}

async function provider(path: string, body?: Record<string, unknown>) {
  const response = await fetch(`https://api.brevo.com/v3/${path}`, {
    method: body ? "POST" : "GET",
    headers: { "api-key": brevoKey.value(), "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`Brevo status ${response.status}`);
  return await response.json() as Record<string, unknown>;
}

export async function runDiscernmentSeries() {
  if (!getApps().length) initializeApp();
  const db = getFirestore();
  const settings = (await db.doc("emailWorkflows/discernment-v1").get()).data();
  if (!settings?.enabled || !(settings.enabledAt instanceof Timestamp)) return;
  const now = Date.now();
  const subscribers = await db.collection("subscribers").where("status", "==", "active").get();
  for (const subscriber of subscribers.docs) {
    const record = subscriber.data();
    if (!eligibleSubscriber(record) || record.consentConfirmedAt.toMillis() < settings.enabledAt.toMillis()) continue;
    const confirmedAt = record.consentConfirmedAt.toMillis();
    await db.runTransaction(async (transaction) => {
      const current = (await transaction.get(subscriber.ref)).data();
      if (!eligibleSubscriber(current, confirmedAt) || current?.discernmentEnrollment === confirmedAt) return;
      for (const step of scheduledSteps(confirmedAt)) {
        transaction.set(db.doc(`scheduledEmails/discernment-${subscriber.id}-${confirmedAt}-${step.step}`), {
          sequence: "discernment-v1", subscriberId: subscriber.id, confirmedAt,
          templateId: step.templateId, step: step.step,
          scheduledFor: Timestamp.fromMillis(step.scheduledFor), status: "pending", createdAt: Timestamp.now(),
        });
      }
      transaction.update(subscriber.ref, { discernmentEnrollment: confirmedAt, emailSequence: "discernment-v1" });
    });
  }
  const due = await db.collection("scheduledEmails").where("scheduledFor", "<=", Timestamp.fromMillis(now)).get();
  for (const job of due.docs) {
    if (job.data().sequence !== "discernment-v1") continue;
    if (job.data().status === "sending" && job.data().startedAt?.toMillis() < now - 10 * 60 * 1000) {
      await job.ref.update({ status: "needs-review", failedAt: Timestamp.now() });
      console.error("Interrupted discernment send needs attention", { jobId: job.id });
    }
    if (job.data().status !== "pending") continue;
    const data = await db.runTransaction(async (transaction) => {
      const current = (await transaction.get(job.ref)).data();
      if (!current || current.status !== "pending") return null;
      const subscriber = (await transaction.get(db.doc(`subscribers/${current.subscriberId}`))).data();
      if (!eligibleSubscriber(subscriber, current.confirmedAt)) {
        transaction.update(job.ref, { status: "cancelled", cancelledAt: Timestamp.now() });
        return null;
      }
      transaction.update(job.ref, { status: "sending", startedAt: Timestamp.now() });
      return { templateId: Number(current.templateId), step: Number(current.step), subscriberId: String(current.subscriberId), confirmedAt: Number(current.confirmedAt), email: String(subscriber?.email), unsubscribeToken: String(subscriber?.unsubscribeToken) };
    });
    if (!data) continue;
    let attemptedSend = false;
    try {
      const contact = await provider(`contacts/${encodeURIComponent(data.email)}`);
      if (contact.emailBlacklisted === true) {
        await job.ref.update({ status: "cancelled", cancelledAt: Timestamp.now() });
        continue;
      }
      const template = await provider(`smtp/templates/${data.templateId}`);
      if (typeof template.htmlContent !== "string" || typeof template.subject !== "string") throw new Error("Invalid email template");
      const htmlContent = renderLetter(template.htmlContent, data.unsubscribeToken);
      const current = (await db.doc(`subscribers/${data.subscriberId}`).get()).data();
      if (!eligibleSubscriber(current, data.confirmedAt)) {
        await job.ref.update({ status: "cancelled", cancelledAt: Timestamp.now() });
        continue;
      }
      attemptedSend = true;
      const result = await provider("smtp/email", {
        sender: { name: "Kali Meister", email: "noreply@kalimeister.com" },
        replyTo: { name: "Randi Agency", email: "billy@randi.agency" },
        to: [{ email: data.email }], subject: template.subject, htmlContent,
        tags: ["discernment-v1", `step-${data.step}`],
      });
      await job.ref.update({ status: "sent", sentAt: Timestamp.now(), messageId: String(result.messageId) });
    } catch {
      await job.ref.update({ status: attemptedSend ? "needs-review" : "failed", failedAt: Timestamp.now() });
      console.error("Discernment email needs attention", { jobId: job.id, attemptedSend });
    }
  }
}

export const deliverDiscernmentSeries = onSchedule({
  schedule: "every 15 minutes", timeZone: "America/New_York", region: "us-east4",
  secrets: [brevoKey], maxInstances: 1, concurrency: 1, timeoutSeconds: 540,
  memory: "256MiB", retryCount: 0,
}, runDiscernmentSeries);
