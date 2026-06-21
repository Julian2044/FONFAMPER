import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#08182f",
          900: "#0d2343",
          800: "#12315e"
        },
        success: "#15803d",
        danger: "#dc2626"
      },
      boxShadow: {
        soft: "0 12px 28px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
