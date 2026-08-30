# @welkinbliss/db

Env-gated, typed Supabase access for the WelkinBliss tenant (`welkin_bliss_*`).
The single shared backend for every WelkinBliss frontend app — see
[ADR 0002](../../docs/adr/0002-multitenant-backend-and-admin.md).

## What's here
- `env.ts` — reads `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`.
  `hasSupabase()` / `hasServiceRole()` decide **real vs. mock** in each app. Missing
  keys → apps use their in-memory mocks, so the repo builds and tests with no secrets.
- `client.ts` — `createAnonClient()` (RLS-bound, public reads) and
  `createServiceClient()` (**server-only**, bypasses RLS). Both return `null` when
  unconfigured.
- `types.ts` — the typed `Database` schema. **Regenerated** from the live schema once
  the project is provisioned (it is the SSOT for the data model):
  ```bash
  supabase gen types typescript --schema public > libs/db/src/types.ts
  ```

## Secrets
Never commit keys. Provide them as env vars (Vercel project settings / `.env.local`).
See each app's `.env.example`.
