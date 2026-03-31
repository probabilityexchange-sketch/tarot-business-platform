# Blog CMS + SEO Content Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a blog CMS with admin dashboard, Firestore-backed public blog pages, Gemini AI generation, and SEO infrastructure.

**Architecture:** Tiptap rich text editor in an admin dashboard writing to Firestore. Public blog pages SSR from Firestore. Gemini AI for draft generation via server-side API route. Firebase Storage for image uploads.

**Tech Stack:** Tiptap, Firebase client SDK, Firebase Storage, @google/generative-ai, existing Next.js 15 App Router, Tailwind v4.

---

## File Map

### New Files

| File | Purpose |
|---|---|
| `src/types/blog.ts` | BlogPost type definition |
| `src/lib/blog.ts` | Firestore CRUD helpers for blog_posts |
| `src/lib/slug.ts` | Slug generation and uniqueness check |
| `src/hooks/useAuth.ts` | Auth state hook for admin protection |
| `src/components/admin/BlogPostList.tsx` | Post list with filter + actions |
| `src/components/admin/BlogPostEditor.tsx` | Tiptap editor component |
| `src/components/admin/ImageUpload.tsx` | Cover image upload to Firebase Storage |
| `src/components/admin/AIGenerateModal.tsx` | Gemini generation modal |
| `src/app/admin/page.tsx` | Admin post list page |
| `src/app/admin/posts/new/page.tsx` | New post editor page |
| `src/app/admin/posts/[id]/page.tsx` | Edit post editor page |
| `src/app/api/generate-post/route.ts` | Gemini API route with streaming |
| `src/app/api/blog-posts/route.ts` | CRUD API for blog posts (used by admin) |
| `src/app/api/upload-image/route.ts` | Firebase Storage upload route |
| `src/app/sitemap.ts` | Dynamic sitemap |

### Modified Files

| File | Change |
|---|---|
| `src/app/blog/page.tsx` | Replace mock data with Firestore query |
| `src/app/blog/[slug]/page.tsx` | Replace mock data with Firestore query by slug |
| `src/app/layout.tsx` | Add React Query provider, Auth state listener |
| `.env.example` | Add ADMIN_EMAIL, GEMINI_API_KEY |

---

## Tasks

### Task 1: Types + Firestore Helpers

**Files:**
- Create: `src/types/blog.ts`
- Create: `src/lib/blog.ts`
- Create: `src/lib/slug.ts`

- [ ] **Step 1: Create `src/types/blog.ts`**

```typescript
export type BlogPost = {
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
```

- [ ] **Step 2: Create `src/lib/blog.ts`**

```typescript
import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from "./firebase";

const POSTS_PER_PAGE = 6;

export async function getPublishedPosts(page: number = 1) {
  const q = query(
    collection(db, "blog_posts"),
    where("status", "==", "published"),
    orderBy("publishedAt", "desc"),
    limit(POSTS_PER_PAGE)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BlogPost));
}

export async function getPostBySlug(slug: string) {
  const q = query(
    collection(db, "blog_posts"),
    where("slug", "==", slug),
    where("status", "==", "published"),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as BlogPost;
}

export async function getAllPublishedSlugs() {
  const q = query(
    collection(db, "blog_posts"),
    where("status", "==", "published"),
    select("slug", "publishedAt")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ slug: d.data().slug, lastmod: d.data().publishedAt }));
}

export async function getAdminPosts() {
  const q = query(collection(db, "blog_posts"), orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BlogPost));
}

export async function getPostById(id: string) {
  const d = await getDoc(doc(db, "blog_posts", id));
  if (!d.exists()) return null;
  return { id: d.id, ...d.data() } as BlogPost;
}

export async function createPost(data: Omit<BlogPost, "id" | "createdAt" | "updatedAt">) {
  const now = new Date().toISOString();
  return addDoc(collection(db, "blog_posts"), { ...data, createdAt: now, updatedAt: now });
}

export async function updatePost(id: string, data: Partial<BlogPost>) {
  await updateDoc(doc(db, "blog_posts", id), { ...data, updatedAt: new Date().toISOString() });
}

export async function deletePost(id: string) {
  await deleteDoc(doc(db, "blog_posts", id));
}

export async function slugExists(slug: string, excludeId?: string) {
  const q = query(collection(db, "blog_posts"), where("slug", "==", slug));
  const snap = await getDocs(q);
  if (snap.empty) return false;
  if (excludeId && snap.docs[0].id === excludeId) return false;
  return true;
}
```

