---
name: testing-visual-playwright
description: Use when setting up or reviewing lean, no-SaaS visual regression testing with Playwright's built-in toHaveScreenshot() — baseline PNGs committed to git and reviewed in the GitHub PR (native 2-up/swipe/onion-skin viewer; Playwright emits a computed diff PNG). Covers page/element/component screenshots, determinism, Docker rendering, the git review flow, and CI. Contrast with testing-visual-storybook-argos (hosted review UI).
---

# Visual Regression — Playwright `toHaveScreenshot` (no SaaS)

**Goal: catch UI regressions early, reviewable in the GitHub PR, with zero external
service.** Write screenshot tests in code, commit baseline PNGs to git, review image
diffs in the PR's Files-changed tab. Choose this over `testing-visual-storybook-argos`
when you want no third-party dependency and PR-native review, and accept owning render
determinism + binary churn in git.

## Mechanics & trade-offs

`await expect(page).toHaveScreenshot('home.png')` captures the rendered page in a real
browser and compares pixel-by-pixel (pixelmatch) against a committed baseline. First
run with `--update-snapshots` writes the baseline; later runs **fail** on drift,
writing `*-expected.png`, `*-actual.png`, and a highlighted `*-diff.png` into the HTML
report. Baselines live in git, so a UI-changing PR shows before/after PNGs in
**Files changed**, rendered with GitHub's 2-up / Swipe / Onion-skin viewer.

vs hosted (Argos/Chromatic): **no** approve/reject button ("approval" = merging the
PR), baselines **bloat git**, and you **own determinism** (OS/browser/font sensitivity
→ run in Docker). Right for small/medium suites; hosted earns its keep at hundreds of
components with frequent redesigns.

## Writing tests

`toHaveScreenshot` is **auto-retrying/web-first** — it re-screenshots until two
captures match (stable: no in-flight network, no running animation) or times out;
prefer it over `page.screenshot()` + manual compare.

```ts
test("hero element", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("hero")).toHaveScreenshot("hero.png"); // element shots: smaller, pinpoint failures
});
```

**Component testing** (`@playwright/experimental-ct-react`) to snapshot a single
component in states — mounts in a *real* browser (real CSS/fonts/focus, unlike jsdom):
```bash
npm init playwright@latest -- --ct   # choose React
```
```tsx
import { test, expect } from "@playwright/experimental-ct-react";
import { Button } from "../src/components/Button";

test("primary", async ({ mount }) => {
  const cmp = await mount(<Button variant="primary">Save</Button>);
  await expect(cmp).toHaveScreenshot("button-primary.png");
});
test("loading", async ({ mount }) => {
  const cmp = await mount(<Button variant="primary" loading>Save</Button>);
  await expect(cmp).toHaveScreenshot("button-loading.png", { animations: "disabled" });
});
```
Load the same global CSS/fonts in `playwright/index.tsx` so components render truthfully.

## Determinism is everything

```ts
// playwright.config.ts
export default defineConfig({
  use: { viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1, colorScheme: "light", timezoneId: "UTC", locale: "en-US" },
  expect: { toHaveScreenshot: {
    maxDiffPixelRatio: 0.01,   // or maxDiffPixels: 100 for small components
    threshold: 0.2,            // per-pixel color sensitivity
    stylePath: "./tests/visual/screenshot.css",
    animations: "disabled",    // default; caret: 'hide' is also default
  } },
});
```
- **`mask`** dynamic regions: `toHaveScreenshot('feed.png', { mask: [page.getByTestId('timestamp'), page.locator('.ad-slot')] })`.
- **`stylePath` CSS** to kill troublemakers: `* { animation: none !important; transition: none !important; caret-color: transparent !important } ::-webkit-scrollbar { display: none !important }`.
- **Freeze time** before navigation: `await page.clock.setFixedTime(new Date('2026-01-01T12:00:00Z'))`.
- **Fonts loaded**: `await page.evaluate(() => document.fonts.ready)`; self-host fonts; avoid `font-display: swap` flashes.
- Per-target tolerances (tight for hero/brand, looser for dense tables) — avoid one global number.

