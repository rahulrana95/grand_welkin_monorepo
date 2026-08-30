export * from "./types";
export { eachDate, toISO } from "./dates";
export { MockAvailabilityProvider } from "./mock";
export { UplistingAvailabilityProvider } from "./uplisting";

import { MockAvailabilityProvider } from "./mock";
import { UplistingAvailabilityProvider } from "./uplisting";
import type { AvailabilityProvider, DayAvailability } from "./types";

/** Pick the provider from env: real Uplisting when configured, else the mock. */
export function createAvailabilityProvider(): AvailabilityProvider {
  const key = process.env.UPLISTING_API_KEY;
  if (process.env.AVAILABILITY_SOURCE === "uplisting" && key) {
    return new UplistingAvailabilityProvider(key);
  }
  return new MockAvailabilityProvider();
}

/** Admin-owned overrides (from welkin_bliss_blocked_dates / _property_pricing). */
export interface AdminOverrides {
  /** Dates the admin has blocked → forced unavailable. */
  readonly blocked?: ReadonlySet<string>;
  /** Per-date price overrides (minor units) → win over the provider's price. */
  readonly priceCentsByDate?: ReadonlyMap<string, number>;
}

/**
 * Final public availability = provider availability, minus admin-blocked dates,
 * with admin per-date prices applied. This is what the property page renders.
 */
export function mergeOverrides(
  days: readonly DayAvailability[],
  overrides: AdminOverrides = {},
): DayAvailability[] {
  const { blocked, priceCentsByDate } = overrides;
  return days.map((day) => {
    if (blocked?.has(day.date)) {
      return { date: day.date, status: "blocked" };
    }
    if (day.status === "available") {
      const override = priceCentsByDate?.get(day.date);
      if (override !== undefined) return { ...day, priceCents: override };
    }
    return day;
  });
}
