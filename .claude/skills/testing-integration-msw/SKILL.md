---
name: testing-integration-msw
description: Use when writing or reviewing integration tests for React + TypeScript — real component trees that fetch over HTTP, with the network mocked at the boundary via MSW v2 (not module/fetch stubs), run under Vitest + RTL. Focus on catching contract/integration drift early. Builds on testing-unit-vitest-rtl.
---

# Integration Testing — Vitest + RTL + MSW v2

**Goal: catch integration & contract breakage early.** The seam under test is a
**real component tree rendering, fetching over HTTP, and reacting** (loading →
success → error → empty). Nothing in your app is stubbed — only the network
boundary is replaced, with a real HTTP-shaped response.

## Why mock at the network layer, not the module layer

`vi.mock('./api')` or stubbing `global.fetch` re-implements your backend in every
test file, and that re-implementation rots as the API evolves. MSW intercepts at the
request boundary, so:
- The component runs its **real** data-fetching path (TanStack Query, RTK Query, raw
  `fetch`, Apollo).
- You can **refactor the data layer freely** and tests stay green if behavior holds.
- **One set of handlers** serves Vitest, browser mode, Playwright, and the dev server.
- A *typed* handler can be made to **fail loudly when the contract changes** (see §4).

> Requires `msw@^2`. v1 `rest`/`res(ctx.json())` is gone — v2 uses `http` +
> `HttpResponse` with a single resolver arg `{ request, params, cookies }`.

## Setup

```
src/mocks/handlers.ts   # happy-path handlers (the base mock backend)
src/mocks/server.ts     # setupServer for node
src/test/setup.ts       # lifecycle + jest-dom
```

```ts
// src/mocks/server.ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";
export const server = setupServer(...handlers);
```

```ts
// src/test/setup.ts — the resetHandlers is non-negotiable
import { afterAll, afterEach, beforeAll } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { server } from "../mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" })); // fail on any unmocked request
afterEach(() => { server.resetHandlers(); cleanup(); });          // tear down per-test overrides
afterAll(() => server.close());
```

`handlers.ts` holds **happy paths only** (MSW best practice). Use **relative paths**
(`/api/...`) so handlers work in node/jsdom/browser; absolute URLs only for 3rd parties.

```ts
// src/mocks/handlers.ts
import { http, HttpResponse } from "msw";
import type { User } from "../types/api";
export const handlers = [
  http.get("/api/users", () =>
    HttpResponse.json<User[]>([{ id: "1", name: "Ada Lovelace", email: "ada@example.com" }])),
];
```

## Writing tests — assert the lifecycle, override per-test

Assert **loading synchronously** (before any `await`), then `findBy*` the resolved
UI. Drive error/empty/edge states with **`server.use(...)`** overrides (removed by
`resetHandlers`, so isolation holds).

```tsx
it("shows loading, then renders users", async () => {
  render(<UserList />);
  expect(screen.getByRole("status")).toHaveTextContent(/loading/i); // sync
  expect(await screen.findByRole("list", { name: /users/i })).toBeInTheDocument();
  expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
});

it("renders an error when the API returns 500", async () => {
  server.use(http.get("/api/users", () => new HttpResponse(null, { status: 500 })));
  render(<UserList />);
  expect(await screen.findByRole("alert")).toHaveTextContent(/went wrong/i);
});

it("renders empty state", async () => {
  server.use(http.get("/api/users", () => HttpResponse.json([])));
  render(<UserList />);
  expect(await screen.findByText(/no users found/i)).toBeInTheDocument();
});

it("handles a dropped connection (first request only)", async () => {
  server.use(http.get("/api/users", () => HttpResponse.error(), { once: true }));
  render(<UserList />);
  expect(await screen.findByRole("alert")).toBeInTheDocument();
});
```

Use MSW's `delay()` for deterministic latency — not fake timers, which stall `waitFor`.

## Contract safety — the early-breakage core

A mock that can silently disagree with the backend is worse than no mock. Three
escalating layers:

