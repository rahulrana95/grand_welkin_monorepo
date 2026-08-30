# ADR 0002 — Multi-tenant backend, admin panel, WhatsApp booking & Uplisting availability

- **Status:** Accepted
- **Date:** 2026-08-30
- **Context:** The monorepo hosts **many independently-deployable frontend apps** (Welkin
  Bliss web, an admin panel, future Welkin Grand web, …). They share **one backend**.
  We need an admin panel to manage properties/photos/pricing/blocked-dates/site-copy,
  public visitors who **book via WhatsApp** (not on-site), and **availability sourced
  from Uplisting** per property.

## Decisions

### 1. Supabase is the single shared backend, multi-tenant
- **Supabase** (Postgres + Auth + Storage) is the one backend all frontend apps talk to.
- **Tenancy = table-prefix per tenant.** Welkin Bliss tables are prefixed **`welkin_bliss_`**;
  a future Welkin Grand tenant gets `welkin_grand_`. This keeps one Supabase project while
  isolating each brand's data, and satisfies the "prefix tables with `welkin_bliss`"
  requirement. (A `tenant` column + Row-Level-Security is the alternative if we later want
  shared tables; documented but not chosen now.)
- Migrations live in [`supabase/migrations/`](../../supabase/migrations/); TS types are
  generated from the schema (`supabase gen types typescript`) — the DB schema is the SSOT
  for the app's data model. (Cross-language/service contracts still go through proto per
  ADR 0001 when a separate backend service appears.)

### 2. Auth & roles
- `welkin_bliss_users` carries a **`type`** (`admin` | `staff` | `viewer`). **Only `admin`/`staff`
  may access the admin app.** Auth uses **Supabase Auth**; the admin app gates every route on
  an authenticated user whose `type` is privileged (middleware + RLS).
- Public visitors are **not** users — they browse and are handed off to WhatsApp.

### 3. Public booking → WhatsApp (no on-site checkout)
- The public property page shows **availability** and a **"Book on WhatsApp"** CTA that
  deep-links `https://wa.me/<number>` with a prefilled message (property, dates, guests).
- No payment/checkout is built. This is deliberate — bookings are concierge-handled.

### 4. Availability → Uplisting (adapter + mock now)
- Availability is fetched from **Uplisting** (PMS) per property via an **adapter interface**
  (`AvailabilityProvider`), with a **mock** implementation now and the real client wired via
  env (`AVAILABILITY_SOURCE`, `UPLISTING_API_KEY`) later. See
  [`libs/availability`](../../libs/availability/).
- Uplisting facts (researched; some paths partner-gated/unverified): base
  `https://connect.uplisting.io`, **HTTP Basic** with `base64(api_key)`, a **Calendar**
  endpoint returning per-date availability + price + restrictions, a **Bookings** endpoint to
  distinguish booked-vs-blocked, and **webhooks** for near-real-time cache invalidation
  (→ `revalidateTag`). API access is invite-only (email support@uplisting.io).
- **Final public availability** = Uplisting availability **minus** our admin-set
  **blocked dates**, using our admin-set **per-date price** where present (else base price).

### 5. Photos → Supabase Storage + async multi-size pipeline
- Uploaded photos go to **Supabase Storage**. An **async image service** generates responsive
  variants (multiple widths × AVIF/WebP) so the client can request the size that fits its
  bandwidth/viewport. Variants are recorded on `welkin_bliss_property_photos.variants` (JSONB).
  Implemented with `sharp`, triggered on upload (Edge Function / queue). Public pages serve
  via `next/image` + `srcset` from the variant set.

## Data model (`welkin_bliss_*`)
`welkin_bliss_users` (id, email, name, **type**, created_at) ·
`welkin_bliss_properties` (id, slug, name, destination fields, summary, description, sleeps,
bedrooms, bathrooms, base_price_cents, currency, status, lat, lng, **uplisting_property_id**,
timestamps) ·
`welkin_bliss_property_photos` (id, property_id, storage_path, alt, sort, width, height,
**variants** jsonb) ·
`welkin_bliss_property_pricing` (id, property_id, **date**, price_cents; unique(property_id,date)) ·
`welkin_bliss_blocked_dates` (id, property_id, **date**, reason; unique(property_id,date)) ·
`welkin_bliss_site_copy` (id, **key**, value, updated_at).

## Consequences
- **Positive:** one backend for every brand; brand data isolated by prefix; admin owns
  pricing/blocking/copy; availability stays truthful via Uplisting; booking is low-friction
  (WhatsApp); images are bandwidth-adaptive.
- **Negative / mitigations:** table-prefix tenancy duplicates DDL per tenant → generate it
  from one template. Uplisting API is partner-gated → adapter + mock keeps us unblocked.
  Runtime pieces (Supabase Auth/DB/Storage, sharp) need real credentials → the app is built
  against **interfaces with mock implementations** so it runs/verifies without them.

## Phased delivery
1. **This PR:** ADR + schema (`supabase/migrations`), Uplisting availability adapter
   (`libs/availability`), public **WhatsApp booking + availability calendar**.
2. **Next:** `apps/admin` app (properties CRUD, per-date pricing with copy-to-range, block
   dates, site-copy editor) against repository interfaces + mock.
3. **This PR:** wire Supabase against the hosted project — env-gated typed clients
   ([`@welkinbliss/db`](../../libs/db/)), a Supabase-backed admin repository + Supabase
   Auth (admin/staff only), and admin blocked-dates / per-date prices merged into the
   public availability calendar. All behind `hasSupabase()` with the mocks as the
   fallback, so the monorepo builds and its visual tests pass without credentials.
4. **Editable site copy (done):** the public site reads `welkin_bliss_site_copy`
   (Supabase over defaults, cached + tagged) for the home hero and footer; the admin
   triggers on-demand revalidation (`/api/revalidate`) after an edit.
5. **Then:** photo upload UI + the async `sharp` image variant pipeline, and the real
   Uplisting client + webhook `revalidateTag`.
