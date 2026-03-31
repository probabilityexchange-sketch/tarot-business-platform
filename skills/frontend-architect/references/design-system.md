# Professional Design System Guidelines

Adhering to these principles ensures a "premium" feel across all screen sizes.

## 1. Spacing & Rhythm
- **8pt Grid:** Use multiples of 4 and 8 for all padding, margins, and gaps (Tailwind: `p-2, p-4, p-6, p-8, gap-4`, etc.).
- **Whitespace:** Use generous margins to create focus and hierarchy. Group related elements tightly; separate logical sections broadly.

## 2. Typography for Readability
- **Hierarchy:** Distinct contrast between headings (sans or serif) and body (sans-serif).
- **Line Length:** Maintain 50-75 characters per line for body text (`max-w-prose`).
- **Scale:** Use a fluid type scale (e.g., `text-base, text-lg, text-2xl, text-4xl`).

## 3. Premium Color & Contrast
- **Neutrals:** Use a sophisticated neutral palette (e.g., Slate, Gray, Zinc) for backgrounds and UI boundaries.
- **Accents:** Use one or two purposeful accent colors for primary CTAs.
- **Contrast:** Ensure all text passes WCAG AA/AAA standards (high contrast).

## 4. Interaction & Feedback
- **Transitions:** Use `transition-all duration-200 ease-in-out` for all hover states.
- **Micro-interactions:** Subtle lifts (`hover:-translate-y-1`), shadows (`hover:shadow-lg`), and focus rings (`focus:ring-2`).
- **State Feedback:** Clear visual changes for success, error, and loading states.
