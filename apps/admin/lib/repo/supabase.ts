import "server-only";
import { PHOTOS_BUCKET, type Database, type WelkinDbClient } from "@welkinbliss/db";
import type { AdminProperty, PropertyInput, PropertyPhoto, Repo, SiteCopy } from "./types";

type Tables = Database["public"]["Tables"];
type PropertyRow = Tables["welkin_bliss_properties"]["Row"];
type PhotoRow = Tables["welkin_bliss_property_photos"]["Row"];

const eachDate = (from: string, to: string): string[] => {
  const out: string[] = [];
  const end = new Date(`${to}T00:00:00Z`);
  for (let d = new Date(`${from}T00:00:00Z`); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
};

/**
 * Supabase-backed repository (ADR 0002 §1). Runs with the **service-role** client —
 * the admin app is already gated to admin/staff, and service role bypasses RLS so
 * staff can manage every tenant row. Domain `id` is the property's uuid PK.
 */
export class SupabaseRepo implements Repo {
  constructor(private readonly db: WelkinDbClient) {}

  private toPhoto = (row: PhotoRow): PropertyPhoto => ({
    id: row.id,
    url: this.db.storage.from(PHOTOS_BUCKET).getPublicUrl(row.storage_path).data.publicUrl,
    alt: row.alt ?? "",
    sort: row.sort,
  });

  private toProperty = (row: PropertyRow, photos: readonly PhotoRow[]): AdminProperty => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    destinationSlug: row.destination_slug,
    region: row.region ?? "",
    country: row.country ?? "",
    countryCode: row.country_code ?? "",
    summary: row.summary ?? "",
    description: row.description ?? "",
    sleeps: row.sleeps,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    basePriceCents: row.base_price_cents,
    currency: row.currency,
    status: row.status,
    uplistingPropertyId: row.uplisting_property_id,
    photos: [...photos].sort((a, b) => a.sort - b.sort).map(this.toPhoto),
  });

  private toRow(input: PropertyInput): Tables["welkin_bliss_properties"]["Insert"] {
    return {
      slug: input.slug,
      name: input.name,
      destination_slug: input.destinationSlug,
      region: input.region,
      country: input.country,
      country_code: input.countryCode,
      summary: input.summary,
      description: input.description,
      sleeps: input.sleeps,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      base_price_cents: input.basePriceCents,
      currency: input.currency,
      status: input.status,
      uplisting_property_id: input.uplistingPropertyId,
    };
  }

  /** Photos grouped by property id, for the given property ids. */
  private async photosByProperty(ids: readonly string[]): Promise<Map<string, PhotoRow[]>> {
    const grouped = new Map<string, PhotoRow[]>();
    if (ids.length === 0) return grouped;
    const { data, error } = await this.db
      .from("welkin_bliss_property_photos")
      .select("*")
      .in("property_id", ids as string[]);
    if (error) throw new Error(error.message);
    for (const photo of data ?? []) {
      const list = grouped.get(photo.property_id) ?? [];
      list.push(photo);
      grouped.set(photo.property_id, list);
    }
    return grouped;
  }

  async listProperties(): Promise<readonly AdminProperty[]> {
    const { data, error } = await this.db.from("welkin_bliss_properties").select("*").order("name");
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    const photos = await this.photosByProperty(rows.map((r) => r.id));
    return rows.map((row) => this.toProperty(row, photos.get(row.id) ?? []));
  }

  async getProperty(id: string): Promise<AdminProperty | null> {
    const { data, error } = await this.db
      .from("welkin_bliss_properties")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    const photos = await this.photosByProperty([id]);
    return this.toProperty(data, photos.get(id) ?? []);
  }

  async createProperty(input: PropertyInput): Promise<AdminProperty> {
    const { data, error } = await this.db
      .from("welkin_bliss_properties")
      .insert(this.toRow(input))
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return this.toProperty(data, []);
  }

  async updateProperty(id: string, patch: Partial<PropertyInput>): Promise<AdminProperty> {
    const current = await this.getProperty(id);
    if (!current) throw new Error(`No property ${id}`);
    const { id: _id, photos: _photos, ...merged } = { ...current, ...patch };
    const { error } = await this.db
      .from("welkin_bliss_properties")
      .update({ ...this.toRow(merged), updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
    const updated = await this.getProperty(id);
    if (!updated) throw new Error(`No property ${id}`);
    return updated;
  }

  async getPricing(propertyId: string): Promise<ReadonlyMap<string, number>> {
    const { data, error } = await this.db
      .from("welkin_bliss_property_pricing")
      .select("date, price_cents")
      .eq("property_id", propertyId);
    if (error) throw new Error(error.message);
    return new Map((data ?? []).map((r) => [r.date, r.price_cents]));
  }

  async setPriceRange(propertyId: string, from: string, to: string, priceCents: number): Promise<void> {
    const rows = eachDate(from, to).map((date) => ({ property_id: propertyId, date, price_cents: priceCents }));
    const { error } = await this.db
      .from("welkin_bliss_property_pricing")
      .upsert(rows, { onConflict: "property_id,date" });
    if (error) throw new Error(error.message);
  }

  async clearPrice(propertyId: string, date: string): Promise<void> {
    const { error } = await this.db
      .from("welkin_bliss_property_pricing")
      .delete()
      .eq("property_id", propertyId)
      .eq("date", date);
    if (error) throw new Error(error.message);
  }

  async getBlocked(propertyId: string): Promise<ReadonlySet<string>> {
    const { data, error } = await this.db
      .from("welkin_bliss_blocked_dates")
      .select("date")
      .eq("property_id", propertyId);
    if (error) throw new Error(error.message);
    return new Set((data ?? []).map((r) => r.date));
  }

  async toggleBlocked(propertyId: string, date: string): Promise<void> {
    const { data, error } = await this.db
      .from("welkin_bliss_blocked_dates")
      .select("id")
      .eq("property_id", propertyId)
      .eq("date", date)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (data) {
      const { error: delErr } = await this.db.from("welkin_bliss_blocked_dates").delete().eq("id", data.id);
      if (delErr) throw new Error(delErr.message);
    } else {
      const { error: insErr } = await this.db
        .from("welkin_bliss_blocked_dates")
        .insert({ property_id: propertyId, date });
      if (insErr) throw new Error(insErr.message);
    }
  }

  async listSiteCopy(): Promise<readonly SiteCopy[]> {
    const { data, error } = await this.db
      .from("welkin_bliss_site_copy")
      .select("key, value, updated_at")
      .order("key");
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({ key: r.key, value: r.value, updatedAt: r.updated_at }));
  }

  async updateSiteCopy(key: string, value: string): Promise<void> {
    const { error } = await this.db
      .from("welkin_bliss_site_copy")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) throw new Error(error.message);
  }
}
