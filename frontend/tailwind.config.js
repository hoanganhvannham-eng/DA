/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'blob-drift': 'blob-drift 12s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
      },
    },
  },
  plugins: [],
}
