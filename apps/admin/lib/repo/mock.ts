import type { AdminProperty, PropertyInput, Repo, SiteCopy } from "./types";

/** In-memory store, stashed on globalThis so it survives HMR / route invocations
 *  within a server instance. Not durable — replaced by the Supabase repo (ADR 0002). */
interface Store {
  properties: Map<string, AdminProperty>;
  pricing: Map<string, Map<string, number>>; // propertyId -> (date -> cents)
  blocked: Map<string, Set<string>>; // propertyId -> dates
  siteCopy: Map<string, SiteCopy>;
}

const g = globalThis as unknown as { __wbAdminStore?: Store };

function seed(): Store {
  const now = new Date().toISOString();
  const properties = new Map<string, AdminProperty>();
  const mk = (p: Omit<AdminProperty, "photos">): AdminProperty => ({ ...p, photos: [] });
  for (const p of [
    mk({ id: "villa-serena", slug: "villa-serena", name: "Villa Serena", destinationSlug: "amalfi-coast", region: "Campania", country: "Italy", countryCode: "IT", summary: "Cliffside villa with a private infinity pool above Positano.", description: "Five-bedroom cliffside home with chef service and sea views.", sleeps: 10, bedrooms: 5, bathrooms: 6, basePriceCents: 245000, currency: "EUR", status: "published", uplistingPropertyId: null }),
    mk({ id: "aspen-hearth-lodge", slug: "aspen-hearth-lodge", name: "Hearth Lodge", destinationSlug: "aspen-snowmass", region: "Colorado", country: "United States", countryCode: "US", summary: "Ski-in timber lodge with a stone fireplace and cedar sauna.", description: "Four-bedroom home built for firelit evenings and first-light air.", sleeps: 8, bedrooms: 4, bathrooms: 4, basePriceCents: 189000, currency: "USD", status: "draft", uplistingPropertyId: null }),
  ]) properties.set(p.id, p);

  const siteCopy = new Map<string, SiteCopy>();
  for (const [key, value] of [
    ["home.hero.tagline", "Your calm above it all"],
    ["home.hero.subhead", "A small collection of serene, light-filled homes — owned and cared for by WelkinBliss."],
    ["footer.promise", "A WelkinBliss concierge confirms every stay."],
  ] as const) siteCopy.set(key, { key, value, updatedAt: now });

  return { properties, pricing: new Map(), blocked: new Map(), siteCopy };
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

export class MockRepo implements Repo {
  async listProperties() {
    return [...store.properties.values()].sort((a, b) => a.name.localeCompare(b.name));
  }
  async getProperty(id: string) {
    return store.properties.get(id) ?? null;
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

  async listSiteCopy() {
    return [...store.siteCopy.values()].sort((a, b) => a.key.localeCompare(b.key));
  }
  async updateSiteCopy(key: string, value: string) {
    store.siteCopy.set(key, { key, value, updatedAt: new Date().toISOString() });
  }
}
