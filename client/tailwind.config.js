import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        base: ["Noto Sans", "Arial", "sans-serif"],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      colors: {
        background: "#f5f8fe",
        foreground: "#141316",
        border: "#DBD8DF",
        primary: "#9C2D3D ",
        secondary: "#615C6D",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    plugin(({ addBase }) => {
      addBase({
        h1: { fontSize: "2rem" },
        p: { fontSize: "1rem" },
      });
    }),
  ],
};
