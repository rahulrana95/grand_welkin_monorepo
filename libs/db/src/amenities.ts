/**
 * Canonical amenity catalogue (shared by the admin selector and the public site).
 * `key` is what's stored in welkin_bliss_properties.amenity_keys; `schemaName` is the
 * schema.org LocationFeatureSpecification name — keep it stable, structured data and
 * the amenity-based collections match on it.
 */
export interface AmenityDef {
  readonly key: string;
  readonly label: string;
  readonly schemaName: string;
}

export const AMENITIES: readonly AmenityDef[] = [
  { key: "pool", label: "Private infinity pool", schemaName: "Private pool" },
  { key: "ac", label: "Air conditioning", schemaName: "Air conditioning" },
  { key: "wifi", label: "Fast Wi-Fi", schemaName: "Wi-Fi" },
  { key: "chef", label: "Chef service", schemaName: "Chef service" },
  { key: "fireplace", label: "Fireplace", schemaName: "Fireplace" },
  { key: "hottub", label: "Hot tub", schemaName: "Hot tub" },
  { key: "pet", label: "Pet-friendly", schemaName: "Pet-friendly" },
  { key: "sauna", label: "Cedar sauna", schemaName: "Sauna" },
  { key: "ev", label: "EV charger", schemaName: "EV charger" },
];

const BY_KEY = new Map(AMENITIES.map((a) => [a.key, a]));

export const amenityByKey = (key: string): AmenityDef | undefined => BY_KEY.get(key);

/** Valid, de-duplicated, catalogue-ordered subset of the given keys. */
export const resolveAmenityKeys = (keys: readonly string[]): readonly string[] => {
  const wanted = new Set(keys);
  return AMENITIES.filter((a) => wanted.has(a.key)).map((a) => a.key);
};
