# Technical SEO, Rendering & Core Web Vitals

> Verify Google/web.dev specifics against live docs at build time (primary sources were egress-blocked; corroborated via search + the GoogleChrome/web.dev GitHub mirror).

## 0. TL;DR

Next.js App Router (React 19 RSC + streaming SSR). Pre-render everything indexable; hydrate as little as possible. The **property detail page (PDP)** and **destination landing pages** are the two ranking workhorses. AVIF heroes with `fetchpriority="high"`; self-hosted fonts with `size-adjust` fallbacks; Lighthouse-CI budgets gate every deploy. Ship self-serve `Product`/`Offer`/`AggregateRating`/`Review` + `BreadcrumbList` JSON-LD now; treat Google's dedicated `VacationRental` program as a separate invitation-only Hotel Center track.

## 1. Rendering strategy

CSR-only is **disqualified for any indexable route** (empty `<div id="root">` forces Google's slower second-wave render; worse LCP/TTFB). Mapping:

| Page type | Mode | Notes |
|---|---|---|
| Home | SSG (or long-TTL ISR) | Instant, rarely changes |
| **Destination landing** (`/villas/tuscany`) | **ISR** | Long-tail SEO engine; editorial + dynamic property grid; revalidate on TTL or on inventory change |
| **Property detail (PDP)** | **ISR + on-demand revalidation** | Pre-render the catalog; `revalidatePath('/villa/[slug]')` from CMS/PMS webhook; fetch **live** price/availability client-side into the already-indexed static shell |
| Search / faceted | **SSR** for canonical indexable views only | Keep deep filter combos out of the index (§4) |
| Booking flow / dashboard | CSR/SSR + `noindex` | — |

**Streaming SSR + RSC (React 19):** flush shell + LCP hero immediately, stream reviews / "similar villas" / map via Suspense. Render descriptions, amenities, breadcrumbs, JSON-LD on the server; mark only interactive leaves (`BookingWidget`, `Gallery`, `MapToggle`) `"use client"`. Format dates/prices/currency deterministically on the server to avoid hydration mismatches (which blank content and cause CLS).

## 2. Core Web Vitals (2026)

Field data (CrUX), 75th percentile, mobile + desktop separately:

| Metric | Good | Needs work | Poor |
|---|---|---|---|
| **LCP** | ≤ 2.5 s | 2.5–4.0 | > 4.0 |
| **INP** (replaced FID, Mar 2024) | ≤ 200 ms | 200–500 | > 500 |
| **CLS** | ≤ 0.1 | 0.1–0.25 | > 0.25 |

**LCP** (usually the hero photo): AVIF (+WebP/JPEG fallback via `<picture>`); the LCP image is **never** lazy-loaded — give it `fetchpriority="high"`; preload the responsive hero (`<link rel="preload" as="image" imagesrcset=… imagesizes="100vw" fetchpriority="high">`); correct `srcset`/`sizes`; `preconnect` to image CDN + booking API; edge/CDN + ISR for low TTFB. Don't over-preload.

**INP:** break long tasks (`scheduler.yield()`); ship less JS (RSC + route code-split + `next/dynamic` for map/gallery/date-picker); defer third parties (`next/script` `afterInteractive`/`lazyOnload`, Web Workers); debounce autocomplete + `AbortController`; prefer CSS animations.

**CLS:** width/height or `aspect-ratio` on every image/embed/ad; reserve space (skeletons) for booking card, gallery, reviews; self-host fonts via `next/font` with `size-adjust`/`ascent-override` fallback (cuts font-CLS ~70%); overlay banners, never push content down.

## 3. Structured data (schema.org)

| Type | Page | Purpose |
|---|---|---|
| `Organization` + `WebSite` | site-wide (root layout) | Brand entity, logo, knowledge panel |
| `BreadcrumbList` | all deep pages | Breadcrumb rich result |
| `Product`+`Offer`+`AggregateRating`+`Review` | **PDP** | Stars/price in SERP — **self-serve, works today** |
| `LodgingBusiness`/`VacationRental` (`containsPlace`→`Accommodation`) | PDP | Lodging semantics; feeds Hotel Center program |
| `ImageObject` / `ItemList` | property / destination | Image search / carousel eligibility |
| `FAQPage` | guides, help | Machine-readable Q&A (also feeds GEO) |

**Rules:** `Product` rich result needs `name` + at least one of `review`/`aggregateRating`/`offers`; merchant/price needs `offers.price` + `priceCurrency` + `availability`; JSON-LD values **must match visible page content** (fabricated ratings → manual action); one missing required field suppresses the **whole** rich result. **Dead:** Sitelinks Search Box (removed Nov 2024) and `rel=next/prev` (harmless if left).

**⚠️ The dedicated `VacationRental` rich result is invitation-only** — requires a Google Technical Account Manager + Hotel Center, ≥8 photos, `containsPlace`→`Accommodation.occupancy`, lat/long ≥5 decimals. **Plan:** ship self-serve `Product`/`Offer`/`Review`/`Breadcrumb` now; keep `VacationRental` semantics in the `@graph` for entity clarity + future; pursue Hotel Center as a business track.

**Property-page JSON-LD (RSC-rendered, `@graph` connecting Product + VacationRental + Breadcrumbs):**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Product", "VacationRental"],
      "@id": "https://welkinbliss.com/villa/villa-serena#property",
      "name": "Villa Serena — Cliffside Infinity Pool, Amalfi Coast",
      "description": "Five-bedroom cliffside villa with private infinity pool, chef service and sea views over Positano.",
      "brand": { "@type": "Brand", "name": "WelkinBliss" },
      "url": "https://welkinbliss.com/villa/villa-serena",
      "image": ["https://cdn.welkinbliss.com/villa-serena/1-2400.avif", "…at least 8…"],
      "latitude": 40.62817, "longitude": 14.48370,
      "address": { "@type": "PostalAddress", "addressLocality": "Positano", "addressRegion": "Campania", "addressCountry": "IT" },
      "containsPlace": {
        "@type": "Accommodation", "additionalType": "EntirePlace",
        "occupancy": { "@type": "QuantitativeValue", "value": 10 },
        "numberOfBedrooms": 5, "numberOfBathroomsTotal": 6,
        "amenityFeature": [
          { "@type": "LocationFeatureSpecification", "name": "Private infinity pool", "value": true },
          { "@type": "LocationFeatureSpecification", "name": "Air conditioning", "value": true },
          { "@type": "LocationFeatureSpecification", "name": "Chef service", "value": true }
        ]
      },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "128", "bestRating": "5" },
      "review": [{ "@type": "Review", "author": { "@type": "Person", "name": "Amara K." }, "datePublished": "2026-07-14", "reviewRating": { "@type": "Rating", "ratingValue": "5" }, "reviewBody": "Impeccable service and the most breathtaking pool." }],
      "offers": { "@type": "Offer", "priceCurrency": "EUR", "price": "2450.00", "priceValidUntil": "2026-12-31", "availability": "https://schema.org/InStock", "url": "https://welkinbliss.com/villa/villa-serena" }
    },
    { "@type": "BreadcrumbList", "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://welkinbliss.com/" },
      { "@type": "ListItem", "position": 2, "name": "Italy", "item": "https://welkinbliss.com/italy" },
      { "@type": "ListItem", "position": 3, "name": "Amalfi Coast", "item": "https://welkinbliss.com/italy/amalfi-coast" },
      { "@type": "ListItem", "position": 4, "name": "Villa Serena" }
    ] }
  ]
}
</script>
```

## 4. On-page & architecture

- **Title:** `{Property}, {Destination} | {USP} | WelkinBliss`, keyword-first (~50–60 chars; Google rewrites ~76% of titles — front-load intent). **Description:** unique, ~150–160 chars, action-oriented. Use the Next.js **Metadata API** (`generateMetadata`) per route.
- **One `<h1>`**; semantic landmarks; real `<button>`/`<a>`; `alt` on every content image (a11y ≈ SEO).
- **Canonicalization:** single host (https, non-www); self-referencing canonicals everywhere; 301 variants; strip tracking params.
- **Pagination:** `rel=next/prev` dead; each paginated page self-canonicals to **itself** (not page 1); provide crawlable `<a>` page links (not JS "load more").
- **Faceted URLs (the #1 failure mode):** **index a curated set** of high-demand facet combos as real ISR landing pages (`/villas/amalfi-coast/with-pool`); keep everything else out (client-state/`#hash`, robots-disallow param patterns, or `noindex,follow`); never create infinite URL spaces (calendar "next month" traps). Crawl-health priority: server speed → content quality → URL volume.
- **Internal linking (pillar → cluster):** destination hub (pillar) → activity/intent + facet guides (clusters) → properties link up; descriptive varied anchor text; give destinations real depth (getting there, neighborhoods, seasons, itineraries), not boilerplate.

