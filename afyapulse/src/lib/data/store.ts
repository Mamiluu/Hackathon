import fs from "fs";
import path from "path";
import { DATES, FACILITIES, STOCK_ITEMS, generateMockData } from "./mockGenerator";
import type { RedistributionProposal, Alert } from "./types";

// Generated once per server process so the demo dataset stays stable across
// requests within a run, while remaining trivially regenerable on restart.
const base = generateMockData();

export const TODAY = DATES[DATES.length - 1];

function indexBy<T>(records: T[], keyFn: (r: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const r of records) {
    const k = keyFn(r);
    const arr = map.get(k);
    if (arr) arr.push(r);
    else map.set(k, [r]);
  }
  return map;
}

export const stockByFacilityItem = indexBy(base.stock, (r) => `${r.facilityId}::${r.itemId}`);
export const footfallByFacility = indexBy(base.footfall, (r) => r.facilityId);
export const bedsByFacility = indexBy(base.beds, (r) => r.facilityId);
export const doctorByFacility = indexBy(base.doctorAttendance, (r) => r.facilityId);
export const testAvailByFacility = indexBy(base.testAvailability, (r) => r.facilityId);

export { FACILITIES, STOCK_ITEMS };

export function getFacility(facilityId: string) {
  return FACILITIES.find((f) => f.id === facilityId);
}

export function getStockHistory(facilityId: string, itemId: string) {
  return stockByFacilityItem.get(`${facilityId}::${itemId}`) ?? [];
}

export function getLatestStock(facilityId: string, itemId: string) {
  const hist = getStockHistory(facilityId, itemId);
  return hist[hist.length - 1];
}

export function getFootfallHistory(facilityId: string) {
  return footfallByFacility.get(facilityId) ?? [];
}

export function getBedsHistory(facilityId: string) {
  return bedsByFacility.get(facilityId) ?? [];
}

export function getDoctorHistory(facilityId: string) {
  return doctorByFacility.get(facilityId) ?? [];
}

export function getTestAvailabilityToday(facilityId: string) {
  const hist = testAvailByFacility.get(facilityId) ?? [];
  return hist.filter((r) => r.date === TODAY);
}

// ---- Mutable state (redistribution decisions, alert cache) persisted to disk ----
// A hackathon demo doesn't need a database, but approvals should survive a page
// refresh / dev-server restart, so we persist just the mutable slice to a JSON file.
const DATA_DIR = path.join(process.cwd(), ".data");
const STATE_FILE = path.join(DATA_DIR, "state.json");

interface PersistedState {
  redistributionOverrides: Record<string, { status: RedistributionProposal["status"]; brief?: string }>;
}

function loadState(): PersistedState {
  try {
    const raw = fs.readFileSync(STATE_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { redistributionOverrides: {} };
  }
}

const state = loadState();

export function getRedistributionOverride(id: string) {
  return state.redistributionOverrides[id];
}

export function setRedistributionOverride(
  id: string,
  override: { status: RedistributionProposal["status"]; brief?: string }
) {
  state.redistributionOverrides[id] = { ...state.redistributionOverrides[id], ...override };
  persist();
}

function persist() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch {
    // Best-effort persistence; an in-memory-only fallback is fine for a demo.
  }
}

// Simple in-memory alert store, recomputed lazily by the alert engine.
let cachedAlerts: Alert[] | null = null;
export function getCachedAlerts(): Alert[] | null {
  return cachedAlerts;
}
export function setCachedAlerts(alerts: Alert[]) {
  cachedAlerts = alerts;
}
