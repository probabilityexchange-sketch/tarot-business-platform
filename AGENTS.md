# AGENTS.md — Kalimeister.com Master Source of Truth

This document is the canonical source of truth for **all three AI agents** collaborating on `kalimeister.com` (`tarot-business-platform`):
- **Claude (`claude` / Claude Code):** Marketing, campaigns, Brevo lifecycle sequences, and brand copy QA (`marketing-team/`).
- **Codex (`codex`):** Core application infrastructure, product flows (Stripe, Cal.com, Printify merch, Brevo API integration), and business test suites (`src/tests/`).
- **Gemini (`agy` / Antigravity CLI):** Google ecosystem — Firebase (App Hosting, Firestore security rules & indexes, Auth, Cloud Functions), Google Analytics 4 (GA4) & Tag Manager (GTM), Google Search Console / Technical SEO / Sitemap / Structured Data / Core Web Vitals, and Gemini AI (`@google/generative-ai`).

---

## 1. Mission Statement

> **Give reflective people in transition calm, honest room to think through a question, a decision, or the story they are living—pairing tarot, conversation, and reflective writing for personal discernment rather than prediction or therapy.**

---

## 2. Brand Identity, Voice & Hard Compliance Rules

Detailed brand context lives in `marketing-team/context/context-card.md` and `marketing-team/context/brand/`. Every agent editing copy, metadata, prompts, or UI must enforce these rules:

### Who Kali Meister Is
- A Tennessee-based writer and spiritual practitioner offering private online tarot readings and reflective writing (`https://kalimeister.com`).
- **Audience:** Reflective professionals and high-achievers in transition (career change, grief, awakening spiritual gifts).
- **Core Message:** *"A reading is time and space to think through a question, a decision or the story you're living."*

### Voice & Tone
- **Three words:** Calm, reflective, plain (with occasional dry wit in shop copy).
- **Style:** Short declarative sentences, everyday words, warm and clear without hype or fortune-teller tropes.
- **Signature lines:**
  - *"A strong feeling. A thoughtful next step."*
  - *"A reading with room for you."*
  - *"Bring a question, a decision or a story you're ready to explore."*
  - *"Tarot is not about predicting the future — it's about illuminating the present."*

### Hard Compliance Rules (Non-Negotiable)
1. **NEVER call readings "therapy"** (do not use "narrative therapy", "psychological therapy", or clinical treatment framing).
2. **NEVER predict outcomes or promise guaranteed results.**
3. **NEVER make medical, mental health, legal, or financial claims** (including grief-healing promises).
4. **NEVER invent or state unverified credentials, statistics, or client stories/testimonials** (e.g., do not claim "5,000 readings" or unconfirmed degrees/certifications unless explicitly approved in `marketing-team/context/brand/claims-and-compliance.md`).
5. **Banned Words:** `therapy`, `manifest`, `destiny`, `guaranteed`, `unlock`, `transform your life`, and AI-slop clichés.
6. **Required Reading Disclaimer** (wherever readings are promoted or booked):
   > *"Tarot readings are offered for reflection and personal insight. They don't predict outcomes and aren't a substitute for medical, mental health, legal or financial advice."*

---

## 3. Live Offers & Operational Truths

| Offer | Details | Price | Primary CTA / Route |
|---|---|---|---|
| **The Narrative Deep-Dive** | 60-minute private online tarot reading | **$250** | `"Book a Reading"` → `/readings` |
| **Shadow Work Intensive** | 90-minute private online tarot reading | **$450** | `"Book a Reading"` → `/readings` |
| **Letters from Kali + Free 3-Part Discernment Guide** | Email signup & weekly reflective letters | **Free** | `"Send me the free guide"` → `/letters` |
| **Course Waitlist** | Upcoming self-paced resources waitlist | **Waitlist** | `/courses` |
| **Shop / Candles & Merch** | Printify + Stripe merch preview (checkout gated via `MERCH_CHECKOUT_ENABLED`) | **Preview** | `/shop` |

### Critical System Boundaries
- **Booking Policy:** Advance payment via Stripe required; non-refundable; reschedule with at least 48 hours' notice; slot reservation holds expire after 30–45 minutes.
- **Email Architecture (Brevo Owns All Subscriber Email):**
  - The website **NEVER** sends marketing, welcome, guide, or sequence emails itself (no `POST /v3/smtp/email` or Firebase email triggers).
  - Website signup routes (`/api/subscribe`, `/api/free-guide`) only validate consent/email and add contacts to **Brevo List `5`** (`BREVO_LIST_ID=5`, *"Kali Meister — Website subscribers"*).
  - Course waitlist signups (`/api/course-waitlist`) add contacts to **Brevo List `8`** (`BREVO_COURSE_LIST_ID=8`), never List 5.
  - All welcome/guide/weekly emails are sent by the active Brevo automation (*"Kalimeister welcome series"*).

---

## 4. Multi-Agent Coordination Protocol

| Domain | Owner | Responsibilities |
|---|---|---|
| **Marketing & Brand OS** | **Claude** | `marketing-team/` campaigns, Brevo email templates & automations, social scripts, brand context updates, copy QA (`marketing-team/approvals/queue.md`). |
| **Infrastructure & Products** | **Codex** | Next.js routes & UI components, Stripe checkout & webhooks, Cal.com slot holds & fulfillment, Printify catalog/order flows, Brevo contact signup logic, and `src/tests/business.cjs`. |
| **Google Stack & SEO** | **Gemini (`agy`)** | Firebase App Hosting (`apphosting.yaml`, `firebase.json`), Firestore Security Rules (`firestore.rules`) & indexes, Firebase Auth/Admin, GA4 & GTM (`src/components/Analytics.tsx`, `src/lib/analytics.ts`), Sitemap/Robots/Schema/CWV, and Gemini AI (`src/app/api/generate-post/route.ts`). |

### Shared Git & Verification Rules
1. Always pull/check `origin/master` before starting work so agents never overwrite each other's commits.
2. Before pushing to `master` (which triggers Firebase App Hosting deployment to `https://kalimeister.com`), run:
   ```bash
   npm run typecheck
   npm run test:business
   ```
3. Never commit secrets, `.env.local`, or `.*.swp` files.

---

## 5. Build, Dev & Test Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# TypeScript type-checking
npm run typecheck

# Business & integration test suite (mocked Stripe, Cal.com, Firestore, Brevo, Printify, SEO)
npm run test:business

# Firebase CLI (always invoke via npx)
npx -y firebase-tools@latest deploy --only firestore:rules --project kalimeister
```

---

## 6. Code Style & Conventions

- **TypeScript:** Strict mode enabled. Never use `any`. Prefer `type` over `interface`. Use `import type` for type-only imports.
- **Quotes:** Double quotes (`"`) for all strings and imports.
- **Path Alias:** `@/*` maps to `./src/*`.
- **Components:** Functional components using `function` keyword.
- **Styling:** Tailwind CSS v4 using the site's warm editorial palette (`bg-surface`, `text-on-surface`, `text-primary`, `text-secondary`).
