/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d9efff',
          200: '#bbe2ff',
          300: '#8ecfff',
          400: '#5ab4ff',
          500: '#3496ff',
          600: '#1f78ff',
          700: '#1761eb',
          800: '#184fbe',
          900: '#1a458f',
        },
      },
      boxShadow: {
        panel: '0 18px 40px rgba(2, 6, 23, 0.35)',
      },
    },
  },
  plugins: [],
}
