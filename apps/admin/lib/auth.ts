import { cookies } from "next/headers";

/**
 * Mock admin auth — a signed-in email in an allowlist, stored in a cookie.
 * Replaced by Supabase Auth (checking welkin_bliss_users.type in {admin,staff})
 * in ADR 0002 phase 3. Only allowlisted emails may sign in.
 */
export const AUTH_COOKIE = "wb_admin";

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
}

export async function getSession(): Promise<Session | null> {
  const email = (await cookies()).get(AUTH_COOKIE)?.value;
  return email && isAllowed(email) ? { email } : null;
}
