/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "sprawl-deep-blue": "#0A3255",
        "sprawl-deep-red": "#B21F2C",
        "sprawl-yellow": "#FFD65C",
        "sprawl-teal": "#B5E1E1",
        "sprawl-bright-blue": "#2459A9",
        "sprawl-bright-red": "#E82F35",
        "sprawl-light-blue": "#6DACDE",
        "sprawl-light-red": "#E96955",
      },
      fontFamily: {
        headline: ["Oswald", "sans-serif"],
        body: ["Crimson Text", "serif"],
        ui: ["Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
