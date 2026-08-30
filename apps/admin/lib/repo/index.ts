import { MockRepo } from "./mock";
import type { Repo } from "./types";

export * from "./types";

/** The repository. Mock now; a Supabase-backed `Repo` slots in here (ADR 0002 phase 3). */
export function getRepo(): Repo {
  return new MockRepo();
}
