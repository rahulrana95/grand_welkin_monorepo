# Supabase (WelkinBliss tenant)

The single shared backend for all WelkinBliss frontend apps (multi-tenant; tables
prefixed `welkin_bliss_*` — a future brand gets its own prefix). See
[ADR 0002](../docs/adr/0002-multitenant-backend-and-admin.md).

## Migrations
`migrations/0001_welkin_bliss_init.sql` — schema: users (with admin `type`),
properties, photos (with `variants` for the async image pipeline), per-date
pricing, blocked dates, editable site copy — plus RLS policies.

## Apply
```bash
supabase db push          # or: supabase migration up
# Regenerate the typed schema consumed by the apps (SSOT for the data model):
supabase gen types typescript --schema public > libs/db/src/types.ts
```

## App wiring
The apps talk to Supabase through [`@welkinbliss/db`](../libs/db/) (env-gated typed
clients). When the env below is present the admin uses Supabase Auth + a
Supabase-backed repository and the web app merges admin blocked-dates / per-date
prices into the public availability calendar; when it's absent both fall back to
in-memory mocks so the repo builds and its visual tests pass with no credentials.

Env the apps need (set in Vercel / `.env.local`; see each app's `.env.example` —
**never commit secrets**):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; bypasses RLS)

Photos use the `welkin-bliss-photos` Storage bucket (create it in the project).
Admin/staff sign-in requires a `welkin_bliss_users` row with `auth_id` set to the
Supabase Auth user's id and `type` in (`admin`, `staff`).
