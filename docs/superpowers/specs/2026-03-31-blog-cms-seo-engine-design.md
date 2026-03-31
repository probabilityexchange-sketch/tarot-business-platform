# Blog CMS + SEO Content Engine

## Context

The platform needs organic traffic to drive bookings. The primary bottleneck is visibility — visitors don't know the site exists. The existing SEO content strategy outlines a blog-driven approach but the blog currently uses mock data with no content management system. This design adds a blog CMS with an admin dashboard so the site owner can write, manage, and publish blog posts without developer involvement. It also integrates Gemini AI to accelerate content creation.

Existing pages (`/readings`, `/courses`, booking flow) are unaffected.

## Scope

- Admin dashboard for blog post management (create, edit, publish, delete)
- Rich text editor (Tiptap) with image uploads
- Gemini AI integration for draft generation and text polishing
- Public blog pages backed by Firestore (replacing mock data)
- SEO infrastructure (sitemap, metadata, structured data)

Out of scope: video embeds, social media integration, email newsletter, marketplace features.

## Architecture

```
┌─────────────────────────────────────────────┐
│  Public Site                                 │
│  /blog          → paginated post list        │
│  /blog/[slug]   → single post (SSR)          │
│  /sitemap.xml   → dynamic sitemap            │
└──────────────────┬──────────────────────────┘
                   │ reads
┌──────────────────▼──────────────────────────┐
│  Firestore: `blog_posts` collection          │
│  { title, slug, content, excerpt, category,  │
│    coverImageUrl, status, publishedAt,       │
│    createdAt, updatedAt }                    │
└──────────────────┬──────────────────────────┘
                   │ reads + writes
┌──────────────────▼──────────────────────────┐
│  Admin Dashboard (/admin/*)                  │
│  /admin            → post list               │
│  /admin/posts/new  → Tiptap editor           │
│  /admin/posts/[id] → edit existing post      │
│  Protected by Firebase Auth                  │
└──────────────────┬──────────────────────────┘
                   │ uploads
┌──────────────────▼──────────────────────────┐
│  Firebase Storage: blog-images/              │
│  {postId}/{timestamp}-{filename}             │
└──────────────────┬──────────────────────────┘
                   │ AI generation
┌──────────────────▼──────────────────────────┐
│  /api/generate-post (server-side)            │
│  Gemini 2.0 Flash via @google/generative-ai  │
│  GEMINI_API_KEY (server-only env var)        │
└─────────────────────────────────────────────┘
```

## Data Model

Single Firestore collection: `blog_posts`

```typescript
type BlogPost = {
  id: string;              // Firestore doc ID (auto-generated)
  title: string;           // Display title
  slug: string;            // URL-safe, unique identifier
  content: string;         // HTML output from Tiptap editor
  excerpt: string;         // Summary for listings and meta description (~200 chars max)
  category: string;        // Free-text: "Archetypes", "Theory", "Psychology", etc.
  coverImageUrl: string;   // Firebase Storage download URL
  status: "draft" | "published";
  publishedAt: string | null;  // ISO timestamp, set when status changes to "published"
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}
```

### Firestore Security Rules

- Public read: only documents where `status == "published"`
- Write: authenticated user email must match configured admin email
- Delete: same as write rules

## Admin Dashboard

### Routes

| Route | Description |
|---|---|
| `/admin` | Post list with status badges, edit/delete actions, status filter (All / Drafts / Published) |
| `/admin/posts/new` | Create post — Tiptap editor with metadata fields |
| `/admin/posts/[id]` | Edit existing post — pre-filled editor |

### Auth

- Check `auth.currentUser?.email` against `ADMIN_EMAIL` env var (server-only, not `NEXT_PUBLIC_`)
- If not authorized, redirect to `/`
- No separate login page — uses existing Firebase Auth
- Single admin email for v1

### Tiptap Editor Features

- Headings (H2, H3)
- Bold, italic, strikethrough
- Bullet and numbered lists
- Links
- Inline image upload (drag & drop or button)
- Code blocks

