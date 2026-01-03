import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand colors - Burnished Gold (Institutional)
        brand: {
          50: "#fdfbf7",
          100: "#f5edd9",
          200: "#e8d6a8",
          300: "#d9bd76",
          400: "#C5A059",
          500: "#C5A059",
          600: "#a88940",
          700: "#8b7034",
          800: "#6e5829",
          900: "#52421f",
          950: "#362c15",
        },
        // Obsidian dark palette
        dark: {
          50: "#f8f8f8",
          100: "#e8e8e8",
          200: "#d0d0d0",
          300: "#a8a8a8",
          400: "#64748b",
          500: "#64748b",
          600: "#3a3a3a",
          700: "#1a1a1a",
          800: "#0d0d0d",
          900: "#080808",
          950: "#050505",
        },
        // Slate Grey for borders and secondary elements
        slate: {
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "slide-logos": "slideLogos 20s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideLogos: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        // Metallic gold gradient - radial from corner for realistic metal sheen
        "gold-metallic":
          "radial-gradient(ellipse at 0% 0%, rgba(197, 160, 89, 0.25) 0%, rgba(197, 160, 89, 0.1) 40%, transparent 70%)",
        "gold-metallic-hover":
          "radial-gradient(ellipse at 0% 0%, rgba(197, 160, 89, 0.35) 0%, rgba(197, 160, 89, 0.15) 40%, transparent 70%)",
      },
      boxShadow: {
        // Subtle institutional shadows - soft and weighted
        subtle: "0 2px 8px rgba(0, 0, 0, 0.4)",
        elevated: "0 4px 16px rgba(0, 0, 0, 0.5)",
        "inner-subtle": "inset 0 1px 2px rgba(0, 0, 0, 0.3)",
        // Gold highlight for special elements
        "gold-glow": "0 0 20px rgba(197, 160, 89, 0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
