import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-base": "var(--bg-base)",
        "bg-elevated": "var(--bg-elevated)",
        "bg-overlay": "var(--bg-overlay)",
        "bg-hover": "var(--bg-hover)",
        "border-subtle": "var(--border-subtle)",
        "border-strong": "var(--border-strong)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-tertiary": "var(--text-tertiary)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "hazard-high": "var(--hazard-high)",
        "hazard-significant": "var(--hazard-significant)",
        "hazard-low": "var(--hazard-low)",
        "hazard-unknown": "var(--hazard-unknown)",
        "tier-critical": "var(--tier-critical)",
        "tier-elevated": "var(--tier-elevated)",
        "tier-moderate": "var(--tier-moderate)",
        "tier-low": "var(--tier-low)",
        "tier-minimal": "var(--tier-minimal)",
      },
      fontFamily: {
        sans: ["InterVariable", "Inter", "system-ui", "sans-serif"],
      },
      fontVariantNumeric: {
        tabular: "tabular-nums",
      },
      boxShadow: {
        panel: "var(--shadow-panel)",
      },
    },
  },
  plugins: [animate],
};

export default config;
