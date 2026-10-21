/// <reference types="vitest/config" />

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  css: {
    transformer: "lightningcss",
    lightningcss: {
      cssModules: {
        pattern: "[local]_[hash]",
      },
      drafts: {
        customMedia: true,
      },
    },
  },
  build: {
    cssMinify: "lightningcss",
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
