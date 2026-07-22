import { STOCK_ITEMS, FACILITIES, getFacility, getLatestStock, getStockHistory, getRedistributionOverride } from "./data/store";
import { getForecast, getRedistributionProposals } from "./forecastingClient";
import type { AlertSeverity, RedistributionProposal } from "./data/types";
import { t, type Lang } from "./i18n/translations";

const ESSENTIAL_CATEGORIES = new Set(["antimalarial", "antibiotic", "maternal"]);

// How far ahead the LP looks. Feeding it today's snapshot only ever proposes a transfer
// once a facility is already in trouble; feeding it the Holt's-projected position N days out
// lets it preempt a stockout that hasn't happened yet -- the whole point of forecasting in
// the first place is wasted if redistribution ignores it and re-derives "today" on its own.
const LOOKAHEAD_DAYS = 5;

function urgencyFor(daysRemaining: number): AlertSeverity {
  if (daysRemaining < 3) return "critical";
  if (daysRemaining < 7) return "warning";
  return "info";
}

interface ProjectedPosition {
  facilityId: string;
  lat: number;
  lng: number;
  quantityOnHand: number;
  dailyConsumption: number;
  daysRemaining: number;
}

async function projectedPosition(facility: (typeof FACILITIES)[number], itemId: string): Promise<ProjectedPosition> {
  const history = getStockHistory(facility.id, itemId);
  const latest = getLatestStock(facility.id, itemId);
  const forecast = await getForecast(history, LOOKAHEAD_DAYS);
  const projected = forecast.forecast[LOOKAHEAD_DAYS - 1];

  const quantityOnHand = projected?.projectedQuantityOnHand ?? latest?.quantityOnHand ?? 0;
  const dailyConsumption = projected?.projectedDailyConsumption ?? latest?.dailyConsumption ?? 0.01;

  return {
    facilityId: facility.id,
    lat: facility.lat,
    lng: facility.lng,
    quantityOnHand,
    dailyConsumption,
    daysRemaining: dailyConsumption > 0 ? quantityOnHand / dailyConsumption : Infinity,
  };
}

export async function computeAllProposals(lang: Lang = "en"): Promise<{ proposals: RedistributionProposal[]; serviceUnavailable: boolean }> {
  const essentialItems = STOCK_ITEMS.filter((i) => ESSENTIAL_CATEGORIES.has(i.category));
  const proposals: RedistributionProposal[] = [];
  let anyUnavailable = false;

  for (const item of essentialItems) {
    const positions = await Promise.all(FACILITIES.map((f) => projectedPosition(f, item.id)));
    const positionByFacility = new Map(positions.map((p) => [p.facilityId, p]));

    const { transfers, unavailable } = await getRedistributionProposals(
      positions.map(({ facilityId, lat, lng, quantityOnHand, dailyConsumption }) => ({
        facilityId,
        lat,
        lng,
        quantityOnHand,
        dailyConsumption,
      }))
    );
    if (unavailable) anyUnavailable = true;

    for (const transfer of transfers) {
      const id = `redis-${item.id}-${transfer.sourceFacilityId}-${transfer.destFacilityId}`;
      const destProjected = positionByFacility.get(transfer.destFacilityId);
      const destDaysRemaining = destProjected?.daysRemaining ?? 0;
      const sourceFacility = getFacility(transfer.sourceFacilityId);
      const destFacility = getFacility(transfer.destFacilityId);
      const override = getRedistributionOverride(id);

      proposals.push({
        id,
        sourceFacilityId: transfer.sourceFacilityId,
        destFacilityId: transfer.destFacilityId,
        itemId: item.id,
        quantity: transfer.quantity,
        urgency: urgencyFor(destDaysRemaining),
        estTransitMinutes: transfer.estTransitMinutes,
        distanceKm: transfer.distanceKm,
        status: override?.status ?? "proposed",
        reasoning: t("redistReasoningProactive", lang, {
          dest: destFacility?.name ?? transfer.destFacilityId,
          days: Number.isFinite(destDaysRemaining) ? destDaysRemaining.toFixed(1) : "—",
          horizon: LOOKAHEAD_DAYS,
          item: item.name,
          source: sourceFacility?.name ?? transfer.sourceFacilityId,
          unit: item.unit,
          distance: transfer.distanceKm,
          minutes: transfer.estTransitMinutes,
        }),
        brief: override?.brief,
        createdAt: new Date().toISOString(),
      });
    }
  }

  const severityOrder: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 };
  proposals.sort((a, b) => severityOrder[a.urgency] - severityOrder[b.urgency]);

  return { proposals, serviceUnavailable: anyUnavailable };
}
