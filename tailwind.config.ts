import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#101820",
        surface: {
          50: "#30404d",
          100: "#24323e",
          200: "#1b2833",
          300: "#15212b",
          400: "#111b24",
          DEFAULT: "#1b2833",
        },
        card: {
          DEFAULT: "#1b2833",
          hover: "#243440",
          border: "#2a3945",
        },
        brand: {
          light: "#72c7f3",
          DEFAULT: "#229ed9",
          dark: "#168ac2",
          vibrant: "#2aabee",
          glow: "rgba(42, 171, 238, 0.16)",
        },
        chat: {
          incoming: "#243440",
          incomingText: "#e8eef3",
          outgoing: "#176b87",
          outgoingEnd: "#176b87",
          outgoingText: "#ffffff",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem",
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
