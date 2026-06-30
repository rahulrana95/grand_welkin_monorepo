---
name: testing-visual-storybook-argos
description: Use when setting up or reviewing visual regression testing for React + TypeScript via Storybook stories + Argos CI (open source) — screenshots captured by Playwright in your own GitHub Actions/Docker, with a PR review UI showing added/changed/removed screenshots and approve/reject. Covers writing stories as capture targets, the Argos pipeline, the PR review flow, and stability. Chromatic noted as the managed alternative.
---

# Visual Regression — Storybook + Argos CI

**Goal: catch UI/visual regressions early, reviewable in the GitHub PR** — added/
changed/removed screenshots with explicit approve/reject before merge. Stories are the
unit of capture; Argos is the diff engine + PR review surface; GitHub Actions +
Playwright (your runners) do the rendering. Use this when you want a real review UI
without committing baselines to git (contrast: `testing-visual-playwright`).

## What this catches (that assertion tests can't)

`toBeInTheDocument()` is blind to **pixels**. Screenshot diffs catch CSS regressions
(padding/radius/color), layout shift/overflow/z-index/truncation, theme/token drift
(dark-mode contrast), font/icon swaps, and **ripple effects** (editing one component
silently changes 40 consumers). **Component isolation = deterministic input →
deterministic pixels**: a story pins exact `args`, so the only variable is your code,
and a focused diff tells you exactly what regressed.

## Stories as screenshot targets (CSF3, one story per state)

Each export = its own baseline. Type-safe via `satisfies Meta<typeof X>` /
`StoryObj<typeof meta>`.

```tsx
// Button.stories.tsx
const meta = { title: "Components/Button", component: Button, args: { children: "Save" } } satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story     = { args: { variant: "primary" } };
export const Destructive: Story = { args: { variant: "destructive", children: "Delete" } };
export const Loading: Story      = { args: { variant: "primary", isLoading: true } };
export const Disabled: Story     = { args: { variant: "primary", disabled: true } };
export const LongLabel: Story    = { args: { children: "A very long label that may wrap or truncate" } };
```

**Interaction states via `play`** (capture happens after `play` settles):
```tsx
export const OpenMenu: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /country/i }));
    await waitFor(() => expect(canvas.getByRole("listbox")).toBeVisible()); // settle before capture
  },
};
```

**Viewports & themes via Argos `modes`** (not copy-pasted stories) — one snapshot per
mode:
```ts
// .storybook/preview.ts
parameters: {
  argos: { modes: {
    "light desktop": { theme: "light", viewport: "desktop" },
    "dark desktop":  { theme: "dark",  viewport: "desktop" },
    "light mobile":  { theme: "light", viewport: "mobile"  },
  } },
}
```
Opt a sandbox story out with `parameters: { argos: { disable: true } }`.

## Argos pipeline

`@storybook/test-runner` walks every story in headless Chromium → `argosScreenshot()`
stabilizes & captures one shot per story/mode → `argos upload` → Argos posts the PR check.

```bash
npm i -D @storybook/test-runner @argos-ci/storybook @argos-ci/cli http-server wait-on concurrently
```
```ts
// .storybook/test-runner.ts
import { waitForPageReady } from "@storybook/test-runner";
import { argosScreenshot } from "@argos-ci/storybook/test-runner";
export default {
  async postVisit(page, context) {
    await waitForPageReady(page);        // fonts/images/async done
    await argosScreenshot(page, context); // stabilizes + expands modes
  },
};
```
```yaml
# .github/workflows/visual-tests.yml (key steps)
- uses: actions/checkout@v4
  with: { fetch-depth: 0 }              # Argos needs history to find the baseline commit
- run: npm ci && npm run build-storybook
- run: npx playwright install --with-deps chromium
- run: npm run test-storybook:ci        # serve static build + run test-runner
- run: npx argos upload ./screenshots
  env: { ARGOS_TOKEN: ${{ secrets.ARGOS_TOKEN }} }   # or GitHub OIDC (id-token: write), preferred
```

## PR review flow (the payoff)

Argos diffs the PR build against the **baseline = base branch (`main`)**. In the
review UI (linked from the PR check):
- **Added** — new story/state; review to bless the new baseline.
- **Changed** — side-by-side pixel diff with highlighted regions (the core signal).
- **Removed** — gone vs baseline; flags accidental deletions.

**Approve** intended changes (becomes the new baseline on merge → check goes green);
**Reject** unintended regressions (check stays red). Configure `main` as the
**auto-approved baseline branch**, and make the Argos check a **required status check**
so unreviewed visual changes can't merge.

## Stability (flaky diffs train people to rubber-stamp)

- `argosScreenshot` already pauses CSS animations, waits fonts/images, hides carets/
  scrollbars — pair with `waitForPageReady`.
- **Kill animations globally** (reduce-motion CSS) for JS-driven animations Argos can't pause.
- **Freeze time & randomness** — pass dates/IDs/random as explicit `args`; never call
  `new Date()`/`Math.random()`/`uuid()` inside components in stories; mock the clock/RNG in a decorator.
- **Mask dynamic regions** with `data-visual-test="transparent|removed|blackout"` or Argos `mask` — don't raise the threshold to hide them.
- **Self-host fonts** (no CDN at test time) for deterministic glyphs.
- **Render only in CI/Docker** (`ubuntu-latest` + `playwright install --with-deps chromium`) — never generate baselines on a dev laptop (subpixel diffs guaranteed).
- Keep `threshold` near default (~0.5); fix nondeterminism at the source, don't desensitize.

## Chromatic — managed alternative
Chromatic renders in its own cloud (no Playwright/runner to maintain) and its
**TurboSnap** snapshots only stories affected by changed files (needs `fetch-depth: 0`,
unlocks after ~10 builds). Pay for it when story count is large and CI render
time/cost dominates, or you want cross-browser cloud rendering with zero infra. Choose
**Argos** for open-source/self-hosted rendering in your own Actions/Docker with full
control — this team's stated stack.

## Checklist
- [ ] One story per meaningful state (default/loading/error/empty/disabled/long-content).
- [ ] CSF3 with `satisfies Meta<typeof X>` / `StoryObj<typeof meta>`.
- [ ] Variants × themes × viewports via Argos `modes`, not duplicated stories.
- [ ] Interaction states via `play` with `await waitFor(...)` so they settle before capture.
- [ ] Dates/IDs/random passed as explicit `args`; clock & RNG frozen.
- [ ] Animations disabled globally; carets transparent.
- [ ] Dynamic regions masked (`data-visual-test`/`mask`), not threshold-hidden.
- [ ] Fonts self-hosted; `waitForPageReady` before capture.
- [ ] Baselines generated only in CI/Docker; `fetch-depth: 0` in checkout.
- [ ] Baseline = `main`, auto-approved; Argos/Chromatic check is a required status check.
- [ ] `threshold` near default; nondeterminism fixed at source.
- [ ] Every Added/Changed/Removed reviewed in the PR; approve only intentional changes.
- [ ] Non-visual sandboxes excluded (`argos.disable`).
