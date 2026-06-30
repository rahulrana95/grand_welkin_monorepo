---
name: typescript-switch-exhaustive
description: Use when branching on a known, finite set of values in TypeScript — status/kind/type/action fields, string-literal unions, discriminated unions, reducers, state machines, or any if/else-if chain over fixed keys. Prefer a `switch` over the known keys (even a large one) with an exhaustive `never` check for readability and compiler-enforced completeness.
---

# Prefer `switch` over known keys, with exhaustive checking

When the set of possible values is **known and finite**, a `switch` is the most
readable shape — each case is a flat, labelled, parallel branch you can scan top to
bottom. **A large but explicit `switch` is preferred over a clever lookup or a long
if/else-if chain** when the keys are meaningful: the reader sees every case, and the
compiler forces you to handle all of them.

## The rule

1. Branching on a finite/union/discriminant value → use `switch`.
2. Give every known value its own `case` — even if that makes the switch long.
   Explicit and exhaustive beats short and surprising.
3. End with a `default` that assigns the value to `never` and throws, so adding a
   new variant without handling it is a **compile error**.

```ts
function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}

type Status = "idle" | "loading" | "success" | "error";

function label(status: Status): string {
  switch (status) {
    case "idle":
      return "Ready";
    case "loading":
      return "Working…";
    case "success":
      return "Done";
    case "error":
      return "Something went wrong";
    default:
      return assertNever(status); // add a Status member ⇒ this line fails to compile
  }
}
```

Add `"cancelled"` to `Status` and forget a case → `assertNever(status)` errors:
*"Argument of type 'string' is not assignable to parameter of type 'never'."* The
type system now guards completeness for you. This is why the explicit switch is
worth its length.

## Discriminated unions are the ideal input

Tag each variant with a literal discriminant (`type` / `kind` / `status`). Inside
each `case`, TypeScript **narrows** to that variant, so variant-only fields are
safely accessible — no casts.

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;          // radius in scope
    case "rectangle":
      return shape.width * shape.height;           // width/height in scope
    case "triangle":
      return (shape.base * shape.height) / 2;
    default:
      return assertNever(shape);
  }
}
```

## Reducers / state machines — the canonical use

```ts
type Action =
  | { type: "increment"; by: number }
  | { type: "decrement"; by: number }
  | { type: "reset" };

function reducer(count: number, action: Action): number {
  switch (action.type) {
    case "increment":
      return count + action.by;
    case "decrement":
      return count - action.by;
    case "reset":
      return 0;
    default:
      return assertNever(action);
  }
}
```

## When NOT to switch

- **Two outcomes / a simple boolean** → an `if` or ternary is clearer than a
  two-case switch.
- **Open-ended or data-driven keys** (arbitrary strings, config maps that grow at
  runtime) → a `Record`/`Map` lookup is right; you can't and shouldn't enumerate
  them. Exhaustiveness only applies to *closed* sets.
- **Pure value→value mapping with no logic** → a typed lookup object is fine and
  concise: `const ICON: Record<Status, string> = { idle: "…", … }`. Use the switch
  when branches contain real logic, early returns, or narrowing.

## Conventions
- Keep `assertNever` (a.k.a. `assertUnreachable`) in a shared `utils` and import it;
  don't redefine per file.
- Every `case` either `return`s or `break`s — no accidental fall-through. Group
  intentional fall-through cases adjacently with a comment.
- Order cases meaningfully (lifecycle order, or most-common first), not randomly.
- Always include the `never` `default`, even when you "know" it's exhaustive today.

## Checklist
- [ ] Branching on a closed set → it's a `switch`, not an if/else-if chain.
- [ ] Every known key has an explicit `case`.
- [ ] `default` calls `assertNever(value)` for compile-time exhaustiveness.
- [ ] Input is a discriminated union where variants carry their own fields.
- [ ] Open-ended keys use a `Record`/`Map` instead (not forced into a switch).
