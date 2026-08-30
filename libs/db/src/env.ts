/**
 * Supabase configuration, read from the environment. Everything here is optional:
 * when the keys are absent the apps fall back to their in-memory mocks, so the
 * monorepo type-checks, builds, and runs its visual tests without any credentials.
 * Secrets are NEVER committed — they are supplied as env vars (Vercel / `.env.local`).
 */

export interface SupabaseEnv {
  readonly url: string;
  /** Public anon key — safe in the browser; subject to Row-Level Security. */
  readonly anonKey: string;
  /** Service-role key — server-only; bypasses RLS. Never expose to the client. */
  readonly serviceRoleKey: string;
}

/** Storage bucket holding original property photos (variants added by the pipeline). */
export const PHOTOS_BUCKET = "welkin-bliss-photos";

/** Parsed Supabase env, or `null` when the URL + anon key are not both present. */
export function supabaseEnv(): SupabaseEnv | null {
  const url = process.env.SUPABASE_URL?.trim();
  const anonKey = process.env.SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  return { url, anonKey, serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "" };
}

/** True when Supabase is configured — used to pick real vs. mock implementations. */
export function hasSupabase(): boolean {
  return supabaseEnv() !== null;
}

/** True when the service-role key is available (server-only privileged access). */
export function hasServiceRole(): boolean {
  return (supabaseEnv()?.serviceRoleKey.length ?? 0) > 0;
}
