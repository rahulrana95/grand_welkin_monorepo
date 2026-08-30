-- WelkinBliss seed data (optional). Idempotent — safe to re-run.
-- Applied by supabase/setup.sh with --seed. The admin email comes from the psql
-- variable :admin_email (setup.sh passes ADMIN_EMAIL); defaults if unset.

\if :{?admin_email}
\else
  \set admin_email 'admin@welkinbliss.com'
\endif

-- ── Admin user row ────────────────────────────────────────────────────────────
-- auth_id is left null; it is filled automatically when this email signs up via
-- Supabase Auth (trigger welkin_bliss_on_auth_user_created). If they already exist
-- in Auth, run: select welkin_bliss_link_admin(:'admin_email');
insert into welkin_bliss_users (email, name, type)
values (:'admin_email', 'WelkinBliss Admin', 'admin')
on conflict (email) do update set type = 'admin';

-- ── Editable site copy ────────────────────────────────────────────────────────
insert into welkin_bliss_site_copy (key, value) values
  ('home.hero.tagline', 'Your calm above it all'),
  ('home.hero.subhead', 'A small collection of serene, light-filled homes — owned and cared for by WelkinBliss.'),
  ('footer.promise',    'A WelkinBliss concierge confirms every stay.')
on conflict (key) do nothing;

-- ── Sample properties (mirror the app''s mock catalogue) ──────────────────────
insert into welkin_bliss_properties
  (slug, name, destination_slug, region, country, country_code, summary, description,
   sleeps, bedrooms, bathrooms, base_price_cents, currency, status)
values
  ('villa-serena', 'Villa Serena', 'amalfi-coast', 'Campania', 'Italy', 'IT',
   'Cliffside villa with a private infinity pool above Positano.',
   'Five-bedroom cliffside home with chef service and sea views.',
   10, 5, 6, 245000, 'EUR', 'published'),
  ('aspen-hearth-lodge', 'Hearth Lodge', 'aspen-snowmass', 'Colorado', 'United States', 'US',
   'Ski-in timber lodge with a stone fireplace and cedar sauna.',
   'Four-bedroom home built for firelit evenings and first-light air.',
   8, 4, 4, 189000, 'USD', 'draft'),
  ('caldera-house', 'Caldera House', 'santorini', 'Cyclades', 'Greece', 'GR',
   'Whitewashed cave-house facing the caldera and the sunset.',
   'Three-bedroom cave-house carved into the cliff, water views throughout.',
   6, 3, 3, 168000, 'EUR', 'published')
on conflict (slug) do nothing;
