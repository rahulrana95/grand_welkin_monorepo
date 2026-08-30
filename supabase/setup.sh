#!/usr/bin/env bash
#
# WelkinBliss database setup. Applies every migration in supabase/migrations (in
# order) to a Supabase Postgres, and optionally loads seed data. Idempotent — safe
# to re-run.
#
# Usage:
#   DATABASE_URL=postgres://... ./supabase/setup.sh                 # schema + storage
#   DATABASE_URL=postgres://... ADMIN_EMAIL=you@x.com \
#       ./supabase/setup.sh --seed                                  # + sample data + admin
#
# Where to get DATABASE_URL:
#   • Hosted:  Supabase dashboard → Project Settings → Database → Connection string
#              (URI). Use the direct connection or the session pooler.
#   • Local:   `supabase start` prints "DB URL"
#              (postgresql://postgres:postgres@127.0.0.1:54322/postgres).
#
# If DATABASE_URL is unset and the Supabase CLI is installed, this falls back to
# `supabase db push` against your linked project (schema only).
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usage() {
  cat <<'EOF'
WelkinBliss database setup — applies supabase/migrations (in order) and optional
seed data to a Supabase Postgres. Idempotent; safe to re-run.

Usage:
  DATABASE_URL=postgres://... ./supabase/setup.sh                 # schema + storage
  DATABASE_URL=postgres://... ADMIN_EMAIL=you@x.com \
      ./supabase/setup.sh --seed                                  # + sample data + admin

Where to get DATABASE_URL:
  • Hosted:  Supabase dashboard -> Project Settings -> Database -> Connection string
             (URI). Use the direct connection or the session pooler.
  • Local:   `supabase start` prints "DB URL"
             (postgresql://postgres:postgres@127.0.0.1:54322/postgres).

If DATABASE_URL is unset and the Supabase CLI is installed, this falls back to
`supabase db push` against your linked project (schema only).
EOF
}

SEED=0
for arg in "$@"; do
  case "$arg" in
    --seed) SEED=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "unknown argument: $arg" >&2; usage >&2; exit 2 ;;
  esac
done

DB_URL="${DATABASE_URL:-${SUPABASE_DB_URL:-}}"

# ── Fallback: Supabase CLI (schema only) ─────────────────────────────────────
if [[ -z "$DB_URL" ]]; then
  if command -v supabase >/dev/null 2>&1; then
    echo "No DATABASE_URL set — applying migrations with the Supabase CLI (supabase db push)."
    supabase db push
    [[ "$SEED" -eq 1 ]] && echo "note: --seed needs a DATABASE_URL; set it and re-run to seed." >&2
    exit 0
  fi
  echo "error: set DATABASE_URL (or SUPABASE_DB_URL), or install the Supabase CLI." >&2
  echo "       run './supabase/setup.sh --help' for details." >&2
  exit 2
fi

command -v psql >/dev/null 2>&1 || { echo "error: psql is required but not found." >&2; exit 2; }

# Redact credentials before printing the target.
target="$(printf '%s' "$DB_URL" | sed -E 's#(://[^:/@]+):[^@]*@#\1:***@#')"
echo "Applying WelkinBliss migrations to: ${target}"

for file in "$HERE"/migrations/*.sql; do
  echo "  → $(basename "$file")"
  psql "$DB_URL" -v ON_ERROR_STOP=1 --quiet -f "$file"
done

if [[ "$SEED" -eq 1 ]]; then
  admin_email="${ADMIN_EMAIL:-admin@welkinbliss.com}"
  echo "  → seed.sql (admin: ${admin_email})"
  psql "$DB_URL" -v ON_ERROR_STOP=1 --quiet -v admin_email="$admin_email" -f "$HERE/seed.sql"
fi

echo "Done. WelkinBliss schema is ready."
[[ "$SEED" -eq 1 ]] && cat <<EOF

Next: create the admin's Supabase Auth user (dashboard → Authentication → Add user,
email ${ADMIN_EMAIL:-admin@welkinbliss.com}). On first sign-in they are linked to the
seeded admin row automatically. If that Auth user already exists, run:
  psql "\$DATABASE_URL" -c "select welkin_bliss_link_admin('${ADMIN_EMAIL:-admin@welkinbliss.com}');"
EOF
exit 0
