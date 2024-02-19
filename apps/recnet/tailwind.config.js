import { radixThemePreset } from "radix-themes-tw";
const { createGlobPatternsForDependencies } = require("@nx/react/tailwind");
const { join } = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      "{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}"
    ),
    ...createGlobPatternsForDependencies(__dirname),
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
