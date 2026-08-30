import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./env";
import type { Database } from "./types";

export type WelkinDbClient = SupabaseClient<Database>;

const noPersist = { auth: { persistSession: false, autoRefreshToken: false } } as const;

/**
 * Anon client — subject to Row-Level Security. Safe for public, unprivileged reads
 * (e.g. published properties, site copy). Returns `null` when Supabase is unconfigured.
 */
export function createAnonClient(): WelkinDbClient | null {
  const env = supabaseEnv();
  if (!env) return null;
  return createClient<Database>(env.url, env.anonKey, noPersist);
}

/**
 * Service-role client — bypasses RLS. SERVER-ONLY (the admin app and server routes).
 * Never import this into client components. Returns `null` when the service-role key
 * is absent, so callers fall back to their mocks.
 */
export function createServiceClient(): WelkinDbClient | null {
  const env = supabaseEnv();
  if (!env || !env.serviceRoleKey) return null;
  return createClient<Database>(env.url, env.serviceRoleKey, noPersist);
}
