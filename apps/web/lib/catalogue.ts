import "server-only";
import { unstable_cache } from "next/cache";
import { PHOTOS_BUCKET, createAnonClient, type WelkinDbClient } from "@welkinbliss/db";
import { DESTINATIONS, PROPERTIES, getDestination } from "./data";
import type { Property, PropertyImage } from "./types";

/**
 * The public property catalogue. Reads PUBLISHED properties (+ photos) from Supabase
 * when configured — so admin-managed inventory appears on the site — and falls back
 * to the mock catalogue otherwise, keeping the app (and its visual tests) working
 * without a backend. Cached + tagged (`catalogue`) so an admin edit can revalidate it.
 */
export const CATALOGUE_TAG = "catalogue";

const CURRENCIES = ["USD", "EUR", "GBP"] as const;
type Currency = (typeof CURRENCIES)[number];
const asCurrency = (value: string): Currency =>
  (CURRENCIES as readonly string[]).includes(value) ? (value as Currency) : "EUR";

/** Editorial enrichment the DB doesn't carry yet (amenities, reviews, gradient),
 *  keyed by slug from the curated catalogue. Missing → sensible defaults. */
const EDITORIAL = new Map(PROPERTIES.map((p) => [p.slug, p]));

const gradientFor = (destinationSlug: string): readonly [string, string] =>
  getDestination(destinationSlug)?.gradient ?? ["#2F6D7F", "#E3BA38"];

async function fetchFromSupabase(db: WelkinDbClient): Promise<readonly Property[]> {
  const storage = db.storage.from(PHOTOS_BUCKET);
  const publicUrl = (path: string): string => storage.getPublicUrl(path).data.publicUrl;

  const { data: rows, error } = await db
    .from("welkin_bliss_properties")
    .select("*")
    .eq("status", "published")
    .order("name");
  if (error) throw new Error(error.message);
  const properties = rows ?? [];
  if (properties.length === 0) return [];

  const { data: photoRows } = await db
    .from("welkin_bliss_property_photos")
    .select("*")
    .in("property_id", properties.map((p) => p.id))
    .order("sort", { ascending: true });

  const imagesByProperty = new Map<string, PropertyImage[]>();
  for (const photo of photoRows ?? []) {
    const list = imagesByProperty.get(photo.property_id) ?? [];
    list.push({
      src: publicUrl(photo.storage_path),
      alt: photo.alt ?? "",
      width: photo.width,
      height: photo.height,
      variants: photo.variants.map((v) => ({
        url: publicUrl(v.path),
        width: v.width,
        format: v.format as "avif" | "webp",
      })),
    });
    imagesByProperty.set(photo.property_id, list);
  }

  return properties.map((row): Property => {
    const editorial = EDITORIAL.get(row.slug);
    const images = imagesByProperty.get(row.id) ?? [];
    return {
      slug: row.slug,
      name: row.name,
      destinationSlug: row.destination_slug,
      summary: row.summary ?? "",
      description: row.description ?? "",
      sleeps: row.sleeps,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      nightlyPriceCents: row.base_price_cents,
      currency: asCurrency(row.currency),
      rating: editorial?.rating ?? 0,
      reviewCount: editorial?.reviewCount ?? 0,
      lat: row.lat ?? 0,
      lng: row.lng ?? 0,
      amenities: editorial?.amenities ?? [],
      reviews: editorial?.reviews ?? [],
      gradient: editorial?.gradient ?? gradientFor(row.destination_slug),
      photoCount: images.length || (editorial?.photoCount ?? 0),
      ...(images.length > 0 ? { images } : {}),
    };
  });
}

const cachedProperties = unstable_cache(
  async (): Promise<readonly Property[]> => {
    const db = createAnonClient();
    return db ? fetchFromSupabase(db) : PROPERTIES;
  },
  ["welkin-bliss-catalogue"],
  { tags: [CATALOGUE_TAG], revalidate: 300 },
);

/** All published properties (Supabase when configured, else the mock catalogue). */
export async function getProperties(): Promise<readonly Property[]> {
  return cachedProperties();
}

export async function getPropertyBySlug(slug: string): Promise<Property | undefined> {
  return (await getProperties()).find((p) => p.slug === slug);
}

export async function getPropertiesInDestination(destinationSlug: string): Promise<readonly Property[]> {
  return (await getProperties()).filter((p) => p.destinationSlug === destinationSlug);
}

// Re-export the editorial geo layer (destinations stay curated).
export { DESTINATIONS, getDestination };
