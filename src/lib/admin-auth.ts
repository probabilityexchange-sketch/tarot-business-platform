import type { NextRequest } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";

export async function verifyAdminRequest(request: NextRequest): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    return false;
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = await getAdminAuth().verifyIdToken(token, true);
    return decoded.email === adminEmail;
  } catch {
    return false;
  }
}
