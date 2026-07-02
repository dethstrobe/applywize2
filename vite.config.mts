import { defineConfig } from "vite";
import { redwood } from "rwsdk/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  environments: {
    ssr: {},
  },
  plugins: [
    cloudflare({
      viteEnvironment: { name: "worker" },
      auxiliaryWorkers: [{ configPath: "./aux-worker/wrangler.jsonc" }],
    }),
    redwood(),
    tailwindcss(),
  ],
});
