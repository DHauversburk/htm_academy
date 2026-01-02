/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Medical / Clean palette
        medical: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9', // Primary clean blue
          600: '#0284c7',
          900: '#0c4a6e',
        },
        alarm: {
          500: '#ef4444', // Red for alarms/errors
        },
        success: {
          500: '#22c55e', // Green for passed inspections
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
