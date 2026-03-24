import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm primary - terracotta
        terracotta: {
          50:  "#FDF4F0",
          100: "#FAE5DB",
          200: "#F5C9B6",
          300: "#EEAA8D",
          400: "#E68A63",
          500: "#D96B3D",
          600: "#C05530",
          700: "#9E4226",
          800: "#7C321D",
          900: "#5C2415",
        },
        // Warm background - cream
        cream: {
          50:  "#FFFDF9",
          100: "#FDF8F0",
          200: "#FAF0DE",
          300: "#F5E4C3",
          400: "#EDD49F",
          500: "#E2BF77",
        },
        // Sage green accent
        sage: {
          50:  "#F2F6F2",
          100: "#E2EDE1",
          200: "#C3D9C1",
          300: "#9FC19C",
          400: "#78A474",
          500: "#5A8A56",
          600: "#466F42",
          700: "#345531",
          800: "#253D23",
          900: "#172717",
        },
        // Warm amber
        amber: {
          50:  "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        // Warm brown for text
        warmBrown: {
          50:  "#FAF5F0",
          100: "#F0E4D7",
          200: "#DDC5AB",
          300: "#C7A07E",
          400: "#AD7B54",
          500: "#8F5E38",
          600: "#72492C",
          700: "#563723",
          800: "#3C271A",
          900: "#251810",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        warm: "0 4px 24px -4px rgba(217, 107, 61, 0.15)",
        "warm-lg": "0 8px 40px -8px rgba(217, 107, 61, 0.2)",
        card: "0 2px 16px -2px rgba(60, 39, 26, 0.08)",
        "card-hover": "0 8px 32px -4px rgba(60, 39, 26, 0.14)",
      },
      backgroundImage: {
        "warm-gradient": "linear-gradient(135deg, #FDF8F0 0%, #FAF0DE 100%)",
        "hero-gradient": "linear-gradient(135deg, #FDF4F0 0%, #F5E4C3 50%, #E2EDE1 100%)",
        "card-gradient": "linear-gradient(145deg, #FFFDF9 0%, #FDF8F0 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "bounce-gentle": "bounceGentle 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
