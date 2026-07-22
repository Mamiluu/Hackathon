import { FACILITIES, STOCK_ITEMS, getStockHistory } from "./store";
import type { Alert, AlertSeverity, OutbreakSignal } from "./types";
import { t, type Lang } from "@/lib/i18n/translations";

/**
 * Syndromic surveillance, not just stock monitoring: a single facility burning through
 * antimalarials faster than its own recent baseline is normal week-to-week noise. Two or
 * more nearby facilities accelerating on the same item, in the same window, is the earliest
 * visible shape of a case cluster -- worth flagging well before any one facility actually
 * runs out. This reuses the same daily-consumption series the forecasting service reads,
 * just asking a different question of it (rate of change vs. absolute level).
 */

const WATCH_THRESHOLD = 0.2; // 20% week-over-week growth at a single facility: worth watching
const WARNING_THRESHOLD = 0.35; // 35% alone, without a cluster, is significant on its own
const CLUSTER_MIN_FACILITIES = 2;

function weekOverWeekGrowth(facilityId: string, itemId: string): number | null {
  const hist = getStockHistory(facilityId, itemId);
  if (hist.length < 14) return null;
  const last7 = hist.slice(-7);
  const prev7 = hist.slice(-14, -7);
  const lastAvg = last7.reduce((sum, h) => sum + h.dailyConsumption, 0) / last7.length;
  const prevAvg = prev7.reduce((sum, h) => sum + h.dailyConsumption, 0) / prev7.length;
  if (prevAvg <= 0) return null;
  return (lastAvg - prevAvg) / prevAvg;
}

export function detectOutbreakSignals(lang: Lang = "en"): OutbreakSignal[] {
  const items = STOCK_ITEMS.filter((i) => i.category === "antimalarial");
  const signals: OutbreakSignal[] = [];

  for (const item of items) {
    const growthByFacility = FACILITIES.map((facility) => ({ facility, growth: weekOverWeekGrowth(facility.id, item.id) }))
      .filter((g): g is { facility: (typeof FACILITIES)[number]; growth: number } => g.growth !== null)
      .filter((g) => g.growth >= WATCH_THRESHOLD)
      .sort((a, b) => b.growth - a.growth);

    if (growthByFacility.length === 0) continue;

    const isCluster = growthByFacility.length >= CLUSTER_MIN_FACILITIES;
    const strongest = growthByFacility[0];
    if (!isCluster && strongest.growth < WARNING_THRESHOLD) continue;

    const avgGrowthPct = Math.round(
      (growthByFacility.reduce((sum, g) => sum + g.growth, 0) / growthByFacility.length) * 100
    );
    const severity: AlertSeverity = isCluster ? "critical" : strongest.growth >= WARNING_THRESHOLD ? "warning" : "info";

    signals.push({
      id: `outbreak-${item.id}`,
      itemId: item.id,
      facilityIds: growthByFacility.map((g) => g.facility.id),
      weekOverWeekGrowthPct: avgGrowthPct,
      severity,
      message: isCluster
        ? t("outbreakClusterMessage", lang, {
            item: item.name,
            count: growthByFacility.length,
            growth: avgGrowthPct,
            facilities: growthByFacility.map((g) => g.facility.name).join(", "),
          })
        : t("outbreakWatchMessage", lang, {
            item: item.name,
            facility: strongest.facility.name,
            growth: Math.round(strongest.growth * 100),
          }),
      createdAt: new Date().toISOString(),
    });
  }

  return signals;
}

/** Fans a cluster signal out to one facility-scoped Alert per affected facility, so it slots into the existing alert list/link/severity machinery unchanged. */
export function outbreakSignalsToAlerts(signals: OutbreakSignal[]): Alert[] {
  return signals.flatMap((signal) =>
    signal.facilityIds.map((facilityId) => ({
      id: `${signal.id}-${facilityId}`,
      facilityId,
      type: "outbreak_signal" as const,
      severity: signal.severity,
      message: signal.message,
      createdAt: signal.createdAt,
    }))
  );
}
