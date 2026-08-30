import { expect, test } from "@playwright/test";

/** Fixed clock so date-dependent UI (the availability calendar) is deterministic. */
const FIXED_TIME = new Date("2026-09-01T00:00:00Z");

/**
 * Per-component visual baselines. Each component is rendered on /ui-gallery
 * wrapped in a [data-visual="<id>"] handle and screenshotted in isolation.
 */
const COMPONENTS: readonly string[] = [
  "logo-color",
  "logo-mono",
  "logo-black",
  "logo-monogram",
  "button-primary",
  "button-ghost",
  "chips",
  "property-card",
  "collection-card",
  "booking-panel",
  "search-bar",
];

test.describe("components", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(FIXED_TIME);
    await page.goto("/ui-gallery", { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
  });

  for (const id of COMPONENTS) {
    test(`component: ${id}`, async ({ page }) => {
      const el = page.locator(`[data-visual="${id}"]`);
      await expect(el).toBeVisible();
      await expect(el).toHaveScreenshot(`${id}.png`);
    });
  }
});

// Global chrome (rendered by the layout on every page) — capture from home.
test.describe("layout", () => {
  test("component: header", async ({ page }) => {
    await page.clock.setFixedTime(FIXED_TIME);
    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    // The site header is the `banner` landmark (section <header>s are not banners).
    await expect(page.getByRole("banner")).toHaveScreenshot("header.png");
  });

  test("component: footer", async ({ page }) => {
    await page.clock.setFixedTime(FIXED_TIME);
    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole("contentinfo")).toHaveScreenshot("footer.png");
  });
});
