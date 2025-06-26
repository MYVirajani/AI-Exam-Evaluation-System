/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    // Add any other paths that contain your components
  ],
  theme: {
    extend: {
      colors: {
        // Theme colors
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
        accent: theme.colors.accent,
        
        // Custom colors
        background: theme.colors.background,
        foreground: theme.colors.foreground,
        headerBg: theme.colors.headerBg,
        headerText: theme.colors.headerText,
      },
      fontFamily: {
        sans: theme.fonts.sans.split(',').map(font => font.trim()),
        mono: [theme.fonts.mono],
      },
    },
  },
  plugins: [],
}