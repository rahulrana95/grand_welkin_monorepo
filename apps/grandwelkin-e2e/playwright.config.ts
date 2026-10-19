import { defineConfig, devices } from "@playwright/test";

/**
 * E2E for the static grandwelkin.com site. The site has no build step — we serve
 * the files in apps/grandwelkin and drive a few critical journeys across a mobile,
 * tablet and desktop viewport. Runs the same spec in every project.
 */
const PORT = Number(process.env.PW_PORT ?? 4330);
const executablePath = process.env.PW_EXECUTABLE || undefined;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    permissions: ["clipboard-read", "clipboard-write"],
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [
    { name: "mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 393, height: 852 } } },
    { name: "tablet", use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: "node serve.mjs",
    env: { PORT: String(PORT) },
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
