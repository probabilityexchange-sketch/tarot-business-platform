import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { savePost } from "@/lib/published-blog";
import type { BlogPost } from "@/types/blog";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const isAdmin = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const snap = await getAdminDb().collection("blog_posts").doc(id).get();

  if (!snap.exists) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ ...(snap.data() as BlogPost), id: snap.id });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const isAdmin = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await savePost(await request.json().catch(() => null), id);
  return NextResponse.json(result.error ? { error: result.error } : { success: true }, { status: result.status });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const isAdmin = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  await getAdminDb().collection("blog_posts").doc(id).delete();
  return NextResponse.json({ success: true });
}
