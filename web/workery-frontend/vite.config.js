import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/Config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to your backend server
      "/api": {
        target: "http://localhost:8000", // Update this to your actual backend URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
