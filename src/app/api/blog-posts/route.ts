import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { savePost } from "@/lib/published-blog";
import type { BlogPost } from "@/types/blog";

export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const q = getAdminDb().collection("blog_posts").orderBy("updatedAt", "desc");
  const snap = await q.get();
  const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as BlogPost));
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await savePost(await request.json().catch(() => null));
  return NextResponse.json(result.error ? { error: result.error } : { id: result.id }, { status: result.status });
}

export async function PUT(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body || typeof body.id !== "string") return NextResponse.json({ error: "Missing post id" }, { status: 400 });
  const result = await savePost(body, body.id);
  return NextResponse.json(result.error ? { error: result.error } : { success: true }, { status: result.status });
}

export async function DELETE(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const id = body.id || new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing post id" }, { status: 400 });
  }
  const docRef = getAdminDb().doc(`blog_posts/${id}`);
  await docRef.delete();
  return NextResponse.json({ success: true });
}
