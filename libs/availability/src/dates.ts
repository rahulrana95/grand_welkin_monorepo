/** Small date helpers — ISO "YYYY-MM-DD" throughout, UTC to stay deterministic. */

export const toISO = (d: Date): string => d.toISOString().slice(0, 10);

export function eachDate(from: string, to: string): string[] {
  const out: string[] = [];
  const end = new Date(`${to}T00:00:00Z`);
  for (let d = new Date(`${from}T00:00:00Z`); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(toISO(d));
  }
  return out;
}

/** Stable non-cryptographic hash → deterministic mock data (no Math.random). */
export function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff; // 0..1
}
