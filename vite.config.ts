import path from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:4000",
      "/sitemap.xml": "http://localhost:4000",
      "/robots.txt": "http://localhost:4000"
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("react-router-dom") || id.includes("react")) {
              return "vendor-react";
            }
            if (id.includes("framer-motion")) {
              return "vendor-framer";
            }
            if (id.includes("@tanstack") || id.includes("zod")) {
              return "vendor-core";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            return "vendor-libs";
          }
        }
      }
    }
  }
});
