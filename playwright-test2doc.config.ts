import { defineConfig } from "@playwright/test"
import { projects } from "./playwright.config.js"
import "@test2doc/playwright/types"

export default defineConfig({
  testDir: "./tests",
  reporter: [
    [
      "@test2doc/playwright",
      {
        outputDir: "./doc/docs",
      },
    ],
  ],
  use: {
    test2doc: {
      annotationDefaults: {
        showArrow: true,
      },
    },
    baseURL: "http://localhost:5173",
  },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  projects,
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
})
