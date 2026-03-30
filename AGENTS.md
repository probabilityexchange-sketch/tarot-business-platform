# AGENTS.md — Coding Agent Guidelines

## Project Overview

Tarot as Narrative Therapy — a Next.js 16 platform for psychological tarot readings, courses, and writing workshops. Firebase backend (Auth, Firestore, Hosting), Stripe payments, Tailwind CSS v4 styling.

## Build / Dev / Test Commands

```bash
# Dev server (no script defined — run directly)
npx next dev

# Production build
npx next build

# Start production server
npx next start

# Type checking
npx tsc --noEmit

# Lint (no ESLint config exists yet — use next lint scaffolding)
npx next lint

# Firebase emulators (auth:9099, firestore:8080, hosting:5000)
firebase emulators:start

# No test framework installed. When adding tests, prefer Vitest.
# Run a single test: npx vitest run path/to/test.test.ts
```

**Note:** `package.json` has no `dev`, `build`, `start`, or `lint` scripts. Use `npx` directly. No ESLint or Prettier configs exist — follow the conventions below manually.

## Project Structure

```
src/
├── app/          # Next.js App Router (pages, layouts, route handlers)
├── components/   # Reusable UI components
├── hooks/        # Custom React hooks
├── lib/          # Service initializations (firebase, stripe) and utilities
└── styles/       # Global CSS (globals.css with Tailwind directives)
```

Path alias: `@/*` maps to `./src/*` (configured in tsconfig).

## Code Style

### TypeScript

- **Strict mode** is enabled. Never use `any` unless absolutely unavoidable.
- Use `type` keyword for type definitions, not `interface` (follows existing convention).
- Use `import type { ... }` for type-only imports.
- Inline type annotations for component props: `{ children: React.ReactNode }`.

### Imports

- **Double quotes** for all strings — never single quotes.
- Named imports from libraries: `import { initializeApp } from "firebase/app"`.
- Group order: (1) `import type`, (2) third-party, (3) internal via `@/` alias, (4) relative.
- No blank lines between import groups (keep it compact per existing style).

```tsx
import type { Metadata } from "next";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
```

### Components

- **Functional components only** — use `function` keyword (not arrow functions).
- Pages and layouts: `export default function ComponentName()`.
- Reusable components: prefer named exports (`export function Button()`) with barrel `index.ts`.
- Metadata export: `export const metadata: Metadata = { ... }`.

### Naming

| Scope | Convention | Example |
|---|---|---|
| Component files | PascalCase or kebab-case | `BookingCard.tsx`, `booking-card.tsx` |
| Lib/utility files | kebab-case | `stripe-client.ts` |
| Components | PascalCase | `BookingCard` |
| Functions/variables | camelCase | `isAuthenticated`, `fetchUserData` |
| Constants | camelCase | `firebaseConfig` |
| Types | PascalCase | `type BookingSlot` |
| CSS classes | Tailwind utilities | `className="px-4 py-2 bg-pink-600"` |

### Styling

- **Tailwind CSS v4** — use utility classes directly in JSX.
- Use `clsx` + `tailwind-merge` for conditional/merged classes:
  ```tsx
  import { clsx } from "clsx";
  import { twMerge } from "tailwind-merge";
  export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
  }
  ```
- Dark theme base: `bg-slate-950`, text: `text-white` / `text-slate-300` / `text-slate-400`.
- Brand color: `pink-*` palette (defined in `tailwind.config.ts`).

### Error Handling

- Use `try/catch` in async operations (API calls, Firebase reads/writes).
- Validate external input with **Zod** schemas before processing.
- Firebase init: guard against double-initialization with `getApps().length`.
- Client-only APIs: guard with `typeof window !== "undefined"`.

### Environment Variables

- Firebase config via `NEXT_PUBLIC_FIREBASE_*` prefix (client-exposed).
- Secrets (Stripe, Resend) must NOT use `NEXT_PUBLIC_` prefix.
- Reference `.env.example` for required variables (currently empty — populate as you add).

## Key Dependencies

| Package | Purpose |
|---|---|
| `next` 16.2.1 | Framework (App Router) |
| `react` 19.2.4 | UI |
| `firebase` 12.11.0 | Auth, Firestore, Analytics |
| `stripe` / `@stripe/stripe-js` | Payments (server / client) |
| `@tanstack/react-query` | Server state management |
| `zod` 4.3.6 | Schema validation |
| `framer-motion` | Animations |
| `lucide-react` | Icons |
| `resend` | Transactional email |
| `axios` | HTTP client |
| `clsx` + `tailwind-merge` | Classname utilities |
| `date-fns` | Date manipulation |

## Firestore Collections

`users`, `appointments`, `products`, `access`, `blog_posts` — see `firestore.rules` for schema and security rules.

## Don'ts

- Don't add comments unless asked — code should be self-documenting.
- Don't use `any` type — use proper types or `unknown`.
- Don't use single quotes for strings.
- Don't create files outside `src/` without explicit instruction.
- Don't install new dependencies without confirming they're needed.
- Don't use CSS modules — Tailwind only.
