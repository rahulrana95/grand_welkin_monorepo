import "server-only";
import type { Sharp } from "sharp";

/**
 * Responsive variant generation for property photos (ADR 0002 §5). One original
 * upload → several widths × modern formats, so the public site serves the size
 * that fits the viewport/bandwidth. Server-only (native `sharp`).
 *
 * `sharp` is loaded lazily so merely importing this module never touches the native
 * binary — a platform where the binary can't load (e.g. a mis-traced serverless
 * function) fails only inside `generateVariants`, which callers already treat as
 * best-effort (the original upload is kept without variants).
 */
type SharpFactory = (input: Buffer, options?: { failOn?: "error" }) => Sharp;

let sharpFactory: SharpFactory | null = null;
async function loadSharp(): Promise<SharpFactory> {
  if (!sharpFactory) {
    const mod = (await import("sharp")) as unknown as { default: SharpFactory };
    sharpFactory = mod.default;
  }
  return sharpFactory;
}

/** Target widths (px). Downscale only — never upscale past the source width. */
export const PHOTO_WIDTHS = [480, 960, 1600, 2400] as const;

/** Output formats, best first. AVIF then WebP. */
export const PHOTO_FORMATS = ["avif", "webp"] as const;
export type PhotoFormat = (typeof PHOTO_FORMATS)[number];

export interface GeneratedVariant {
  readonly width: number;
  readonly format: PhotoFormat;
  readonly data: Buffer;
  readonly contentType: string;
}

export interface SourceMeta {
  readonly width: number;
  readonly height: number;
}

export interface VariantResult {
  readonly source: SourceMeta;
  readonly variants: readonly GeneratedVariant[];
}

const CONTENT_TYPE: Record<PhotoFormat, string> = {
  avif: "image/avif",
  webp: "image/webp",
};

export interface GenerateOptions {
  readonly widths?: readonly number[];
  readonly formats?: readonly PhotoFormat[];
}

/**
 * Decode `input` once and emit a variant per (width ≤ source width) × format.
 * Always includes the source width (capped to the largest target) so the full-res
 * image is available. Throws if the input is not a decodable image.
 */
export async function generateVariants(input: Buffer, options: GenerateOptions = {}): Promise<VariantResult> {
  const widths = options.widths ?? PHOTO_WIDTHS;
  const formats = options.formats ?? PHOTO_FORMATS;

  const sharp = await loadSharp();
  const base = sharp(input, { failOn: "error" }).rotate(); // honour EXIF orientation
  const meta = await base.metadata();
  const sourceWidth = meta.width ?? 0;
  const sourceHeight = meta.height ?? 0;
  if (sourceWidth === 0 || sourceHeight === 0) throw new Error("Unreadable image (no dimensions)");

  const targets = [...new Set(widths.filter((w) => w < sourceWidth).concat(sourceWidth))].sort((a, b) => a - b);

  const variants: GeneratedVariant[] = [];
  for (const width of targets) {
    for (const format of formats) {
      const pipeline = base.clone().resize({ width, withoutEnlargement: true });
      const encoded =
        format === "avif" ? pipeline.avif({ quality: 50 }) : pipeline.webp({ quality: 72 });
      variants.push({ width, format, data: await encoded.toBuffer(), contentType: CONTENT_TYPE[format] });
    }
  }

  return { source: { width: sourceWidth, height: sourceHeight }, variants };
}
