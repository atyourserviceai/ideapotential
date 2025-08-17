import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import { cloudflare as cf } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

export default defineConfig({
  plugins: [
    cf({
      viteEnvironment: { name: "ssr" },
      inspectorPort: 9829, // Set inspector port to avoid conflicts
    }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths({
      ignoreConfigErrors: true,
      projects: [path.resolve(__dirname, "tsconfig.json")],
    }),
  ],
  server: {
    port: 5773,
    strictPort: true,
  },
});
