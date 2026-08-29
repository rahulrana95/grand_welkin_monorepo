# Brand & Theme System

> Derived from the official **WelkinBliss Brand Guidelines 2026** (`Brandguide.pdf`, 2026). This replaces the earlier provisional direction — these are the real, logo-derived values. One thing to confirm with the designer: the guide lists the blue as HEX `#247989` **and** RGB `47,109,127` (`#2F6D7F`) — a small internal mismatch; this doc standardizes on the HEX `#247989`. Verify which is canonical before locking tokens.

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
| `--wb-blue` | `#247989` | 7715C | Primary — wordmark, UI primary, headings, links, fills |
| `--wb-gold` | `#E3BA38` | 7409C | Accent — CTAs, highlights, the "sun" |
| `--wb-ink` | `#14181B` | (rich black) | Body text |
| `--wb-paper` | `#FBFAF7` | (warm white) | Default ground |
| `--wb-white` | `#FFFFFF` | — | Surfaces |

Tint ramps (the guide specifies 95/80/60/40% steps; values below are computed tints over white — tune as needed):

```css
:root {
  /* Brand core */
  --wb-blue: #247989;
  --wb-gold: #E3BA38;
  --wb-ink: #14181B;
  --wb-paper: #FBFAF7;
  --wb-white: #FFFFFF;

  /* Blue tints */
  --wb-blue-80: #4A8D9B;
  --wb-blue-60: #7CAFB8;
  --wb-blue-40: #A7C9D0;
  --wb-blue-08: #EAF2F4;   /* subtle tinted surface */

  /* Gold tints */
  --wb-gold-80: #E9C862;
  --wb-gold-60: #EFD88C;
  --wb-gold-40: #F5E6B6;

  /* Semantic (light) */
  --wb-bg: var(--wb-paper);
  --wb-surface: var(--wb-white);
  --wb-text: var(--wb-ink);
  --wb-text-muted: #55606A;
  --wb-primary: var(--wb-blue);
  --wb-on-primary: var(--wb-white);
  --wb-accent: var(--wb-gold);
  --wb-on-accent: var(--wb-ink);   /* gold needs DARK text on it */
  --wb-border: #E4E0D8;
}

/* Dark theme — "twilight": deep teal-navy derived from the blue */
:root[data-theme="dark"], :root:not([data-theme="light"]) {
  @media (prefers-color-scheme: dark) {
    --wb-bg: #0F1A1E;
    --wb-surface: #16242A;
    --wb-text: #EDEAE3;
    --wb-text-muted: #A7B2B6;
    --wb-primary: #4A9DB0;         /* lighten blue for contrast on dark */
    --wb-on-primary: #06120F;
    --wb-accent: var(--wb-gold);   /* gold holds up on dark */
    --wb-on-accent: #14181B;
    --wb-border: #24343A;
  }
}
```

**Accessibility rules (important):**
- **Gold `#E3BA38` fails contrast as text on white** — use it for CTA/accent *fills with ink text*, large graphic elements, and the sun motif; **never** for body/small text on a light ground.
- **Blue `#247989` on paper** is ~4.6:1 — OK for large text/UI and borderline for body; prefer `--wb-ink` for long-form body text, blue for headings/links/UI. Verify every text/bg pair at AA (4.5:1) before shipping.

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

## Implementation

- Ship the tokens above as **`@welkinbliss/ui`** (the shared design-system package from `04-frontend-framework-and-deploy.md`) so `apps/web` and any future app consume one source of truth. Define the full light palette on `:root`; override only what changes for dark (per our `react-typescript` theming conventions).
- Fonts self-hosted via `next/font` (Playfair Display + Inter) with `size-adjust` fallbacks.
- Favicon / app icon = the **arch monogram**; maskable variants on `--wb-blue` and `--wb-paper`.

## Still worth confirming with you
1. **Blue HEX vs RGB mismatch** in the guide (`#247989` vs `#2F6D7F`) — which is canonical?
2. **Body sans choice** (Inter recommended) — approve or specify.
3. **Vector logo assets** (SVG) for the three lockups + arch monogram — to add to `@welkinbliss/ui` and generate the favicon set. (I have the PDF, not editable vectors.)
4. **Positioning/business model** (nature-forward stays; marketplace vs owned) — confirms voice + trust design.
