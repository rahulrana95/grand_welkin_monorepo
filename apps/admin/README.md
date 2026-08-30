# @welkinbliss/admin

Admin panel for WelkinBliss — manage properties, per-date pricing, blocked dates,
and site copy. Next.js App Router, branded with `@welkinbliss/ui`.
See [ADR 0002](../../docs/adr/0002-multitenant-backend-and-admin.md).

> **Built against a repository interface + in-memory mock** (`lib/repo`) and **mock
> auth** (`lib/auth`), so it runs and verifies without Supabase. Phase 3 swaps the
> mock `Repo` for a Supabase-backed one and mock auth for Supabase Auth (checking
> `welkin_bliss_users.type`).

## Run
```bash
pnpm --filter @welkinbliss/admin dev     # http://localhost:3000
```
Sign in with an allowlisted email (default `admin@welkinbliss.com`, any password).
Set `ADMIN_EMAILS` to change the allowlist.

## Features
- **Properties** — list, create, edit (name, destination, capacity, base price, status…).
- **Pricing & availability** (on a property) — a 2-month calendar: **Set pricing**
  (pick a date range, enter one price, **copy it to the whole range**) and **Block
  dates** (click to toggle; blocked dates drop out of public availability).
- **Site copy** — edit keyed strings the public site reads.

## Next
Wire Supabase (Auth/DB/Storage) + the async photo pipeline; connect blocked dates &
per-date pricing into the public availability merge (`mergeOverrides`).
