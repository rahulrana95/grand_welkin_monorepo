import type { AvailabilityProvider, DayAvailability, DayStatus } from "./types";

/**
 * Real Uplisting client. Auth + base URL + the Calendar/Bookings model are researched
 * facts; exact paths/field names are partner-gated and UNVERIFIED — confirm against the
 * Uplisting "[Public]" Postman collection (email support@uplisting.io) and adjust the two
 * mapping spots below. Everything else in the app depends only on `AvailabilityProvider`.
 */
export class UplistingAvailabilityProvider implements AvailabilityProvider {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl = process.env.UPLISTING_BASE_URL ?? "https://connect.uplisting.io",
  ) {}

  private authHeader(): string {
    // Verified: HTTP Basic with base64(api_key).
    return `Basic ${Buffer.from(this.apiKey).toString("base64")}`;
  }

  async getAvailability(propertyId: string, from: string, to: string): Promise<readonly DayAvailability[]> {
    const headers = { Authorization: this.authHeader(), Accept: "application/json" };

    // Calendar: per-date availability + price + restrictions for the range.
    const calRes = await fetch(
      `${this.baseUrl}/calendar/${encodeURIComponent(propertyId)}?from=${from}&to=${to}`,
      { headers },
    );
    if (calRes.status === 429) throw new Error("Uplisting rate limit (429) — back off and retry");
    if (!calRes.ok) throw new Error(`Uplisting calendar ${calRes.status}`);
    const cal = (await calRes.json()) as { data?: readonly Record<string, unknown>[] };

    // Bookings: label unavailable dates as booked (guest reservation) vs blocked (owner).
    const bookedDates = new Set<string>();
    const bkRes = await fetch(
      `${this.baseUrl}/bookings?property_id=${encodeURIComponent(propertyId)}&from=${from}&to=${to}`,
      { headers },
    );
    if (bkRes.ok) {
      const bk = (await bkRes.json()) as { data?: readonly { check_in: string; check_out: string }[] };
      for (const b of bk.data ?? []) {
        for (let d = new Date(`${b.check_in}T00:00:00Z`); d < new Date(`${b.check_out}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
          bookedDates.add(d.toISOString().slice(0, 10));
        }
      }
    }

    // ── mapping (confirm field names against Postman) ──
    return (cal.data ?? []).map((row) => {
      const date = String(row.date);
      const available = Boolean(row.available);
      const status: DayStatus = available ? "available" : bookedDates.has(date) ? "booked" : "blocked";
      // Build with only defined fields (exactOptionalPropertyTypes).
      const day: { date: string; status: DayStatus; priceCents?: number; currency?: string; minStay?: number } = { date, status };
      if (available && row.price != null) day.priceCents = Math.round(Number(row.price) * 100);
      if (available && typeof row.currency === "string") day.currency = row.currency;
      if (row.min_stay != null) day.minStay = Number(row.min_stay);
      return day satisfies DayAvailability;
    });
  }
}
