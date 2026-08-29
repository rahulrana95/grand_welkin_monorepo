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

## Follow-ups
- Replace `Photo` gradient placeholders with `next/image` (AVIF, `priority` LCP hero) + real CDN imagery.
- Enable PPR + a shared ISR cache handler (Redis) for multi-instance (see `next.config.ts`).
- Add tests per the `testing-*` skills; wire the `web.yml` test/deploy steps.
