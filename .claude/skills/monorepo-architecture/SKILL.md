---
name: monorepo-architecture
description: Use when adding a project/package to this monorepo, wiring a new Protobuf schema or consumer, editing BUILD.bazel / MODULE.bazel / buf config, or making build-system decisions. Encodes the chosen stack — Bazel + Gazelle + Buf — with Protobuf as the single source of truth and action-graph propagation of schema changes. See docs/adr/0001-monorepo-build-system.md.
---

# Monorepo Architecture — Bazel + Gazelle + Buf

This repo is a polyglot monorepo (**TypeScript/JS + Node + Go + Python + Java**) on
**Bazel** (open-source Blaze) for provably-exact affected builds/tests, **Gazelle /
`aspect configure`** to auto-generate BUILD files (minimal toil), and **Buf** for the
Protobuf single source of truth. Rationale & alternatives: `docs/adr/0001`.

## Non-negotiable principles

1. **Protobuf is the single source of truth.** Every language's types are *generated*
   from `.proto`, never hand-written. Never create a TS interface / Go struct / Python
   class / Java class that mirrors a proto message — depend on the generated target.
2. **One `proto_library` per package; all languages hang off it.** `ts_proto_library`,
   `go_proto_library`, `py_proto_library`, `java_proto_library` all take the same
   `proto = ":x_proto"`. This is what makes a schema change propagate to every consumer.
3. **The `deps` edge is the contract.** A consumer depends on the generated target
   (`//proto/.../v1:cart_ts_proto`). That edge is why editing the proto rebuilds &
   retests exactly the consumers. Keep it correct — let **Gazelle** maintain it; don't
   hand-copy generated files between packages.
4. **Keep the inner dev loop OUT of Bazel.** Run `vite`/`next dev`/HMR on plain pnpm
   `node_modules`. Bazel owns codegen, CI, tests, and prod builds.
5. **Versioned proto packages** (`acme/<domain>/v1`). Incompatible changes go to a new
   version; never break `v1` in place — `buf breaking` blocks it.

## How propagation works (explain it, rely on it)

Bazel keys every action on the content digests of its inputs. Edit `cart.proto` →
its hash changes → codegen actions re-run → generated outputs change → every target
that `deps` on them re-runs → their tests re-run. Invalidation flows along `deps`
edges to the exact transitive closure and **stops there**; unaffected targets keep
identical action keys and are cache hits (including cached test results). No watcher
scripts. Verify impact with:
```bash
bazel cquery 'rdeps(//..., //proto/acme/cart/v1:cart_proto)'
```

## Adding things

**A new proto package** → create `proto/<domain>/<v>/x.proto`, then run
`bazel run //:gazelle` to generate the `proto_library` + language `*_proto_library`
targets (or copy the pattern in `proto/acme/cart/v1/BUILD.bazel`). Add `buf_lint_test`
+ `buf_breaking_test`.

**A new TS package** → add `package.json` + `tsconfig.json` (extends `//:tsconfig`)
under `libs/` or `apps/`; run Gazelle / `aspect configure` to emit the `ts_project`.
Add `//proto/.../v1:x_ts_proto` to its `deps` when it consumes a schema.

**A new Go/Python/Java consumer** → same idea; depend on the matching
`*_proto_library`. Gazelle generates Go/proto BUILD files; use `aspect configure` for JS/TS.

## Proto codegen specifics

- **TypeScript:** `ts_proto_library` (Aspect) driving **protoc-gen-es** (Protobuf-ES v2,
  plain objects) + **Connect-ES** for typed RPC clients (`gen_connect_es = True`). Set
  `copy_files = True` so the editor sees the generated `.d.ts`.
- **Governance:** `rules_buf` → `buf_lint_test` / `buf_breaking_test` as Bazel tests,
  plus the `bufbuild/buf-action` PR workflow. `buf breaking` against `main` is a
  required check.
- **Validation in the schema** via `buf.validate` field/message rules; enforce at
  runtime with `@bufbuild/protovalidate` (TS) and the equivalent per language.

## BUILD / MODULE hygiene

- Prefer running **Gazelle** over hand-editing BUILD files; use `# gazelle:` directives
  for config (`js_pnpm_lockfile`, `js_tsconfig`, `js_proto`).
- `MODULE.bazel` version pins must be confirmed against the Bazel Central Registry;
  run `bazel mod tidy` after changes.
- Generated code is gitignored (generate-on-build). If switching to committed
  generated code, un-ignore it and add `buf generate && git diff --exit-code` to CI.

## Performance

- A **remote cache** shared by CI + laptops is what makes Bazel fast — wire
  `--remote_cache` in `.bazelrc` (BuildBuddy / EngFlow / Aspect Workflows / self-hosted
  `bazel-remote`). Add remote execution only if cold builds/fan-out justify it.
- On cold CI, scope to affected targets with `target-determinator` / `bazel-diff`;
  with a warm cache, `bazel test //...` is already cheap because unaffected targets hit.

## Checklist (when changing the monorepo)
- [ ] No hand-written mirror of a proto message — depend on the generated target.
- [ ] New schema → `proto_library` is the single source; all languages hang off it; versioned package.
- [ ] Consumers depend on the generated target via `deps` (let Gazelle maintain the edge).
- [ ] `buf lint` + `buf breaking` pass; incompatible change → new version, not in-place break.
- [ ] BUILD files generated by Gazelle/`aspect configure`, not hand-rolled where avoidable.
- [ ] `bazel mod tidy` run; version pins confirmed against BCR.
- [ ] Inner dev loop stays on pnpm/Vite; Bazel used for codegen/CI/tests/prod.
- [ ] Verified impact with `bazel cquery 'rdeps(...)'` for non-trivial schema edits.
