import { expect, test } from "@playwright/test";

const FIXED_TIME = new Date("2026-09-01T00:00:00Z");
const AUTH = { name: "wb_admin", value: "admin@welkinbliss.com", url: `http://127.0.0.1:${process.env.PW_PORT ?? 3320}` };

// Unauthenticated login screen.
test("page: login", async ({ page }) => {
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot("login.png", { fullPage: true });
});

// Authenticated screens (cookie set + clock frozen for the calendar).
test.describe("app", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([AUTH]);
    await page.clock.setFixedTime(FIXED_TIME);
  });

  const PAGES: readonly { readonly path: string; readonly name: string }[] = [
    { path: "/", name: "dashboard" },
    { path: "/properties", name: "properties" },
    { path: "/properties/villa-serena", name: "property-edit" },
    { path: "/site-copy", name: "site-copy" },
  ];

  for (const { path, name } of PAGES) {
    test(`page: ${name}`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
    });
  }
});
