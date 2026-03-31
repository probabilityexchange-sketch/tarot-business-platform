import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
if (!ADMIN_EMAIL) throw new Error("ADMIN_EMAIL env var not set");

if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}")),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  try {
    const decoded = await getAuth().verifySessionCookie(token, true);
    return decoded.email === ADMIN_EMAIL;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const postId = formData.get("postId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
  }

  const bucket = getStorage().bucket();
  const timestamp = Date.now();
  const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `blog-images/${postId || "temp"}/${timestamp}-${safeFilename}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await bucket.file(path).save(buffer, {
    metadata: { contentType: file.type },
  });

  await bucket.file(path).makePublic();
  const url = `https://storage.googleapis.com/${bucket.name}/${path}`;

  return NextResponse.json({ url });
}
