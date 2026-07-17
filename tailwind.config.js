/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        obsidian: "var(--background)",
        surface: "var(--surface)",
        "surface-hover": "var(--surface-hover)",
        ink: "var(--text-primary)",
        muted: "var(--text-muted)",
        border: "var(--border)",
        "input-bg": "var(--input-bg)",
        gold: {
          DEFAULT: "var(--gold)",
          bright: "var(--gold-bright)",
          deep: "var(--gold-deep)"
        }
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Inter", "sans-serif"]
      },
      boxShadow: {
        gold: "var(--shadow)"
      },
      backgroundImage: {
        "gold-line": "linear-gradient(90deg, rgba(212,175,55,0), rgba(212,175,55,.7), rgba(212,175,55,0))"
      }
    }
  },
  plugins: []
};
