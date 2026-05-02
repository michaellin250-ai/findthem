/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0a0a14",
          900: "#0d0d1a",
          800: "#111122",
          700: "#161628",
          600: "#1e1e35",
          500: "#252545",
        },
        amber: {
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
        },
        slate: {
          100: "#f1f5f9",
          200: "#e2e8f0",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-amber": "pulseAmber 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-in-right": "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fadeIn 0.4s ease-out",
        "skeleton": "skeleton 1.5s ease-in-out infinite",
      },
      keyframes: {
        pulseAmber: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.4 },
        },
        slideInRight: {
          from: { transform: "translateX(100%)", opacity: 0 },
          to: { transform: "translateX(0)", opacity: 1 },
        },
        fadeIn: {
          from: { opacity: 0, transform: "translateY(8px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        skeleton: {
          "0%": { backgroundPosition: "-200px 0" },
          "100%": { backgroundPosition: "calc(200px + 100%) 0" },
        },
      },
      boxShadow: {
        amber: "0 0 20px rgba(245, 158, 11, 0.3)",
        "amber-lg": "0 0 40px rgba(245, 158, 11, 0.2)",
        panel: "0 0 60px rgba(0,0,0,0.8)",
      },
    },
  },
  plugins: [],
};
