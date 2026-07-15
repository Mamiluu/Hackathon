import type { StockRecord } from "./data/types";

export interface ForecastPoint {
  date: string;
  projectedQuantityOnHand: number;
  projectedDailyConsumption: number;
}

export interface ForecastResult {
  forecast: ForecastPoint[];
  daysToStockout: number | null;
  method: string;
  confidence: "low" | "medium" | "high";
}

const SERVICE_URL = process.env.FORECASTING_SERVICE_URL ?? "http://localhost:8010";

// Local last-resort fallback (flat-line extrapolation) so the UI never breaks if the
// Python service isn't running yet — clearly distinguishable via `method`.
function localFallbackForecast(history: StockRecord[], horizonDays: number): ForecastResult {
  if (history.length === 0) {
    return { forecast: [], daysToStockout: null, method: "unavailable", confidence: "low" };
  }
  const last = history[history.length - 1];
  const avgConsumption =
    history.slice(-7).reduce((sum, h) => sum + h.dailyConsumption, 0) / Math.min(7, history.length);

  let qty = last.quantityOnHand;
  let daysToStockout: number | null = null;
  const forecast: ForecastPoint[] = [];
  const start = new Date(last.date);
  for (let i = 1; i <= horizonDays; i++) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    qty = Math.max(0, qty - avgConsumption);
    forecast.push({
      date: d.toISOString().slice(0, 10),
      projectedQuantityOnHand: Math.round(qty * 10) / 10,
      projectedDailyConsumption: Math.round(avgConsumption * 10) / 10,
    });
    if (daysToStockout === null && qty <= 0) daysToStockout = i;
  }

  return { forecast, daysToStockout, method: "flat_average_fallback", confidence: "low" };
}

export async function getForecast(history: StockRecord[], horizonDays = 21): Promise<ForecastResult> {
  try {
    const res = await fetch(`${SERVICE_URL}/forecast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        history: history.map((h) => ({
          date: h.date,
          quantityOnHand: h.quantityOnHand,
          dailyConsumption: h.dailyConsumption,
        })),
        horizonDays,
      }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`forecasting service responded ${res.status}`);
    return (await res.json()) as ForecastResult;
  } catch {
    return localFallbackForecast(history, horizonDays);
  }
}

export interface RedistributionTransfer {
  sourceFacilityId: string;
  destFacilityId: string;
  quantity: number;
  distanceKm: number;
  estTransitMinutes: number;
}

export interface RedistributionPositionInput {
  facilityId: string;
  lat: number;
  lng: number;
  quantityOnHand: number;
  dailyConsumption: number;
  safetyDays?: number;
}

export async function getRedistributionProposals(
  positions: RedistributionPositionInput[]
): Promise<{ transfers: RedistributionTransfer[]; unavailable: boolean }> {
  try {
    const res = await fetch(`${SERVICE_URL}/redistribution/propose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ positions }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`redistribution service responded ${res.status}`);
    const data = (await res.json()) as { transfers: RedistributionTransfer[] };
    return { transfers: data.transfers, unavailable: false };
  } catch {
    return { transfers: [], unavailable: true };
  }
}
