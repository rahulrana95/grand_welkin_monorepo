import { createServiceClient } from "@welkinbliss/db";
import { MockRepo } from "./mock";
import { SupabaseRepo } from "./supabase";
import type { Repo } from "./types";

export * from "./types";

/**
 * The repository. Supabase-backed when the service-role key is present (ADR 0002
 * phase 3), else the in-memory mock — so the app builds and its visual tests pass
 * with no credentials.
 */
export function getRepo(): Repo {
  const db = createServiceClient();
  return db ? new SupabaseRepo(db) : new MockRepo();
}
