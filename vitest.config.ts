import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname) }, // mirror tsconfig "@/*" so component tests resolve
  },
  test: {
    environment: "jsdom",
    // jsdom disables localStorage on an opaque origin; a real URL enables Storage.
    environmentOptions: { jsdom: { url: "http://localhost:3000" } },
    setupFiles: ["tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
