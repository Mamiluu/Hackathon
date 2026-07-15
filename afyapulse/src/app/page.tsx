import { getAllAlerts, getAllSnapshots } from "@/lib/data/alertEngine";
import { FACILITIES, STOCK_ITEMS, TODAY, getFacility } from "@/lib/data/store";
import { computeAllProposals } from "@/lib/redistribution";
import { StatTile } from "@/components/StatTile";
import { AlertList } from "@/components/AlertList";
import { FacilityCard } from "@/components/FacilityCard";
import { DistrictMap, type MapRoute } from "@/components/DistrictMap";
import { StoryBanner } from "@/components/StoryBanner";
import { getLang } from "@/lib/i18n/getLang";
import { t } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const lang = getLang();
  const snapshots = getAllSnapshots(lang);
  const alerts = getAllAlerts(lang);
  const { proposals } = await computeAllProposals(lang);

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const atRiskFacilities = snapshots.filter((s) => s.stockRisk !== "ok").length;
  const avgBedOccupancy = Math.round(
    snapshots.reduce((sum, s) => sum + s.bedOccupancyPct, 0) / snapshots.length
  );
  const avgHealthScore = Math.round(snapshots.reduce((sum, s) => sum + s.healthScore, 0) / snapshots.length);
  const totalFootfall = snapshots.reduce((sum, s) => sum + s.footfallToday, 0);

  const sorted = [...snapshots].sort((a, b) => a.healthScore - b.healthScore);

  const topProposal = proposals[0];
  const routes: MapRoute[] = proposals.slice(0, 6).map((p) => {
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
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-1">
        <div className="text-xs font-medium uppercase tracking-wide text-series-1">{t("dashboardEyebrow", lang)}</div>
        <h1 className="text-2xl font-semibold text-ink-primary">Kilifi County · {TODAY}</h1>
        <p className="max-w-2xl text-sm text-ink-secondary">
          {t("dashboardSubtitle", lang, { count: FACILITIES.length })}
        </p>
      </div>

      {topProposal && (
        <StoryBanner
          facilityId={topProposal.destFacilityId}
          facilityName={getFacility(topProposal.destFacilityId)?.name ?? ""}
          itemName={STOCK_ITEMS.find((i) => i.id === topProposal.itemId)?.name ?? ""}
          sourceName={getFacility(topProposal.sourceFacilityId)?.name ?? ""}
          distanceKm={topProposal.distanceKm}
          lang={lang}
        />
      )}

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatTile label={t("statFacilities", lang)} value={String(FACILITIES.length)} />
        <StatTile
          label={t("statCriticalAlerts", lang)}
          value={String(criticalCount)}
          delta={criticalCount > 0 ? t("statNeedsAction", lang) : undefined}
          deltaGood={false}
        />
        <StatTile label={t("statAtRisk", lang)} value={String(atRiskFacilities)} hint={t("statOfEssential", lang)} />
        <StatTile label={t("statAvgBeds", lang)} value={`${avgBedOccupancy}%`} />
        <StatTile
          label={t("statHealthScore", lang)}
          value={String(avgHealthScore)}
          hint={t("statPatientsToday", lang, { count: totalFootfall })}
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink-primary">{t("priorityAlerts", lang)}</h2>
          <AlertList alerts={alerts} limit={6} lang={lang} />
        </div>
        <DistrictMap
          facilities={snapshots.map((s) => ({ id: s.facility.id, name: s.facility.name, lat: s.facility.lat, lng: s.facility.lng, healthScore: s.healthScore }))}
          routes={routes}
          lang={lang}
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-primary">{t("facilitiesWorstFirst", lang)}</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((snapshot) => (
            <FacilityCard key={snapshot.facility.id} snapshot={snapshot} lang={lang} />
          ))}
        </div>
      </div>
    </div>
  );
}
