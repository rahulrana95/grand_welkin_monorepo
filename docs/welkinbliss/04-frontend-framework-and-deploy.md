# Frontend Framework & Independent Deployment (in the Bazel monorepo)

> Config API names (e.g. `experimental.ppr`, `cacheHandler`) are current-to-2026 but were reconstructed from search extracts (vendor docs egress-blocked) — confirm against live docs at build time.

## 1. Framework: **Next.js 16 (App Router / RSC), `output: 'standalone'`**

WelkinBliss is a "mixed estate" — SEO-critical content (property pages, destination guides, editorial) **and** a transactional booking surface (search, availability, checkout). Next.js is the only mainstream option first-rate at *both* in one app.

| Axis | Next.js 16 | React Router v7 (Remix) | Astro 6 |
|---|---|---|---|
| SSR/streaming | Best (RSC + streaming + **PPR**) | True streaming, simpler model | Server islands, ~zero JS default |
| **ISR / on-demand revalidate** | **First-class** (`revalidateTag`/`revalidatePath`) | None built-in (CDN/HTTP cache) | None native (CDN + adapter) |
| Image optimization | `next/image` (needs `sharp` self-hosted) | none built-in | built-in `<Image>` |
| i18n | Metadata API + `next-intl` | libraries | built-in routing |
| CWV defaults | Good with discipline | Light runtime | **Best OOTB** (least JS) |
| Ecosystem/hiring | **Largest** | Growing | Content-focused |
| Hosting | Vercel golden path; self-host via standalone | **Most portable** | Very portable |

**Why Next.js for us:** (1) needs both halves well; (2) **ISR + on-demand revalidation + Partial Prerendering** map exactly onto "static-fast luxury property page + streamed live price/availability island, refreshed on booking/CMS webhooks"; (3) mature SEO ergonomics (Metadata API, typed JSON-LD via `schema-dts`, `hreflang`, sitemaps, OG images); (4) largest talent pool. **Neutralize its one weakness (CWV regressions)** with RSC-first discipline (Client Components only at interaction leaves) + a Lighthouse gate.

**When to switch/split:** **Astro** for a content-only marketing site (best CWV, edge-native on Cloudflare) — a clean split is `welkinbliss.com` (Astro marketing) + `book.welkinbliss.com` (Next) as two apps/pipelines, which the monorepo supports. **React Router v7** if max host-portability / minimal cache-ops beats ISR/RSC, or on Shopify Hydrogen.

## 2. Independent deployability

**Layout:**
```
apps/web/            # @welkinbliss/web — Next.js (native toolchain owns dev + build)
  next.config.ts  Dockerfile  app/…
libs/ui/             # @welkinbliss/ui — shared RSC-safe design system
libs/proto-ts/       # @acme/proto-ts — GENERATED from proto (buf) — never hand-edited
proto/acme/…         # single source of truth
```
```yaml
# pnpm-workspace.yaml
packages: ["apps/*", "libs/*"]
```
- Consume generated types + UI as **`workspace:*`** deps (`@acme/proto-ts`, `@welkinbliss/ui`). Refresh `@acme/proto-ts` via `buf generate` / `bazel run //proto/...:generate` before native dev; **Bazel produces the canonical output in CI** so the app never drifts.
- **Containerized standalone SSR (recommended default):** `output: 'standalone'` → self-contained server, ~80% smaller image, portable, no vendor lock-in. Vercel = lowest-effort (managed ISR/images, per-PR previews, instant rollback) — fine for a marketing-only surface.
- **Affected triggers — use both:** path filters (`dorny/paths-filter`) for speed + graph-aware for correctness (`bazel query 'rdeps(//apps/web/..., set($CHANGED))'`, or `turbo --filter='@welkinbliss/web...[origin/main]'`) so a `libs/ui` or `@acme/proto-ts` change also triggers the app.
- **Versioning/rollback:** immutable `ghcr.io/welkinbliss/web:<git-sha>` (+ moving `:prod`); rollback = redeploy prior SHA; never `:latest`. Per-app env/secrets isolation; minimal `NEXT_PUBLIC_*`; no shared `.env`.

## 3. Coexistence with Bazel — **Option A (recommended)**

| Concern | Owner |
|---|---|
| Proto codegen (`@acme/proto-ts`) | **Bazel + Buf** (canonical, hermetic) |
| Cross-language affected build/test in CI | **Bazel** (`bazel test //...`, remote cache) |
| Frontend inner dev loop | **Native** pnpm + `next dev`/HMR |
| Frontend unit/integration/visual/e2e | Native runners (Vitest/MSW/Playwright), invoked in the app's CI job |
| **Production build** of the Next app | **Native `next build`** (standalone), wrapped by CI for provenance |

