/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      borderColor: {
        'glass-light': 'rgba(255, 255, 255, 0.18)',
        'glass-dark': 'rgba(255, 255, 255, 0.08)',
      },
      backgroundColor: {
        'glass-light': 'rgba(255, 255, 255, 0.45)',
        'glass-dark': 'rgba(15, 23, 42, 0.45)',
      }
    },
  },
  plugins: [],
}