### Post Metadata Fields

- Title (text input)
- Slug (auto-generated from title, editable)
- Excerpt (textarea, ~200 chars)
- Category (text input, not a select — free-text)
- Cover image (file upload → Firebase Storage)
- Status toggle: Draft / Published

### Image Upload Flow

1. User drops or selects image in editor or cover image field
2. Upload to Firebase Storage: `blog-images/{postId}/{timestamp}-{filename}`
3. Get download URL
4. Insert URL into editor HTML content or set as `coverImageUrl`

## Gemini AI Integration

### API Route

`/api/generate-post` — server-side Next.js route handler. Keeps `GEMINI_API_KEY` secret (no `NEXT_PUBLIC_` prefix).

### Model

`gemini-2.0-flash` via `@google/generative-ai` SDK.

### Two Modes

**Generate from topic:**
1. Admin enters a topic or title
2. System sends prompt with topic, brand voice guidelines (psychological tarot, narrative therapy, Jungian concepts, premium academic tone), and target length (~800-1200 words)
3. Gemini returns full draft with headings and body paragraphs
4. Draft populates Tiptap editor for editing

**Polish raw text:**
1. Admin pastes transcript or rough notes into textarea
2. System sends raw text with instructions to restructure as polished blog post preserving voice
3. Result populates editor for final editing

### Streaming

Responses stream to the client for progressive text rendering. Improves perceived performance for longer generations.

### UI

- "Generate with AI" button at top of editor
- Modal with two tabs: "From Topic" and "From Text"
- Generate button triggers streaming response into editor
- Admin can regenerate or edit manually after

## Public Blog Pages

### `/blog` (listing)

- Fetch published posts from Firestore: `where("status", "==", "published").orderBy("publishedAt", "desc").limit(6)`
- Cursor-based pagination via `?page=N` query parameter
- Featured post = most recent. Remaining posts in 2-column grid
- Same card layout and styling as current mock version

### `/blog/[slug]` (single post)

- Fetch by `slug` field where `status == "published"`
- If not found, return 404
- Render HTML content via `dangerouslySetInnerHTML` (same pattern as current)
- JSON-LD structured data (`BlogPosting` schema) auto-generated from post metadata
- "Deepen the Inquiry" CTA at bottom — links to `/readings` (unchanged)

### Performance

- Server-side rendered (not static) — new posts appear immediately without rebuild
- Firestore queries use indexes: `status + publishedAt` composite index

## SEO Layer

1. **Sitemap** (`/sitemap.xml`): Dynamic route querying all published posts. Standard XML with `lastmod` from `publishedAt`. Next.js metadata API handles generation.

2. **Per-post metadata**: `generateMetadata()` export pulls title, description (from excerpt), OpenGraph fields, and publishedTime from Firestore.

3. **JSON-LD**: `BlogPosting` schema on each post page. Already implemented in current mock version — just sourced from real data.

## Error Handling

| Scenario | Behavior |
|---|---|
| Firestore read failure (public) | User-friendly error message with retry button. Listing shows "No posts yet" as fallback. |
| Gemini API failure | Toast notification "AI generation failed. Please try again." Editor content preserved. |
| Image upload failure | Error shown in editor, image not inserted. User can retry. |
| Duplicate slug | Auto-append number (e.g., `shadow-work-2`) on create. |
| Unpublished post accessed by URL | Return 404. |
| Admin auth failure | Redirect to `/`. |
| Empty editor publish | Block publish if title or content is empty. Show validation error. |

## Dependencies

- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link` — rich text editor
- `@google/generative-ai` — Gemini API client

No other new dependencies. Uses existing Firebase, Next.js, and Tailwind setup.

## Testing

Manual testing for v1. When Vitest is added later, prioritize:
- Firestore query helpers (CRUD operations)
- Slug generation and uniqueness logic
- Gemini API route (mock the SDK)
