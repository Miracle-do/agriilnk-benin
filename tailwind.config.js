/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2D6A4F",
        "primary-dark": "#245a42",
        "primary-light": "#52B788",
        "primary-pale": "#D8F3DC",
        harvest: "#F4A261",
        soil: "#6B4226",
        cream: "#FEFAE0",
      },
    },
  },
  plugins: [],
}

