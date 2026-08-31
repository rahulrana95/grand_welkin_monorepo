import type { AdminProperty, PhotoInput, PropertyInput, PropertyPhoto, Repo, SiteCopy } from "./types";

/** In-memory store, stashed on globalThis so it survives HMR / route invocations
 *  within a server instance. Not durable — replaced by the Supabase repo (ADR 0002). */
interface Store {
  properties: Map<string, AdminProperty>;
  pricing: Map<string, Map<string, number>>; // propertyId -> (date -> cents)
  blocked: Map<string, Set<string>>; // propertyId -> dates
  photos: Map<string, PropertyPhoto[]>; // propertyId -> photos (ordered by sort)
  siteCopy: Map<string, SiteCopy>;
}

const g = globalThis as unknown as { __wbAdminStore?: Store };

function seed(): Store {
  const now = new Date().toISOString();
  const properties = new Map<string, AdminProperty>();
  const mk = (p: Omit<AdminProperty, "photos">): AdminProperty => ({ ...p, photos: [] });
  for (const p of [
    mk({ id: "villa-serena", slug: "villa-serena", name: "Villa Serena", destinationSlug: "amalfi-coast", region: "Campania", country: "Italy", countryCode: "IT", summary: "Cliffside villa with a private infinity pool above Positano.", description: "Five-bedroom cliffside home with chef service and sea views.", sleeps: 10, bedrooms: 5, bathrooms: 6, basePriceCents: 245000, currency: "EUR", status: "published", uplistingPropertyId: null, amenityKeys: ["pool", "chef", "ac", "wifi"] }),
    mk({ id: "aspen-hearth-lodge", slug: "aspen-hearth-lodge", name: "Hearth Lodge", destinationSlug: "aspen-snowmass", region: "Colorado", country: "United States", countryCode: "US", summary: "Ski-in timber lodge with a stone fireplace and cedar sauna.", description: "Four-bedroom home built for firelit evenings and first-light air.", sleeps: 8, bedrooms: 4, bathrooms: 4, basePriceCents: 189000, currency: "USD", status: "draft", uplistingPropertyId: null, amenityKeys: ["fireplace", "sauna", "hottub", "wifi"] }),
  ]) properties.set(p.id, p);

  // A couple of demo photos on the flagship property so the manager renders populated.
  const photos = new Map<string, PropertyPhoto[]>();
  const svg = (label: string, from: string, to: string): string =>
    `data:image/svg+xml;base64,${Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><text x="20" y="160" font-family="sans-serif" font-size="28" fill="#fff">${label}</text></svg>`,
    ).toString("base64")}`;
  photos.set("villa-serena", [
    { id: "photo-1", url: svg("Sea view", "#2F6D7F", "#E3BA38"), alt: "Infinity pool over the sea", sort: 0 },
    { id: "photo-2", url: svg("Terrace", "#4A9DB0", "#2F6D7F"), alt: "Sunset terrace", sort: 1 },
  ]);

  const siteCopy = new Map<string, SiteCopy>();
  for (const [key, value] of [
    ["home.hero.tagline", "Your calm above it all"],
    ["home.hero.subhead", "A small collection of serene, light-filled homes — owned and cared for by WelkinBliss."],
    ["footer.promise", "A WelkinBliss concierge confirms every stay."],
  ] as const) siteCopy.set(key, { key, value, updatedAt: now });

  return { properties, pricing: new Map(), blocked: new Map(), photos, siteCopy };
}

const store: Store = (g.__wbAdminStore ??= seed());

const eachDate = (from: string, to: string): string[] => {
  const out: string[] = [];
  const end = new Date(`${to}T00:00:00Z`);
  for (let d = new Date(`${from}T00:00:00Z`); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
};

const slugify = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const withPhotos = (property: AdminProperty): AdminProperty => {
  const photos = store.photos.get(property.id);
  return photos ? { ...property, photos: [...photos].sort((a, b) => a.sort - b.sort) } : property;
};

export class MockRepo implements Repo {
  async listProperties() {
    return [...store.properties.values()].sort((a, b) => a.name.localeCompare(b.name)).map(withPhotos);
  }
  async getProperty(id: string) {
    const property = store.properties.get(id);
    return property ? withPhotos(property) : null;
  }
  async createProperty(input: PropertyInput) {
    const id = slugify(input.slug || input.name) || crypto.randomUUID();
    const property: AdminProperty = { ...input, id, slug: id, photos: [] };
    store.properties.set(id, property);
    return property;
  }
  async updateProperty(id: string, patch: Partial<PropertyInput>) {
    const current = store.properties.get(id);
    if (!current) throw new Error(`No property ${id}`);
    const next: AdminProperty = { ...current, ...patch };
    store.properties.set(id, next);
    return next;
  }

  async getPricing(propertyId: string) {
    return store.pricing.get(propertyId) ?? new Map<string, number>();
  }
  async setPriceRange(propertyId: string, from: string, to: string, priceCents: number) {
    const map = store.pricing.get(propertyId) ?? new Map<string, number>();
    for (const date of eachDate(from, to)) map.set(date, priceCents);
    store.pricing.set(propertyId, map);
  }
  async clearPrice(propertyId: string, date: string) {
    store.pricing.get(propertyId)?.delete(date);
  }

  async getBlocked(propertyId: string) {
    return store.blocked.get(propertyId) ?? new Set<string>();
  }
  async toggleBlocked(propertyId: string, date: string) {
    const set = store.blocked.get(propertyId) ?? new Set<string>();
    if (set.has(date)) set.delete(date);
    else set.add(date);
    store.blocked.set(propertyId, set);
  }

  async addPhotos(propertyId: string, photos: readonly PhotoInput[]) {
    const list = store.photos.get(propertyId) ?? [];
    let sort = list.reduce((max, p) => Math.max(max, p.sort), -1);
    for (const photo of photos) {
      const base64 = Buffer.from(photo.data).toString("base64");
      list.push({
        id: crypto.randomUUID(),
        url: `data:${photo.contentType};base64,${base64}`,
        alt: photo.alt ?? "",
        sort: ++sort,
      });
    }
    store.photos.set(propertyId, list);
  }
  async deletePhoto(propertyId: string, photoId: string) {
    const list = store.photos.get(propertyId);
    if (list) store.photos.set(propertyId, list.filter((p) => p.id !== photoId));
  }
  async movePhoto(propertyId: string, photoId: string, direction: "up" | "down") {
    const list = [...(store.photos.get(propertyId) ?? [])].sort((a, b) => a.sort - b.sort);
    const i = list.findIndex((p) => p.id === photoId);
    const j = direction === "up" ? i - 1 : i + 1;
    const a = list[i];
    const b = list[j];
    if (!a || !b) return;
    store.photos.set(propertyId, list.map((p) => {
      if (p.id === a.id) return { ...p, sort: b.sort };
      if (p.id === b.id) return { ...p, sort: a.sort };
      return p;
    }));
  }
  async updatePhotoAlt(propertyId: string, photoId: string, alt: string) {
    const list = store.photos.get(propertyId);
    if (list) store.photos.set(propertyId, list.map((p) => (p.id === photoId ? { ...p, alt } : p)));
  }

  async listSiteCopy() {
    return [...store.siteCopy.values()].sort((a, b) => a.key.localeCompare(b.key));
  }
  async updateSiteCopy(key: string, value: string) {
    store.siteCopy.set(key, { key, value, updatedAt: new Date().toISOString() });
  }
}