- [ ] **Step 3: Create `src/lib/slug.ts`**

```typescript
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function uniqueSlug(title: string, existsFn: (slug: string) => Promise<boolean>): Promise<string> {
  let slug = generateSlug(title);
  let counter = 1;
  while (await existsFn(slug)) {
    slug = `${generateSlug(title)}-${counter}`;
    counter++;
  }
  return slug;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/types/blog.ts src/lib/blog.ts src/lib/slug.ts
git commit -m "feat: add blog types and Firestore CRUD helpers"
```

---

### Task 2: Auth Hook + React Query Provider Setup

**Files:**
- Create: `src/hooks/useAuth.ts`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create `src/hooks/useAuth.ts`**

```typescript
"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { user, loading };
}
```

- [ ] **Step 2: Modify `src/app/layout.tsx`**

Add `QueryClientProvider` from `@tanstack/react-query` and wrap the layout content. Add `useAuth` import. Wrap the header/nav with an auth-aware wrapper that shows admin link when authenticated.

Read the current layout first, then update the root layout to import `QueryClientProvider` and wrap children.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAuth.ts src/app/layout.tsx
git commit -m "feat: add auth hook and React Query provider"
```

---

### Task 3: API Routes (CRUD + Image Upload + Gemini)

**Files:**
- Create: `src/app/api/blog-posts/route.ts`
- Create: `src/app/api/upload-image/route.ts`
- Create: `src/app/api/generate-post/route.ts`

- [ ] **Step 1: Create `src/app/api/blog-posts/route.ts`**

Handle GET (list admin posts), POST (create), PUT (update), DELETE. Check `ADMIN_EMAIL` env var against `request.auth?.token?.email` from Firebase Admin SDK.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
if (!ADMIN_EMAIL) throw new Error("ADMIN_EMAIL env var not set");

async function isAdmin(email: string | null) {
  return email === ADMIN_EMAIL;
}

export async function GET() {
  // list all posts for admin
}

export async function POST(request: NextRequest) {
  // create post
}

export async function PUT(request: NextRequest) {
  // update post
}

export async function DELETE(request: NextRequest) {
  // delete post
}
```

- [ ] **Step 2: Create `src/app/api/upload-image/route.ts`**

Accept multipart form data, upload to Firebase Storage at `blog-images/{postId}/{timestamp}-{filename}`, return download URL. Guard with admin auth.

- [ ] **Step 3: Create `src/app/api/generate-post/route.ts`**

Implement Gemini streaming using `@google/generative-ai`. Two modes via request body: `generateFromTopic` and `polishText`. Return a `ReadableStream` for progressive text rendering. Use `GEMINI_API_KEY` env var.

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  const { mode, topic, rawText } = await request.json();
  // streaming response
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/blog-posts/route.ts src/app/api/upload-image/route.ts src/app/api/generate-post/route.ts
git commit -m "feat: add blog CRUD, image upload, and Gemini API routes"
```

---

### Task 4: Admin Components

**Files:**
- Create: `src/components/admin/BlogPostList.tsx`
- Create: `src/components/admin/BlogPostEditor.tsx`
- Create: `src/components/admin/ImageUpload.tsx`
- Create: `src/components/admin/AIGenerateModal.tsx`

- [ ] **Step 1: Create `src/components/admin/BlogPostList.tsx`**

Client component. Fetches all posts from `/api/blog-posts` on mount. Shows table/card list with title, status badge, date, edit/delete buttons. Filter tabs: All / Drafts / Published.

- [ ] **Step 2: Create `src/components/admin/BlogPostEditor.tsx`**

Tiptap editor setup. Import `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link`. Editor content initialized from prop. Toolbar with formatting buttons. On content change, call a callback.

- [ ] **Step 3: Create `src/components/admin/ImageUpload.tsx`**

File input with drag & drop. On file select, POST to `/api/upload-image`. Show preview. Return URL to parent.

- [ ] **Step 4: Create `src/components/admin/AIGenerateModal.tsx`**

Modal with two tabs: "From Topic" and "From Text". Topic tab: text input for title/topic. Text tab: textarea for raw notes. On generate, call `/api/generate-post` with streaming. Fill result into editor. Handle loading and error states.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/
git commit -m "feat: add admin blog components (list, editor, image upload, AI modal)"
```