**Layer 1 — one shared, generated type (compile-time).** Type request & response
with the **same types the real client uses**, ideally **generated from the backend
contract** (`openapi-typescript`, `graphql-codegen`). A backend field rename then
becomes a *compile error in your handlers*.
```ts
import { http, HttpResponse, type PathParams } from "msw";
import type { CreateUserBody, User } from "../types/api";
http.post<PathParams, CreateUserBody, User>("/api/users", async ({ request }) => {
  const body = await request.json();                 // typed CreateUserBody
  return HttpResponse.json({ id: "new", ...body });  // must satisfy User, else type error
});
```

**Layer 2 — runtime-validate the outgoing mock with Zod** (types vanish at runtime;
a hand-built body can still be subtly wrong):
```ts
import { UserListSchema } from "../types/api"; // z.infer gives the type too
http.get("/api/users", () => HttpResponse.json(UserListSchema.parse([
  { id: "1", name: "Ada Lovelace", email: "ada@example.com" },
]))); // throws if the mock drifts
```

**Layer 3 — validate the incoming write body** so a client-side refactor that
changes the request shape is caught:
```ts
const parsed = CreateUserBodySchema.safeParse(await request.json());
if (!parsed.success) return HttpResponse.json({ error: parsed.error.flatten() }, { status: 400 });
```

> Type-sharing + Zod stop *your mocks* from drifting from *your understanding* of the
> API. They can't detect the *real backend* changing — for that, generate the shared
> schema from the backend's contract and/or add a thin contract test (Pact / replay
> real responses through the same Zod schemas in CI).

## GraphQL

MSW keys on **operation name**, not URL, and returns the `{ data }`/`{ errors }` envelope:
```ts
import { graphql, HttpResponse } from "msw";
graphql.query<GetUserQuery, GetUserVars>("GetUser", ({ variables }) =>
  HttpResponse.json({ data: { user: { id: variables.id, name: "Ada" } } }));
// error envelope (not HTTP status):
server.use(graphql.query("GetUser", () => HttpResponse.json({ errors: [{ message: "Not found" }] })));
```

## Pitfalls
- **Unhandled requests** → always `onUnhandledRequest: "error"` in tests.
- **Handler leakage** → `resetHandlers()` in `afterEach` is mandatory (else order-dependent).
- **Over-mocking** → don't also `vi.mock` the client or stub `fetch`; MSW is the *only* fake.
- **Missed loading state** → assert spinner *before* awaiting, not after.
- **Manual `act()`** → use `findBy`/`waitFor`/`userEvent`; never hand-wrap.
- **`waitFor` misuse** → single assertion inside, no side effects (no render/`server.use`).
- **Request assertions** → assert resulting UI, not "was called with"; let `onUnhandledRequest: 'error'` enforce the endpoint.
- **Fake timers** → break network waits; prefer real timers + MSW `delay()`.

## Checklist
- [ ] Network mocked at the boundary (MSW `setupServer`), never `vi.mock('./api')`/fetch stub.
- [ ] `server.listen({ onUnhandledRequest: "error" })` in `beforeAll`.
- [ ] `server.resetHandlers()` + `cleanup()` in `afterEach`; `server.close()` in `afterAll`.
- [ ] `handlers.ts` = happy paths; error/empty/edge are per-test `server.use(...)`.
- [ ] Loading asserted synchronously; success/error via `findBy*`/`waitFor`; no manual `act()`.
- [ ] Queries are user-facing (role/label/text); no test IDs / internal state.
- [ ] Error, empty, and ≥1 edge case (500 / network error / slow) covered, not just happy path.
- [ ] Response & request bodies typed from a **shared** type (`http.get<Params, Body, Res>`).
- [ ] Shared types/schemas generated from the backend contract where possible.
- [ ] Handlers Zod-validate outgoing responses (and incoming write bodies).
- [ ] GraphQL handlers key on operation name and return `{ data }`/`{ errors }` correctly.
- [ ] Real timers (or MSW `delay()`); tests pass both in isolation and in the full run.
