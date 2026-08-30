import { createServiceClient, hasSupabase, type UserType } from "@welkinbliss/db";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "./supabase-server";

/**
 * Admin auth. Two modes, chosen by env:
 *  - **Supabase Auth** when Supabase is configured — the signed-in user must have a
 *    `welkin_bliss_users` row whose `type` is `admin`/`staff` (ADR 0002 §2).
 *  - **Mock** otherwise — an allowlisted email in a cookie, so the app runs and its
 *    visual tests pass with no backend.
 */
export const AUTH_COOKIE = "wb_admin";

const PRIVILEGED: readonly UserType[] = ["admin", "staff"];
const isPrivileged = (type: UserType): boolean => PRIVILEGED.includes(type);

export function adminEmails(): readonly string[] {
  return (process.env.ADMIN_EMAILS ?? "admin@welkinbliss.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowed(email: string): boolean {
  return adminEmails().includes(email.trim().toLowerCase());
}

export interface Session {
  readonly email: string;
  readonly role: UserType;
}

/** Current admin session, or `null` when not signed in / not privileged. */
export async function getSession(): Promise<Session | null> {
  return hasSupabase() ? getSupabaseSession() : getMockSession();
}

async function getSupabaseSession(): Promise<Session | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user?.email) return null;

  // Role lookup bypasses RLS (service role) so the gate can't be locked out by policy.
  const admin = createServiceClient();
  if (!admin) return null;
  const { data: row } = await admin
    .from("welkin_bliss_users")
    .select("email, type")
    .eq("auth_id", user.id)
    .maybeSingle();
  if (!row || !isPrivileged(row.type)) return null;
  return { email: row.email, role: row.type };
}

async function getMockSession(): Promise<Session | null> {
  const email = (await cookies()).get(AUTH_COOKIE)?.value;
  return email && isAllowed(email) ? { email, role: "admin" } : null;
}
