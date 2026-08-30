import { defineConfig, devices } from "@playwright/test";

/**
 * Visual regression config — Playwright `toHaveScreenshot` with git-committed
 * baselines (see docs/welkinbliss + the `testing-visual-playwright` skill).
 *
 * Determinism: fixed viewport/scale, light theme, UTC, animations disabled,
 * carets/scrollbars hidden. Baselines are generated and compared in the SAME
 * environment (Playwright 1.62.1 / chromium-1194) that CI uses via the official
 * `mcr.microsoft.com/playwright:v1.62.1-noble` image — never regenerate on a
 * dev machine with a different OS/browser.
 *
 * PW_EXECUTABLE lets this run against the pre-installed browser locally; CI
 * leaves it unset and uses the image's bundled browser.
 */
const PORT = Number(process.env.PW_PORT ?? 3300);
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
    env: { PORT: String(PORT) },
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
