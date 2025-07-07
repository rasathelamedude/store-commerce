import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    Proxy: {
      "/api": {
        target: "http://localhost:5110",
        changeOrigin: true,
      },
    },
  },
});
