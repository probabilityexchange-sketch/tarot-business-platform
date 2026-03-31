import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getAdminPosts, createPost, updatePost, deletePost } from "@/lib/blog";
import type { BlogPost } from "@/types/blog";

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  if (!ADMIN_EMAIL) return false;
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

export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const posts = await getAdminPosts();
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { title, slug, content, excerpt, category, coverImageUrl, status } = body;
  if (!title || !slug || !content || !excerpt || !category || !status) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const docRef = await createPost({ title, slug, content, excerpt, category, coverImageUrl: coverImageUrl || "", status, publishedAt: status === "published" ? new Date().toISOString() : null });
  return NextResponse.json({ id: docRef.id });
}

export async function PUT(request: NextRequest) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { id, ...data } = body;
  if (!id) {
    return NextResponse.json({ error: "Missing post id" }, { status: 400 });
  }
  await updatePost(id, data as Partial<BlogPost>);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const id = body.id || new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing post id" }, { status: 400 });
  }
  await deletePost(id);
  return NextResponse.json({ success: true });
}
