import { getAllAlerts, getAllSnapshots } from "@/lib/data/alertEngine";
import { FACILITIES, TODAY } from "@/lib/data/store";
import { StatTile } from "@/components/StatTile";
import { AlertList } from "@/components/AlertList";
import { FacilityCard } from "@/components/FacilityCard";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const snapshots = getAllSnapshots();
  const alerts = getAllAlerts();

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const atRiskFacilities = snapshots.filter((s) => s.stockRisk !== "ok").length;
  const avgBedOccupancy = Math.round(
    snapshots.reduce((sum, s) => sum + s.bedOccupancyPct, 0) / snapshots.length
  );
  const avgHealthScore = Math.round(snapshots.reduce((sum, s) => sum + s.healthScore, 0) / snapshots.length);
  const totalFootfall = snapshots.reduce((sum, s) => sum + s.footfallToday, 0);

  const sorted = [...snapshots].sort((a, b) => a.healthScore - b.healthScore);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-1">
        <div className="text-xs font-medium uppercase tracking-wide text-series-1">District Command Center</div>
        <h1 className="text-2xl font-semibold text-ink-primary">Kilifi County · {TODAY}</h1>
        <p className="max-w-2xl text-sm text-ink-secondary">
          Live status across {FACILITIES.length} primary health facilities — stock, beds, staffing, and diagnostics
          in one view, with AI-flagged risks below.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatTile label="Facilities monitored" value={String(FACILITIES.length)} />
        <StatTile
          label="Critical alerts"
          value={String(criticalCount)}
          delta={criticalCount > 0 ? "Needs action" : undefined}
          deltaGood={false}
        />
        <StatTile label="At stockout risk" value={String(atRiskFacilities)} hint="of essential medicines" />
        <StatTile label="Avg bed occupancy" value={`${avgBedOccupancy}%`} />
        <StatTile label="County health score" value={String(avgHealthScore)} hint={`${totalFootfall} patients today`} />
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-ink-primary">Priority alerts</h2>
        <AlertList alerts={alerts} limit={6} />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-primary">Facilities, worst health score first</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((snapshot) => (
            <FacilityCard key={snapshot.facility.id} snapshot={snapshot} />
          ))}
        </div>
      </div>
    </div>
  );
}
