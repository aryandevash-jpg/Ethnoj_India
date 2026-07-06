import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-cormorant)", "Playfair Display", "serif"],
      },
      colors: {
        cream: "oklch(0.965 0.018 80)",
        "cream-deep": "oklch(0.935 0.028 80)",
        maroon: "oklch(0.45 0.16 12)",
        "maroon-deep": "oklch(0.38 0.18 12)",
        gold: "oklch(0.74 0.13 80)",
        "gold-soft": "oklch(0.78 0.08 82)",
        emerald: "oklch(0.42 0.08 165)",
        ink: "oklch(0.22 0.02 50)",
        background: "oklch(0.965 0.018 80)",
        foreground: "oklch(0.22 0.02 50)",
        card: "oklch(0.985 0.012 82)",
        "card-foreground": "oklch(0.22 0.02 50)",
        popover: "oklch(0.985 0.012 82)",
        "popover-foreground": "oklch(0.22 0.02 50)",
        primary: "oklch(0.45 0.16 12)",
        "primary-foreground": "oklch(0.965 0.018 80)",
        secondary: "oklch(0.935 0.028 80)",
        "secondary-foreground": "oklch(0.22 0.02 50)",
        muted: "oklch(0.935 0.028 80)",
        "muted-foreground": "oklch(0.45 0.02 50)",
        accent: "oklch(0.74 0.13 80)",
        "accent-foreground": "oklch(0.22 0.02 50)",
        destructive: "oklch(0.55 0.22 28)",
        "destructive-foreground": "oklch(0.965 0.018 80)",
        border: "oklch(0.88 0.025 75)",
        input: "oklch(0.9 0.02 75)",
        ring: "oklch(0.78 0.08 82)",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "calc(0.75rem - 2px)",
        sm: "calc(0.75rem - 4px)",
      },
      boxShadow: {
        soft: "0 4px 24px -8px oklch(0.45 0.16 12 / 0.14)",
        warm: "0 14px 40px -16px oklch(0.38 0.18 12 / 0.28)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s linear infinite",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
