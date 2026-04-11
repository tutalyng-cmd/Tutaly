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
        primary: {
          DEFAULT: "#0D1B2A",
          light: "#1B263B",
          dark: "#08101C",
        },
        accent: {
          teal: "#1D9E75",
          amber: "#FFBF00",
        },
        status: {
          success: "#2A9D8F",
          urgent: "#E63946",
          pending: "#FFBF00",
          expired: "#6C757D",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
      },
      spacing: {
        "8px": "8px",
      },
    },
  },
  plugins: [],
};
export default config;
