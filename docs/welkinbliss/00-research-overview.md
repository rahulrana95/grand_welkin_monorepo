# WelkinBliss — Research Overview & Recommendations

> **Status:** Research phase (this PR). No app code yet — this is the decision record and playbook the build will follow.
> **Working assumption:** WelkinBliss (welkinbliss.com) is a **luxury vacation-rental / premium-stays brand**, inferred from the two reference sites (Wander, Homes & Villas by Marriott). **Confirm this** — it shapes everything below.
> **Sourcing caveat:** this environment's egress proxy blocked direct fetches of many primary sources (the live reference sites, Google/web.dev docs, vendor docs). Findings are corroborated via search extracts and secondary sources and are flagged in each detail doc. Treat exact palettes/API flags as "verify against the live source at build time."

This folder:
- `01-reference-teardowns.md` — Wander + Marriott Homes & Villas: what's exceptional, what to steal, what to avoid.
- `02-seo-ssr-cwv.md` — technical SEO, rendering strategy, Core Web Vitals, schema.org (with a full property-page JSON-LD).
- `03-geo-aeo-llm.md` — ranking/being cited in AI answer engines (evidence-graded).
- `04-frontend-framework-and-deploy.md` — framework pick + independent deployment out of the Bazel monorepo (with config).
- `05-brand-theme-direction.md` — **provisional** theme direction (needs the real logo to finalize).

---

## 1. The one-paragraph strategy

Win the way **Wander** wins on *feel* (curated, architecturally-striking inventory shot like a design magazine; an emotional, browse-first site; trust made concrete) and the way **Marriott Homes & Villas** wins on *scale* (a programmatic **geo × theme landing-page matrix** with crawlable HTML sitemap hubs that carpets the long-tail). Then beat both where they're weak: **Marriott's reviews/trust are thin and its pages are heavy** → we do verified reviews + `AggregateRating`, deeper destination content, and faster Core Web Vitals; **Wander is vertically integrated and app-gated** → we keep discovery frictionless and open. Build it SEO-first and AI-answer-ready from day one.

## 2. Locked technical decisions

| Decision | Choice | Why |
|---|---|---|
| **Framework** | **Next.js 16, App Router (RSC), `output: 'standalone'`** | Only option first-rate at *both* the SEO marketing surface and the interactive booking surface; ISR + on-demand revalidation + Partial Prerendering fit "static-fast property pages with a live price/availability island." (Wander runs exactly this: Next.js App Router.) |
| **Rendering map** | SSG/ISR for home + destination pages + property pages; **SSR** for search/faceted; CSR only for non-indexed widgets (calendar, map) | Crawlable HTML for everything that must rank; freshness via webhook `revalidateTag`/`revalidatePath`. |
| **SEO schema** | Self-serve `Product`+`Offer`+`AggregateRating`+`Review`+`BreadcrumbList` + site-wide `Organization`/`WebSite` **now**; keep `VacationRental`/`Accommodation` semantics; pursue Google **Hotel Center** program as a business track | Google's dedicated `VacationRental` rich result is invitation-only; the `Product` markup works in organic SERPs today. |
| **GEO/AEO** | Answer-first content, entity `sameAs`→Wikidata, **facts in server-rendered HTML**, off-site PR + reviews; a **per-property LLM-friendly content layer** | Off-site mentions ≈ 84% of AI citations; the brand with cleaner machine-readable facts gets the recommendation. Wander already ships a per-property Markdown mirror — cheap, rare, high-leverage. |
| **Deploy** | **Containerized standalone SSR on our own cloud**, shared **Redis ISR cache**, CDN with `stale-while-revalidate`; Vercel acceptable for a marketing-only surface | Consistent with our polyglot self-build org; no lock-in; multi-instance ISR stays consistent. |
| **Monorepo fit** | `apps/web` is a pnpm workspace package depending on `@acme/proto-ts` + `@welkinbliss/ui` (`workspace:*`); **Bazel Option A** — native `next build`, wrapped by CI for provenance & graph-triggered runs | Matches ADR 0001 ("dev loop outside Bazel"); Bazel owns proto codegen + affected graph + cross-lang tests. |
| **CI** | Separate `web.yml` (path- + graph-affected) → build → Vitest/MSW/Playwright/visual → **Lighthouse gate (LCP≤2.5s, INP≤200ms, CLS≤0.1)** → per-PR preview (`noindex`) → prod on merge | Independent deployability; performance regressions block merge. |

## 3. What to steal (top of the list)

1. **Photography standard as a listing gate** — the #1 luxury unifier for multi-owner inventory (both sites). This is upstream of the website.
2. **Emotional, low-commitment search** ("Whenever/Whoever"-style) + **browse-first, restrained hero** that hands off to imagery fast (Wander's own rule: full-screen heroes kill scroll momentum).
3. **The (geo × theme) landing-page matrix** + **crawlable HTML sitemap hubs** + **curated Collections** (Marriott's organic engine).
4. **Reduce price shock as a feature** — a "Split with Friends" equivalent for $1k+/night stays.
5. **Trust made concrete & numeric** — vetting standard, 24/7 concierge, verified reviews, secure-payment cues; "this isn't a scam" as an explicit design goal on booking surfaces.
6. **Per-property structured facts** (amenities, capacity, location relations, USPs) in SSR HTML + schema — wins both rich results *and* AI recommendations.

## 4. Our competitive wedges

- **Reviews & trust done right** (Marriott's weakest area): verified guest reviews + `AggregateRating` rich results + a guest-protection/rebooking guarantee.
- **Deeper destination content** (Marriott under-invests): real "how to get there / neighborhoods / when to visit / itineraries" guides = topical authority + long-tail + AI-citation fuel.
- **Speed** (both are heavy): AVIF heroes with `fetchpriority`, RSC-first, Lighthouse-gated — small-brand advantage.

## 5. Open decisions & dependencies

1. ✅ **Brand.** Official Brand Guidelines 2026 in hand; the real system is implemented in **[`@welkinbliss/ui`](../../libs/ui/)** — blue **`#2F6D7F`** (confirmed by sampling the logo; the guide's `#247989` was wrong), gold `#E3BA38`, **Playfair Display + Inter** (approved), arch/sun/nature motif. Logo SVGs (3 lockups + monograms + favicon) **recreated from the PDF** in `libs/ui/brand/`. Open: official editable vector wordmark to replace the recreated one.
2. ✅ **Business model = owned/operated** (like Wander) — trust strategy is first-party (hotel-grade consistency, quality guarantee, 24/7 concierge, verified reviews); avoids the marketplace variance/accountability gap.
3. **i18n scope at launch** (English-only with `/en/` prefix for future locales, or multi-locale now?).
4. **Supply & photography operations** — who sources and shoots inventory to the standard above (the brand is nature-forward: natural light, outdoors, serene).
5. **Deploy target confirmation** — own-cloud containers (recommended) vs Vercel vs Cloudflare/OpenNext.

## 6. Suggested next steps (after this research merges)

1. Confirm the five decisions above (esp. logo + business model).
2. A **`brand-and-seo` skill** + design tokens once the logo lands.
3. **Scaffold `apps/web`** (Next.js App Router) as an independently-deployable package wired to `@acme/proto-ts`, with the SEO/schema/CWV scaffolding and CI from `04-...` — a follow-up PR.
