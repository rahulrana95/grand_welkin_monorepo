---
name: testing-e2e-playwright
description: Use when writing or reviewing end-to-end tests that drive a React + TypeScript app against an ACTUAL backend using Playwright Test (optional Gherkin via playwright-bdd). Covers config, real-backend data lifecycle, storageState auth, anti-flakiness, Page Object Model, and CI. Keep the suite tiny — 3–5 critical journeys.
---

# E2E Testing Against a Real Backend — Playwright

**Goal: catch full-stack breakage early** — contract drift between the real
frontend and a real API, broken auth, regressed checkout — the things unit and
integration tests structurally cannot see. The cost is fragility, so every choice
trades coverage for a **small, reliable, non-flaky** suite that fails only when
something is genuinely broken.

## What E2E should cover — 3–5 journeys only

E2E is the slowest, flakiest layer. Keep it to flows whose breakage is a production
incident:
1. **Auth** — log in / log out (the gate; session storage).
2. **The core money/trust path** — browse → cart → checkout → confirmation (or create → edit → publish).
3. **One write+read round-trip** — create via UI, reload, confirm persisted (catches FE↔BE contract drift).
4. **One permission boundary** — a non-admin is blocked from an admin action.
5. *(optional)* one destructive flow (delete/cancel/refund).

**Push everything else down**: validation/logic → unit (Vitest); component↔API wiring
with mocked transport → integration (RTL + MSW). If a bug can be caught a layer down,
it belongs a layer down. A 30-test suite that's green-means-green beats a 300-test
suite people learn to ignore.

## Setup

```bash
npm init playwright@latest          # scaffolds config + GH Actions
npx playwright install --with-deps
```

