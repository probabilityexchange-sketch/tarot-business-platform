"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { BlogPostList } from "@/components/admin/BlogPostList";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";

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
        <div>
          <h1 className="font-display text-3xl text-on-surface">Admin</h1>
          <p className="text-on-surface/60 mt-2">Manage the journal and service operations from one place.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/bookings">
            <Button variant="secondary">
              <BookOpen size={18} className="mr-2" />
              Bookings
            </Button>
          </Link>
          <Link href="/admin/posts/new">
            <Button>
              <Plus size={18} className="mr-2" />
              New Post
            </Button>
          </Link>
        </div>
      </div>
      <Card className="mb-10 border-none">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-label text-xs uppercase tracking-[0.2em] text-tertiary mb-2">Service Tools</p>
            <h2 className="text-2xl font-display text-on-surface">Reading bookings, notes, and follow-up</h2>
            <p className="text-on-surface/60 mt-2 max-w-2xl">
              Keep an eye on upcoming sessions, payment status, and internal notes without leaving the admin area.
            </p>
          </div>
          <Link href="/admin/bookings">
            <Button variant="secondary">Open Booking Dashboard</Button>
          </Link>
        </div>
      </Card>
      <BlogPostList />
    </div>
  );
}
