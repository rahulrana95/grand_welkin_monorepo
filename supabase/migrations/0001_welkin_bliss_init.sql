-- WelkinBliss tenant schema. Single shared Supabase backend; tables are prefixed
-- per tenant (welkin_bliss_*). A future tenant (e.g. Welkin Grand) gets welkin_grand_*.
-- See docs/adr/0002-multitenant-backend-and-admin.md.
--
-- Idempotent: safe to run repeatedly (local dev, re-provisioning). Uses IF NOT
-- EXISTS / guarded enum creation / drop-then-create policies.

-- ── Enums ────────────────────────────────────────────────────────────────────
do $$ begin
  create type welkin_bliss_user_type as enum ('admin', 'staff', 'viewer');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type welkin_bliss_property_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null;
end $$;

-- ── Users (admin/staff only; public visitors are NOT users) ──────────────────
create table if not exists welkin_bliss_users (
  id          uuid primary key default gen_random_uuid(),
  auth_id     uuid unique,                         -- maps to auth.users.id (Supabase Auth)
  email       text not null unique,
  name        text,
  type        welkin_bliss_user_type not null default 'viewer',
  created_at  timestamptz not null default now()
);

-- ── Properties ───────────────────────────────────────────────────────────────
create table if not exists welkin_bliss_properties (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text not null unique,
  name                  text not null,
  destination_slug      text not null,
  region                text,
  country               text,
  country_code          text,                       -- ISO 3166-1 alpha-2
  summary               text,
  description           text,
  sleeps                int  not null default 1,
  bedrooms              int  not null default 0,
  bathrooms             int  not null default 0,
  base_price_cents      bigint not null default 0,  -- fallback when no per-date price
  currency              text not null default 'EUR',
  status                welkin_bliss_property_status not null default 'draft',
  lat                   double precision,
  lng                   double precision,
  uplisting_property_id text,                        -- link to the Uplisting listing
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index if not exists welkin_bliss_properties_destination_idx on welkin_bliss_properties (destination_slug);
create index if not exists welkin_bliss_properties_status_idx      on welkin_bliss_properties (status);

-- ── Photos (variants filled by the async image pipeline — ADR §5) ────────────
create table if not exists welkin_bliss_property_photos (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid not null references welkin_bliss_properties (id) on delete cascade,
  storage_path text not null,                        -- Supabase Storage object path (original)
  alt          text,
  sort         int  not null default 0,
  width        int,
  height       int,
  variants     jsonb not null default '[]'::jsonb,   -- [{ width, format, path }]
  created_at   timestamptz not null default now()
);
create index if not exists welkin_bliss_property_photos_idx on welkin_bliss_property_photos (property_id, sort);

-- ── Per-date dynamic pricing (admin sets; copy-one-price-to-a-range in the UI) ─
create table if not exists welkin_bliss_property_pricing (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references welkin_bliss_properties (id) on delete cascade,
  date        date not null,
  price_cents bigint not null,
  unique (property_id, date)
);

-- ── Blocked dates (admin-set; subtracted from Uplisting availability) ────────
create table if not exists welkin_bliss_blocked_dates (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references welkin_bliss_properties (id) on delete cascade,
  date        date not null,
  reason      text,
  unique (property_id, date)
);

-- ── Editable site copy (CMS-lite; keyed strings the site reads) ──────────────
create table if not exists welkin_bliss_site_copy (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,                   -- e.g. 'home.hero.tagline'
  value      text not null,
  updated_at timestamptz not null default now()
);

-- ── Row-Level Security ───────────────────────────────────────────────────────
-- Enable on every table. Privileged access (admin/staff) is granted via policies
-- that check the caller's welkin_bliss_users.type; published/public reads are
-- served through explicit read policies or the service role.
alter table welkin_bliss_users            enable row level security;
alter table welkin_bliss_properties       enable row level security;
alter table welkin_bliss_property_photos  enable row level security;
alter table welkin_bliss_property_pricing enable row level security;
alter table welkin_bliss_blocked_dates    enable row level security;
alter table welkin_bliss_site_copy        enable row level security;

-- Helper: is the current auth user an admin/staff member of this tenant?
create or replace function welkin_bliss_is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from welkin_bliss_users u
    where u.auth_id = auth.uid() and u.type in ('admin', 'staff')
  );
$$;

-- Public may read published properties and their supporting rows.
drop policy if exists "public reads published properties" on welkin_bliss_properties;
create policy "public reads published properties" on welkin_bliss_properties
  for select using (status = 'published');

drop policy if exists "public reads published photos" on welkin_bliss_property_photos;
create policy "public reads published photos" on welkin_bliss_property_photos
  for select using (
    exists (
      select 1 from welkin_bliss_properties p
      where p.id = welkin_bliss_property_photos.property_id and p.status = 'published'
    )
  );

drop policy if exists "public reads site copy" on welkin_bliss_site_copy;
create policy "public reads site copy" on welkin_bliss_site_copy
  for select using (true);

-- Staff/admin may do everything (per-table).
drop policy if exists "staff manage properties" on welkin_bliss_properties;
create policy "staff manage properties" on welkin_bliss_properties
  for all using (welkin_bliss_is_staff()) with check (welkin_bliss_is_staff());

drop policy if exists "staff manage photos" on welkin_bliss_property_photos;
create policy "staff manage photos" on welkin_bliss_property_photos
  for all using (welkin_bliss_is_staff()) with check (welkin_bliss_is_staff());

drop policy if exists "staff manage pricing" on welkin_bliss_property_pricing;
create policy "staff manage pricing" on welkin_bliss_property_pricing
  for all using (welkin_bliss_is_staff()) with check (welkin_bliss_is_staff());

drop policy if exists "staff manage blocked dates" on welkin_bliss_blocked_dates;
create policy "staff manage blocked dates" on welkin_bliss_blocked_dates
  for all using (welkin_bliss_is_staff()) with check (welkin_bliss_is_staff());

drop policy if exists "staff manage site copy" on welkin_bliss_site_copy;
create policy "staff manage site copy" on welkin_bliss_site_copy
  for all using (welkin_bliss_is_staff()) with check (welkin_bliss_is_staff());

drop policy if exists "staff read users" on welkin_bliss_users;
create policy "staff read users" on welkin_bliss_users
  for select using (welkin_bliss_is_staff());
