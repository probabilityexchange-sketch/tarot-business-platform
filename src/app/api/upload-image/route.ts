import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "firebase-admin/storage";
import { verifyAdminRequest } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request);
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
