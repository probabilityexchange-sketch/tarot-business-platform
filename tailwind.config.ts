import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "var(--surface)",
        "surface-container-lowest": "var(--surface-container-lowest)",
        "surface-container-low": "var(--surface-container-low)",
        "surface-container": "var(--surface-container)",
        "surface-container-high": "var(--surface-container-high)",
        "surface-container-highest": "var(--surface-container-highest)",
        primary: "var(--primary)",
        "primary-container": "var(--primary-container)",
        secondary: "var(--secondary)",
        tertiary: "var(--tertiary)",
        "on-surface": "var(--on-surface)",
        "on-primary-fixed": "var(--on-primary-fixed)",
        error: "var(--error)",
        "outline-variant": "var(--outline-variant)",
      },
      fontFamily: {
        display: ["var(--font-newsreader)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        label: ["var(--font-space-grotesk)", "sans-serif"],
      },
      transitionTimingFunction: {
        snappy: "var(--ease-snappy)",
      },
      transitionDuration: {
        "250": "250ms",
      },
      spacing: {
        "spacing-8": "2rem",
        "spacing-10": "2.5rem",
      },
    },
  },
  plugins: [],
};
export default config;
