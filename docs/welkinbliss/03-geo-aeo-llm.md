# GEO / AEO — Ranking & Being Cited in AI Answer Engines

> Evidence-graded. Primary sources were egress-blocked; corroborated across multiple search extracts. Tactics are tagged **[proven]**, **[supported]**, or **[hype/unproven]**.

## 1. What it is

**Generative Engine Optimization (GEO) / Answer Engine Optimization (AEO)** = structuring content, entities, and off-site signals so AI answer engines (Google AI Overviews/AI Mode, ChatGPT-search, Perplexity, Gemini, Claude) **extract, trust, and cite** you. The metric shifts from blue-link rank to **citation/mention rate across a tracked prompt set**.

**The retrieval pipeline (why the unit is the passage, not the page):** query decomposition → search/rank → **chunk extraction** → embedding similarity → relevance → generation with attribution. Two gates: a short self-contained *passage* must be retrieved, then judged worthy of inclusion. Citation analyses show a strong positional bias — **~44% of citations come from the first ~30% of a page** ("first-30%" pattern), skewing to short, Q&A-shaped, entity-explicit text.

**Relationship to SEO:** for **Google surfaces**, Google's own guidance (May 2026) is blunt — a page only needs to be indexed and snippet-eligible; "optimizing for generative AI search is optimizing for the search experience, and thus still SEO." GEO genuinely diverges on **non-Google engines** (ChatGPT/Perplexity/Claude), which lean much harder on **off-site consensus** and **passage-level extractability**.

## 2. Content structure for extractability **[supported — Princeton GEO study, KDD 2024]**

- **Answer-first / inverted pyramid** — lead every page and every H2 with a direct **40–60-word answer block** (the part most often quoted).
- **Headings as questions** mirroring prompts ("What makes a WelkinBliss villa different?").
- **Self-contained passages** — each chunk must stand alone; **re-name the entity** inside it ("a chunk that says 'the platform' without naming it is useless when extracted"). Restate WelkinBliss / the property / the destination.
- **Short paragraphs (2–3 sentences), lists, comparison tables, FAQ/Q&A blocks** — extracted more reliably than long prose.
- **Statistics + named quotations + cited sources** — the **best-supported** content moves (Princeton: statistics +~41%, quotations from named sources +~28%, plus citations and authoritative voice). Add concrete numbers, cite sources inline, quote named guests/experts.

> Honest caveat: precise dials ("40–60 words," "update every 7–14 days," "10–20 articles/month") are vendor guidance, not peer-reviewed. The **direction** (answer-first, self-contained, stats/quotes/citations, Q&A) is what's supported.

## 3. Entity & authority

- **Knowledge-graph presence [supported]:** `Organization` schema with `@id`, `logo`, and especially **`sameAs`** → **Wikidata** (highest-leverage; feeds Google's Knowledge Graph), LinkedIn, Crunchbase, socials. Pursue a legitimate **Wikidata** entity (and Wikipedia only if notability is genuinely met — earn, don't fabricate).
- **Consistent NAP** across site, Google Business Profile, OTA listings, directories — inconsistency makes models "guess" and suppresses confident citation.
- **E-E-A-T:** real named authors with bios/credentials; first-hand experience (you vetted/stayed at the properties); clear ownership/contact/trust pages.
- **Off-site mentions = the biggest lever for non-Google engines [proven/strong]:** ~**85% of brand mentions** come from third-party pages; brands are cited ~**6.5× more via a third-party page** than their own; **~84% of AI citations are earned media**; brand mentions correlate ~**3× more** with AI visibility than backlinks. → **Digital PR (being talked about) is a core GEO channel.**
- **Reddit/Quora/reviews as consensus proxies:** Reddit is ~#2 among Google AI Overview cited domains (~19.6% share). Authentic community presence + a fresh review corpus (Google/OTA/TripAdvisor) materially shape whether AI *recommends* you.

## 4. Technical enablers

