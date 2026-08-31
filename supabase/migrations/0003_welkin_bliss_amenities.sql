-- WelkinBliss: property amenities. Stored as an array of canonical amenity keys
-- (the catalogue lives in @welkinbliss/db). Drives the "What this home offers" list
-- and the amenity-based collections (poolside / chef-service / pet-friendly).
-- Idempotent.

alter table welkin_bliss_properties
  add column if not exists amenity_keys text[] not null default '{}';
