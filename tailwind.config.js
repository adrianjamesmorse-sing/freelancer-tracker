/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8ff",
          100: "#d9efff",
          200: "#bbe2ff",
          300: "#8ecfff",
          400: "#5ab4ff",
          500: "#3496ff",
          600: "#1f78ff",
          700: "#1761eb",
          800: "#184fbe",
          900: "#1a458f"
        }
      },
      boxShadow: {
        panel: "0 1px 3px rgba(0,0,0,0.08), 0 18px 42px rgba(15, 23, 42, 0.12)"
      }
    }
  },
  plugins: []
};