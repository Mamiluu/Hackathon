import { computeAllProposals } from "@/lib/redistribution";
import { getFacility, STOCK_ITEMS } from "@/lib/data/store";
import { getAllSnapshots } from "@/lib/data/alertEngine";
import { RedistributionCard } from "@/components/RedistributionCard";
import { StatTile } from "@/components/StatTile";
import { DistrictMap, type MapRoute } from "@/components/DistrictMap";
import { getLang } from "@/lib/i18n/getLang";
import { t } from "@/lib/i18n/translations";

export default async function RedistributionPage() {
  const lang = getLang();
  const { proposals, serviceUnavailable } = await computeAllProposals(lang);
  const snapshots = getAllSnapshots(lang);
  const totalUnits = proposals.reduce((sum, p) => sum + p.quantity, 0);
  const critical = proposals.filter((p) => p.urgency === "critical").length;

  const routes: MapRoute[] = proposals.map((p) => {
    const item = STOCK_ITEMS.find((i) => i.id === p.itemId)!;
    return {
      sourceId: p.sourceFacilityId,
      destId: p.destFacilityId,
      urgency: p.urgency,
      quantity: p.quantity,
      itemName: item.name,
      unit: item.unit,
    };
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <div className="text-xs font-medium uppercase tracking-wide text-series-1">{t("redistributionEyebrow", lang)}</div>
        <h1 className="text-2xl font-semibold text-ink-primary">{t("redistributionTitle", lang)}</h1>
        <p className="max-w-2xl text-sm text-ink-secondary">{t("redistributionSubtitle", lang)}</p>
      </div>

      {serviceUnavailable && (
        <div className="mb-6 rounded-lg border border-status-warning/30 bg-status-warning/10 px-4 py-3 text-sm text-ink-primary">
          {t("serviceUnavailable", lang)}{" "}
          <code className="rounded bg-surface-raised px-1 py-0.5 text-xs">
            services/forecasting: .venv\Scripts\python -m uvicorn main:app --port 8010
          </code>
          .
        </div>
      )}

      <div className="mb-8 grid grid-cols-3 gap-4">
        <StatTile label={t("statProposed", lang)} value={String(proposals.length)} />
        <StatTile label={t("statCritical", lang)} value={String(critical)} />
        <StatTile label={t("statUnitsInMotion", lang)} value={String(totalUnits)} />
      </div>

      {routes.length > 0 && (
        <div className="mb-8">
          <DistrictMap
            facilities={snapshots.map((s) => ({ id: s.facility.id, name: s.facility.name, lat: s.facility.lat, lng: s.facility.lng, healthScore: s.healthScore }))}
            routes={routes}
            lang={lang}
          />
        </div>
      )}

      <div className="mx-auto max-w-4xl">
        {proposals.length === 0 ? (
          <div className="rounded-xl border border-hairline bg-surface p-6 text-sm text-ink-secondary">
            {t("noRedistributionNeeded", lang)}
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((p) => {
              const item = STOCK_ITEMS.find((i) => i.id === p.itemId)!;
              return (
                <RedistributionCard
                  key={p.id}
                  proposal={p}
                  itemName={item.name}
                  itemUnit={item.unit}
                  sourceFacilityName={getFacility(p.sourceFacilityId)?.name ?? p.sourceFacilityId}
                  destFacilityName={getFacility(p.destFacilityId)?.name ?? p.destFacilityId}
                  lang={lang}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
