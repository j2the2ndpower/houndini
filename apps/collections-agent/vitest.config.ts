import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
  css: {
    // Prevent Vitest/Vite from loading external PostCSS config during tests
    postcss: { plugins: [] },
  },
});
