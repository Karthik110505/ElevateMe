/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Manrope", "system-ui", "sans-serif"], // Body text
        heading: ["Space Grotesk", "Sora", "Inter", "sans-serif"], // Headings
        display: ["Space Grotesk", "system-ui", "sans-serif"], // Large display text
      },
      colors: {
        // Neon Blue Theme - Dark backgrounds
        dark: {
          900: "#0a0f1c", // Deepest dark blue
          800: "#0f1629", // Dark blue background
          700: "#162033", // Medium dark blue
          600: "#1d2d47", // Lighter dark blue
        },
        // Neon Blue Accents
        neon: {
          blue: "#00d9ff", // Bright neon blue
          cyan: "#00d9ff", // Same as neon blue for consistency
          "blue-light": "#33e0ff", // Lighter neon blue
          "blue-dark": "#0099cc", // Darker neon blue
          glow: "#00d9ff80", // Neon blue with transparency for glow effects
        },
        // Supporting colors
        accent: {
          cyan: "#00ffff", // Bright cyan
          teal: "#00ccaa", // Teal accent
          purple: "#6366f1", // Purple accent
        },
      },
      boxShadow: {
        neon: "0 0 20px rgba(0, 217, 255, 0.3)",
        "neon-strong": "0 0 30px rgba(0, 217, 255, 0.5)",
        "neon-button": "0 0 15px rgba(0, 217, 255, 0.4)",
      },
      animation: {
        "pulse-neon": "pulse-neon 2s ease-in-out infinite alternate",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        "pulse-neon": {
          "0%": { boxShadow: "0 0 20px rgba(0, 217, 255, 0.3)" },
          "100%": { boxShadow: "0 0 30px rgba(0, 217, 255, 0.8)" },
        },
        glow: {
          "0%": { textShadow: "0 0 10px rgba(0, 217, 255, 0.5)" },
          "100%": { textShadow: "0 0 20px rgba(0, 217, 255, 0.8)" },
        },
      },
    },
  },
  plugins: [],
};
