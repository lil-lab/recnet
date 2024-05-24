import { resolve } from "path";

import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

import packageJson from "./package.json";

const clientTestEnv = {
  ...loadEnv("", process.cwd()),
  NEXT_PUBLIC_APP_VERSION: packageJson.version,
};

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    env: clientTestEnv,
    setupFiles: [resolve(__dirname, "src/test/setup.ts")],
  },
});
