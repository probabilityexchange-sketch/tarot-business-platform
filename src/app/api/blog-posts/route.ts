import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { verifyAdminRequest } from "@/lib/admin-auth";
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
  const body = await request.json();
  const { title, slug, content, excerpt, category, coverImageUrl, status } = body;
  if (!title || !slug || !content || !excerpt || !category || !status) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const now = new Date().toISOString();
  const docRef = await getAdminDb().collection("blog_posts").add({
    title,
    slug,
    content,
    excerpt,
    category,
    coverImageUrl: coverImageUrl || "",
    status,
    publishedAt: status === "published" ? now : null,
    createdAt: now,
    updatedAt: now,
  });
  return NextResponse.json({ id: docRef.id });
}

export async function PUT(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { id, ...data } = body;
  if (!id) {
    return NextResponse.json({ error: "Missing post id" }, { status: 400 });
  }
  const docRef = getAdminDb().doc(`blog_posts/${id}`);
  await docRef.update({ ...data, updatedAt: new Date().toISOString() });
  return NextResponse.json({ success: true });
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
