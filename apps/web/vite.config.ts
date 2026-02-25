import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [sveltekit(), tailwindcss()],
  resolve: {
    alias: {
      "form-data": "./src/lib/empty-module.ts",
    },
  },
  build: {
    rollupOptions: {
      external: [
        "crypto",
        "url",
        "http",
        "https",
        "http2",
        "util",
        "stream",
        "assert",
        "tty",
        "zlib",
        "events",
      ],
    },
  },
});
