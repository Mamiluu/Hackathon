/**
 * Vercel's serverless functions run on an ephemeral, effectively read-only filesystem in
 * production -- the fs-backed persistence in lib/data/store.ts (`setRedistributionOverride`,
 * `.data/state.json`) works perfectly in local dev but silently no-ops there, since its writes
 * are wrapped in a best-effort try/catch. For a single-presenter demo, what actually needs to
 * survive a page refresh is "this browser's own most recent action," not a shared multi-user
 * database -- so this mirrors approvals/briefs into localStorage as a zero-infrastructure fix.
 * A real multi-user deployment would swap this for Vercel KV/Postgres instead.
 */
const PREFIX = "afyapulse:";

export function readLocalOverride<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeLocalOverride<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Best-effort only -- private browsing / storage quota exceeded, etc.
  }
}
