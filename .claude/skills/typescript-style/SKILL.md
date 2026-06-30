---
name: typescript-style
description: Use when writing, reviewing, or refactoring any TypeScript (.ts/.tsx) code. Enforces 100% type coverage (strict mode, no `any`), and a readability-first style — explicit public types, inferred internals, descriptive names, immutability, and `as const`. Prefer clarity over cleverness.
---

# TypeScript Style & Type Safety

The goal of every change: **a new reader understands it on the first pass, and the
compiler proves it correct.** Readability beats brevity. Type safety is not optional.

## 1. Type coverage is 100% — `any` is banned

- `tsconfig.json` runs in **strict** mode (and we treat `noUncheckedIndexedAccess`
  as on). Never weaken compiler flags to make an error go away — fix the type.
- **Never use `any`.** It deletes type checking and lets bugs hide.
- For genuinely unknown shapes (API responses, `JSON.parse`, `catch` errors) use
  `unknown` and **narrow** before use.
- Never silence the compiler with `as` casts or `// @ts-ignore`. If you must
  suppress, it is `// @ts-expect-error` **with a one-line reason** — and that is a
  last resort, not a tool.

```ts
// ❌ untyped hole — anything goes, nothing is checked
function parse(input: any) {
  return input.data.items;
}

// ✅ unknown forces you to prove the shape before trusting it
function parse(input: unknown): readonly Item[] {
  if (!isApiResponse(input)) {
    throw new TypeError("Unexpected API response shape");
  }
  return input.data.items;
}
```

Validate external data at the boundary with a schema library (Zod/valibot) rather
than asserting `as SomeType`. A cast lies; a parse checks.

```ts
const User = z.object({ id: z.string(), name: z.string() });
type User = z.infer<typeof User>;          // single source of truth
const user = User.parse(await res.json()); // throws on bad data, types flow out
```

## 2. Be explicit on the outside, inferred on the inside

- **Public API** (exported functions, component props, return types of exported
  functions): annotate everything explicitly. Explicit return types catch mistakes
  at the function, not at every call site, and they document intent.
- **Internal logic** (locals, obvious initializers): let inference do the work.
  `const count = 0` needs no `: number`.

```ts
// ✅ explicit boundary, inferred internals
export function totalCents(items: readonly LineItem[]): number {
  let sum = 0;                       // inferred — obvious
  for (const item of items) sum += item.priceCents * item.qty;
  return sum;
}
```

## 3. Naming — names are documentation

- Variables/functions: `camelCase`. Types/interfaces/enums: `PascalCase`.
  Constants that are true compile-time fixed sets: `UPPER_SNAKE` or `as const`.
- Booleans read as predicates: `isLoading`, `hasAccess`, `canSubmit`.
- No abbreviations that aren't universal. `userResponse`, not `usrRes`.
- No `I`-prefix on interfaces (`IUser` → `User`). No `T`-suffix on types.
- Functions are verbs (`fetchUser`), values are nouns (`activeUser`).

## 4. `type` vs `interface`

- **`interface`** for object shapes and public/extendable contracts (supports
  `extends`, clearer errors).
- **`type`** for unions, intersections, tuples, mapped/conditional types, and
  function signatures.
- Be consistent within a file. Don't mix styles for the same kind of thing.

```ts
interface User {                 // object shape
  readonly id: string;
  name: string;
}
type Result = Success | Failure; // union — must be a type
```

## 5. Immutability by default

- Mark fields and array/params `readonly` unless something genuinely mutates them.
  It documents intent and stops accidental writes.
- Use `as const` for fixed literal sets so values stay narrow instead of widening
  to `string`/`number`.

```ts
const ROLES = ["admin", "editor", "viewer"] as const;
type Role = (typeof ROLES)[number]; // "admin" | "editor" | "viewer"

interface Config {
  readonly retries: number;
  readonly endpoints: readonly string[];
}
```

## 6. Prefer union literals over `enum`

String-literal unions are simpler, erase cleanly, and play well with
discriminated unions and exhaustive `switch` (see `typescript-switch-exhaustive`).

```ts
// ✅ preferred
type Status = "idle" | "loading" | "success" | "error";

// ⚠️ avoid numeric enums (leaky reverse-maps, runtime cost). A `const`
// object + `as const` is fine when you need a named namespace of values.
```

## 7. Null / undefined

- Pick one to represent "absent" (prefer `undefined` in app code) and be
  consistent. Don't return `null` from some paths and `undefined` from others.
- Use optional chaining `?.` and nullish coalescing `??` (not `||`, which trips on
  `0`/`""`/`false`).

## 8. Smaller readability rules

- One job per function. If you need "and" to describe it, split it.
- Prefer early returns / guard clauses over deep nesting.
- No magic literals — name them (`const MAX_RETRIES = 3`).
- Type function **inputs and outputs**, then trust them inside.
- Don't over-abstract. Concrete and clear beats generic and clever — reach for
  generics only when there's a real relationship to express (see
  `typescript-generics`).

## Checklist before finishing a TS change
- [ ] No `any`, no unexplained `as`/`@ts-ignore`.
- [ ] Exported functions have explicit return types.
- [ ] External data is parsed/validated, not asserted.
- [ ] Fixed sets are `as const`; data that doesn't mutate is `readonly`.
- [ ] Names read as documentation; no cryptic abbreviations.
- [ ] `tsc --noEmit` is clean.
