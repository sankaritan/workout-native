/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#13ec6d",
          dark: "#0fa64d",
        },
        background: {
          light: "#f6f8f7",
          dark: "#102218",
        },
        surface: {
          light: "#ffffff",
          dark: "#1c2e24",
          "dark-highlight": "#25362e",
          active: "#263c30",
        },
        nav: {
          inactive: "#6b8779",
        },
        text: {
          muted: "#9db9a8",
        },
        border: {
          DEFAULT: "#28392f",
          light: "#3b5445",
        },
      },
      fontFamily: {
        display: ["Lexend"],
        body: ["NotoSans"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
