import { expect, test } from "@playwright/test";

/** Full-page visual baselines for every route. */
const PAGES: readonly { readonly path: string; readonly name: string }[] = [
  { path: "/", name: "home" },
  { path: "/collections", name: "collections-hub" },
  { path: "/collections/coastal", name: "collection-coastal" },
  { path: "/collections/coastal/amalfi-coast", name: "intersection-coastal-amalfi" },
  { path: "/destinations/amalfi-coast", name: "destination-amalfi" },
  { path: "/villa/villa-serena", name: "villa-serena" },
  { path: "/explore", name: "explore" },
];

// Fixed clock so date-dependent UI (the property availability calendar) is stable.
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-09-01T00:00:00Z"));
});

for (const { path, name } of PAGES) {
  test(`page: ${name}`, async ({ page }) => {
    await page.goto(path, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
  });
}
