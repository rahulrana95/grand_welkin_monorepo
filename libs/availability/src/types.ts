/** Availability contract shared by the public site (and later the admin). */

export type DayStatus = "available" | "booked" | "blocked";

export interface DayAvailability {
  /** ISO date, "YYYY-MM-DD". */
  readonly date: string;
  readonly status: DayStatus;
  /** Nightly price in minor units; present when available. */
  readonly priceCents?: number;
  readonly currency?: string;
  readonly minStay?: number;
}

export interface AvailabilityProvider {
  /**
   * Availability for a property between `from` and `to` (inclusive ISO dates).
   * The provider is the source of truth for booked dates + nightly price;
   * admin-set blocked dates and per-date overrides are merged on top (see `merge`).
   */
  getAvailability(
    propertyId: string,
    from: string,
    to: string,
  ): Promise<readonly DayAvailability[]>;
}
