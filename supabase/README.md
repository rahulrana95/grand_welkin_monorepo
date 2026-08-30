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
supabase gen types typescript --schema public > libs/db/generated.ts  # typed client (later)
```
Env the apps need (added when Supabase is provisioned): `SUPABASE_URL`,
`SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
