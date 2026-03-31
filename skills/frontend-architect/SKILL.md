---
name: frontend-architect
description: Professional, responsive, and performance-optimized frontend design. Use when Gemini CLI needs to create or refactor UI components with a focus on aesthetics, accessibility, and SEO (Core Web Vitals).
---

# Frontend Architect

## Overview

The `frontend-architect` skill enables the design and implementation of high-end, responsive user interfaces that prioritize performance and search engine visibility. It focuses on premium aesthetics (8pt grid, balanced typography) and technical excellence (semantic HTML, image optimization, Core Web Vitals).

## Professional Workflow

When executing a frontend design task, follow this sequential workflow:

### 1. Research & Analysis
- **Framework Check:** Verify current Tailwind config and available UI components (e.g., Shadcn/UI).
- **Competitor Scan:** Identify high-performing design patterns in the same niche.
- **Audit:** For refactoring, run a baseline accessibility and performance check.

### 2. Strategy & Structure
- **Semantic Mapping:** Define the HTML5 structure (main, section, article, nav).
- **SEO Strategy:** Identify keywords for `alt` tags, headings, and metadata.
- **Responsiveness:** Plan breakpoints (mobile-first) and fluid layouts.

### 3. Execution (The "8pt System")
- **Layout:** Implement using Flexbox and Grid with 8pt spacing (`p-2, p-4, p-8`).
- **Typography:** Apply a fluid scale with high readability (`max-w-prose`).
- **Polish:** Add subtle transitions, hover states, and premium neutral palettes.

### 4. Validation & Optimization
- **Performance:** Optimize image loading (`next/image`, `srcset`) and script strategy.
- **SEO Check:** Validate heading hierarchy and structured data (JSON-LD).
- **Cross-Device:** Test on multiple screen sizes and verify accessibility (WCAG AA).

## Guidelines & Standards

- **SEO & Performance:** See [performance-seo.md](references/performance-seo.md) for Core Web Vitals and semantic standards.
- **Visual Design:** See [design-system.md](references/design-system.md) for spacing, typography, and premium aesthetics.

## Example Requests

- "Design a modern landing page hero section with a focus on LCP performance."
- "Refactor this pricing table to be mobile-responsive and high-contrast."
- "Create a semantic blog layout that follows Google's best practices for SEO."
