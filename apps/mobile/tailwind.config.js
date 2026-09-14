/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        Vazirmatn: ["Vazirmatn"],
        VazirmatnMedium: ["VazirmatnMedium"],
        VazirmatnSemiBold: ["VazirmatnSemiBold"],
        VazirmatnBold: ["VazirmatnBold"],
        VazirmatnExtraBold: ["VazirmatnExtraBold"],
      },
      colors: {
        gray: {
          50: "rgb(var(--color-gray-50) / <alpha-value>)",
          100: "rgb(var(--color-gray-100) / <alpha-value>)",
          200: "rgb(var(--color-gray-200) / <alpha-value>)",
          300: "rgb(var(--color-gray-300) / <alpha-value>)",
          400: "rgb(var(--color-gray-400) / <alpha-value>)",
          500: "rgb(var(--color-gray-500) / <alpha-value>)",
          600: "rgb(var(--color-gray-600) / <alpha-value>)",
          700: "rgb(var(--color-gray-700) / <alpha-value>)",
          800: "rgb(var(--color-gray-800) / <alpha-value>)",
          900: "rgb(var(--color-gray-900) / <alpha-value>)",
        },
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5f2",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        secondary: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134d4b",
        },
        glass: {
          light: "rgba(255, 255, 255, 0.25)",
          lightBorder: "rgba(255, 255, 255, 0.3)",
          dark: "rgba(0, 0, 0, 0.2)",
          darkBorder: "rgba(255, 255, 255, 0.1)",
          shadow: "rgba(0, 0, 0, 0.08)",
        },
      },
      backgroundColor: {
        "glass-light": "rgba(255, 255, 255, 0.25)",
        "glass-dark": "rgba(0, 0, 0, 0.2)",
      },
      borderColor: {
        "glass-border": "rgba(255, 255, 255, 0.3)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.08), 0 3px 10px 0 rgba(0, 0, 0, 0.05)",
        "glass-dark": "0 8px 32px 0 rgba(0, 0, 0, 0.20), 0 3px 10px 0 rgba(0, 0, 0, 0.10)",
      },
    },
  },
  plugins: [],
};
