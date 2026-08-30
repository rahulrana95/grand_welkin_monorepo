import "server-only";

/**
 * Ask the public web app to drop its cached site copy after an admin edit, so the
 * change shows immediately. Best-effort and env-gated: a no-op unless both
 * WEB_REVALIDATE_URL (the web app's /api/revalidate) and WEB_REVALIDATE_SECRET are
 * set. Failures are swallowed — the copy is already saved; the cache TTL is the
 * fallback.
 */
export async function revalidateWebSiteCopy(): Promise<void> {
  const url = process.env.WEB_REVALIDATE_URL;
  const secret = process.env.WEB_REVALIDATE_SECRET;
  if (!url || !secret) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-revalidate-secret": secret },
      body: JSON.stringify({ tag: "site-copy" }),
      cache: "no-store",
    });
  } catch {
    /* best-effort */
  }
}
