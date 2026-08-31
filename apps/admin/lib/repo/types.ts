/** Admin domain types + repository interface. Mirrors the welkin_bliss_* tables
 *  (supabase/migrations). Pages depend only on `Repo`; the impl is swappable
 *  (mock now, Supabase later). */

export type PropertyStatus = "draft" | "published" | "archived";

export interface PropertyPhoto {
  readonly id: string;
  readonly url: string;
  readonly alt: string;
  readonly sort: number;
}

export interface AdminProperty {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly destinationSlug: string;
  readonly region: string;
  readonly country: string;
  readonly countryCode: string;
  readonly summary: string;
  readonly description: string;
  readonly sleeps: number;
  readonly bedrooms: number;
  readonly bathrooms: number;
  readonly basePriceCents: number;
  readonly currency: string;
  readonly status: PropertyStatus;
  readonly uplistingPropertyId: string | null;
  readonly amenityKeys: readonly string[];
  readonly photos: readonly PropertyPhoto[];
}

export type PropertyInput = Omit<AdminProperty, "id" | "photos">;

/** A newly uploaded original image, before Storage/variant processing. */
export interface PhotoInput {
  readonly data: Uint8Array;
  readonly filename: string;
  readonly contentType: string;
  readonly alt?: string;
}

export interface SiteCopy {
  readonly key: string;
  readonly value: string;
  readonly updatedAt: string;
}

export interface Repo {
  listProperties(): Promise<readonly AdminProperty[]>;
  getProperty(id: string): Promise<AdminProperty | null>;
  createProperty(input: PropertyInput): Promise<AdminProperty>;
  updateProperty(id: string, patch: Partial<PropertyInput>): Promise<AdminProperty>;

  /** Per-date price overrides (minor units), keyed by ISO date. */
  getPricing(propertyId: string): Promise<ReadonlyMap<string, number>>;
  /** Copy one price across an inclusive date range ("copy-to-range"). */
  setPriceRange(propertyId: string, from: string, to: string, priceCents: number): Promise<void>;
  clearPrice(propertyId: string, date: string): Promise<void>;

  getBlocked(propertyId: string): Promise<ReadonlySet<string>>;
  toggleBlocked(propertyId: string, date: string): Promise<void>;

  /** Upload originals → Storage + responsive variants; append to the property. */
  addPhotos(propertyId: string, photos: readonly PhotoInput[]): Promise<void>;
  deletePhoto(propertyId: string, photoId: string): Promise<void>;
  /** Reorder a photo within its property (swaps sort with its neighbour). */
  movePhoto(propertyId: string, photoId: string, direction: "up" | "down"): Promise<void>;
  updatePhotoAlt(propertyId: string, photoId: string, alt: string): Promise<void>;

  listSiteCopy(): Promise<readonly SiteCopy[]>;
  updateSiteCopy(key: string, value: string): Promise<void>;
}
