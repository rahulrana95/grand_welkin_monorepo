import { eachDate, hash } from "./dates";
import type { AvailabilityProvider, DayAvailability } from "./types";

/**
 * Deterministic mock — status/price derived from a stable hash of (propertyId, date),
 * so SSR, tests, and screenshots are reproducible. Roughly: weekends & a slice of
 * dates read as booked, a few as blocked, the rest available with a price that flexes
 * around a base and rises on weekends.
 */
export class MockAvailabilityProvider implements AvailabilityProvider {
  constructor(private readonly baseCents = 24500, private readonly currency = "EUR") {}

  async getAvailability(propertyId: string, from: string, to: string): Promise<readonly DayAvailability[]> {
    return eachDate(from, to).map((date) => {
      const r = hash(`${propertyId}:${date}`);
      const weekend = [0, 6].includes(new Date(`${date}T00:00:00Z`).getUTCDay());

      if (r < 0.06) return { date, status: "blocked" as const };
      if (r < (weekend ? 0.5 : 0.22)) return { date, status: "booked" as const };

      const flex = 1 + (r - 0.5) * 0.5 + (weekend ? 0.15 : 0); // ±~25% + weekend premium
      return {
        date,
        status: "available" as const,
        priceCents: Math.round((this.baseCents * flex) / 100) * 100,
        currency: this.currency,
        minStay: weekend ? 2 : 1,
      };
    });
  }
}
