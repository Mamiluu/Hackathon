import { STOCK_ITEMS, FACILITIES, getFacility, getLatestStock, getRedistributionOverride } from "./data/store";
import { getRedistributionProposals } from "./forecastingClient";
import type { AlertSeverity, RedistributionProposal } from "./data/types";
import { t, type Lang } from "./i18n/translations";

const ESSENTIAL_CATEGORIES = new Set(["antimalarial", "antibiotic", "maternal"]);

function urgencyFor(daysRemaining: number): AlertSeverity {
  if (daysRemaining < 3) return "critical";
  if (daysRemaining < 7) return "warning";
  return "info";
}

export async function computeAllProposals(lang: Lang = "en"): Promise<{ proposals: RedistributionProposal[]; serviceUnavailable: boolean }> {
  const essentialItems = STOCK_ITEMS.filter((i) => ESSENTIAL_CATEGORIES.has(i.category));
  const proposals: RedistributionProposal[] = [];
  let anyUnavailable = false;

  for (const item of essentialItems) {
    const positions = FACILITIES.map((f) => {
      const latest = getLatestStock(f.id, item.id);
      return {
        facilityId: f.id,
        lat: f.lat,
        lng: f.lng,
        quantityOnHand: latest?.quantityOnHand ?? 0,
        dailyConsumption: latest?.dailyConsumption ?? 0.01,
      };
    });

    const { transfers, unavailable } = await getRedistributionProposals(positions);
    if (unavailable) anyUnavailable = true;

    for (const transfer of transfers) {
      const id = `redis-${item.id}-${transfer.sourceFacilityId}-${transfer.destFacilityId}`;
      const destLatest = getLatestStock(transfer.destFacilityId, item.id);
      const destDaysRemaining = destLatest && destLatest.dailyConsumption > 0 ? destLatest.quantityOnHand / destLatest.dailyConsumption : 0;
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
        reasoning: t("redistReasoning", lang, {
          dest: destFacility?.name ?? transfer.destFacilityId,
          days: destDaysRemaining.toFixed(1),
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
