import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0F1E",
        foreground: "#E2E8F0",
        card: "#151F2E",
        'cyan-primary': "#00FFFF",
        'cyan-deep': "#008B8B",
        'cyan-glow': "rgba(0, 255, 255, 0.3)",
      },
      boxShadow: {
        'cyan-glow': "0 0 20px rgba(0, 255, 255, 0.3)",
        'cyan-glow-strong': "0 0 40px rgba(0, 255, 255, 0.5)",
      },
      animation: {
        'float': "float 6s ease-in-out infinite",
        'pulse-glow': "pulse-glow 4s ease-in-out infinite",
        'mystical': "mystical 8s ease-in-out infinite",
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)" },
          '50%': { opacity: '0.7', boxShadow: "0 0 40px rgba(0, 255, 255, 0.6)" },
        },
        mystical: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
