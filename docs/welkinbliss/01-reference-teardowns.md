# Reference Teardowns — Wander & Homes & Villas by Marriott

> Distilled from research. The live sites and most secondary sources were egress-blocked, so **visual specifics (exact hex/fonts) are inferred and flagged** — confirm on the live sites with Wappalyzer + Rich Results Test before copying anything visual.

---

## A. Wander.com — win on *feel*

**Positioning:** "the first true brand in short-term rentals — the dependability of a luxury hotel with the warmth of a thoughtfully designed home" ("hotelification"). Tagline **"Find your happy place."** / "A vacation home, but better." Voice: calm, aspirational, understated.

**The premium signal is upstream of the website.** Wander only operates **architecturally striking homes** ("top 1%"), furnished with real design brands (Herman Miller, Knoll, DWR), with a Tesla per property. Every listing photo is effectively a design-magazine shoot. **Takeaway: photography/inventory quality is ~70% of "luxury"; a great template on mediocre listings won't read as premium.**

**Signature UX:**
- **Emotional, low-commitment search** — human-labeled "**Whenever**" (dates) / "**Whoever**" (guests) instead of rigid pickers; a "Last-minute deals" tab.
- **Browse-first, gallery-driven.** Their own published playbook: *"photos are the primary decision driver… guests want to browse, not learn,"* and — notably — **a full-screen hero "stops momentum"; a smaller hero encourages scrolling.** Lead with inventory, not a blocking splash.
- **Property pages:** fast WebP gallery, prominent price + booking CTA, easy calendar; trust treated as a design requirement (they write about the "payment trust gap").
- **The app is the delight layer:** smart-home control (locks, climate, Tesla), 24/7 AI concierge, and **"Split with Friends"** (one-tap cost-split on $1k+/night stays) — turns price shock into a shareable action.
- **Trust made numeric:** "top 1% of homes," NPS 85, 94% satisfaction, 439k+ travelers, 1,000+ homes; vertically integrated via "WanderOS."

**Tech/SEO signals (single-source, flagged):** **Next.js App Router**, SSR; property pages server-render full **`VacationRental` JSON-LD**; full data in the **RSC flight payload**; clean slug URLs (`/<slug>`); location hubs (`/united-states`); `sitemap.xml` (~6k entries); and — unusually — a **per-property LLM-friendly Markdown mirror** for generative search (GEO). WebP images.

**Steal:** emotional search; restrained-hero browse-first layout; Split-with-Friends; concrete numeric trust; Next.js + `VacationRental` JSON-LD + slug URLs + per-property LLM mirror; curation-as-IA (theme collections over infinite filters).
**Avoid:** full-screen video hero that blocks the fold; faking luxury with type/animation over thin inventory; app-download/login gates before the user has seen homes. (And don't copy a palette you haven't actually seen.)

---

## B. Homes & Villas by Marriott Bonvoy — win on *scale & SEO*

**Positioning:** premium curated marketplace, **~140k professionally-managed homes, 700+ destinations**, positioned above Airbnb/Vrbo on trust. Titles lean on "**Book Directly and Save**." The luxury cue is **institutional trust + photographic consistency**, not ornament — "Marriott stands behind this home."

**UX & booking:**
- Two search modes: classic **destination + dates**, and (2024) **generative-AI natural-language search** ("a quiet beach home for two near vineyards") built on Azure OpenAI.
- **Curated Collections** (Ski-In/Ski-Out, Vineyards & Villas, Zen Homes, Pet-Friendly, National Parks…) that double as inspiration **and** SEO landing pages.
- Property pages: gallery-forward, amenities, map, **Bonvoy points earn/redeem** — the structural moat (200M-member loyalty base).
- **Weakness → our opportunity:** reviews are thin and less trusted; third-party management creates accountability gaps.

**SEO playbook (the reason this teardown matters):**
- **Clean URLs:** language-prefixed `/en/…`; `/en/properties/{id}-{keyword-rich-slug}`; hierarchical, lowercase, keyword-bearing.
- **The (geo × theme) landing-page matrix:** two crossable taxonomies — destinations (country→city) × collections (beach/ski/vineyard/pet-friendly…) — generate thousands of long-tail pages ("villas in Tuscany," "ski chalets in Aspen," "pet-friendly beach homes in Florida").
- **Crawlable HTML sitemap hubs** (`/en/sitemap/vacation-rental-destinations`, `/en/sitemap/curated-collections`) that internally link every landing page — flat click-depth so deep pages get indexed and receive link equity (don't rely on the JS search app for discovery).
- **Templated metadata** per page type; language-prefixed URLs built for i18n/`hreflang` from the start.
- Schema types **inferred** (verify): `VacationRental`/`LodgingBusiness`, `Product`+`AggregateRating`+`Review`, `BreadcrumbList`, `Organization`→parent Marriott, `FAQPage`.

**Tech (disclosed):** cloud-native microservices on **AWS** (ECS, MSK/Kafka, OpenSearch, CloudWatch); Azure OpenAI for AI search; Salesforce host portal. Frontend framework not disclosed — but landing pages rank, so they are almost certainly **SSR/pre-rendered** (verify). Heavy imagery + AI widget = **likely CWV risk** → our speed opening.

**Steal (SEO-first):** the geo×theme matrix from day one; crawlable HTML sitemap hubs; keyword-rich hierarchical URLs; `/en/` language prefix at launch; templated metadata; Collections as merchandising + SEO; photography standard as a listing gate.
**Avoid:** thin low-trust reviews (make verified reviews + `AggregateRating` first-class — our wedge); third-party accountability gaps (guest-protection guarantee); enterprise bloat/slowness (win on speed); shallow destination content (add real guides — cheap topical authority they're leaving on the table); SPA-walling SEO pages (server-render everything that must rank).