```ts
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";
const baseURL = process.env.BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,        // retries hide flake locally — CI only
  workers: process.env.CI ? 4 : undefined,
  fullyParallel: true,
  reporter: process.env.CI ? "blob" : [["html", { open: "never" }]],
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: "on-first-retry",              // full trace only when a test retries
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    reducedMotion: "reduce",              // kill animation-driven flake
  },
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    { name: "chromium", use: { ...devices["Desktop Chrome"], storageState: ".auth/user.json" }, dependencies: ["setup"] },
    { name: "webkit",   use: { ...devices["Desktop Safari"], storageState: ".auth/user.json" }, dependencies: ["setup"] },
  ],
  webServer: {
    command: "npm run preview",           // serve the PRODUCTION build, not the dev server
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

## Real backend — the hard part (cross-test data pollution is the enemy)

**Point at** an ephemeral `docker-compose` stack (preferred in CI: DB+API+app fresh
per run, e.g. Postgres on `tmpfs`) or persistent staging (faster, but assume others
mutate it — never assert absolute counts).

**Test data lifecycle**, in order of preference:
1. **Reset + seed once per run** (migrations + known seed) for a clean baseline.
2. **API-based per-test setup/teardown** — create what the test needs via the API
   (not the UI), tear it down after.
3. **Unique data per test** so parallel workers never collide.

```ts
// API-based fixture — no cross-test pollution
export const test = base.extend<{ project: { id: string } }>({
  project: async ({ request }, use) => {
    const res = await request.post("/api/projects", { data: { name: `proj-${Date.now()}` } });
    const project = await res.json();
    await use(project);
    await request.delete(`/api/projects/${project.id}`); // always cleaned up
  },
});
```

Rules: **idempotent** (passes on clean DB and on re-run); **isolated** (own your data,
clean it up — Playwright gives each test a fresh context); **parallel-safe** (unique
data or per-worker DB). Never assert on global state you don't own.

**Auth — log in once via `storageState`.** Per-test UI login is the #1 cause of slow,
flaky suites. Do it once in a `setup` project; every test starts authenticated.
```ts
// e2e/auth.setup.ts
setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(process.env.E2E_USER!);
  await page.getByLabel("Password").fill(process.env.E2E_PASS!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible(); // user-visible signal, not a sleep
  await page.context().storageState({ path: ".auth/user.json" });
});
```
One file per role (`.auth/admin.json`, `.auth/user.json`); gitignore `.auth/`; prefer
API login (`request.post('/api/login')` + `storageState`) over UI login when possible.

## Anti-flakiness (flake destroys trust faster than missing coverage)

- **Web-first auto-retrying assertions; never `waitForTimeout`.** `expect(locator).toBeVisible()` / `toHaveText()` poll until true. One-shot reads (`isVisible()`, `textContent()`) race the UI.
- **Locate by role/label/text, not CSS/XPath** — survives markup refactors, so you catch *real* regressions not styling churn. `getByTestId` only for non-semantic nodes.
- **Set up `waitForResponse` before the triggering click**, so a fast API call can't return before you listen:
  ```ts
  const created = page.waitForResponse((r) => r.url().includes("/api/orders") && r.ok());
  await page.getByRole("button", { name: "Place order" }).click();
  await created;
  ```
- **Never wait on `networkidle`** — wait on a user-visible state. Control time with `page.clock`, not sleeps. A locator matching >1 element throws — fix the locator, don't loosen it.

## Page Object Model + fixtures

Keep locators/actions in one class (UI change = one-line fix); inject via fixtures.
Locator fields `readonly`; keep assertions out of "action" methods (expose `expect*`
helpers instead); specs read like user intent.
```ts
export const test = base.extend<{ checkoutPage: CheckoutPage }>({
  checkoutPage: async ({ page }, use) => { await use(new CheckoutPage(page)); },
});
```

## playwright-bdd (Gherkin) — only when non-devs read the specs

Use **`playwright-bdd`** (vitalets), **not** `cucumber-js` — it generates native
Playwright tests, keeping the runner, fixtures, POM, traces, auto-waiting, sharding.
```ts
// playwright.config.ts
const testDir = defineBddConfig({ features: "e2e/features/**/*.feature", steps: "e2e/steps/**/*.ts" });
export default defineConfig({ testDir, /* …rest as above */ });
```
```ts
const { Given, When, Then } = createBdd();
When("I place the order", async ({ page }) => {
  const done = page.waitForResponse((r) => r.url().includes("/api/orders") && r.ok());
  await page.getByRole("button", { name: "Place order" }).click();
  await done;
});
```
Wire `"test:e2e": "bddgen && playwright test"`. Skip BDD if only devs touch the tests.

## CI

Run in the **official Playwright Docker image** (`mcr.microsoft.com/playwright:vX-noble`,
tag pinned to your version) so browsers/OS deps match. Boot the real backend
(`docker compose ... --wait` + migrate + seed), **shard** across jobs with
`reporter: 'blob'`, merge into one HTML report, and **upload traces + report as
artifacts** so a failed PR run is debuggable by time-travel. Make the job a required
check.

## Checklist
- [ ] Covers a critical full-stack journey (else move it down a layer).
- [ ] No `waitForTimeout`/sleeps; all waits are web-first auto-retrying assertions.
- [ ] Locators are role/label/text; `data-testid` only when non-semantic; no CSS/XPath.
- [ ] `waitForResponse` set up *before* the triggering action; no `networkidle` waits.
- [ ] Test creates its own uniquely-named data and cleans it up via API.
- [ ] No assertions on global/shared counts; idempotent; passes in isolation, any order, parallel.
- [ ] Auth from `storageState` (setup project), not per-test UI login; setup via API.
- [ ] POM holds locators/actions (readonly); specs read like intent; no asserts in actions.
- [ ] Animations handled (`reducedMotion`); time via `page.clock`.
- [ ] trace/screenshot/video on failure; no committed `test.only`; retries CI-only.
- [ ] (BDD) reusable parameterized steps; `bddgen` before `playwright test`; Gherkin only if non-devs read it.
- [ ] Runs in the official Playwright Docker image in CI; sharded; report+traces uploaded; required check.
- [ ] Green 3× locally before merge — a test that flakes once is treated as broken.
