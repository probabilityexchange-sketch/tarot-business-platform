# Tarot Business Platform (Administrator's Guide)

## Core Technologies
- **Frontend:** Next.js 15+ (App Router, TypeScript, Tailwind CSS)
- **Backend:** Firebase (Auth, Firestore, Hosting, Analytics)
- **Payments:** Stripe (Pre-payment before scheduling)
- **Scheduling:** Integration with Google Calendar via Calendly/Acuity (Stitch compatible)

## Project Structure
- `src/app/`: Modern Next.js App Router for high-performance SEO.
- `src/lib/`: Reusable logic for Firebase, Stripe, and global utilities.
- `outlines/stitch/`: Storage for the webpage outlines you're creating.
- `SEO_CONTENT_STRATEGY.md`: The roadmap for the content engine.

## Immediate Administrator Checklist
1. [ ] **Firebase Setup:** Create a new project at [console.firebase.google.com](https://console.firebase.google.com/).
2. [ ] **Environment Variables:** Update `.env.local` with your unique Firebase/Stripe keys.
3. [ ] **Stripe Account:** Initialize your [Stripe dashboard](https://dashboard.stripe.com/) to receive payments directly.
4. [ ] **Analytics & Search Console:** Link the domain once deployed to track "Tarot" keyword dominance.

## Current Goal: Repositioning
The platform is currently themed around **"Psychological Tarot"** and **"Narrative Therapy"** to justify the high-ticket $150-$250 price point and filter out low-value inquiries.
