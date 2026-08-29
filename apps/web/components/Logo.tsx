/**
 * WelkinBliss logo — inline so it themes cleanly and needs no image request.
 * Mirrors the canonical assets in @welkinbliss/ui/brand (used for favicon/OG).
 */
type LogoVariant = "color" | "mono" | "black";

interface LogoColors {
  readonly arch: string;
  readonly sun: string;
  readonly welkin: string;
  readonly bliss: string;
}

function colorsFor(variant: LogoVariant): LogoColors {
  switch (variant) {
    case "color":
      return { arch: "var(--wb-blue)", sun: "var(--wb-gold)", welkin: "var(--wb-blue)", bliss: "var(--wb-gold)" };
    case "mono":
      return { arch: "currentColor", sun: "currentColor", welkin: "currentColor", bliss: "currentColor" };
    case "black":
      return { arch: "var(--wb-ink)", sun: "var(--wb-ink)", welkin: "var(--wb-ink)", bliss: "var(--wb-ink)" };
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
}

const RAYS: readonly (readonly [number, number, number, number])[] = [
  [55, 40, 55, 28], [41, 44, 35, 33], [69, 44, 75, 33],
  [32, 55, 21, 49], [78, 55, 89, 49], [27, 68, 15, 67], [83, 68, 95, 67],
];

interface LogoProps {
  readonly variant?: LogoVariant;
  readonly withWordmark?: boolean;
  readonly height?: number;
  readonly title?: string;
}

export function Logo({ variant = "color", withWordmark = true, height = 44, title = "WelkinBliss" }: LogoProps) {
  const c = colorsFor(variant);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", color: c.arch }}>
      <svg viewBox="0 0 120 132" height={height} role="img" aria-label={title} fill="none">
        <g strokeLinecap="round" strokeLinejoin="round" strokeWidth={4.5}>
          <path d="M26 116 L26 52 A34 34 0 0 1 94 52 L94 116" stroke={c.arch} />
          <path d="M24 116 L96 116" stroke={c.arch} />
          <path d="M31 74 A30 30 0 0 1 55 45" stroke={c.arch} strokeWidth={3} />
          <g stroke={c.sun} strokeWidth={3.4}>
            {RAYS.map(([x1, y1, x2, y2]) => (
              <line key={`${x1}-${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} />
            ))}
          </g>
          <circle cx={55} cy={66} r={17} stroke={c.sun} />
          <path d="M24 116 C28 100 38 88 49 90 C58 92 61 101 68 101 C75 101 80 94 86 100 C90 104 93 110 96 116" stroke={c.arch} />
          <path d="M40 110 C48 103 58 104 64 111" stroke={c.arch} strokeWidth={3} />
        </g>
      </svg>
      {withWordmark ? (
        <span
          aria-hidden
          style={{
            fontFamily: "var(--wb-font-display)",
            fontWeight: 700,
            lineHeight: 0.98,
            letterSpacing: "0.06em",
            fontSize: height * 0.42,
            display: "grid",
          }}
        >
          <span style={{ color: c.welkin }}>WELKIN</span>
          <span style={{ color: c.bliss }}>BLISS</span>
        </span>
      ) : null}
    </span>
  );
}
