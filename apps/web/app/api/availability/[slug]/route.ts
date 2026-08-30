import { NextResponse } from "next/server";
import {
  MockAvailabilityProvider,
  UplistingAvailabilityProvider,
  mergeOverrides,
} from "@welkinbliss/availability";
import { getProperty } from "@/lib/data";
import { getAdminOverrides } from "@/lib/overrides";

const addDays = (iso: string, days: number): string => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/**
 * Per-property availability for a date range. Sourced from the availability
 * provider (Uplisting when configured, else a deterministic mock), then merged
 * with admin overrides (blocked dates / per-date prices) read from Supabase when
 * configured (ADR 0002).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const property = getProperty(slug);
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = new URL(request.url);
  const today = new Date().toISOString().slice(0, 10);
  const from = url.searchParams.get("from") ?? today;
  const to = url.searchParams.get("to") ?? addDays(from, 60);

  const useUplisting =
    process.env.AVAILABILITY_SOURCE === "uplisting" && !!process.env.UPLISTING_API_KEY;
  const provider = useUplisting
    ? new UplistingAvailabilityProvider(process.env.UPLISTING_API_KEY!)
    : new MockAvailabilityProvider(property.nightlyPriceCents, property.currency);

  const days = await provider.getAvailability(property.slug, from, to);

  // Admin overrides from welkin_bliss_blocked_dates / _property_pricing (empty
  // without Supabase). Final availability = provider − blocked, admin prices applied.
  const overrides = await getAdminOverrides(property.slug, from, to);
  const merged = mergeOverrides(days, overrides);

  return NextResponse.json({ propertySlug: slug, from, to, days: merged });
}
