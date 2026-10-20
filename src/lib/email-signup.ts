import { createHash, randomBytes } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { getAdminDb } from "@/lib/firebase-admin";
import { allowPublicRequest } from "@/lib/request-limit";

export const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  consent: z.literal(true),
  source: z.string().max(120).optional().default("homepage"),
  website: z.string().max(200).optional().default(""),
});

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function brevoRequest(path: string, body: Record<string, unknown>) {
  if (!process.env.BREVO_API_KEY) throw new Error("Email service unavailable");
  const response = await fetch(`https://api.brevo.com/v3/${path}`, {
    method: "POST",
    headers: { "api-key": process.env.BREVO_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
}

function signupList(source: string) {
  const listId = Number(source === "course-waitlist" ? process.env.BREVO_COURSE_LIST_ID : process.env.BREVO_LIST_ID);
  if (!Number.isSafeInteger(listId) || listId <= 0) throw new Error("Subscriber list is not configured");
  if (source === "course-waitlist" && listId === Number(process.env.BREVO_LIST_ID)) throw new Error("Course waitlist requires a separate list");
  return listId;
}

export async function requestSignup(request: Request, source?: string) {
  try {
    const parsed = signupSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "Enter a valid email and agree to receive Kali’s emails." }, { status: 400 });
    const data = parsed.data;
    if (data.website) return Response.json({ message: "Check your inbox to confirm your email." });
    if (!process.env.BREVO_API_KEY) throw new Error("Email service unavailable");
    const signupSource = source || "website";
    const listId = signupList(signupSource);
    const templateId = Number(process.env.BREVO_DOI_TEMPLATE_ID);
    if (!Number.isSafeInteger(templateId) || templateId <= 0) throw new Error("Email confirmation is not configured");
    if (!(await allowPublicRequest("email"))) return Response.json({ error: "Signup is busy. Please try again later." }, { status: 429 });
    const ref = getAdminDb().collection("email_signup_requests").doc(hash(`${listId}:${data.email}`));
    const accepted = await getAdminDb().runTransaction(async (transaction) => {
      const existing = (await transaction.get(ref)).data();
      if (existing?.requestedAt instanceof Timestamp && existing.requestedAt.toMillis() > Date.now() - 60000) return false;
      transaction.set(ref, {
        listId, source: source || data.source,
        consentVersion: "2026-10-20", requestedAt: Timestamp.now(),
        status: "confirmation_requested", emailOwner: "brevo",
        deleteAfter: Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      return true;
    });
    if (!accepted) return Response.json({ error: "Please wait a minute before requesting another email." }, { status: 429 });
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://kalimeister.com";
    await brevoRequest("contacts/doubleOptinConfirmation", {
      email: data.email, includeListIds: [listId], templateId,
      redirectionUrl: `${baseUrl}/email/confirmed`,
    });
    return Response.json({ message: "Check your inbox to confirm your email." });
  } catch (error) {
    console.error("Email signup failed", error);
    return Response.json({ error: "We couldn't send your confirmation email. Please try again in a minute." }, { status: 503 });
  }
}

export async function confirmSignup(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) throw new Error("Invalid confirmation link");
  const result = await getAdminDb().collection("subscribers").where("confirmationHash", "==", hash(token)).limit(1).get();
  const ref = result.docs[0]?.ref;
  if (!ref) throw new Error("This confirmation link is invalid or has been replaced.");
  const unsubscribeToken = randomBytes(32).toString("hex");
  const data = await getAdminDb().runTransaction(async (transaction) => {
    const record = (await transaction.get(ref)).data();
    if (!record || record.confirmationHash !== hash(token) || !(record.confirmationExpiresAt instanceof Timestamp) || record.confirmationExpiresAt.toMillis() < Date.now()) throw new Error("This confirmation link has expired. Please sign up again.");
    if (record.confirmedFor === hash(token) || record.guideSentFor === hash(token)) return null;
    if (record.deliveryLeaseUntil instanceof Timestamp && record.deliveryLeaseUntil.toMillis() > Date.now()) throw new Error("Confirmation is already in progress. Please try again in a minute.");
    const activeUnsubscribeToken = record.unsubscribeToken || unsubscribeToken;
    transaction.update(ref, { deliveryLeaseUntil: Timestamp.fromMillis(Date.now() + 60000), unsubscribeHash: hash(activeUnsubscribeToken), unsubscribeToken: activeUnsubscribeToken });
    return { email: z.string().email().parse(record.email), source: String(record.source || "website") };
  });
  if (!data) return;
  try {
    const listId = signupList(data.source);
    await brevoRequest("contacts", { email: data.email, updateEnabled: true, listIds: [listId] });
    const activated = await getAdminDb().runTransaction(async (transaction) => {
      const current = (await transaction.get(ref)).data();
      if (current?.confirmationHash !== hash(token) || !(current.confirmationExpiresAt instanceof Timestamp) || current.confirmationExpiresAt.toMillis() < Date.now()) return false;
      transaction.update(ref, { status: "active", consentConfirmedAt: Timestamp.now(), confirmedFor: hash(token), emailOwner: "brevo", emailSequence: "disabled", deliveryLeaseUntil: Timestamp.fromMillis(0) });
      return true;
    });
    if (!activated) {
      const current = (await ref.get()).data();
      if (current?.status === "unsubscribed") await brevoRequest("contacts", { email: data.email, updateEnabled: true, emailBlacklisted: true });
      throw new Error("Confirmation changed while processing");
    }
  } catch (error) {
    await ref.update({ deliveryLeaseUntil: Timestamp.fromMillis(0) });
    throw error;
  }
}

export async function unsubscribe(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) throw new Error("Invalid unsubscribe link");
  const result = await getAdminDb().collection("subscribers").where("unsubscribeHash", "==", hash(token)).limit(1).get();
  if (!result.docs.length) throw new Error("Invalid unsubscribe link");
  const snapshot = result.docs[0];
  const email = snapshot.data().email;
  const matches = await getAdminDb().collection("subscribers").where("email", "==", email).get();
  const batch = getAdminDb().batch();
  for (const document of matches.docs) batch.update(document.ref, { status: "unsubscribed", emailSequence: "disabled", unsubscribedAt: Timestamp.now(), confirmationExpiresAt: Timestamp.fromMillis(0) });
  await batch.commit();
  await brevoRequest("contacts", { email, updateEnabled: true, emailBlacklisted: true });
}
