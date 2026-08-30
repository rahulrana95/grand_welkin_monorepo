import "server-only";
import { unstable_cache } from "next/cache";
import { createServiceClient } from "@welkinbliss/db";

/**
 * Editable site copy — keyed strings the public site reads, edited in the admin
 * (welkin_bliss_site_copy). Values come from Supabase when configured, layered over
 * the defaults below; without a backend the defaults render (so the site and its
 * visual tests are deterministic). Reads are cached and tagged so an admin edit can
 * revalidate them (see app/api/revalidate).
 */
export const SITE_COPY_TAG = "site-copy";

export const SITE_COPY_KEYS = ["home.hero.tagline", "home.hero.subhead", "footer.promise"] as const;
export type SiteCopyKey = (typeof SITE_COPY_KEYS)[number];

/** Defaults MUST match the shipped copy so the no-backend render is unchanged. */
export const SITE_COPY_DEFAULTS: Record<SiteCopyKey, string> = {
  "home.hero.tagline": "Your calm above it all",
  "home.hero.subhead":
    "A small collection of serene, light-filled homes — owned and cared for by WelkinBliss, with hotel-grade calm and a 24/7 concierge.",
  "footer.promise": "A WelkinBliss concierge confirms every stay.",
};

const isKey = (key: string): key is SiteCopyKey => (SITE_COPY_KEYS as readonly string[]).includes(key);

async function fetchSiteCopy(): Promise<Partial<Record<SiteCopyKey, string>>> {
  const db = createServiceClient();
  if (!db) return {};
  const { data, error } = await db.from("welkin_bliss_site_copy").select("key, value");
  if (error || !data) return {};
  const overrides: Partial<Record<SiteCopyKey, string>> = {};
  for (const row of data) {
    if (isKey(row.key) && row.value) overrides[row.key] = row.value;
  }
  return overrides;
}

const cachedSiteCopy = unstable_cache(fetchSiteCopy, ["welkin-bliss-site-copy"], {
  tags: [SITE_COPY_TAG],
  revalidate: 300,
});

/** All copy keys resolved (Supabase overrides on top of defaults). */
export async function getSiteCopy(): Promise<Record<SiteCopyKey, string>> {
  return { ...SITE_COPY_DEFAULTS, ...(await cachedSiteCopy()) };
}
