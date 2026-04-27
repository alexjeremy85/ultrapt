import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0a0a",
          surface: "#141414",
          card: "#1a1a1a",
          elevated: "#222222",
        },
        border: {
          DEFAULT: "#2a2a2a",
          strong: "#3a3a3a",
        },
        ink: {
          DEFAULT: "#f5f5f5",
          muted: "#a3a3a3",
          dim: "#737373",
        },
        accent: {
          DEFAULT: "#ff6b00",
          hover: "#ff8533",
          dim: "#cc5500",
          glow: "rgba(255, 107, 0, 0.3)",
        },
        success: "#22c55e",
        warning: "#eab308",
        danger: "#ef4444",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 30px 0 rgba(255, 107, 0, 0.4)",
        "glow-sm": "0 0 12px 0 rgba(255, 107, 0, 0.3)",
      },
      backgroundImage: {
        "gradient-hype":
          "linear-gradient(135deg, #ff6b00 0%, #ff8533 50%, #ffaa66 100%)",
        "gradient-dark":
          "radial-gradient(ellipse at top, #1a1a1a 0%, #0a0a0a 60%)",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px 0 rgba(255, 107, 0, 0.3)" },
          "50%": { boxShadow: "0 0 35px 0 rgba(255, 107, 0, 0.5)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
