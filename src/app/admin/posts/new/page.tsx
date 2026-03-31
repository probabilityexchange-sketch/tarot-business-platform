"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Editor } from "@tiptap/react";
import { BlogPostEditor } from "@/components/admin/BlogPostEditor";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { AIGenerateModal } from "@/components/admin/AIGenerateModal";
import { Button } from "@/components/ui/button";
import { generateSlug } from "@/lib/slug";
import { ArrowLeft, Save, Send } from "lucide-react";
import Link from "next/link";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [saving, setSaving] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);

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
      const res = await fetch("/api/blog-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin">
          <Button variant="tertiary" size="sm">
            <ArrowLeft size={16} className="mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="font-display text-2xl text-on-surface">New Post</h1>
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
          <ImageUpload postId="new" value={coverImageUrl} onChange={setCoverImageUrl} />
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
        </div>
      </div>
    </div>
  );
}
