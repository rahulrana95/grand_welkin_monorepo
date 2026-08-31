/**
 * Typed schema for the WelkinBliss tenant (`welkin_bliss_*`).
 *
 * Hand-authored to mirror `supabase/migrations/0001_welkin_bliss_init.sql`. When the
 * Supabase project is provisioned this file is REGENERATED from the live schema — it
 * is the SSOT for the app's data model (ADR 0002 §1):
 *
 *   supabase gen types typescript --schema public > libs/db/src/types.ts
 *
 * Keep the exported name `Database` so the generated file is a drop-in replacement.
 */

export type UserType = "admin" | "staff" | "viewer";
export type PropertyStatus = "draft" | "published" | "archived";

/** One responsive image variant produced by the async pipeline (ADR 0002 §5). */
export interface PhotoVariant {
  readonly width: number;
  readonly format: string;
  readonly path: string;
}

// Rows are `type` (not `interface`) so they carry an implicit index signature and
// satisfy postgrest's `GenericTable` (`Row extends Record<string, unknown>`).
type UsersRow = {
  id: string;
  auth_id: string | null;
  email: string;
  name: string | null;
  type: UserType;
  created_at: string;
};

type PropertiesRow = {
  id: string;
  slug: string;
  name: string;
  destination_slug: string;
  region: string | null;
  country: string | null;
  country_code: string | null;
  summary: string | null;
  description: string | null;
  sleeps: number;
  bedrooms: number;
  bathrooms: number;
  base_price_cents: number;
  currency: string;
  status: PropertyStatus;
  lat: number | null;
  lng: number | null;
  uplisting_property_id: string | null;
  amenity_keys: string[];
  created_at: string;
  updated_at: string;
};

type PhotosRow = {
  id: string;
  property_id: string;
  storage_path: string;
  alt: string | null;
  sort: number;
  width: number | null;
  height: number | null;
  variants: readonly PhotoVariant[];
  created_at: string;
};

type PricingRow = {
  id: string;
  property_id: string;
  date: string;
  price_cents: number;
};

type BlockedDatesRow = {
  id: string;
  property_id: string;
  date: string;
  reason: string | null;
};

type SiteCopyRow = {
  id: string;
  key: string;
  value: string;
  updated_at: string;
};

/** Insert = row without DB-generated columns; Update = all fields optional. */
type Insert<Row, Generated extends keyof Row> = Omit<Row, Generated> & Partial<Pick<Row, Generated>>;

type Table<Row, Ins, Upd> = {
  Row: Row;
  Insert: Ins;
  Update: Upd;
  /** FK relationships (postgrest `GenericTable`). None modelled by hand. */
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      welkin_bliss_users: Table<UsersRow, Insert<UsersRow, "id" | "created_at" | "type">, Partial<UsersRow>>;
      welkin_bliss_properties: Table<
        PropertiesRow,
        Insert<PropertiesRow, "id" | "created_at" | "updated_at" | "lat" | "lng" | "amenity_keys">,
        Partial<PropertiesRow>
      >;
      welkin_bliss_property_photos: Table<PhotosRow, Insert<PhotosRow, "id" | "created_at">, Partial<PhotosRow>>;
      welkin_bliss_property_pricing: Table<PricingRow, Insert<PricingRow, "id">, Partial<PricingRow>>;
      welkin_bliss_blocked_dates: Table<
        BlockedDatesRow,
        Insert<BlockedDatesRow, "id" | "reason">,
        Partial<BlockedDatesRow>
      >;
      welkin_bliss_site_copy: Table<SiteCopyRow, Insert<SiteCopyRow, "id" | "updated_at">, Partial<SiteCopyRow>>;
    };
    Views: Record<string, never>;
    Functions: {
      welkin_bliss_is_staff: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      welkin_bliss_user_type: UserType;
      welkin_bliss_property_status: PropertyStatus;
    };
  };
}
