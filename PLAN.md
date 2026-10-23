# PLAN.md — Kalimeister.com Shared Roadmap & Agent Coordination

> Shared roadmap for **Claude** (Marketing), **Codex** (Infrastructure & Products), and **Gemini / `agy`** (Google Stack & SEO).
> Canonical brand, mission, and engineering rules live in [`AGENTS.md`](./AGENTS.md) and [`marketing-team/context/context-card.md`](./marketing-team/context/context-card.md).

## Mission Statement

> **Give reflective people in transition calm, honest room to think through a question, a decision, or the story they are living—pairing tarot, conversation, and reflective writing for personal discernment rather than prediction or therapy.**

---

## Current Production Status (as of 2026-10-21)

- **Live URL:** `https://kalimeister.com` (Firebase App Hosting backend `kali` in project `kalimeister`)
- **Deployment Flow:** Push to `origin/master` → GitHub / Firebase App Hosting auto-deploys
- **Readings Live:**
  - *The Narrative Deep-Dive* (60 min, $250)
  - *Shadow Work Intensive* (90 min, $450)
  - Cal.com reservation holds + Stripe Checkout + webhook/confirmation fulfillment verified
- **Email & Lead Capture Live:**
  - Website signups (`/api/subscribe`, `/api/free-guide`) add contacts directly to Brevo List `5`; course waitlist (`/api/course-waitlist`) adds to Brevo List `8`
  - Brevo automation *"Kalimeister welcome series"* (discernment guide template 21 → 3-day wait → Letters 01–05 weekly) activated 2026-10-21
- **Merchandise / Shop (`/shop`):**
  - Printify catalog, shipping quotes, and Stripe checkout enabled (`MERCH_CHECKOUT_ENABLED=true`, `MERCH_TAX_REVIEWED=true`; paid orders enter manual admin review before Printify production)
- **Google Stack & SEO:**
  - Consolidated canonical city tarot pages (45 retained, legacy/unoffered service routes 301-redirected or retired)
  - GA4 (`G-83C04RTNB2`) + `gtag` event forwarding configured
  - Firestore Security Rules hardened and deployed (`kalimeister`)

---

## Agent Responsibilities

| Area | Claude (Marketing) | Codex (Infra & Products) | Gemini / `agy` (Google & SEO) |
|---|---|---|---|
| **Brand OS & Copy QA** (`marketing-team/`) | **Primary** | Reads `AGENTS.md` | Reads `AGENTS.md` |
| **Brevo Campaigns, Templates & Automations** | **Primary** | API contact sync (`src/lib/email-signup.ts`) | Secret/env config (`apphosting.yaml`) |
| **Social Scripts (TikTok, Shorts, Reels)** | **Primary** | | |
| **Next.js App, Stripe, Cal.com, Printify** | | **Primary** | |
| **Business Test Suite** (`src/tests/business.cjs`) | | **Primary** | Runs before every push |
| **Firebase (App Hosting, Firestore, Auth)** | | | **Primary** |
| **GA4 / GTM Analytics & Funnel Tracking** | | | **Primary** |
| **Google Search Console, Sitemap, Schema, CWV** | | | **Primary** |
| **Gemini AI Blog Generator** (`/api/generate-post`) | | | **Primary** |

---

## Active Priorities & Next Steps

### 1. Marketing & Content (Claude)
- [x] Ship Welcome + 3-part discernment guide (Brevo template 21) and activate *"Kalimeister welcome series"* automation
- [ ] Review pending items in `marketing-team/approvals/queue.md` with Kali/Billy (`Q-20261017-7` Letter 06, `Q-20261017-8` Retreat interest, `Q-20261021-2` & `Q-20261021-3` Major Arcana scripts)
- [ ] Collect Kali's confirmed credentials, origin story, and 2–3 writing samples to resolve remaining `[unverified]` / `[gap]` tags in `marketing-team/context/brand/`

### 2. Infrastructure & Products (Codex)
- [x] Direct Brevo contact signup (List 5 / List 8) with zero website-sent transactional sequences
- [x] Printify catalog + gated merchandise checkout (`#16`, `#17`, `#19`)
- [ ] Confirm Cal.com availability slots with Kali so `/readings` shows live bookable times
- [ ] Enable merch checkout (`MERCH_CHECKOUT_ENABLED=true`, `MERCH_TAX_REVIEWED=true`) once tax/product review is complete

### 3. Google Ecosystem, Analytics & SEO (Gemini / `agy`)
- [x] Configure GA4 measurement ID fallback and `gtag` funnel event dispatch
- [x] Harden and deploy `firestore.rules` to `kalimeister`
- [x] Align Gemini AI blog generator (`src/app/api/generate-post/route.ts`) with Kali's brand voice and compliance rules
- [ ] Monitor Google Search Console indexing and Core Web Vitals (LCP/CLS) across canonical city reading pages and journal posts
