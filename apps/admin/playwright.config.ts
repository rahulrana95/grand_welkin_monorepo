import { defineConfig, devices } from "@playwright/test";

/** Visual regression for the admin — same approach as apps/web (see the
 *  testing-visual-playwright skill). Deterministic; baselines in git. */
const PORT = Number(process.env.PW_PORT ?? 3320);
const executablePath = process.env.PW_EXECUTABLE || undefined;

export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["html", { open: "never" }], ["list"]],
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFilePath}/{arg}{ext}",
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      animations: "disabled",
      caret: "hide",
      scale: "css",
      stylePath: "./tests/visual/screenshot.css",
    },
  },
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: "light",
    timezoneId: "UTC",
    locale: "en-US",
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm run start",
    env: { PORT: String(PORT), ADMIN_EMAILS: "admin@welkinbliss.com" },
    url: `http://127.0.0.1:${PORT}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
