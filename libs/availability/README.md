# @welkinbliss/availability

Per-property availability behind a small interface, so apps depend on a contract —
not on Uplisting. Ship with the **mock**, flip an env var to the **real** client later.

```ts
import { createAvailabilityProvider, mergeOverrides } from "@welkinbliss/availability";

const provider = createAvailabilityProvider();               // mock, or Uplisting if configured
const days = await provider.getAvailability(id, from, to);   // per-date status + price
const final = mergeOverrides(days, { blocked, priceCentsByDate }); // apply admin overrides
```

- `AvailabilityProvider` — `getAvailability(propertyId, from, to) => DayAvailability[]`.
- `MockAvailabilityProvider` — deterministic (hash of property+date), for dev/tests/screenshots.
- `UplistingAvailabilityProvider` — real client (base `connect.uplisting.io`, HTTP Basic,
  Calendar + Bookings). **Exact paths/fields are partner-gated/UNVERIFIED** — confirm against
  Uplisting's Postman collection and adjust the two mapping spots. See ADR 0002 §4.
- `mergeOverrides` — subtract admin-blocked dates, apply admin per-date prices.

**Env:** `AVAILABILITY_SOURCE=mock|uplisting`, `UPLISTING_API_KEY`, optional `UPLISTING_BASE_URL`.
Cache reads and invalidate via an Uplisting webhook → `revalidateTag('availability:<id>')`.
