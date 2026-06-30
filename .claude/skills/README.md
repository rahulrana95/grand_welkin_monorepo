# Project skills

Agent skills that guide how code is written in this repo. Each lives in its own
folder as a `SKILL.md` with frontmatter; Claude Code auto-loads a skill when its
`description` matches the task. They encode our house style: **readability first,
100% type coverage, no `any`.**

## TypeScript / frontend (current set)

| Skill | Loads when… |
|---|---|
| [`typescript-style`](./typescript-style/SKILL.md) | writing/reviewing any `.ts`/`.tsx` — strict types, no `any`, naming, immutability, `as const` |
| [`typescript-generics`](./typescript-generics/SKILL.md) | generics are in play — when they're justified (Golden Rule) and how to keep them readable |
| [`typescript-switch-exhaustive`](./typescript-switch-exhaustive/SKILL.md) | branching on a finite/known set — prefer `switch` + `never` exhaustiveness over if/else chains |
| [`react-typescript`](./react-typescript/SKILL.md) | React `.tsx` — prop typing, discriminated-union props, typed hooks/events/context, no `React.FC` |

The skills cross-reference each other; `react-typescript` builds on the three core
TypeScript skills.

## Testing (React + TypeScript)

A layered strategy whose single goal is to **detect breaking changes and UI
regressions early** — each bug caught by the fastest, cheapest layer that can see it.
**Start at [`testing-strategy`](./testing-strategy/SKILL.md)** to route a change to the
right layer, then open the specific skill.

| Skill | Loads when… |
|---|---|
| [`testing-strategy`](./testing-strategy/SKILL.md) | deciding *which* test to write, setting up the stack, or reviewing coverage across layers (the map) |
| [`testing-unit-vitest-rtl`](./testing-unit-vitest-rtl/SKILL.md) | unit/component tests — Vitest + RTL, BDD style (optional Gherkin via `vitest-cucumber`) |
| [`testing-integration-msw`](./testing-integration-msw/SKILL.md) | integration tests — real component trees with the network mocked at the boundary via MSW v2 |
| [`testing-e2e-playwright`](./testing-e2e-playwright/SKILL.md) | E2E against an actual backend — Playwright (+ `playwright-bdd`), data lifecycle, `storageState` auth, anti-flakiness |
| [`testing-visual-storybook-argos`](./testing-visual-storybook-argos/SKILL.md) | visual regression with a PR approve/reject UI — Storybook stories + Argos (Chromatic = managed alt) |
| [`testing-visual-playwright`](./testing-visual-playwright/SKILL.md) | lean, no-SaaS visual regression — Playwright `toHaveScreenshot`, git baselines reviewed in the PR |
