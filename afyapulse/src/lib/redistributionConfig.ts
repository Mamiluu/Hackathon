/**
 * Shared with both the server-side proposal computation (lib/redistribution.ts) and the
 * client-side trust trace (components/RedistributionCard.tsx) -- kept in its own
 * server/client-safe module so the client bundle never has to pull in lib/redistribution.ts,
 * which imports the fs-backed data store.
 */
export const LOOKAHEAD_DAYS = 5;
