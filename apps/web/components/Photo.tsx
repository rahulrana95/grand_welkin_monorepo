/**
 * Branded placeholder standing in for the AVIF photo set (no CDN assets yet).
 * Replace with `next/image` (AVIF/WebP, `priority` on the LCP hero, explicit
 * dimensions) once real imagery is wired — see docs 02 §2.
 */
interface PhotoProps {
  readonly gradient: readonly [string, string];
  readonly alt: string;
  readonly ratio?: string; // e.g. "16 / 10"
  readonly arch?: boolean;
  readonly priority?: boolean; // documents LCP intent
  readonly children?: React.ReactNode;
}

export function Photo({ gradient, alt, ratio = "16 / 10", arch = false, children }: PhotoProps) {
  const [from, to] = gradient;
  return (
    <div
      role="img"
      aria-label={alt}
      className={arch ? "arch" : undefined}
      style={{
        position: "relative",
        aspectRatio: ratio,
        background: `radial-gradient(120% 90% at 30% 110%, ${to} 0%, ${from} 55%, #0F1A1E 130%)`,
        display: "grid",
        placeItems: "center",
      }}
    >
      {/* soft sun */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: "18%",
          left: "62%",
          width: "26%",
          aspectRatio: "1",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,.55), rgba(255,255,255,0) 68%)",
          filter: "blur(2px)",
        }}
      />
      {children}
    </div>
  );
}
