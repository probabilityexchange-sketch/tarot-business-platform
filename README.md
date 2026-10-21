# Kalimeister.com (`tarot-business-platform`)

> **Mission:** Give reflective people in transition calm, honest room to think through a question, a decision, or the story they are living—pairing tarot, conversation, and reflective writing for personal discernment rather than prediction or therapy.

## Stack & Architecture
- **Frontend:** Next.js 15 (App Router, TypeScript, Tailwind CSS v4)
- **Google Cloud / Firebase:** Firebase App Hosting (`kali` backend), Firestore, Firebase Auth, GA4 (`G-83C04RTNB2`), Gemini AI (`@google/generative-ai`)
- **Payments & Merch:** Stripe Checkout & Webhooks, Printify API
- **Scheduling:** Cal.com API (slot holds and confirmed booking fulfillment)
- **Email Lifecycle:** Brevo Contacts API (List `5` for subscribers, List `8` for course waitlist; all emails sent via Brevo automations)

## Multi-Agent Workflow
All agents share a single source of truth in [`AGENTS.md`](./AGENTS.md):
- **Claude (`CLAUDE.md` / `marketing-team/`):** Marketing strategy, Brevo email sequences, social scripts, and brand compliance QA.
- **Codex (`AGENTS.md`):** Core Next.js application logic, Stripe/Cal.com/Printify integrations, and automated business tests (`npm run test:business`).
- **Gemini / Antigravity (`agy` / `AGENTS.md`):** Firebase deployment & security rules, GA4/GTM analytics, Google Search/SEO/Core Web Vitals, and Gemini AI endpoints.

## Key Commands
```bash
npm run dev            # Start local Next.js dev server
npm run typecheck      # Run TypeScript compiler check
npm run test:business  # Run end-to-end business logic test suite
npm run build          # Production build check
```
