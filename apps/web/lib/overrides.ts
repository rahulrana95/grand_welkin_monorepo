import "server-only";
import { createServiceClient } from "@welkinbliss/db";
import type { AdminOverrides } from "@welkinbliss/availability";

/**
 * Admin-owned availability overrides for a public property, read from Supabase:
 * blocked dates (forced unavailable) and per-date price overrides. These are merged
 * on top of the Uplisting/mock availability (`mergeOverrides`) so the public calendar
 * reflects what the admin set. Returns empty overrides when Supabase is unconfigured.
 */
export async function getAdminOverrides(slug: string, from: string, to: string): Promise<AdminOverrides> {
  const db = createServiceClient();
  if (!db) return {};

  const { data: property } = await db
    .from("welkin_bliss_properties")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!property) return {};

  const [blockedRes, pricingRes] = await Promise.all([
    db
      .from("welkin_bliss_blocked_dates")
      .select("date")
      .eq("property_id", property.id)
      .gte("date", from)
      .lte("date", to),
    db
      .from("welkin_bliss_property_pricing")
      .select("date, price_cents")
      .eq("property_id", property.id)
      .gte("date", from)
      .lte("date", to),
  ]);

  const blocked = new Set((blockedRes.data ?? []).map((r) => r.date));
  const priceCentsByDate = new Map((pricingRes.data ?? []).map((r) => [r.date, r.price_cents]));
  return { blocked, priceCentsByDate };
}
