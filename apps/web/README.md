# @welkinbliss/web

WelkinBliss (welkinbliss.com) — the SEO-first, independently-deployable frontend.
Next.js App Router (React Server Components) + `@welkinbliss/ui` brand tokens/logo.
Rationale: [`docs/welkinbliss/`](../../docs/welkinbliss/00-research-overview.md).

> **Reference scaffold — not build-verified here** (no `pnpm`/Next in this env). Written
> to documented Next.js 15/App-Router APIs. Run the steps below to bring it up.

## Run it

```bash
pnpm install                       # from repo root
pnpm --filter @welkinbliss/web dev # http://localhost:3000  (inner loop stays off Bazel)
pnpm --filter @welkinbliss/web build && pnpm --filter @welkinbliss/web start
```

## What's wired

- **Brand:** `@welkinbliss/ui/tokens.css` + inline `<Logo>`; **Playfair Display + Inter**
  via `next/font`; the **arch** as the hero/card motif; favicon from the arch monogram.
- **Rendering:** home (static), destinations + property pages (**ISR**, `revalidate`),
  booking is a `"use client"` island inside the server-rendered page.
- **SEO:** per-route `generateMetadata` (title/description/canonical/OG); JSON-LD —
  `Organization`+`WebSite` site-wide, `Product`/`VacationRental`+`Offer`+`AggregateRating`+
  `Review` + `BreadcrumbList` on property pages; dynamic `sitemap.ts`, `robots.ts`, `manifest.ts`.
- **Content:** mock catalogue in `lib/data.ts` (swap for the PMS/CMS via `@acme/proto-ts`).

## Pages
- `/` — arched hero + emotional search + featured homes + destinations + trust band
- `/destinations/[slug]` — destination landing (answer-first summary + property grid)
- `/villa/[slug]` — property detail (gallery, amenities, reviews, booking island, full JSON-LD)

## Visual regression testing

Every page and every component has a committed **baseline screenshot**; CI diffs each
change against it (Playwright `toHaveScreenshot`, per the `testing-visual-playwright`
skill). Baselines live in `tests/visual/__screenshots__/` and are reviewed in the PR.

```bash
# run against baselines (what CI does)
pnpm --filter @welkinbliss/web build
pnpm --filter @welkinbliss/web test:visual

# intentional UI change → regenerate & commit the new baselines IN THE SAME PR
pnpm --filter @welkinbliss/web test:visual:update
```

- **Pages** (`tests/visual/pages.spec.ts`): full-page shots of every route.
- **Components** (`tests/visual/components.spec.ts`): each component is rendered on
  `/ui-gallery` (a noindexed kitchen-sink page) and screenshotted in isolation, plus
  the header/footer landmarks.
- **Determinism** (`playwright.config.ts` + `tests/visual/screenshot.css`): fixed
  viewport/scale, light theme, UTC, animations disabled, carets/scrollbars hidden.
- **Environment parity:** baselines are generated and compared with **Playwright
  1.62.1 / chromium-1194** — the same as CI's `mcr.microsoft.com/playwright:v1.62.1-noble`
  image. Never regenerate on a dev machine with a different OS/browser. CI **never**
  passes `--update-snapshots`; an unexpected diff fails the PR, and the Playwright
  report (with the diff image) is uploaded as an artifact.

## Follow-ups
- Replace `Photo` gradient placeholders with `next/image` (AVIF, `priority` LCP hero) + real CDN imagery.
- Enable PPR + a shared ISR cache handler (Redis) for multi-instance (see `next.config.ts`).
- Add functional tests (Vitest + MSW + Playwright e2e) per the `testing-*` skills; wire the deploy steps.
