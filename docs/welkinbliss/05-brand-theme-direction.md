# Brand & Theme Direction (PROVISIONAL)

> ⚠️ **Blocking dependency:** the theme is meant to be **"inspired from our logo,"** and I don't have the logo or brand assets. Everything below is a **provisional hypothesis** derived from the name and the reference sites — a starting point to react to, **not** committed design tokens. **Share the logo (or its colors/mark) and this gets replaced with a real, logo-derived system.**

## The name as a brief

- **Welkin** — an archaic/poetic word for *the vault of heaven; the sky; the celestial sphere.* Connotations: sky, air, light, elevation, the sublime, calm expanse.
- **Bliss** — serene joy, contentment, "your happy place" (which is also literally Wander's promise).
- **"WelkinBliss"** ⇒ *serene, elevated, heavenly calm* — a luxury-stays brand about rising above the everyday into a state of ease. This is a gift for a vacation-rental brand: it points to **light, sky, horizon, and quiet luxury** rather than gold-and-serif opulence.

The reference teardowns agree that **luxury here = restraint + photographic quality + trust**, not ornament. So the theme should feel *quiet, spacious, and light-filled* — letting full-bleed property photography carry the richness.

## Provisional visual direction (hypotheses to confirm against the logo)

**Mood:** serene, elevated, editorial, airy. Think "morning light over a horizon," generous negative space, calm confidence.

**Palette hypothesis** (placeholders — replace with logo-derived tokens):
| Role | Direction | Placeholder |
|---|---|---|
| Ground | warm off-white / soft paper | `#FAF7F2` |
| Ink | deep near-black, slightly warm | `#1A1A17` |
| Primary (sky) | a calm, elevated blue — "welkin" | `#3E5C76` |
| Accent (warmth) | a soft dusk/gold for CTAs, used sparingly | `#C9A66B` |
| Dark theme ground | deep twilight navy | `#12161C` |

> These are deliberately generic. If the logo is, say, teal + cream, or sunset-toned, the whole system shifts. **Do not implement these as tokens** until the logo is in.

**Typography hypothesis:** a refined **serif display** for headlines (editorial, aspirational — evokes quiet luxury) paired with a clean **neo-grotesque sans** for UI/body. Self-hosted via `next/font` with `size-adjust` fallbacks (zero font-CLS, per `02-...`). Large type, generous line-height, lots of air.

**Art direction (the real luxury lever):** a **photography standard as a listing gate** — consistent aspect ratios, minimum resolution, natural light, styled interiors + dramatic landscape. This, not CSS, is what makes the brand read as premium (both Wander and Marriott win here). AVIF, prioritized LCP hero, restrained (non-full-screen) hero that hands off to the gallery quickly.

**Motion:** subtle, slow, confident — gentle fades/parallax on scroll; never busy. Respect `prefers-reduced-motion`.

**Voice:** calm, aspirational, understated, specific. "Find your calm above it all" energy — but write it once the positioning is confirmed. Trust language made concrete and numeric (vetting standard, 24/7 concierge, verified reviews).

## Theming implementation notes (framework-ready, palette-agnostic)

- Define the brand as **design tokens** (CSS custom properties) with a complete light palette on `:root` and a dark override — so the logo-derived values slot in without touching components. Aligns with our `react-typescript` + component conventions.
- Ship the token set as **`@welkinbliss/ui`** (the shared design-system package from `04-...`) so `apps/web` and any future app consume one source of truth.
- Support light/dark from day one; default to light (airy) with a considered dark (twilight) mode.

## What I need from you to finalize

1. **The logo** (vector if possible) — the whole palette/type/mark derives from it.
2. Any existing **brand guidelines / color values / fonts** already chosen.
3. Confirmation of **positioning + business model** (marketplace vs owned) — it changes voice and trust design.

Once those land, this doc becomes a concrete **design-token set + `brand-and-seo` skill**, and we can produce a design canvas / mockups for the homepage, a destination page, and a property page.
