---
name: typescript-generics
description: Use when writing or reviewing TypeScript that involves (or might involve) generics — reusable functions, hooks, utility types, containers, or APIs whose types relate inputs to outputs. Decides WHEN a generic is justified vs noise, and HOW to write generics that stay readable (descriptive names, constraints, defaults).
---

# Generics — only when they earn their place

Generics exist to express a **relationship between types** — "the thing that comes
out depends on the thing that went in." Use them for that, and nothing else.
A misused generic is harder to read than the duplication it replaced.

## The Golden Rule: a type parameter must be used at least twice

If a type parameter appears **only once**, it relates nothing to nothing — delete
it. It's almost always `unknown` or a plain type in disguise.

```ts
// ❌ pointless — `Value` appears once, expresses no relationship
function logIt<Value>(value: Value): void {
  console.log(value);
}
// ✅ same behavior, honest signature
function logIt(value: unknown): void {
  console.log(value);
}

// ✅ justified — the return relates to the argument (used twice)
function first<Item>(items: readonly Item[]): Item | undefined {
  return items[0];
}

// ✅ justified — the parameter ties two arguments together
function pluck<Obj, Key extends keyof Obj>(obj: Obj, key: Key): Obj[Key] {
  return obj[key];
}
```

**Decision test before adding `<T>`:** does the type parameter connect two or more
positions (two args, or an arg and the return)? No → don't make it generic.

## Name type parameters descriptively

Single letters (`T`, `K`, `U`) are fine for tiny, obvious utilities. The moment a
generic carries meaning, **name it** — readability is the whole point.

```ts
// ⚠️ fine for a trivial identity helper
function identity<T>(value: T): T { return value; }

// ✅ descriptive names make intent obvious in real code
function groupBy<Item, Key extends string>(
  items: readonly Item[],
  getKey: (item: Item) => Key,
): Record<Key, Item[]> { /* ... */ }
```

Convention: `PascalCase`, meaningful words (`Item`, `Element`, `Key`, `Value`,
`Payload`, `Response`). Reserve `T`-style only for throwaway one-liners.

## Constrain to the minimum the code actually needs

Use `extends` so the generic only accepts what it really uses — and so the body has
the properties it touches. Constrain narrowly; don't demand more than you use.

```ts
// ✅ requires exactly what the body relies on (an `id`), nothing more
function byId<Entity extends { readonly id: string }>(
  entities: readonly Entity[],
  id: string,
): Entity | undefined {
  return entities.find((entity) => entity.id === id);
}
```

## Use default type parameters to keep call sites clean

A default makes the type argument optional and documents the common case.

```ts
interface ApiResult<Data = unknown> {
  readonly status: number;
  readonly data: Data;
}

function createStore<State, Action = { type: string }>(/* ... */) { /* ... */ }
```

## Don't over-engineer the type system

- Prefer a concrete type or a small union over a deep conditional/mapped type when
  the concrete version is clearer. Cleverness in types is still cleverness.
- If a generic signature needs a paragraph to explain, it's probably too abstract —
  split it, or write two concrete functions.
- Let inference work. Annotate type arguments at call sites **only** when the
  compiler can't infer them; don't write `first<User>(users)` when `first(users)`
  already resolves to `User`.
- Add a short comment above genuinely advanced generics (mapped/conditional/
  recursive types) explaining what they produce.

## Quick reference for common readable patterns
- **Lookup that preserves the value type:** `<Obj, Key extends keyof Obj>(obj, key) => Obj[Key]`
- **Collection helper:** `<Item>(items: readonly Item[]) => ...`
- **Async wrapper preserving payload:** `<Payload>(p: Promise<Payload>) => Promise<Result<Payload>>`
- **Factory with optional override:** `<Config = DefaultConfig>(config?: Partial<Config>) => ...`

## Checklist
- [ ] Every type parameter is used at least twice (else remove it).
- [ ] Names are descriptive once they carry meaning.
- [ ] Constraints request only what the body uses.
- [ ] Defaults provided where there's an obvious common case.
- [ ] No conditional/mapped-type gymnastics where a concrete type reads better.
