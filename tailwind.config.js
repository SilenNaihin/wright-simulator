/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sim-bg': '#1a1d23',
        'sim-panel': '#252830',
        'sim-border': '#3a3f4a',
        'sim-accent': '#00a8cc',
        'sim-success': '#00cc88',
        'sim-warning': '#ffaa00',
        'sim-danger': '#ff4444',
      },
    },
  },
  plugins: [],
}
