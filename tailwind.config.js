/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        muted: "#6b7280",
        line: "#e5e7eb",
        brand: "#ff6501"
      }
    }
  },
  plugins: []
};
