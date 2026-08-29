import type { Amenity, Destination, Property } from "./types";

/**
 * Mock catalogue so the app renders standalone (no backend). In production this
 * layer is replaced by the PMS/CMS via the generated `@acme/proto-ts` client;
 * page components keep the same shape. Owned/operated model → every home here is
 * one we care for directly.
 */

const AMENITIES = {
  pool: { label: "Private infinity pool", schemaName: "Private pool" },
  ac: { label: "Air conditioning", schemaName: "Air conditioning" },
  wifi: { label: "Fast Wi-Fi", schemaName: "Wi-Fi" },
  chef: { label: "Chef service", schemaName: "Chef service" },
  fireplace: { label: "Fireplace", schemaName: "Fireplace" },
  hottub: { label: "Hot tub", schemaName: "Hot tub" },
  pet: { label: "Pet-friendly", schemaName: "Pet-friendly" },
  sauna: { label: "Cedar sauna", schemaName: "Sauna" },
  ev: { label: "EV charger", schemaName: "EV charger" },
} satisfies Record<string, Amenity>;

export const DESTINATIONS: readonly Destination[] = [
  {
    slug: "amalfi-coast",
    name: "Amalfi Coast",
    region: "Campania",
    country: "Italy",
    countryCode: "IT",
    theme: "coastal",
    tagline: "Cliffside light over the Tyrrhenian",
    summary:
      "The Amalfi Coast is a string of cliff-clinging villages above the Tyrrhenian Sea in southern Italy. WelkinBliss keeps a handful of sea-view homes here for slow mornings, lemon groves, and long golden evenings.",
    bestTime: "May–June and September for warm sea and thinner crowds.",
    gradient: ["#2F6D7F", "#E3BA38"],
  },
  {
    slug: "aspen-snowmass",
    name: "Aspen Snowmass",
    region: "Colorado",
    country: "United States",
    countryCode: "US",
    theme: "mountain",
    tagline: "Quiet peaks and clear alpine air",
    summary:
      "Aspen Snowmass sits in the Elk Mountains of Colorado, wrapped in aspen groves and ski terrain. Our homes here are built for firelit evenings and first-light air, ski-in in winter and wildflower trails in summer.",
    bestTime: "Dec–Mar for snow; Jul–Sep for hiking and cool nights.",
    gradient: ["#2F6D7F", "#4A9DB0"],
  },
  {
    slug: "santorini",
    name: "Santorini",
    region: "Cyclades",
    country: "Greece",
    countryCode: "GR",
    theme: "coastal",
    tagline: "Caldera views and whitewashed calm",
    summary:
      "Santorini is a caldera island in the Greek Cyclades, known for whitewashed cliffs and sweeping sunsets. WelkinBliss cave-houses here face the water for a stay that is equal parts serene and sun-soaked.",
    bestTime: "Late Apr–early Jun and Sep–Oct for calm weather.",
    gradient: ["#4A9DB0", "#E3BA38"],
  },
];

export const PROPERTIES: readonly Property[] = [
  {
    slug: "villa-serena",
    name: "Villa Serena",
    destinationSlug: "amalfi-coast",
    summary:
      "A five-bedroom cliffside villa above Positano with a private infinity pool and full sea views.",
    description:
      "Villa Serena is a five-bedroom cliffside home above Positano on the Amalfi Coast. A private infinity pool runs to the edge of the terrace, chef service is included, and every room opens to the Tyrrhenian Sea. WelkinBliss owns and maintains the home to a hotel-grade standard with a 24/7 concierge.",
    sleeps: 10,
    bedrooms: 5,
    bathrooms: 6,
    nightlyPriceCents: 245000,
    currency: "EUR",
    rating: 4.9,
    reviewCount: 128,
    lat: 40.62817,
    lng: 14.4837,
    amenities: [AMENITIES.pool, AMENITIES.ac, AMENITIES.chef, AMENITIES.wifi, AMENITIES.ev],
    reviews: [
      { author: "Amara K.", date: "2026-07-14", rating: 5, body: "Impeccable service and the most breathtaking pool we've ever stayed at." },
      { author: "Daniel R.", date: "2026-06-02", rating: 5, body: "Woke to the sea every morning. The concierge thought of everything." },
    ],
    gradient: ["#2F6D7F", "#E3BA38"],
    photoCount: 24,
  },
  {
    slug: "aspen-hearth-lodge",
    name: "Hearth Lodge",
    destinationSlug: "aspen-snowmass",
    summary:
      "A four-bedroom timber lodge with ski-in access, a stone fireplace, and a cedar sauna.",
    description:
      "Hearth Lodge is a four-bedroom timber home in Aspen Snowmass with ski-in access, a double-height stone fireplace, and a cedar sauna. Built for firelit evenings and first-light air, it is owned and cared for by WelkinBliss with 24/7 support.",
    sleeps: 8,
    bedrooms: 4,
    bathrooms: 4,
    nightlyPriceCents: 189000,
    currency: "USD",
    rating: 4.8,
    reviewCount: 96,
    lat: 39.2084,
    lng: -106.9498,
    amenities: [AMENITIES.fireplace, AMENITIES.sauna, AMENITIES.hottub, AMENITIES.wifi, AMENITIES.pet],
    reviews: [
      { author: "Priya S.", date: "2026-02-20", rating: 5, body: "Ski-in, ski-out and the sauna after was heaven. Spotless." },
      { author: "Marcus T.", date: "2026-01-11", rating: 4, body: "Cosy and beautifully kept. The fireplace is the heart of the house." },
    ],
    gradient: ["#2F6D7F", "#4A9DB0"],
    photoCount: 19,
  },
  {
    slug: "caldera-house",
    name: "Caldera House",
    destinationSlug: "santorini",
    summary:
      "A three-bedroom cave-house on the caldera with a plunge pool and sunset terrace.",
    description:
      "Caldera House is a three-bedroom cave-house carved into the Santorini caldera, with a private plunge pool and a west-facing terrace made for the sunset. WelkinBliss keeps the home to a hotel-grade standard with a 24/7 concierge.",
    sleeps: 6,
    bedrooms: 3,
    bathrooms: 3,
    nightlyPriceCents: 156000,
    currency: "EUR",
    rating: 4.9,
    reviewCount: 74,
    lat: 36.4618,
    lng: 25.3753,
    amenities: [AMENITIES.pool, AMENITIES.ac, AMENITIES.wifi, AMENITIES.chef],
    reviews: [
      { author: "Lena M.", date: "2026-06-28", rating: 5, body: "The sunset from the terrace is unreal. Every detail considered." },
    ],
    gradient: ["#4A9DB0", "#E3BA38"],
    photoCount: 21,
  },
];

export const getDestination = (slug: string): Destination | undefined =>
  DESTINATIONS.find((d) => d.slug === slug);

export const getProperty = (slug: string): Property | undefined =>
  PROPERTIES.find((p) => p.slug === slug);

export const propertiesInDestination = (destinationSlug: string): readonly Property[] =>
  PROPERTIES.filter((p) => p.destinationSlug === destinationSlug);
