---
name: testing-strategy
description: Use when deciding WHICH kind of test to write for a React + TypeScript change, setting up a project's test stack, or reviewing test coverage across layers. The map that routes work to the right layer (unit / integration / e2e / visual) so breaking changes and UI regressions are caught as early and as cheaply as possible. Start here, then open the specific testing-* skill.
---

# Testing Strategy — catch breakage early, at the cheapest layer

**One goal: detect breaking changes and UI regressions early.** Every bug should be
caught by the **fastest, cheapest test that can see it**. Push detection down the
pyramid; reserve the slow, flaky layers for what only they can prove.

## The layers (and which skill to open)

| Layer | Stack | Catches | Speed | Skill |
|---|---|---|---|---|
| **Unit / component** | Vitest + RTL (+ vitest-cucumber) | behavior/logic/a11y of one component or function | ms — widest layer | `testing-unit-vitest-rtl` |
| **Integration** | Vitest + RTL + **MSW v2** | component tree + real data-fetching; contract drift | ms–s | `testing-integration-msw` |
| **E2E (real backend)** | **Playwright** (+ playwright-bdd) | full frontend↔backend↔DB journeys | s–min — keep to 3–5 | `testing-e2e-playwright` |
| **Visual (hosted review)** | **Storybook + Argos** | pixel/UI regressions; PR approve/reject UI | s — per story | `testing-visual-storybook-argos` |
| **Visual (lean, no SaaS)** | **Playwright `toHaveScreenshot`** | pixel/UI regressions; git-baseline PR diffs | s | `testing-visual-playwright` |

## Routing rule — "what's the cheapest layer that can catch this?"

- **Pure logic, formatting, validation, a hook, a reducer** → unit.
- **One component's rendering/interaction/states (loading/empty/error/disabled)** → unit (component test).
- **A feature that fetches and renders data; error/empty/edge responses; contract shape** → integration (MSW). *Mock the network at the boundary, never `vi.mock('./api')`.*
- **A critical end-to-end journey where the real frontend + real backend integration is the thing under test** → E2E (≤5 total).
- **Does it look right? (CSS, layout, theme, spacing, ripple effects across consumers)** → visual. Assertion tests are blind to pixels; jsdom doesn't paint.

> If a bug can be caught one layer down, it belongs one layer down. A 30-test E2E
> suite that's green-means-green beats a 300-test one people learn to ignore.

## Visual: which of the two?

Both screenshot a real browser render and surface diffs in the PR. Pick by review UX:
- **Storybook + Argos** — want a real **approve/reject review UI**, "render any
  component" via stories, baselines stored server-side (repo stays lean). Open source,
  runs in your own CI/Docker. Chromatic is the managed, zero-infra alternative.
- **Playwright `toHaveScreenshot`** — want **zero third-party service**; baselines
  committed to git, reviewed with GitHub's native image-diff viewer. Leaner stack; you
  own render determinism (Docker) and accept binary churn in git.

Default to **Argos** for a component library / design system (review UX matters at
scale); **plain Playwright** for a small app that already uses Playwright for E2E.

## Cross-cutting principles (apply at every layer)

- **Test observable behavior / user-visible output, not implementation details** —
  internal state, effect counts, private names. Implementation tests fail on safe
  refactors (false alarms) and miss real breakage.
- **Query by accessibility** (role/label/text) — survives markup churn and doubles as
  an a11y check. `data-testid` only when nothing semantic fits.
- **Determinism is non-negotiable** — freeze time/randomness, disable animations, wait
  on user-visible state (never `waitForTimeout`/`networkidle`). A flaky test trains
  people to ignore failures, defeating early detection.
- **Contract safety** — share/generate types from the backend contract so a field
  rename is a *compile error*, not a production incident (see `testing-integration-msw`).
- **Every layer gates the PR in CI** — unit/integration on every PR; E2E + visual as
  required checks (visual can be `paths:`/label-gated since it's slower). Render E2E and
  visual in the **official Playwright Docker image** for environment parity.

## Recommended scripts

```jsonc
{
  "scripts": {
    "test": "vitest run",                 // unit + integration (same runner)
    "test:watch": "vitest",
    "test:cov": "vitest run --coverage",
    "test:e2e": "playwright test",        // or: bddgen && playwright test
    "test:visual": "playwright test --project=visual",   // or test-storybook:ci for Argos
    "test:ct": "playwright test -c playwright-ct.config.ts"
  }
}
```

## BDD note (Gherkin vs behavior-style)

"BDD" = either real **Gherkin** (`vitest-cucumber`, `playwright-bdd`) or **behavior-
style** `describe/it` naming. Use Gherkin **only when non-engineers read/write the
specs**; otherwise behavior-named native tests are clearer and lower-overhead. The
choice is per-layer — see each `testing-*` skill.

## Checklist (when adding/reviewing tests for a change)
- [ ] The test lives at the **cheapest layer that can catch the bug**.
- [ ] No duplication across layers (the same logic isn't unit- *and* E2E-tested).
- [ ] Behavior/output asserted, not implementation details.
- [ ] Network mocked at the boundary for integration; real backend only for the ≤5 E2E journeys.
- [ ] Visual coverage exists for shared/design-system components (one of the two skills).
- [ ] Deterministic (time/random/animation controlled); no `waitForTimeout`.
- [ ] Runs in CI as a PR gate; E2E/visual render in the Playwright Docker image.
