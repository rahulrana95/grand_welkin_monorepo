# Brand & Theme System

> Derived from the official **WelkinBliss Brand Guidelines 2026** (`Brandguide.pdf`). These are the real, logo-derived values. **Live tokens + logo SVGs now exist in [`libs/ui`](../../libs/ui/) (`@welkinbliss/ui`)** — this doc is the rationale; the code is the source of truth.
>
> **Blue resolved:** the guide had an internal mismatch (HEX `#247989` vs RGB `47,109,127`). Sampling the actual logo from the PDF renders **~#36697F**, which matches the RGB spec, **not** `#247989`. Canonical blue = **`#2F6D7F`**.

## The brand in one line

WelkinBliss is about **calm, nature, openness, and everyday bliss** — a rising sun over a soft landscape, framed by a sheltering arch. The feeling to build: *serene, warm, optimistic, connected to the outdoors.* This is quiet, nature-forward luxury (closer to Wander's "happy place" serenity than to corporate opulence) — let light-filled photography and generous space carry the richness; keep the UI restrained.

## Logo

- **Symbol:** line-art **rising sun + soft clouds + natural landscape within an architectural arch** — shelter, harmony, warmth, optimism, the outdoors.
- **Wordmark:** "WELKIN" (blue) over "BLISS" (gold), serif.
- **Lockups:** single-color (blue), full-color, and black; horizontal (symbol + wordmark) and stacked. The **arch monogram** works standalone as an app icon / favicon.
- **Backgrounds:** main-color, white, and dark versions exist — use the approved version per background; never recolor.
- **Min sizes** (from guide): full logo ≥ 45×17 mm print; symbol ≥ 10×11.5 mm. For web, keep the wordmark legible (don't shrink below ~120px wide); use the arch monogram at small sizes.
- **The arch is our signature UI motif** — echo the arched top on hero framing, property cards, and section dividers. It's distinctive and ownable; use it sparingly so it stays special.

## Color tokens

Core brand colors (exact from the guide):

| Token | HEX | Pantone | Use |
|---|---|---|---|
| `--wb-blue` | `#2F6D7F` | 7715C | Primary — wordmark, UI primary, headings, links, fills |
| `--wb-gold` | `#E3BA38` | 7409C | Accent — CTAs, highlights, the "sun" |
| `--wb-ink` | `#14181B` | (rich black) | Body text |
| `--wb-paper` | `#FBFAF7` | (warm white) | Default ground |
| `--wb-white` | `#FFFFFF` | — | Surfaces |

Tint ramps (the guide specifies 95/80/60/40% steps; values below are computed tints over white — tune as needed):

The full token set (core + tints + light/dark semantics + type + shape) is implemented in
**[`libs/ui/src/tokens.css`](../../libs/ui/src/tokens.css)** — the canonical source. Core:

```css
--wb-blue: #2F6D7F;   /* Pantone 7715C */
--wb-gold: #E3BA38;   /* Pantone 7409C */
--wb-ink:  #14181B;   --wb-paper: #FBFAF7;   --wb-white: #FFFFFF;
--wb-accent: var(--wb-gold);  --wb-on-accent: var(--wb-ink);  /* gold takes dark text */
```

**Accessibility rules (important):**
- **Gold `#E3BA38` fails contrast as text on white** — use it for CTA/accent *fills with ink text*, large graphic elements, and the sun motif; **never** for body/small text on a light ground.
- **Blue `#2F6D7F` on paper** is ~5:1 — OK for headings/links/UI; prefer `--wb-ink` for long-form body text. Verify every text/bg pair at AA (4.5:1) before shipping.

## Typography

**Primary typeface: Playfair Display** (serif) — Bold for display/headings/brand, Regular for subheads. Web-load via `next/font` (Google Fonts) with `size-adjust` fallbacks for zero font-CLS (per `02-seo-ssr-cwv.md`).

**Body / UI: a clean sans** — the guide explicitly recommends pairing Playfair with "a clean, modern sans-serif for supporting text" but doesn't name one. **Recommendation: Inter** (or Source Sans 3) for body, labels, and small UI. *Adaptation note:* the print guide set body in Playfair 12pt; for web readability + Core Web Vitals we set **body/UI in the sans and reserve Playfair for display/headings** — a deliberate, defensible adaptation. Confirm with the designer.

Type scale (mapping the guide's Playfair hierarchy to responsive web):

```css
:root {
  --wb-font-display: "Playfair Display", Georgia, "Times New Roman", serif;
  --wb-font-body: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;

  --wb-h1: clamp(2.5rem, 5vw, 4rem);      /* Playfair Bold */
  --wb-h2: clamp(2rem, 3.5vw, 3rem);      /* Playfair Bold */
  --wb-h3: clamp(1.5rem, 2.5vw, 2rem);    /* Playfair Bold */
  --wb-sub: 1.125rem;                     /* Playfair Regular */
  --wb-body: 1rem;                        /* Inter, 16px min */
  --wb-small: 0.875rem;                   /* Inter */
}
h1,h2,h3,.display { font-family: var(--wb-font-display); font-weight: 700; }
body { font-family: var(--wb-font-body); color: var(--wb-text); background: var(--wb-bg); }
```

## Art direction, motion, voice

- **Photography (the real luxury lever):** natural light, outdoors, warm and airy — sun, sky, greenery, serene interiors that open to landscape. Enforce a **photography standard as a listing gate** (aspect ratios, min resolution, styling) — it's what unifies the brand (see `01-reference-teardowns.md`). AVIF, prioritized LCP hero, restrained (non-full-screen) hero that hands off to the gallery.
- **Iconography:** thin line-art matching the logo's stroke; consistent weight; the arch as a recurring container.
- **Motion:** subtle, slow, confident — gentle fades / soft parallax; a sunrise/gradient can nod to the mark. Respect `prefers-reduced-motion`.
- **Voice:** calm, warm, optimistic, specific — "everyday bliss," "your calm above it all." Trust made concrete and numeric (vetting standard, verified reviews, 24/7 concierge).

## Implementation — status

- **Tokens shipped** as [`@welkinbliss/ui`](../../libs/ui/) (`src/tokens.css`) — one source of truth for `apps/web` and future apps; full light palette on `:root`, dark overrides only.
- **Logo SVGs created** in [`libs/ui/brand/`](../../libs/ui/brand/): 3 lockups (colour / mono / black), 3 monograms, and a favicon — **recreated from the brand-guide PDF** (symbol/favicon are pure vector paths; the lockup wordmark uses the Playfair webfont — swap in the official vector when available).
- Fonts self-hosted via `next/font` (Playfair Display + **Inter**, approved) with `size-adjust` fallbacks. Favicon / app icon = the **arch monogram**.

## Resolved / still open
- ✅ **Blue** = `#2F6D7F` (confirmed by sampling the logo; the guide's `#247989` was wrong).
- ✅ **Body sans** = **Inter** (approved).
- ✅ **Logo assets** = recreated as SVG in `@welkinbliss/ui` (official editable vectors welcome later to replace the recreated wordmark).
- ✅ **Business model** = **owned/operated** (like Wander) — see voice/trust note below.
- ⏳ Official **vector logo files** from the designer, to supersede the recreated wordmark.

### Owned/operated → voice & trust
Because WelkinBliss **owns and operates** its stays (not a third-party marketplace), lean
into the vertical-integration trust story: hotel-grade consistency, first-party quality
guarantee, 24/7 concierge, and concrete numbers (satisfaction, verified reviews). This is
Wander's playbook and a genuine edge over Marriott's third-party-management accountability
gap (`01-reference-teardowns.md`). Voice: calm, warm, optimistic, first-person stewardship
("homes we care for," "your calm above it all").
