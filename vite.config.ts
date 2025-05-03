import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

const aliases: { [key: string]: string } = {
  "@": path.resolve(import.meta.dirname, "client", "src"),
  "@shared": path.resolve(import.meta.dirname, "shared"),
};

const assetsPath = path.resolve(import.meta.dirname, "attached_assets");
if (fs.existsSync(assetsPath)) {
  aliases["@assets"] = assetsPath;
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: aliases,
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/client"),
    emptyOutDir: true,
  },
});
