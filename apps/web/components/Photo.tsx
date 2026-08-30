import type { ImageFormat, PropertyImage } from "@/lib/types";

/**
 * Property imagery. With a real `image`, renders a `<picture>` that serves the
 * pre-generated responsive AVIF/WebP variants (ADR 0002 §5) with the original as
 * fallback — no runtime optimization. Without one, falls back to the brand-gradient
 * placeholder (used by the mock catalogue and homes with no photos yet).
 */
interface PhotoProps {
  readonly gradient: readonly [string, string];
  readonly alt: string;
  readonly ratio?: string; // e.g. "16 / 10"
  readonly arch?: boolean;
  readonly priority?: boolean; // LCP intent → eager load
  readonly image?: PropertyImage | undefined;
  /** Responsive `sizes` hint for the browser (default: full viewport width). */
  readonly sizes?: string;
  readonly children?: React.ReactNode;
}

const srcSetFor = (image: PropertyImage, format: ImageFormat): string =>
  image.variants
    .filter((v) => v.format === format)
    .map((v) => `${v.url} ${v.width}w`)
    .join(", ");

export function Photo({ gradient, alt, ratio = "16 / 10", arch = false, priority = false, image, sizes = "100vw", children }: PhotoProps) {
  if (image) {
    const avif = srcSetFor(image, "avif");
    const webp = srcSetFor(image, "webp");
    return (
      <div
        className={arch ? "arch" : undefined}
        style={{ position: "relative", aspectRatio: ratio, overflow: "hidden", background: "var(--wb-surface-tinted)" }}
      >
        <picture>
          {avif ? <source type="image/avif" srcSet={avif} sizes={sizes} /> : null}
          {webp ? <source type="image/webp" srcSet={webp} sizes={sizes} /> : null}
          {/* eslint-disable-next-line @next/next/no-img-element -- variants are pre-generated; no runtime optimization */}
          <img
            src={image.src}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            {...(priority ? { fetchPriority: "high" as const } : {})}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </picture>
        {children}
      </div>
    );
  }

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
