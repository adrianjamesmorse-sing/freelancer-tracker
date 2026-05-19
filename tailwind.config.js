/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f7f3eb',
          100: '#efe6d6',
          200: '#e3d4ba',
          300: '#d2bc96',
          400: '#bfa16f',
          500: '#9f8768',
          600: '#856f54',
          700: '#6d5b45',
          800: '#564736',
          900: '#403427',
        },
        olive: {
          500: '#7f8e6c',
          600: '#6b785a',
          700: '#556149',
        },
      },
      boxShadow: {
        panel: '0 12px 32px rgba(88, 71, 54, 0.12)',
      },
    },
  },
  plugins: [],
}
