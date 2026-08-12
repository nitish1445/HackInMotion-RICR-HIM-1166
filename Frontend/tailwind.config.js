/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2196F3",
          50: "#EAF5FE",
          100: "#E3F2FD",
          200: "#BFE1FB",
          300: "#90CAF9",
          400: "#4FACF7",
          500: "#2196F3",
          600: "#1A7FD1",
          700: "#15629F",
          800: "#0D47A1",
          900: "#0A3877",
        },
        secondary: "#90CAF9",
        light: "#E3F2FD",
        dark: "#0D47A1",
        surface: {
          light: "#F7FAFD",
          dark: "#0A1120",
        },
        panel: {
          light: "#FFFFFF",
          dark: "#111A2E",
        },
        ink: {
          light: "#0B1B33",
          dark: "#E7EEFA",
        },
        muted: {
          light: "#5B6B85",
          dark: "#8B97B3",
        },
        success: "#22C55E",
        warn: "#F59E0B",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "sans-serif"],
        body: ['"Inter"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(13, 71, 161, 0.06), 0 8px 24px rgba(13, 71, 161, 0.08)",
        "soft-dark": "0 1px 2px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.4)",
        glow: "0 0 0 1px rgba(33,150,243,0.15), 0 8px 30px rgba(33,150,243,0.20)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(33,150,243,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(33,150,243,0.08) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "32px 32px",
      },
    },
  },
  plugins: [],
};
