import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const aliases: { [key: string]: string } = {
  "@": path.resolve(__dirname, "client", "src"),
  "@shared": path.resolve(__dirname, "shared"),
};

const assetsPath = path.resolve(__dirname, "attached_assets");
if (fs.existsSync(assetsPath)) {
  aliases["@assets"] = assetsPath;
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: aliases,
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/client"),
    emptyOutDir: true,
  },
});
