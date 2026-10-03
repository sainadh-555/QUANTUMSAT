/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        surface: '#151C2C',
        surfaceHover: '#1E293B',
        primary: '#3B82F6',
        secondary: '#6366F1',
        accentGreen: '#10B981',
        accentCyan: '#06B6D4',
        textMain: '#F8FAFC',
        textMuted: '#94A3B8'
      }
    },
  },
  plugins: [],
}
