/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        school: {
          navy: '#0f172a',    // Dark school administrative header/sidebar dark background
          primary: '#1e40af', // Sri Lankan classic school royal/navy blue
          accent: '#3b82f6',  // Modern cyan/blue highlight
          success: '#10b981', // Clean green for presence/high marks
          warning: '#f59e0b', // Amber for late arrivals
          danger: '#ef4444',  // Crimson for absence notifications
          bg: '#f8fafc',      // Sleek background gray
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
