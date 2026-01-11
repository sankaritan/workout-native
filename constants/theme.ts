/**
 * Design system tokens matching the mockup designs.
 * Use these when programmatic access to theme values is needed.
 * For styling, prefer using Tailwind classes via NativeWind.
 */
export const theme = {
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
      darkHighlight: "#25362e",
      active: "#263c30",
    },
    nav: {
      inactive: "#6b8779",
    },
    text: {
      primary: "#ffffff",
      secondary: "#9db9a8",
      muted: "#6b8779",
    },
    border: {
      DEFAULT: "#28392f",
      light: "#3b5445",
    },
  },
  fonts: {
    display: "Lexend",
    body: "NotoSans",
  },
  fontWeights: {
    light: "300",
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  borderRadius: {
    DEFAULT: 4,
    lg: 8,
    xl: 12,
    "2xl": 16,
    full: 9999,
  },
} as const;

export type Theme = typeof theme;
