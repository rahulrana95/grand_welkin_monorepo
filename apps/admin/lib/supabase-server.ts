import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { supabaseEnv, type Database } from "@welkinbliss/db";

/**
 * Cookie-bound Supabase client for the admin app's server components / actions.
 * Reads and writes the Supabase Auth session cookies via Next's cookie store, so
 * `auth.getUser()` / `auth.signInWithPassword()` persist the session.
 *
 * Callers must guard with `hasSupabase()` — this throws if Supabase is unconfigured.
 */
export async function createSupabaseServerClient() {
  const env = supabaseEnv();
  if (!env) throw new Error("Supabase is not configured");
  const store = await cookies();
  return createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (toSet: { name: string; value: string; options: CookieOptions }[]) => {
        // In server components cookies are read-only; Next throws — ignore there.
        // In server actions / route handlers this succeeds and refreshes the session.
        try {
          for (const { name, value, options } of toSet) store.set(name, value, options);
        } catch {
          /* read-only context */
        }
      },
    },
  });
}
