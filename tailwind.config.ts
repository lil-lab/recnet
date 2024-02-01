import type { Config } from "tailwindcss";
import { radixThemePreset } from "radix-themes-tw";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        white: "#ffffff",
        black: "#000000",
      },
      animation: {
        skeleton: "skeleton 1.5s ease-in-out infinite",
      },
      keyframes: {
        skeleton: {
          "0%": { backgroundPosition: "right", opacity: "1" },
          "50%": { backgroundPosition: "left", opacity: "0.5" },
          "100%": { backgroundPosition: "right", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
  presets: [radixThemePreset],
};
export default config;