## 5. Crawl & indexation

- **XML sitemaps** split by type (`sitemap-properties.xml`, `-destinations.xml`, `-guides.xml`) under a sitemap index (≤50k URLs / 50 MB each); **only canonical 200-OK indexable URLs**; honest `lastmod`; auto-regenerate via `app/sitemap.ts`. Add **image sitemap** entries (visual brand → image search matters).
- **robots.txt:** allow `/`, disallow `/api/ /booking/ /account/` and known param patterns; declare sitemap; never block JS/CSS Googlebot needs; never `Disallow` a page you also want `noindex`'d (it can't be crawled to see the tag).
- **hreflang/i18n:** reciprocal return tags + `x-default`; prefer sitemap-level hreflang for a large catalog; correct ISO codes; all alternates indexable.
- **JS rendering:** keep primary content in initial HTML; verify via Search Console **URL Inspection → rendered HTML** + Rich Results Test (text, links, JSON-LD present).
- **Soft-404s:** dead/booked-out property → real 404/410 or 301, never a 200 "not available" shell; unknown slugs return proper 404 status.

## 6. Measurement

- **Search Console** (source of truth): Page Indexing, Sitemaps, CWV report (field/CrUX), Enhancements (rich-result validity), URL Inspection.
- **CrUX + PageSpeed Insights** (field p75 = what counts; lab = diagnostic); **`web-vitals` RUM** to your analytics for real-device INP.
- **Lighthouse CI in the pipeline** — fail PRs on regression (LCP ≤ 2500, CLS ≤ 0.1, TBT as the lab proxy for INP; JS-bytes budget). See `04-...` for the config.

## 7. Priority checklist

**P0:** App Router with SSG/ISR (home/destinations/PDP) + SSR (search), no CSR-indexable routes · single canonical host + self-canonicals · `next/image` AVIF/WebP + hero `priority` + explicit dims · `next/font` self-hosted + `size-adjust` · reserve space for async UI · Metadata API per route · `Product`+`Offer`+`AggregateRating`+`Review`+`Breadcrumb` + `Organization`/`WebSite` JSON-LD · dynamic sitemap + robots + Search Console · proper 404/410.
**P1:** preconnect + preload hero · streaming SSR/RSC, minimal `"use client"`, `next/dynamic` heavy widgets, defer 3rd-party · faceted-URL policy · self-canonical pagination · Lighthouse-CI budgets + `web-vitals` RUM · render verification.
**P2:** pillar/cluster destination content · sitemap hreflang · weekly CWV/Enhancements monitoring · Hotel Center program track · on-demand ISR from CMS/PMS webhooks.
