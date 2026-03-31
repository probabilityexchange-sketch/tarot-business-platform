"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { BlogPostList } from "@/components/admin/BlogPostList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-on-surface/60">Loading...</div>
      </div>
    );
  }

  if (user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-on-surface">Blog Posts</h1>
        <Link href="/admin/posts/new">
          <Button>
            <Plus size={18} className="mr-2" />
            New Post
          </Button>
        </Link>
      </div>
      <BlogPostList />
    </div>
  );
}
