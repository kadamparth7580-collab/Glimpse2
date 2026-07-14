import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F7F3EE",
        sage: "#6B8F71",
        "sage-dark": "#557060",
        card: "#FFFFFF",
        ink: "#2E2E2E",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      borderRadius: {
        cozy: "1.5rem",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(46, 46, 46, 0.06)",
        card: "0 2px 12px rgba(46, 46, 46, 0.08)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
