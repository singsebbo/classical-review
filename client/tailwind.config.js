/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'EB Garamond'", 'serif'],
      },
      colors: {
        "cadet-gray": '#9cafb7',
        "sage": '#adb993',
        "sunset": '#f6ca83',
        "citron": '#d0d38f'
      }
    }
  },
  plugins: [],
}