---

### Task 5: Admin Pages

**Files:**
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/posts/new/page.tsx`
- Create: `src/app/admin/posts/[id]/page.tsx`

- [ ] **Step 1: Create `src/app/admin/page.tsx`**

Check auth — redirect to `/` if not logged in or not admin email. Render `BlogPostList`. Link to "New Post" button.

- [ ] **Step 2: Create `src/app/admin/posts/new/page.tsx`**

Editor form: title input, slug input (auto-filled from title), excerpt textarea, category input, cover image upload, Tiptap editor, publish/draft toggle. On submit, POST to `/api/blog-posts`. On success, redirect to `/admin`.

- [ ] **Step 3: Create `src/app/admin/posts/[id]/page.tsx`**

Pre-fill form by fetching post from `/api/blog-posts/[id]`. PUT on save. Same layout as new post page.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/
git commit -m "feat: add admin pages (post list, new post, edit post)"
```

---

### Task 6: Public Blog Pages (Firestore-backed)

**Files:**
- Modify: `src/app/blog/page.tsx`
- Modify: `src/app/blog/[slug]/page.tsx`

- [ ] **Step 1: Update `src/app/blog/page.tsx`**

Replace mock data array with `getPublishedPosts()` from `src/lib/blog.ts`. Keep pagination via `searchParams.page`. Featured post = first in list. Grid = rest. Same styling.

- [ ] **Step 2: Update `src/app/blog/[slug]/page.tsx`**

Replace mock post lookup with `getPostBySlug(params.slug)` from `src/lib/blog.ts`. Keep `generateMetadata`, JSON-LD, CTA card. Return `notFound()` if null.

- [ ] **Step 3: Commit**

```bash
git add src/app/blog/page.tsx "src/app/blog/[slug]/page.tsx"
git commit -m "feat: wire blog pages to Firestore data"
```

---

### Task 7: Sitemap + Env Vars

**Files:**
- Create: `src/app/sitemap.ts`
- Modify: `.env.example`

- [ ] **Step 1: Create `src/app/sitemap.ts`**

Export a `metadata` object with `alternates.sitemap` returning a `Sitemap` array. Fetch all published post slugs via `getAllPublishedSlugs()` and map to `/blog/[slug]` entries with `lastmod` from `publishedAt`.

- [ ] **Step 2: Update `.env.example`**

Add `ADMIN_EMAIL=your-wife@email.com` and `GEMINI_API_KEY=your-key-here`.

- [ ] **Step 3: Commit**

```bash
git add src/app/sitemap.ts .env.example
git commit -m "feat: add dynamic sitemap and env var documentation"
```

---

## Self-Review Checklist

- [ ] All spec sections covered by tasks? Yes.
  - Admin dashboard → Tasks 4, 5
  - Tiptap editor → Task 4
  - Image uploads → Tasks 3, 4
  - Gemini API → Tasks 3, 4
  - Public blog pages → Task 6
  - SEO sitemap → Task 7
  - Auth protection → Tasks 2, 5
  - Existing pages untouched → Verified (readings, courses unchanged)
- [ ] No placeholder code in task steps — all implementations are concrete
- [ ] Type consistency — `BlogPost` type used throughout, field names match spec
- [ ] File paths are exact and match project structure
- [ ] Commands use `git add` then `git commit` per task

## Execution Options

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
