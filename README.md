# grand_welkin monorepo

A polyglot company monorepo — **TypeScript/JS + Node.js + Go + Python + Java** — built
on **Bazel + Gazelle + Buf**, where Protobuf is the single source of truth and a schema
change rebuilds & retests exactly the targets that consume it.

> **Status: reference skeleton.** These files are written to the documented APIs of
> each tool but have **not** been build-verified in this environment (no `bazel`/`buf`
> installed). Version pins in `MODULE.bazel` are illustrative — confirm against the
> Bazel Central Registry and run `bazel mod tidy` before relying on them. See
> [ADR 0001](docs/adr/0001-monorepo-build-system.md) for the full rationale.

## Layout

```
MODULE.bazel            bzlmod deps: rules_js/ts, rules_go, rules_python, rules_java,
                        rules_proto, protobuf, rules_buf, gazelle
.bazelrc / .bazelversion  build flags (+ remote cache) and pinned Bazel version
BUILD.bazel             root: npm linking, shared tsconfig, Gazelle target
buf.yaml / buf.gen.yaml  proto governance (lint/breaking) and standalone codegen
pnpm-workspace.yaml     pnpm workspaces for first-party JS/TS packages

proto/                  ← SINGLE SOURCE OF TRUTH
  acme/cart/v1/
    cart.proto          schema (messages, enum, CartService) + buf.validate rules
    BUILD.bazel         proto_library + ts/go/py/java proto libs + buf lint/breaking

libs/cart/              TypeScript consumer of the generated types (+ vitest test)
apps/api/               Go consumer of the SAME proto (main.go + BUILD.bazel)
                        (Python/Java consumers follow the identical pattern)

docs/adr/               architecture decision records
.github/workflows/      buf.yml (proto checks) + bazel.yml (affected build & test)
```

## How a proto change propagates (the core guarantee)

```
cart.proto → proto_library → {ts,go,py,java}_proto_library → consumers → their tests
```

Edit `cart.proto` → its content hash changes → only the codegen + consuming targets +
their tests get new action keys and re-run; everything else is a cache hit. The Bazel
action graph *is* the propagation mechanism — no watcher scripts. Gazelle keeps the
`deps` edges in sync with your `import` statements so the guarantee stays correct.

## Everyday commands

```bash
# First-time setup (run these once the toolchains are installed):
pnpm install                 # generates pnpm-lock.yaml (needed by rules_js)
bazel mod tidy               # resolves Go deps + fills use_repo(...) pins
bazel run //:gazelle         # (or: aspect configure) generate/refresh BUILD files

# Build & test only what's affected (cache makes unaffected targets free):
bazel build //...
bazel test //...

# Inspect impact of a proto change:
bazel cquery 'rdeps(//..., //proto/acme/cart/v1:cart_proto)'

# Proto governance:
buf lint
buf breaking --against '.git#branch=main'

# Frontend inner-loop stays OUTSIDE Bazel (fast HMR):
pnpm --filter @acme/cart dev
```

## Conventions

- **Proto is the source of truth.** All language types are generated; never hand-write
  a struct that mirrors a message.
- **Versioned proto packages** (`acme/<domain>/v1`); incompatible changes → a new
  version, never an in-place break (`buf breaking` enforces this).
- **Keep the dev loop out of Bazel**; Bazel owns codegen, CI, tests, and prod builds.
- **Remote cache** shared by CI and laptops is what makes builds fast.

The repo's working conventions for code, tests, and this architecture live as agent
skills under [`.claude/skills/`](.claude/skills/) — see `monorepo-architecture`.
