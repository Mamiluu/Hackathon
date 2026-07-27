/**
 * Shared with both the server-side proposal computation (lib/redistribution.ts) and the
 * client-side trust trace (components/RedistributionCard.tsx) -- kept in its own
 * server/client-safe module so the client bundle never has to pull in lib/redistribution.ts,
 * which imports the fs-backed data store.
 */
export const LOOKAHEAD_DAYS = 5;

// How far past LOOKAHEAD_DAYS the redistribution LP checks before committing to a transfer --
// the LP itself only ever solves against the LOOKAHEAD_DAYS snapshot, but a donor facility that
// looks safe to give away stock from at day 5 can still be trending toward its own shortfall by
// day 21. This is purely a post-solve safety check, not a second optimization horizon.
export const CASCADE_HORIZON_DAYS = 21;
