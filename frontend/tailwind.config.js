/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        doge: "#fbbf24",
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      borderWidth: {
        '6': '6px',
      }
    },
  },
  plugins: [],
}
