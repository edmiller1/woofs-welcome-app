import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { resolve } from "path";

export default defineConfig({
  plugins: [svelte({ hot: false })],
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
  resolve: {
    conditions: ["browser"],
    alias: {
      $lib: resolve(__dirname, "src/lib"),
      $app: resolve(__dirname, "src/test/mocks/app"),
      "$env/static/public": resolve(__dirname, "src/test/mocks/env/static/public.ts"),
    },
  },
});
