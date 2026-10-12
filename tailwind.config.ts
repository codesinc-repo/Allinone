import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0e6ba8",
          50: "#e8f1f8",
          100: "#c6daeb",
          500: "#0e6ba8",
          600: "#0a568a",
          700: "#07426d",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
