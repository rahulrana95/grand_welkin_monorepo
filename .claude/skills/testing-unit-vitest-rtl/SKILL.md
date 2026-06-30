---
name: testing-unit-vitest-rtl
description: Use when writing or reviewing unit/component tests for React + TypeScript with Vitest + React Testing Library (BDD style; optional Gherkin via vitest-cucumber). The fast PR gate that catches behavioral/semantic/structural regressions early — not pixels (that's the visual-testing skills) and not real network (that's the integration/e2e skills).
---

# Unit & Component Testing — Vitest + React Testing Library (BDD)

**Goal: catch breaking changes early.** These tests run in milliseconds in a
simulated DOM, gate every PR, and fail the instant a component's *observable
behavior* changes. This is the widest layer of the pyramid.

## What this layer covers (and what it must not)

**Cover** — renders the right thing per props/state (loading/empty/error/disabled),
user interactions produce the right outcome, accessibility contracts (role/name/
label), callback wiring, and pure logic (hooks via `renderHook`, reducers,
validators).

**Don't cover here** (wrong layer → brittleness, not safety):
- **Pixel appearance** (color/spacing/fonts) — jsdom doesn't paint. Use the
  `testing-visual-*` skills.
- Real network / cross-page routing / DB → `testing-integration-msw`, `testing-e2e-playwright`.
- **Implementation details** — internal `useState` values, effect call counts,
  private names. Testing these fails on safe refactors instead of real breakage.

## Setup

```bash
npm i -D vitest @vitest/coverage-v8 jsdom @vitejs/plugin-react \
  @testing-library/react @testing-library/dom \
  @testing-library/user-event @testing-library/jest-dom
# optional Gherkin: npm i -D @amiceli/vitest-cucumber
```

```ts
// vitest.config.ts
/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",              // happy-dom only if jsdom is a measured bottleneck
    setupFiles: "./src/test/setup.ts",
    css: true,
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.{test,spec}.{ts,tsx}", "src/**/*.d.ts", "src/main.tsx", "src/test/**"],
      thresholds: { lines: 80, functions: 80, branches: 75, statements: 80 },
    },
  },
});
```

```ts
// src/test/setup.ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
afterEach(() => cleanup());
```

`tsconfig` → `"types": ["vitest/globals", "@testing-library/jest-dom"]`.

## BDD flavor (a): native `describe/it` — the default (≈90% of tests)

BDD here is a *discipline*: name tests by **observable behavior**, readable as a
sentence. No extra dependency.

```tsx
describe("LoginForm", () => {
  it("disables submit until email and password are provided", () => {
    render(<LoginForm onSubmit={vi.fn()} />);
    expect(screen.getByRole("button", { name: /sign in/i })).toBeDisabled();
  });

  it("submits the entered credentials when the form is valid", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "ada@example.com");
    await user.type(screen.getByLabelText(/password/i), "hunter2");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(onSubmit).toHaveBeenCalledWith({ email: "ada@example.com", password: "hunter2" });
  });

  it("shows a validation message for an invalid email", async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={vi.fn()} />);
    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/valid email/i);
  });
});
```

Naming: `describe("<Component>")` → `it("<observable outcome>")`, present tense,
no "should", no internals. Nest `describe("when <context>")` for grouped states.

## BDD flavor (b): real Gherkin via `@amiceli/vitest-cucumber`

Worth it **only when non-engineers (PM/QA) own the specs** as living `.feature`
files. The lib wraps each `Scenario` in a `describe` and errors on any
missing/unimplemented step, keeping spec and code in lockstep.

```gherkin
# src/features/login.feature
Feature: Login form
  Scenario: Submitting valid credentials
    Given the login form is displayed
    When I enter "ada@example.com" as the email
    And I enter "hunter2" as the password
    And I click the "Sign in" button
    Then the form is submitted with my credentials
```

```tsx
// src/features/login.steps.ts — current v3 API
const feature = await loadFeature("src/features/login.feature");
describeFeature(feature, ({ Scenario }) => {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  Scenario("Submitting valid credentials", ({ Given, When, And, Then }) => {
    Given("the login form is displayed", () => { onSubmit.mockClear(); render(<LoginForm onSubmit={onSubmit} />); });
    When("I enter {string} as the email", (_, email: string) => user.type(screen.getByLabelText(/email/i), email));
    And("I enter {string} as the password", (_, pw: string) => user.type(screen.getByLabelText(/password/i), pw));
    And("I click the {string} button", (_, label: string) => user.click(screen.getByRole("button", { name: label })));
    Then("the form is submitted with my credentials", () =>
      expect(onSubmit).toHaveBeenCalledWith({ email: "ada@example.com", password: "hunter2" }));
  });
});
```

Don't Gherkin-ify everything — the indirection only pays off when a human reads the
`.feature` files. Pure logic and most components → plain `it()`.

## React Testing Library rules

**Query priority** (use the highest that fits — it asserts a11y *and* finds the node):
1. `getByRole("button", { name: /…/i })` — top choice for nearly everything.
2. `getByLabelText` — form fields.
3. `getByText` — non-interactive content.
4. `getByDisplayValue` / `getByAltText` / `getByTitle` — niche.
5. `getByTestId` — **last resort only**; ties tests to implementation and skips the a11y check.

- **Always use `screen`** — never destructure queries from `render`.
- **`userEvent.setup()` + `await` every interaction** — not `fireEvent` (userEvent
  fires the full realistic event chain).
- **Async:** `findBy*` for appearance, `waitForElementToBeRemoved` for disappearance,
  `waitFor` only for non-element assertions, `queryBy*` **only** for asserting absence.
- Favoring role/label queries makes tests double as a baseline a11y check.
- Hooks: `renderHook`; wrap *direct* setter calls in `act()` (only then).

## Pitfalls

- **Testing state, not behavior** → assert what the user sees.
- **`act()` warnings** → fix by awaiting interactions/async queries, not by wrapping
  in `act()`. Manual `act` is only for `renderHook` setters.
- **Brittle selectors** (`container.querySelector`, class names, deep testid chains).
- **Snapshot overuse** → devs regenerate blindly; they catch nothing. Avoid
  full-component snapshots; assert specific elements (tiny inline snapshots only if justified).
- **Not awaiting `userEvent`** (v14 is async) → flaky order.
- **Over-mocking** the component under test or its children → green test, broken app.
  Mock only real boundaries (network/time/randomness).

## Coverage & CI

- v8 provider; `vitest run --coverage` exits non-zero below threshold → the gate.
- Healthy default: **80% lines/functions/statements, ~75% branches.** Don't chase
  100%. Consider `thresholds.perFile: true`.
- CI runs `vitest run --coverage` on every PR; dev uses `vitest` (watch).

## Checklist
- [ ] Tests assert observable behavior, never internal state/effects/props plumbing.
- [ ] Named as behavior sentences (`describe`/`it`).
- [ ] Queried by role/label first; `getByTestId` only as documented last resort.
- [ ] `screen` used; no destructured queries.
- [ ] `userEvent.setup()` + `await` on every interaction (no `fireEvent`).
- [ ] `findBy` for async appearance, `queryBy` only for absence, `waitFor` only for non-element asserts.
- [ ] No stray `act()`; no class/`querySelector`/deep-testid selectors; no large snapshots.
- [ ] Mocks only real boundaries; cleanup + mock reset between tests.
- [ ] Covers loading/empty/error/disabled/validation + happy path.
- [ ] Meets coverage thresholds without vanity tests; CI runs `--coverage` on PRs.
- [ ] Gherkin (if used): current `describeFeature(...)` API, every step implemented.
