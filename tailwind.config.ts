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
        background: "#0d0e15",
        surface: {
          50: "#27293d",
          100: "#1f2132",
          200: "#181926",
          300: "#13141f",
          400: "#0f1018",
          DEFAULT: "#141522",
        },
        card: {
          DEFAULT: "#1a1b2a",
          hover: "#222336",
          border: "#28293d",
        },
        brand: {
          light: "#c084fc",
          DEFAULT: "#8a3ffc",
          dark: "#6929c4",
          vibrant: "#9333ea",
          glow: "rgba(138, 63, 252, 0.4)",
        },
        chat: {
          incoming: "#1e202f",
          incomingText: "#e2e8f0",
          outgoing: "#8a3ffc",
          outgoingEnd: "#6929c4",
          outgoingText: "#ffffff",
        },
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(138, 63, 252, 0.35)",
        "glow-sm": "0 0 15px -3px rgba(138, 63, 252, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