## Consistent rendering = Docker

The #1 false-diff cause: a macOS baseline vs a Linux CI render (font hinting/
anti-aliasing/subpixel differ). **Generate baselines in the same environment that
compares them** — the official `mcr.microsoft.com/playwright:vX.Y.Z-noble` image,
tag pinned to your `@playwright/test` version.

```bash
# update baselines THROUGH the image so bytes match CI (--ipc=host avoids Chromium crashes)
docker run --rm --ipc=host -v "$(pwd)":/work -w /work \
  mcr.microsoft.com/playwright:v1.50.0-noble npx playwright test --update-snapshots
```
Commit the `*-linux.png` files; treat them as source of truth. Don't commit throwaway
`*-darwin.png` (gitignore other platform suffixes or restrict the visual project to one platform).

## Git + GitHub PR review flow

Filenames are `{name}-{projectName}-{platform}.png`; the platform suffix is why a
Mac baseline won't match Linux CI. Optionally tidy layout with `snapshotPathTemplate`.

1. Make a UI change → CI fails the visual job (the signal).
2. If **intentional**, regenerate via the Docker command and **commit updated baselines in the same PR**.
3. Reviewers open **Files changed**: GitHub renders each changed PNG with 2-up / Swipe /
   Onion-skin. Approving the visual change = approving/merging the PR.

Repo hygiene: prefer element/component shots over full-page (smaller PNGs, localized
failures); crop tight; keep baselines under one folder. The native diff viewer needs
images **tracked in git** (not PR-comment attachments) — and **does NOT render LFS
images**, so use plain git blobs for small/medium suites; reach for Git LFS only when
history bloat genuinely hurts (accepting the loss of the in-PR viewer).

## CI

```yaml
# .github/workflows/visual.yml (key parts)
jobs:
  visual:
    runs-on: ubuntu-latest
    container: { image: "mcr.microsoft.com/playwright:v1.50.0-noble", options: "--user 1001 --ipc=host" }
    steps:
      - uses: actions/checkout@v5
        with: { lfs: true }                 # only if baselines are in LFS
      - run: npm ci
      - run: npx playwright test --project=chromium   # NEVER --update-snapshots in CI
      - uses: actions/upload-artifact@v5
        if: ${{ !cancelled() }}             # upload report even on failure
        with: { name: playwright-report, path: playwright-report/ }
```
Run inside the Playwright container (rendering matches baselines; no `playwright
install` needed). **Never `--update-snapshots` in CI** (would silently overwrite
baselines so tests can never fail). Make the visual job a **required check** so an
unexpected diff blocks the PR. Optionally gate behind a `paths:`/label filter since
visual tests are slower.

## Checklist
- [ ] Pinned render surface: fixed viewport, `deviceScaleFactor: 1`, `colorScheme`, `locale`, `timezoneId: "UTC"`.
- [ ] Baselines generated & compared in the same env — official Playwright image, tag pinned to your version; no committed `-darwin` baselines.
- [ ] `animations: "disabled"` + `stylePath` CSS for JS-driven animations; carets/scrollbars neutralized.
- [ ] Time frozen via `page.clock.setFixedTime`; `document.fonts.ready` awaited; fonts self-hosted.
- [ ] Dynamic regions `mask`ed (timestamps/avatars/ads/random/video/iframes).
- [ ] Element/component screenshots preferred over full-page; cropped tight.
- [ ] Stable state awaited via `toHaveScreenshot` auto-retry; no `waitForTimeout`.
- [ ] Per-target `maxDiffPixels`/`maxDiffPixelRatio` + `threshold`; no single global number.
- [ ] Component mounts load the app's global CSS/fonts; each state snapshotted explicitly.
- [ ] Baselines committed as plain git blobs (LFS only if needed, knowing it disables the PR viewer).
- [ ] CI never updates snapshots; HTML report uploaded `if: !cancelled()`; visual job is a required check.
- [ ] Intentional changes reviewed in-PR (2-up/swipe/onion-skin); baseline folder gated by `CODEOWNERS`.
