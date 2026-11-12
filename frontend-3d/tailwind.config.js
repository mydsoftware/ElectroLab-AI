/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        board: {
          DEFAULT: '#e8e0d5',
          dark: '#d4cbb8',
        },
      },
    },
  },
  plugins: [],
}
