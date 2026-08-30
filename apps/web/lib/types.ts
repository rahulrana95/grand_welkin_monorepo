/** Domain types for the WelkinBliss catalogue. All read-only — data is immutable in the view. */

export type Theme =
  | "coastal"
  | "mountain"
  | "vineyard"
  | "forest"
  | "desert";

export interface Amenity {
  readonly label: string;
  /** schema.org LocationFeatureSpecification name; keep stable for structured data. */
  readonly schemaName: string;
}

export interface Review {
  readonly author: string;
  readonly date: string; // ISO
  readonly rating: number; // 1..5
  readonly body: string;
}

export interface Destination {
  readonly slug: string;
  readonly name: string;
  readonly region: string;
  readonly country: string;
  readonly countryCode: string; // ISO 3166-1 alpha-2
  readonly theme: Theme;
  readonly tagline: string;
  /** Answer-first, self-contained intro (GEO/AEO — see docs 03). */
  readonly summary: string;
  readonly bestTime: string;
  readonly gradient: readonly [string, string];
}

export type ImageFormat = "avif" | "webp";

export interface ImageVariant {
  readonly url: string;
  readonly width: number;
  readonly format: ImageFormat;
}

/** A real property photo (original + responsive variants). */
export interface PropertyImage {
  /** Original object URL — the `<img>` fallback. */
  readonly src: string;
  readonly alt: string;
  readonly width: number | null;
  readonly height: number | null;
  readonly variants: readonly ImageVariant[];
}

export interface Property {
  readonly slug: string;
  readonly name: string;
  readonly destinationSlug: string;
  readonly summary: string;
  readonly description: string;
  readonly sleeps: number;
  readonly bedrooms: number;
  readonly bathrooms: number;
  readonly nightlyPriceCents: number;
  readonly currency: "USD" | "EUR" | "GBP";
  readonly rating: number;
  readonly reviewCount: number;
  readonly lat: number;
  readonly lng: number;
  readonly amenities: readonly Amenity[];
  readonly reviews: readonly Review[];
  /** Brand-gradient placeholder, shown when the property has no `images`. */
  readonly gradient: readonly [string, string];
  readonly photoCount: number;
  /** Real photos from the CMS; when present they replace the gradient placeholder. */
  readonly images?: readonly PropertyImage[];
}

export const priceFormatted = (property: Property): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: property.currency,
    maximumFractionDigits: 0,
  }).format(property.nightlyPriceCents / 100);
