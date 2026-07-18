import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          tertiary: "var(--bg-tertiary)",
          surface: "var(--bg-surface)",
          "surface-hover": "var(--bg-surface-hover)",
          elevated: "var(--bg-elevated)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          inverse: "var(--text-inverse)",
        },
        accent: {
          cyan: "var(--accent-cyan)",
          "cyan-soft": "var(--accent-cyan-soft)",
          "cyan-glow": "var(--accent-cyan-glow)",
          purple: "var(--accent-purple)",
          "purple-soft": "var(--accent-purple-soft)",
          "purple-glow": "var(--accent-purple-glow)",
          amber: "var(--accent-amber)",
          "amber-soft": "var(--accent-amber-soft)",
          green: "var(--accent-green)",
          "green-soft": "var(--accent-green-soft)",
          red: "var(--accent-red)",
          "red-soft": "var(--accent-red-soft)",
          orange: "var(--accent-orange)",
          "orange-soft": "var(--accent-orange-soft)",
          blue: "var(--accent-blue)",
          "blue-soft": "var(--accent-blue-soft)",
        },
        border: {
          subtle: "var(--border-subtle)",
          DEFAULT: "var(--border-default)",
          accent: "var(--border-accent)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
