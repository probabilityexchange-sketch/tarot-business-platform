"use client";

import { auth } from "@/lib/firebase";

export async function getAdminIdToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Admin authentication required");
  }

  return user.getIdToken();
}

export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = await getAdminIdToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
