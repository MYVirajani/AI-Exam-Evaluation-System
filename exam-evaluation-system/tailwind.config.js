/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "palette-purple": "#8B5CF6",
        "palette-blue": "#3B82F6",
        "palette-cyan": "#06B6D4",
        brand: {
          purple: "#7c3aed", // Deep purple (start)
          "purple-blue": "#6366f1", // Purple-blue blend
          blue: "#3b82f6", // Blue
          "blue-cyan": "#0ea5e9", // Blue-cyan blend
          cyan: "#06b6d4", // Cyan
          "cyan-light": "#0891b2", // Cyan lighter
          turquoise: "#22d3ee", // Turquoise (end)
        },
        // Gradient variants for different use cases
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9", // Your blue-cyan
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        secondary: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7", // Close to your purple
          600: "#9333ea",
          700: "#7c3aed", // Your brand purple
          800: "#6b21a8",
          900: "#581c87",
        },
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg, #7c3aed 0%, #3b82f6 25%, #06b6d4 50%, #0891b2 75%, #22d3ee 100%)",
        "gradient-brand-reverse":
          "linear-gradient(135deg, #22d3ee 0%, #0891b2 25%, #06b6d4 50%, #3b82f6 75%, #7c3aed 100%)",
        "gradient-brand-vertical":
          "linear-gradient(180deg, #7c3aed 0%, #3b82f6 25%, #06b6d4 50%, #0891b2 75%, #22d3ee 100%)",
        "gradient-subtle":
          "linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(34, 211, 238, 0.1) 100%)",
      },
      boxShadow: {
        brand:
          "0 10px 25px -3px rgba(124, 58, 237, 0.1), 0 4px 6px -2px rgba(124, 58, 237, 0.05)",
        "brand-lg": "0 25px 50px -12px rgba(124, 58, 237, 0.25)",
        cyan: "0 10px 25px -3px rgba(6, 182, 212, 0.1), 0 4px 6px -2px rgba(6, 182, 212, 0.05)",
      },
      animation: {
        gradient: "gradient 6s ease infinite",
        float: "float 3s ease-in-out infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        gradient: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
