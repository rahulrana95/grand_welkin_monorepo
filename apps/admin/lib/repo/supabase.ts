import "server-only";
import { PHOTOS_BUCKET, resolveAmenityKeys, type Database, type PhotoVariant, type WelkinDbClient } from "@welkinbliss/db";
import { generateVariants } from "@welkinbliss/images";
import type { AdminProperty, PhotoInput, PropertyInput, PropertyPhoto, Repo, SiteCopy } from "./types";

type Tables = Database["public"]["Tables"];
type PropertyRow = Tables["welkin_bliss_properties"]["Row"];
type PhotoRow = Tables["welkin_bliss_property_photos"]["Row"];

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

const extFor = (contentType: string, filename: string): string =>
  EXT_BY_TYPE[contentType] ?? filename.split(".").pop()?.toLowerCase() ?? "bin";

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
    amenityKeys: resolveAmenityKeys(row.amenity_keys ?? []),
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
      amenity_keys: [...resolveAmenityKeys(input.amenityKeys)],
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

  // ── Photos: Storage + responsive variants (ADR 0002 §5) ────────────────────
  async addPhotos(propertyId: string, photos: readonly PhotoInput[]): Promise<void> {
    const bucket = this.db.storage.from(PHOTOS_BUCKET);
    const { data: last } = await this.db
      .from("welkin_bliss_property_photos")
      .select("sort")
      .eq("property_id", propertyId)
      .order("sort", { ascending: false })
      .limit(1)
      .maybeSingle();
    let sort = last?.sort ?? -1;

    for (const photo of photos) {
      const id = crypto.randomUUID();
      const dir = `${propertyId}/${id}`;
      const original = Buffer.from(photo.data);
      const originalPath = `${dir}/original.${extFor(photo.contentType, photo.filename)}`;

      const { error: upErr } = await bucket.upload(originalPath, original, {
        contentType: photo.contentType,
        upsert: true,
      });
      if (upErr) throw new Error(upErr.message);

      // Variants are best-effort: a decode/encode failure must not lose the upload.
      let variants: PhotoVariant[] = [];
      let width: number | null = null;
      let height: number | null = null;
      try {
        const result = await generateVariants(original);
        width = result.source.width;
        height = result.source.height;
        for (const v of result.variants) {
          const path = `${dir}/${v.width}.${v.format}`;
          const { error } = await bucket.upload(path, v.data, { contentType: v.contentType, upsert: true });
          if (!error) variants.push({ width: v.width, format: v.format, path });
        }
      } catch {
        variants = [];
      }

      const { error: insErr } = await this.db.from("welkin_bliss_property_photos").insert({
        id,
        property_id: propertyId,
        storage_path: originalPath,
        alt: photo.alt ?? null,
        sort: ++sort,
        width,
        height,
        variants,
      });
      if (insErr) throw new Error(insErr.message);
    }
  }

  async deletePhoto(propertyId: string, photoId: string): Promise<void> {
    const { data, error } = await this.db
      .from("welkin_bliss_property_photos")
      .select("storage_path, variants")
      .eq("id", photoId)
      .eq("property_id", propertyId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return;

    const paths = [data.storage_path, ...data.variants.map((v) => v.path)];
    await this.db.storage.from(PHOTOS_BUCKET).remove(paths);
    const { error: delErr } = await this.db.from("welkin_bliss_property_photos").delete().eq("id", photoId);
    if (delErr) throw new Error(delErr.message);
  }

  async movePhoto(propertyId: string, photoId: string, direction: "up" | "down"): Promise<void> {
    const { data, error } = await this.db
      .from("welkin_bliss_property_photos")
      .select("id, sort")
      .eq("property_id", propertyId)
      .order("sort", { ascending: true });
    if (error) throw new Error(error.message);
    const list = data ?? [];
    const i = list.findIndex((p) => p.id === photoId);
    const j = direction === "up" ? i - 1 : i + 1;
    const a = list[i];
    const b = list[j];
    if (!a || !b) return;
    // Swap sort values (two independent updates).
    const r1 = await this.db.from("welkin_bliss_property_photos").update({ sort: b.sort }).eq("id", a.id);
    if (r1.error) throw new Error(r1.error.message);
    const r2 = await this.db.from("welkin_bliss_property_photos").update({ sort: a.sort }).eq("id", b.id);
    if (r2.error) throw new Error(r2.error.message);
  }

  async updatePhotoAlt(propertyId: string, photoId: string, alt: string): Promise<void> {
    const { error } = await this.db
      .from("welkin_bliss_property_photos")
      .update({ alt })
      .eq("id", photoId)
      .eq("property_id", propertyId);
    if (error) throw new Error(error.message);
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
