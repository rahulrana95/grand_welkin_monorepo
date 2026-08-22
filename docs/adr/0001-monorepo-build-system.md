# ADR 0001 — Monorepo build system: Bazel + Gazelle + Buf

- **Status:** Accepted
- **Date:** 2026-06-30
- **Decision drivers:** polyglot codebase (TypeScript/JS + Node.js + Go + Python +
  Java), a desire for Google-Blaze-style *provably-exact* affected builds/tests, a
  single-source-of-truth Protobuf schema whose changes must propagate to all
  consumers automatically, and an explicit preference for **Blaze correctness with
  minimal toil**.

## Context

The company monorepo will hold many projects across five languages that share data
and RPC contracts. We need:

1. A build graph where a change rebuilds/retests **only** the affected targets.
2. Protobuf as the single source of truth; all language types **generated**, never
   hand-written; a proto edit must reach every consumer automatically.
3. Performance at scale (caching, ideally remote execution).
4. Low ongoing maintenance — we do not want to hand-write a forest of build files.

## Options considered

| Option | Affected-scope correctness | Polyglot (incl. frontend) | Toil | Verdict |
|---|---|---|---|---|
| **Nx / Turborepo** | Package-level, heuristic | JS-first; Go/Py/Java second-class | Very low | ✗ can't put all 5 languages in one correct graph |
| **Pants v2** | Action-level (dep inference) | Strong Py/Go/JVM, **weak JS/TS** | **Lowest** | ✗ real frontend makes weak JS support a dealbreaker |
| **Buck2** | Action-level, exact | Excellent | High + bleeding-edge | ✗ thin external ecosystem |
| **Bazel + Gazelle** | **Action-level, provably exact** | **Best-in-class, TS first-class** (Aspect rules_js/ts) | **Low** via Gazelle auto-BUILD | ✓ **chosen** |

## Decision

Adopt **Bazel** (open-source Blaze) as the build system, **Gazelle / `aspect
configure`** to auto-generate and maintain BUILD files from imports (the
"minimal toil" lever), and **Buf** for the Protobuf single-source-of-truth layer.

- **JS/TS:** Aspect `rules_js` + `rules_ts` (bzlmod, pnpm-native), with `swc` for fast
  transpile and `tsc` for type-checking.
- **Proto → types:** one `proto_library` per package is the source of truth;
  `ts_proto_library` (Protobuf-ES + Connect-ES), `go_proto_library`,
  `py_proto_library`, and `java_proto_library` all hang off it.
- **Governance:** `rules_buf` runs `buf lint` + `buf breaking` as Bazel tests, and the
  `bufbuild/buf-action` workflow enforces them on every PR.
- **Speed:** a remote cache (BuildBuddy / EngFlow / Aspect Workflows / self-hosted
  `bazel-remote`) shared by CI and developer laptops, from day one.

### Why this satisfies "proto change propagates automatically"

Bazel identifies inputs by content hash and keys every action on the digests of its
inputs. Editing `cart.proto` changes its hash → the codegen actions re-run → the
generated `.d.ts` / Go / Python / Java outputs change → every `ts_project` /
`go_library` / etc. that `deps` on them re-runs → and so do their tests. The
invalidation flows along `deps` edges to the exact transitive closure of consumers
and **stops there**; unaffected targets keep identical action keys and are served
from cache (including cached test results). The action graph *is* the propagation
mechanism — no watcher scripts — and Gazelle keeps the `deps` edges correct.

## Consequences

**Positive:** one correct graph across five languages; exact affected build/test;
schema changes become compile errors in every consumer; fast with remote cache.

**Negative / mitigations:**
- Bazel learning curve & BUILD maintenance → **Gazelle/`aspect configure`** generate
  BUILD files; engineers rarely hand-edit Starlark.
- Frontend dev-server/HMR friction → **keep the inner dev loop on plain pnpm/Vite
  outside Bazel**; Bazel owns codegen, CI, tests, prod builds.
- Slow cold builds → **remote cache from day one**.
- IDE can't see generated proto types → `copy_files = True` on `ts_proto_library`.

## Follow-ups

- Confirm all ruleset version pins against the Bazel Central Registry; run
  `bazel mod tidy`.
- Stand up the remote cache and wire `--remote_cache` in `.bazelrc`.
- Add `target-determinator` / `bazel-diff` to scope CI to the affected set on cold runs.
- Generate `pnpm-lock.yaml` (`pnpm install`) and Go deps (`bazel mod tidy`).
- Revisit if the language mix narrows to mostly-JS (then Nx would be cheaper) or
  becomes Python/Go/JVM-dominant with negligible frontend (then Pants).
