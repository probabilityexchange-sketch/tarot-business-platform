# Performance and SEO-First Frontend Design

To ensure high Google rankings and a professional feel, prioritize these technical standards:

## 1. Core Web Vitals Optimization
- **LCP (Largest Contentful Paint):** Use `next/image` or modern `srcset`. Prioritize above-the-fold content loading (priority flag).
- **CLS (Cumulative Layout Shift):** Always define width/height for images and use aspect-ratio boxes. Avoid dynamic content injection that shifts existing elements.
- **FID (First Input Delay):** Minimize main-thread blocking. Defer non-critical JS.

## 2. Semantic HTML & SEO
- **Heading Hierarchy:** One `h1` per page. Use `h2-h6` sequentially.
- **Microdata:** Use JSON-LD for structured data (Articles, Products, Organizations).
- **Accessibility:** 100% Lighthouse A11y score. Every interactive element must be keyboard navigable.

## 3. Asset Management
- **Images:** Use WebP/AVIF. Lazy-load all images below the fold.
- **Fonts:** Limit font weights. Use `font-display: swap`.
- **Scripts:** Use `next/script` with `strategy="afterInteractive"` or `lazyOnload` where appropriate.
