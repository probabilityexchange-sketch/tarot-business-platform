```markdown
# Design System Strategy: Electric Occultism

## 1. Overview & Creative North Star
**The Creative North Star: "The Digital Alchemist"**

This design system rejects the clinical coldness of standard "dark mode" templates in favor of a high-end, editorial experience that feels both ancient and futuristic. We are bridging the gap between sacred geometry and high-tech precision. 

To achieve this, the system breaks the "standard grid" through **intentional asymmetry** and **tonal depth**. Layouts should feel like a premium digital magazine: large-scale typography that overlaps containers, high-contrast "neon pulses" against deep charcoal voids, and a sophisticated use of glassmorphism to suggest layers of hidden meaning. We avoid "boxed-in" designs; elements should breathe, float, and glow.

---

## 2. Colors & Surface Architecture
The "Electric Midnight" palette is built on a foundation of near-blacks, punctuated by high-energy vibrations of violet, cyan, and lime.

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders are strictly prohibited for sectioning or containment. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section sitting on a `surface` background creates a sophisticated, architectural transition that a line cannot replicate.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of obsidian and frosted glass. 
- **Base Layer:** `surface` (#131314).
- **Secondary Depth:** Use `surface-container-low` (#1c1b1c) for large structural areas.
- **Interactive Depth:** Use `surface-container-high` (#2a2a2b) for elevated cards.
- **Nesting Logic:** Place a `surface-container-highest` card inside a `surface-container-low` section to create natural "lift" without relying on shadows.

### The "Glass & Gradient" Rule
To move beyond a flat digital feel, use Glassmorphism for floating navigation elements or modal overlays. 
- **Formula:** `surface-container` at 60% opacity + `backdrop-blur: 24px`.
- **Signature Textures:** Use subtle linear gradients for CTAs, transitioning from `primary` (#d0bcff) to `primary-container` (#a078ff) at a 135-degree angle to provide a "charged" visual soul.

---

## 3. Typography: The Editorial Contrast
We use a high-contrast pairing to represent the "Mystic" (Serif) and the "Digital" (Sans-Serif).

- **Display & Headlines (Newsreader):** This sharp, modern serif carries the brand’s authority. Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) for hero sections. Headlines should often overlap image containers or background transitions to create a bespoke, non-template look.
- **Body (Inter):** The workhorse. Clean, neutral, and highly legible. Used for all long-form content to ensure the "tech" side of the brand feels professional and grounded.
- **Labels (Space Grotesk):** This high-tech sans-serif is reserved for metadata, micro-copy, and technical callouts. It should always be uppercase with increased letter-spacing (+0.05em) to evoke a "classified" or "coded" aesthetic.

---

## 4. Elevation & Depth
Hierarchy is achieved through **Tonal Layering** rather than traditional shadows.

- **The Layering Principle:** Depth is "stacked." A `surface-container-lowest` card on a `surface` background creates a "carved out" look, while `surface-container-highest` creates a "raised" look.
- **Ambient Glows:** Instead of standard drop shadows, use "Neon Halos." When an element is active, apply a very large, ultra-low opacity blur (32px blur, 4% opacity) using the `primary` or `secondary` color tokens. This mimics the natural atmospheric glow of a neon light.
- **The "Ghost Border" Fallback:** If a divider is functionally required for accessibility, use the `outline-variant` token at **15% opacity**. Never use 100% opaque lines.
- **Snappy Transitions:** All depth changes (hovering a card, opening a menu) must use a "snappy" easing: `cubic-bezier(0.2, 0, 0, 1)` with a duration of `250ms`.

---

## 5. Components

### Buttons
- **Primary:** Gradient fill (`primary` to `primary-container`). No border. `label-md` text in `on-primary-fixed`.
- **Secondary:** Glassmorphic background (`surface-variant` at 20% opacity) with a `secondary` (#4cd7f6) "Ghost Border" at 30% opacity.
- **Tertiary:** Text-only using `tertiary` (#98da27), with a 2px underline that expands on hover.

### Cards & Lists
- **Rule:** Forbid divider lines.
- **Styling:** Use a 40px vertical gap (`spacing-10`) between list items. Use a subtle background shift (`surface-container-low`) on hover to define the hit area.
- **Cards:** Use `lg` (0.5rem) roundedness. Content should be edge-to-edge with heavy internal padding (`spacing-8`).

### Input Fields
- **Default:** `surface-container-highest` background, no border.
- **Focus:** A 1px "Ghost Border" using `secondary` at 40% opacity and a subtle `secondary` outer glow (4px blur).
- **Error:** Background remains dark; text shifts to `error`, and a 2px left-side accent bar appears in `error` (#ffb4ab).

### Signature Component: The "Ritual" Progress Bar
For loading states or scroll progress, use a `tertiary` (lime) glow-line that is only 1px tall but has a 10px `tertiary` outer glow, making it look like a laser beam cutting through the dark.

---

## 6. Do's and Don'ts

### Do
- **Do** use "oversized" whitespace. If you think there's enough space, add 20% more.
- **Do** overlap elements. Let a headline "bleed" over the edge of a glass container.
- **Do** use `tertiary` (lime) sparingly. It is a "high-voltage" accent for critical actions or "enlightenment" moments.

### Don't
- **Don't** use pure white (#FFFFFF) for body text. Always use `on-surface` (#e5e2e3) to reduce eye strain and maintain the premium dark aesthetic.
- **Don't** use standard Material Design elevations. We do not use "Level 1, 2, 3" shadows. We use Surface Tiers.
- **Don't** use icons in circles. Icons should be "naked," high-stroke-weight glyphs floating in space to maintain the minimalist impact.
- **Don't** use 100% opaque borders. They break the "Digital Alchemy" illusion by creating rigid, boxed-in grids.

---

## 7. Spacing Scale Reference
- **Micro (0.35rem - 0.7rem):** For internal component padding (buttons, chips).
- **Macro (2.75rem - 5.5rem):** For section spacing.
- **Hero (7rem - 8.5rem):** For top-level breathing room to ensure the "Editorial" feel.```