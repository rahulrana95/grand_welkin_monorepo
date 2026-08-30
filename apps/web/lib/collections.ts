import { DESTINATIONS, PROPERTIES, getDestination } from "./data";
import type { Destination, Property } from "./types";

/**
 * Collections — the "theme/experience" taxonomy. Crossed with destinations (geo)
 * they form the (geo × theme) landing-page matrix that carpets the long-tail
 * (see docs/welkinbliss/01-reference-teardowns.md — Marriott's organic engine).
 */
export interface Collection {
  readonly slug: string;
  readonly title: string;
  readonly kicker: string;
  /** Answer-first, self-contained intro (GEO/AEO — docs 03). */
  readonly summary: string;
  readonly gradient: readonly [string, string];
  readonly match: (property: Property, destination: Destination) => boolean;
}

const hasAmenity = (property: Property, schemaName: string): boolean =>
  property.amenities.some((a) => a.schemaName === schemaName);

export const COLLECTIONS: readonly Collection[] = [
  {
    slug: "coastal",
    title: "Coastal homes",
    kicker: "Sea air & slow mornings",
    summary:
      "WelkinBliss coastal homes sit above the water — cliffside villas and cave-houses for sea breeze, long light, and mornings that start with the tide. Every home is one we own and care for.",
    gradient: ["#2F6D7F", "#E3BA38"],
    match: (_p, d) => d.theme === "coastal",
  },
  {
    slug: "mountain",
    title: "Mountain retreats",
    kicker: "Clear air & quiet peaks",
    summary:
      "WelkinBliss mountain retreats are built for firelit evenings and first-light air — timber homes wrapped in alpine calm, ski terrain in winter and wildflower trails in summer.",
    gradient: ["#2F6D7F", "#4A9DB0"],
    match: (_p, d) => d.theme === "mountain",
  },
  {
    slug: "poolside",
    title: "Homes with a pool",
    kicker: "Private water, all yours",
    summary:
      "These WelkinBliss homes have a private pool — infinity edges over the sea or a quiet plunge to end the day. Book the whole home; the water is yours alone.",
    gradient: ["#4A9DB0", "#E3BA38"],
    match: (p) => hasAmenity(p, "Private pool"),
  },
  {
    slug: "chef-service",
    title: "Chef-service stays",
    kicker: "Dinner, handled",
    summary:
      "At these WelkinBliss homes a private chef is part of the stay — market-fresh dinners at your table, no reservations, no rush. Calm hospitality, hotel-grade.",
    gradient: ["#E3BA38", "#2F6D7F"],
    match: (p) => hasAmenity(p, "Chef service"),
  },
  {
    slug: "pet-friendly",
    title: "Pet-friendly homes",
    kicker: "Bring the whole family",
    summary:
      "WelkinBliss pet-friendly homes welcome dogs — room to roam, trails from the door, and a calm place for everyone to land. Confirm details with your concierge.",
    gradient: ["#4A9DB0", "#2F6D7F"],
    match: (p) => hasAmenity(p, "Pet-friendly"),
  },
];

export const getCollection = (slug: string): Collection | undefined =>
  COLLECTIONS.find((c) => c.slug === slug);

const destinationOf = (property: Property): Destination | undefined =>
  getDestination(property.destinationSlug);

export const propertiesInCollection = (slug: string): readonly Property[] => {
  const collection = getCollection(slug);
  if (!collection) return [];
  return PROPERTIES.filter((p) => {
    const d = destinationOf(p);
    return d !== undefined && collection.match(p, d);
  });
};

export const propertiesInCollectionAndDestination = (
  collectionSlug: string,
  destinationSlug: string,
): readonly Property[] =>
  propertiesInCollection(collectionSlug).filter((p) => p.destinationSlug === destinationSlug);

/** Destinations that have at least one property in the collection. */
export const destinationsInCollection = (slug: string): readonly Destination[] => {
  const slugs = new Set(propertiesInCollection(slug).map((p) => p.destinationSlug));
  return DESTINATIONS.filter((d) => slugs.has(d.slug));
};

/** Collections that have at least one property in the destination. */
export const collectionsForDestination = (destinationSlug: string): readonly Collection[] =>
  COLLECTIONS.filter((c) =>
    propertiesInCollection(c.slug).some((p) => p.destinationSlug === destinationSlug),
  );

/** Every geo × theme combo that actually has inventory — drives generateStaticParams. */
export const validIntersections = (): readonly { collection: string; destination: string }[] =>
  COLLECTIONS.flatMap((c) =>
    destinationsInCollection(c.slug).map((d) => ({ collection: c.slug, destination: d.slug })),
  );
