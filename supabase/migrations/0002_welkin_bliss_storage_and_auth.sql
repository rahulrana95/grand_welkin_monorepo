-- WelkinBliss: Storage bucket for property photos + admin auto-linking.
-- Supabase-only (uses the `storage` and `auth` schemas). Idempotent.
-- See docs/adr/0002-multitenant-backend-and-admin.md (§2 auth, §5 photos).

-- ── Storage bucket for original property photos (variants added by the pipeline) ─
insert into storage.buckets (id, name, public)
values ('welkin-bliss-photos', 'welkin-bliss-photos', true)
on conflict (id) do nothing;

-- Public read of photo objects; staff/admin may write. (RLS on storage.objects is
-- enabled by Supabase.)
drop policy if exists "welkin_bliss public read photos" on storage.objects;
create policy "welkin_bliss public read photos" on storage.objects
  for select using (bucket_id = 'welkin-bliss-photos');

drop policy if exists "welkin_bliss staff writes photos" on storage.objects;
create policy "welkin_bliss staff writes photos" on storage.objects
  for all
  using (bucket_id = 'welkin-bliss-photos' and welkin_bliss_is_staff())
  with check (bucket_id = 'welkin-bliss-photos' and welkin_bliss_is_staff());

-- ── Auto-link Supabase Auth users to their welkin_bliss_users row ─────────────
-- When someone signs up (or is created) in Supabase Auth, if a welkin_bliss_users
-- row was pre-seeded with the same email and no auth_id yet, link it. This is how a
-- seeded admin becomes usable after their first sign-in — no manual UUID copying.
create or replace function welkin_bliss_link_auth_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update welkin_bliss_users u
     set auth_id = new.id
   where u.email = new.email and u.auth_id is null;
  return new;
end;
$$;

drop trigger if exists welkin_bliss_on_auth_user_created on auth.users;
create trigger welkin_bliss_on_auth_user_created
  after insert on auth.users
  for each row execute function welkin_bliss_link_auth_user();

-- One-shot helper to link an existing auth user (if they signed up BEFORE being
-- seeded): select welkin_bliss_link_admin('you@example.com');
create or replace function welkin_bliss_link_admin(p_email text) returns void
language sql security definer set search_path = public, auth as $$
  update welkin_bliss_users u
     set auth_id = a.id
    from auth.users a
   where a.email = p_email and u.email = p_email;
$$;
