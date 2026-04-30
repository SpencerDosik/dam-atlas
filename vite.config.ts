import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  worker: {
    format: "es",
  },
  optimizeDeps: {
    exclude: ["@deck.gl/core", "@deck.gl/layers", "@deck.gl/mapbox"],
  },
  build: {
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks: {
          maplibre: ["maplibre-gl"],
          deck: [
            "@deck.gl/core",
            "@deck.gl/layers",
            "@deck.gl/mapbox",
            "@deck.gl/aggregation-layers",
          ],
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-slider",
          ],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  },
});