- **JSON-LD structured data [do it — for eligibility/accuracy, NOT as a citation trigger]:** `Organization`, `VacationRental`/`LodgingBusiness`, `FAQPage`/`QAPage`, `Article` (author + dateModified), `BreadcrumbList`, `AggregateRating`/`Review`, `amenityFeature`. Google recognizes amenity attributes (private pool, pet-friendly, ocean view, A/C…) — declaring them lets engines answer attribute-specific queries. **[hype]** "schema = 3.2× citations" is uncorroborated; a 1,885-page study found near-zero citation uplift and Google says schema isn't required for AI features.
- **Server-render the facts [proven prerequisite]:** many AI crawlers don't execute JS reliably — property name, location, capacity, amenities, price, reviews **must be in SSR HTML**, not JS-injected. (Directly reinforces the SSR decision in `02-...`.)
- **AI-crawler access (robots.txt) — selective allow-list [supported]:** *allow* retrieval/search agents that power live citations — **OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude-User/Claude-SearchBot, Googlebot**; *decide deliberately* on training-only crawlers — **GPTBot, ClaudeBot, CCBot, Google-Extended** (Google-Extended opts out of Gemini training with **no** effect on Search/AI-Overview indexing). Recommended posture for a growth brand: **allow retrieval agents + Googlebot unconditionally; allow training crawlers unless you have a specific reason not to.**
- **`llms.txt` [hype/experimental]:** a root Markdown file curating content for LLMs. Google (June 2026) says it has **no** effect on Search/AI Overviews; adoption low; no major engine confirms using it for retrieval (devtools like Cursor/Claude Code do use it for docs). **Verdict: cheap to add, harmless, don't prioritize.**

## 5. Measurement (no Search Console equivalent exists)

- **AI-visibility platforms:** Profound (enterprise), Semrush AIO, Ahrefs Brand Radar AI, Peec (mid), Otterly (~$29/mo). Method: run a fixed prompt set across engines on a schedule; parse appearance + cited URLs.
- **Analytics/log attribution:** referral traffic from `chatgpt.com`, `perplexity.ai`, `gemini.google.com`; AI-bot hits (GPTBot, PerplexityBot, OAI-SearchBot) in server logs to confirm crawlability.
- **Manual prompt panel:** fixed target prompts ("luxury villa in ___", "best vacation rental company for ___"), logged weekly.
- **[honest caveat]** Reliability is contested — a 2026 experiment concluded per-query AI-visibility tracking is "inherently unreliable" (non-deterministic, personalized). **Track trends/share-of-voice across many prompts over time, not single queries.** AI referrals are still small (~0.3% of traffic vs ~43% organic) but growing fast.

## 6. Travel-specific

- **Measure per engine** — mention rates vary ~1.7× across engines; link destinations differ (GPT sends ~91% direct to the property; Perplexity most OTA-friendly). WelkinBliss needs a per-engine profile, not one number.
- **"The property with cleaner schema/data gets the recommendation"** — engines credit whichever brand presents the most complete machine-readable signals. → structured, complete per-property facts win.
- **Google Business Profile is disproportionately powerful in travel** (~79% of hotel links in Google AI Mode go to GBP) — complete, review-rich GBP per market, fed by on-site schema.
- **Attribute-specific facts are the currency** ("pet-friendly," "sleeps 8," "walkable to old town," "toddler-safe") — declare as explicit confirmed structured facts in SSR HTML + schema.
- **The niche is winnable** — big OTAs dominate raw mentions, but rental-alternative brands "struggle to break through" where signals are weak. A focused luxury-rental brand can out-signal on rich per-property data + answer-first destination Q&A + genuine experience content + fresh reviews + off-site presence. **Freshness matters** (seasonality/availability).

## 7. Prioritized checklist

**Do first (evidence-backed):**
1. **Facts in server-rendered HTML** — every property's name/location/capacity/amenities/USPs/price/reviews. [prereq]
2. **Rewrite for extractability** — answer-first 40–60-word blocks under question H2s; self-contained passages that re-name the entity; comparison tables; FAQ/QAPage on every property + destination. [supported]
3. **Statistics + named quotations + cited sources** in guides and property pages. [best-supported]
4. **Entity foundation** — `Organization` + `sameAs`→Wikidata/LinkedIn/Crunchbase; consistent NAP; pursue a Wikidata entity. [supported]
5. **Property/destination schema** — `VacationRental`/`LodgingBusiness`, `amenityFeature`, `AggregateRating`/`Review`, `FAQPage`, `Article`. [eligibility, not a citation lever]
6. **Off-site authority & reviews** — digital PR to travel publications; grow fresh Google/OTA reviews; authentic travel-community presence. [strongest lever for non-Google]
7. **Complete Google Business Profiles per market.** [travel-specific, high impact]
8. **Crawlability** — allow retrieval agents + Googlebot; deliberate call on training crawlers.
9. **Freshness cadence** — update destination/top-property pages; surface `dateModified`.
10. **Measurement** — fixed prompt panel across engines + one AI-visibility tool; judge trends, not single queries.

**Cheap/experimental:** `llms.txt` at root (+ consider a Wander-style **per-property Markdown mirror** — low effort, rare, plausibly useful for AI extraction).

**Bottom line:** GEO/AEO ≈ **excellent SEO + entity authority + off-site PR + machine-readable facts**, measured as a trend across many prompts. It's a real, fast-growing but still-small channel — not a separate magic discipline, and not the vendor silver bullets.
