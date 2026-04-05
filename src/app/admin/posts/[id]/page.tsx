"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import type { Editor } from "@tiptap/react";
import { BlogPostEditor } from "@/components/admin/BlogPostEditor";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { AIGenerateModal } from "@/components/admin/AIGenerateModal";
import { Button } from "@/components/ui/button";
import { generateSlug } from "@/lib/slug";
import { adminFetch } from "@/lib/admin-client";
import { ArrowLeft, Save, Send, Trash2 } from "lucide-react";
import Link from "next/link";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  coverImageUrl: string;
  status: "draft" | "published";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState<Editor | null>(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await adminFetch(`/api/blog-posts/${id}`);
        if (!res.ok) throw new Error("Failed to fetch post");
        const post: BlogPost = await res.json();

        setTitle(post.title);
        setSlug(post.slug);
        setExcerpt(post.excerpt);
        setCategory(post.category);
        setCoverImageUrl(post.coverImageUrl);
        setContent(post.content);
        setStatus(post.status);

        if (editor) {
          editor.commands.setContent(post.content);
        }
      } catch (error) {
        console.error("Failed to fetch post:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchPost();
    }
  }, [id, editor]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === generateSlug(value)) {
      setSlug(generateSlug(value));
    }
  };

  const handleEditorChange = (html: string) => {
    setContent(html);
  };

  const handleSubmit = async (publishStatus: "draft" | "published") => {
    setSaving(true);
    try {
      const res = await adminFetch("/api/blog-posts", {
        method: "PUT",
        body: JSON.stringify({
          id,
          title,
          slug,
          excerpt,
          category,
          coverImageUrl,
          content,
          status: publishStatus,
        }),
      });

      if (res.ok) {
        router.push("/admin");
      }
    } catch (error) {
      console.error("Failed to save post:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await adminFetch("/api/blog-posts", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        router.push("/admin");
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-on-surface/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin">
          <Button variant="tertiary" size="sm">
            <ArrowLeft size={16} className="mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="font-display text-2xl text-on-surface">Edit Post</h1>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-label uppercase tracking-wider text-on-surface/60 mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface placeholder:text-on-surface/40 focus:outline-none focus:border-primary"
            placeholder="Enter post title..."
          />
        </div>

        <div>
          <label className="block text-sm font-label uppercase tracking-wider text-on-surface/60 mb-2">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface placeholder:text-on-surface/40 focus:outline-none focus:border-primary"
            placeholder="post-url-slug..."
          />
        </div>

        <div>
          <label className="block text-sm font-label uppercase tracking-wider text-on-surface/60 mb-2">
            Excerpt
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value.slice(0, 200))}
            rows={3}
            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface placeholder:text-on-surface/40 focus:outline-none focus:border-primary resize-none"
            placeholder="Brief description of the post..."
          />
          <div className="text-right text-xs text-on-surface/40 mt-1">
            {excerpt.length}/200
          </div>
        </div>

        <div>
          <label className="block text-sm font-label uppercase tracking-wider text-on-surface/60 mb-2">
            Category
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface placeholder:text-on-surface/40 focus:outline-none focus:border-primary"
            placeholder="e.g., Tarot, Meditation, Psychology..."
          />
        </div>

        <div>
          <label className="block text-sm font-label uppercase tracking-wider text-on-surface/60 mb-2">
            Cover Image
          </label>
          <ImageUpload postId={id} value={coverImageUrl} onChange={setCoverImageUrl} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-label uppercase tracking-wider text-on-surface/60">
              Content
            </label>
            {editor && <AIGenerateModal editor={editor} />}
          </div>
          <BlogPostEditor initialContent={content} onChange={handleEditorChange} onEditorReady={setEditor} />
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            variant="secondary"
            onClick={() => handleSubmit("draft")}
            disabled={saving}
          >
            <Save size={16} className="mr-2" />
            {saving ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSubmit("published")}
            disabled={saving}
          >
            <Send size={16} className="mr-2" />
            {saving ? "Publishing..." : "Publish"}
          </Button>
          <Button
            variant="tertiary"
            onClick={handleDelete}
            className="ml-auto text-error hover:text-error"
          >
            <Trash2 size={16} className="mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
