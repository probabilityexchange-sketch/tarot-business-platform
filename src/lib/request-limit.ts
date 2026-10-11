import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";

export async function allowPublicRequest(operation: "email" | "reservation", maximum = 30) {
  const bucket = Math.floor(Date.now() / (60 * 60 * 1000));
  const ref = getAdminDb().collection("request_limits").doc(`${operation}-${bucket}`);
  return getAdminDb().runTransaction(async (transaction) => {
    const record = (await transaction.get(ref)).data();
    const count = Number(record?.count || 0);
    if (count >= maximum) return false;
    transaction.set(ref, { count: count + 1, expiresAt: Timestamp.fromMillis((bucket + 24) * 60 * 60 * 1000) });
    return true;
  });
}
