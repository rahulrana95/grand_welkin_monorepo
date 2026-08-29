# @welkinbliss/ui

Shared design system for WelkinBliss — brand **design tokens** and **logo assets**,
derived from the official Brand Guidelines 2026. One source of truth consumed by
`apps/web` and any future app.

> These logo SVGs were **recreated from the brand-guide PDF** (no editable vectors were
> available yet). The **symbol and favicon are pure vector paths** and fully portable.
> The lockup **wordmark uses the Playfair Display webfont** (`<text>`), so it renders
> correctly wherever that font is loaded (the app loads it via `next/font`); swap in the
> official vector wordmark when it arrives.

## Tokens

```ts
import "@welkinbliss/ui/tokens.css";
```

Then use the CSS custom properties — never hard-code hex:

```css
.cta { background: var(--wb-accent); color: var(--wb-on-accent); }  /* gold + dark text */
.link { color: var(--wb-primary); }                                 /* brand blue */
h1 { font-family: var(--wb-font-display); font-size: var(--wb-h1); }
body { font-family: var(--wb-font-body); background: var(--wb-bg); color: var(--wb-text); }
.card--arch { border-radius: var(--wb-radius-arch); }               /* the signature arch */
```

- **Blue** `#2F6D7F` (Pantone 7715C) · **Gold** `#E3BA38` (Pantone 7409C) · ink `#14181B` · paper `#FBFAF7`.
- Light + dark ("twilight") themes; override via `:root[data-theme="dark"]` or system preference.
- **Accessibility:** gold is for **fills/accents with dark text** (`--wb-on-accent`) — never small light text on gold. Verify every text/bg pair at AA (4.5:1).

## Logo assets (`brand/`)

| File | Use |
|---|---|
| `welkinbliss-logo.svg` | **Full-colour lockup** (blue + gold) — default, on light grounds |
| `welkinbliss-logo-mono.svg` | Single-colour (blue) — when colour is limited |
| `welkinbliss-logo-black.svg` | Black — one-colour / print / on gold or light photo |
| `welkinbliss-symbol.svg` | **Arch monogram**, full colour — compact spaces |
| `welkinbliss-symbol-mono.svg` | Monogram, single blue |
| `welkinbliss-symbol-black.svg` | Monogram, black |
| `favicon.svg` | Tab / app icon (tight-cropped monogram) |

On dark grounds use the full-colour lockup (blue lightens automatically only in UI, not in
the static SVG) or the mono/white treatment; keep the gold sun.

### Usage rules (from the guide)
- **Clear space:** keep at least the arch's half-width of empty space around the logo.
- **Minimum size:** full lockup ≥ ~120px wide on screen; below that use the monogram
  (guide print minimums: logo 45×17 mm, symbol 10×11.5 mm).
- **Don't:** recolour outside the brand palette, stretch/skew, add effects, place the
  colour lockup on a busy/low-contrast photo, or reconstruct the wordmark in another font.

## Symbol meaning
A rising sun with rays over rolling hills, framed by an architectural arch — calm, nature,
openness, shelter, warmth, optimism, everyday bliss.