**Option A** = build with the native toolchain; Bazel/CI treats the app as a leaf (provides canonical `@acme/proto-ts`, runs the affected check, invokes `next build` in a hermetic step: pinned Node via `corepack`/`.nvmrc`, frozen lockfile, Docker). Reproducibility comes from lockfile + pinned toolchain + container, not Bazel sandboxing — standard and acceptable. **Option B** (full Bazel build via `aspect_rules_js` + `contrib/nextjs`) gives hermetic cached builds but adds real ongoing cost tracking `rules_js` against fast-moving Next releases and forces the frontend team into Bazel to debug builds. **Recommendation: Option A**; reserve B for a measured cache-miss bottleneck. (Matches ADR 0001's "dev loop outside Bazel," extended to the build loop.)

## 4. Deploy targets & edge

| Target | Best for | ISR/cache | SEO |
|---|---|---|---|
| **Own-cloud containers** (Docker + standalone, Node) | Default for a self-building org; full control, no lock-in | ISR works; **multi-instance → shared cache handler (Redis/S3)** so pods agree after revalidation | Full SSR HTML; control TTFB via your CDN |
| **Vercel** | Marketing surface, lowest effort | Managed ISR + on-demand + image opt | Excellent defaults |
| **Cloudflare (Workers) + OpenNext** | Edge + cheapest cache | **R2-backed** incremental cache | Edge TTFB, SSR preserved |

- CDN in front regardless; honor `s-maxage` + `stale-while-revalidate` for ISR.
- **Multi-instance trap:** without a shared cache, pods serve inconsistent cached pages after revalidation → configure a `cacheHandler` (Redis standard).
- **SEO across targets:** SSR HTML on first byte (never client-only for indexable routes); fast TTFB (CDN/edge/streaming + PPR/ISR); stable canonical URLs; **preview hosts return `X-Robots-Tag: noindex`**.

## 5. CI/CD (independent per-app pipeline)

```
1 affected (path-filter + bazel rdeps / turbo --filter)
2 codegen  → Bazel/Buf produces @acme/proto-ts (schema truth)
3 build    → pnpm --filter @welkinbliss/web build   (next build, standalone)
4 test     → Vitest (unit) + MSW (integration) + Playwright (e2e vs preview) + visual (Playwright/Argos)
5 perf     → Lighthouse CI vs budgets → fail on regression
6 deploy   → Docker :<git-sha> → preview (noindex) → prod on merge
```

**`apps/web/next.config.ts`:**
```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  images: { remotePatterns: [{ protocol: "https", hostname: "cdn.welkinbliss.com" }] },
  experimental: { ppr: "incremental" },            // static shell + streamed dynamic islands
  cacheHandler: process.env.NODE_ENV === "production" ? require.resolve("./cache-handler.js") : undefined,
  cacheMaxMemorySize: 0,
  transpilePackages: ["@welkinbliss/ui", "@acme/proto-ts"],
};
export default nextConfig;
```

**`apps/web/Dockerfile` (standalone, multi-stage):**
```dockerfile
FROM node:22-bookworm-slim AS builder
WORKDIR /repo
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/
COPY libs/ui/package.json libs/ui/
COPY libs/proto-ts/package.json libs/proto-ts/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @welkinbliss/web build          # → apps/web/.next/standalone

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /repo/apps/web/.next/standalone ./
COPY --from=builder /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /repo/apps/web/public ./apps/web/public
USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
```

**Lighthouse gate (`apps/web/lighthouserc.json`)** — budgets at the 2026 "good" thresholds:
```jsonc
{ "ci": {
  "collect": { "url": ["https://pr-${PR}.welkinbliss.dev/", "https://pr-${PR}.welkinbliss.dev/villa/example"], "numberOfRuns": 3 },
  "assert": { "assertions": {
    "categories:performance": ["error", { "minScore": 0.9 }],
    "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
    "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
    "total-blocking-time": ["error", { "maxNumericValue": 200 }]
  } }
} }
```

Keep `web.yml` **separate** from `bazel.yml` (cross-language affected) and `buf.yml` (proto lint/breaking); shared-dep changes fan in via `paths:` + the Bazel `rdeps`/`turbo` affected check.

## 6. Recommendation

**Next.js 16 App Router (standalone)** for the app; **Bazel Option A** (native build wrapped by CI; Bazel owns proto codegen + affected + cross-lang tests); **containerized standalone SSR on our own cloud** with a shared Redis ISR cache. Split a content-only marketing site to **Astro** later if it emerges. RSC-first discipline + Lighthouse gate keep CWV honest.
