import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
});

test("loads with the right title and hero", async ({ page }) => {
  await expect(page).toHaveTitle("Grand Welkin: fast, private web tools from Bangalore");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("serene places to stay");
});

test("has the expected landmarks and sections", async ({ page }) => {
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  for (const name of ["Our portfolio", "How we build", "About", "Privacy", "Contact"]) {
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  }
});

test("live products link to their site in a new tab; coming-soon do not", async ({ page }) => {
  const liveLinks = page.locator("a.card-link");
  await expect(liveLinks).toHaveCount(2);
  await expect(liveLinks.nth(0)).toHaveAttribute("href", "https://purecalchq.com");
  await expect(liveLinks.nth(1)).toHaveAttribute("href", "https://purepdfhq.com");
  for (const link of await liveLinks.all()) {
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
  }
  // 6 cards total, 4 of them are "Coming soon" with no card link.
  await expect(page.locator("li.card")).toHaveCount(6);
  await expect(page.getByText("Coming soon")).toHaveCount(4);
});

test("copy button copies the contact email", async ({ page }) => {
  const btn = page.getByRole("button", { name: "Copy email address" });
  await btn.click();
  await expect(btn).toHaveText("Copied");
});

test("exposes valid Organization JSON-LD", async ({ page }) => {
  const raw = await page.locator('script[type="application/ld+json"]').textContent();
  const data = JSON.parse(raw ?? "{}");
  expect(data["@type"]).toBe("Organization");
  expect(data.legalName).toBe("RNP Grand Welkin LLP");
  expect(data.address.addressCountry).toBe("IN");
});

test("no horizontal scroll at this viewport", async ({ page }) => {
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflows).toBe(false);
});
