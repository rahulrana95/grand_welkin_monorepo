# Supabase (WelkinBliss tenant)

The single shared backend for all WelkinBliss frontend apps (multi-tenant; tables
prefixed `welkin_bliss_*` — a future brand gets its own prefix). See
[ADR 0002](../docs/adr/0002-multitenant-backend-and-admin.md).

## Migrations
- `migrations/0001_welkin_bliss_init.sql` — schema: users (with admin `type`),
  properties, photos (with `variants` for the async image pipeline), per-date
  pricing, blocked dates, editable site copy — plus RLS policies.
- `migrations/0002_welkin_bliss_storage_and_auth.sql` — the `welkin-bliss-photos`
  Storage bucket + policies, and a trigger that auto-links a Supabase Auth user to
  their pre-seeded `welkin_bliss_users` row on sign-up.
- `seed.sql` — optional sample properties, site copy, and one admin row.

All migrations are **idempotent** — safe to re-run.

## Set up the database (one command)
`setup.sh` applies every migration in order (and optionally the seed) via `psql`.

```bash
# Schema + Storage only:
DATABASE_URL='postgres://…' ./supabase/setup.sh

# …plus sample data and an admin user:
DATABASE_URL='postgres://…' ADMIN_EMAIL='you@example.com' ./supabase/setup.sh --seed
```
Get `DATABASE_URL` from the Supabase dashboard (Project Settings → Database →
Connection string), or from `supabase start` for a local stack
(`postgresql://postgres:postgres@127.0.0.1:54322/postgres`). With no
`DATABASE_URL` but the Supabase CLI installed, it falls back to `supabase db push`
(schema only). Run `./supabase/setup.sh --help` for details.

After seeding, create the admin's Supabase Auth user (dashboard → Authentication),
using the same email — first sign-in links them to the admin row automatically.

## Regenerate typed schema (after any schema change)
```bash
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
