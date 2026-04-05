"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { adminFetch } from "@/lib/admin-client";

type BlogPost = {
  id: string;
  title: string;
  status: "draft" | "published";
  category: string;
  updatedAt: string;
};

type FilterTab = "all" | "drafts" | "published";

async function fetchPosts(): Promise<BlogPost[]> {
  const res = await adminFetch("/api/blog-posts");
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

async function deletePost(id: string): Promise<void> {
  const res = await adminFetch("/api/blog-posts", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("Failed to delete post");
}

export function BlogPostList() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterTab>("all");

  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: fetchPosts,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });

  const filteredPosts = useMemo(() => {
    if (!posts) return undefined;
    return posts.filter((post) => {
      if (filter === "all") return true;
      if (filter === "drafts") return post.status === "draft";
      if (filter === "published") return post.status === "published";
      return true;
    });
  }, [posts, filter]);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deleteMutation.mutate(id);
    }
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "drafts", label: "Drafts" },
    { key: "published", label: "Published" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-outline-variant pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              "px-4 py-2 font-label text-sm uppercase tracking-wider transition-colors",
              filter === tab.key
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface/60 hover:text-on-surface"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-on-surface/60">Loading...</div>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                <th className="text-left p-4 font-label text-xs uppercase tracking-wider text-on-surface/60">
                  Title
                </th>
                <th className="text-left p-4 font-label text-xs uppercase tracking-wider text-on-surface/60">
                  Status
                </th>
                <th className="text-left p-4 font-label text-xs uppercase tracking-wider text-on-surface/60">
                  Category
                </th>
                <th className="text-left p-4 font-label text-xs uppercase tracking-wider text-on-surface/60">
                  Updated
                </th>
                <th className="text-right p-4 font-label text-xs uppercase tracking-wider text-on-surface/60">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts?.map((post) => (
                <tr key={post.id} className="border-b border-outline-variant/50 last:border-0">
                  <td className="p-4 text-on-surface">{post.title}</td>
                  <td className="p-4">
                    <span
                      className={cn(
                        "inline-block px-2 py-1 text-xs font-label uppercase rounded",
                        post.status === "published"
                          ? "bg-primary/20 text-primary"
                          : "bg-surface-container text-on-surface/60"
                      )}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="p-4 text-on-surface/80">{post.category}</td>
                  <td className="p-4 text-on-surface/60 text-sm">
                    {new Date(post.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="tertiary" size="sm">
                        Edit
                      </Button>
                      <Button
                        variant="tertiary"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        className="text-error hover:text-error"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPosts?.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface/60">
                    No posts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
