import Link from "next/link";
import { notFound } from "next/navigation";
import { computeFacilitySnapshot, daysOfStockRemaining } from "@/lib/data/alertEngine";
import {
  STOCK_ITEMS,
  TODAY,
  getBedsHistory,
  getDoctorHistory,
  getFacility,
  getFootfallHistory,
  getTestAvailabilityToday,
} from "@/lib/data/store";
import { StatusPill, type Severity } from "@/components/StatusPill";
import { HealthMeter } from "@/components/HealthMeter";
import { Sparkline } from "@/components/Sparkline";
import { AlertList } from "@/components/AlertList";
import { StockForecastChart } from "@/components/StockForecastChart";
import { titleCase } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ESSENTIAL_CATEGORIES = new Set(["antimalarial", "antibiotic", "maternal"]);

const TYPE_LABEL: Record<string, string> = {
  dispensary: "Dispensary",
  health_centre: "Health Centre",
  district_hospital: "District Hospital",
};

function riskSeverity(days: number): Severity {
  if (days < 3) return "critical";
  if (days < 7) return "warning";
  return "good";
}

export default function FacilityDetailPage({ params }: { params: { id: string } }) {
  const facility = getFacility(params.id);
  if (!facility) notFound();

  const snapshot = computeFacilitySnapshot(facility.id);
  const bedsHistory = getBedsHistory(facility.id).slice(-14);
  const doctorHistory = getDoctorHistory(facility.id).slice(-14);
  const footfallHistory = getFootfallHistory(facility.id).slice(-14);
  const testsToday = getTestAvailabilityToday(facility.id);

  const essentialItems = STOCK_ITEMS.filter((i) => ESSENTIAL_CATEGORIES.has(i.category));
  const worstItem = [...essentialItems].sort(
    (a, b) => daysOfStockRemaining(facility.id, a.id) - daysOfStockRemaining(facility.id, b.id)
  )[0];

  const stockTable = STOCK_ITEMS.map((item) => ({
    item,
    days: daysOfStockRemaining(facility.id, item.id),
  })).sort((a, b) => a.days - b.days);

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/" className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-ink-secondary hover:text-series-1">
        ← Command Center
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-series-1">
            {TYPE_LABEL[facility.type]} · {facility.ward} Ward
          </div>
          <h1 className="text-2xl font-semibold text-ink-primary">{facility.name}</h1>
          <p className="text-sm text-ink-secondary">
            {facility.totalBeds} beds · {facility.scheduledStaff} scheduled staff · as of {TODAY}
          </p>
        </div>
        <div className="w-40 shrink-0">
          <HealthMeter score={snapshot.healthScore} />
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-hairline bg-surface p-4">
          <div className="text-xs font-medium text-ink-secondary">Bed occupancy</div>
          <div className="mt-1 flex items-end justify-between">
            <span className="text-2xl font-semibold text-ink-primary">{snapshot.bedOccupancyPct}%</span>
            <Sparkline values={bedsHistory.map((b) => b.occupiedBeds)} />
          </div>
        </div>
        <div className="rounded-xl border border-hairline bg-surface p-4">
          <div className="text-xs font-medium text-ink-secondary">Doctor attendance</div>
          <div className="mt-1 flex items-end justify-between">
            <span className="text-2xl font-semibold text-ink-primary">{snapshot.doctorAttendancePct}%</span>
            <Sparkline values={doctorHistory.map((d) => d.presentStaff)} />
          </div>
        </div>
        <div className="rounded-xl border border-hairline bg-surface p-4">
          <div className="text-xs font-medium text-ink-secondary">Patient footfall today</div>
          <div className="mt-1 flex items-end justify-between">
            <span className="text-2xl font-semibold text-ink-primary">{snapshot.footfallToday}</span>
            <Sparkline values={footfallHistory.map((f) => f.patientCount)} />
          </div>
        </div>
        <div className="rounded-xl border border-hairline bg-surface p-4">
          <div className="text-xs font-medium text-ink-secondary">Test kits unavailable</div>
          <div className="mt-1">
            <span className="text-2xl font-semibold text-ink-primary">{snapshot.testKitsMissing}</span>
            <span className="ml-1 text-sm text-ink-muted">of {testsToday.length}</span>
          </div>
        </div>
      </div>

      {worstItem && (
        <div className="mb-8">
          <StockForecastChart facilityId={facility.id} items={essentialItems} defaultItemId={worstItem.id} />
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink-primary">Full stock position</h2>
          <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline text-left text-xs text-ink-muted">
                  <th className="px-4 py-2 font-medium">Item</th>
                  <th className="px-4 py-2 font-medium">Days left</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {stockTable.map(({ item, days }) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2.5 text-ink-primary">{item.name}</td>
                    <td className="px-4 py-2.5 tabular text-ink-secondary">
                      {Number.isFinite(days) ? days.toFixed(1) : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusPill severity={riskSeverity(days)} text={titleCase(riskSeverity(days) === "good" ? "ok" : riskSeverity(days))} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink-primary">Diagnostics availability today</h2>
          <ul className="divide-y divide-hairline overflow-hidden rounded-xl border border-hairline bg-surface">
            {testsToday.map((t) => {
              const item = STOCK_ITEMS.find((i) => i.id === t.itemId);
              return (
                <li key={t.itemId} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="text-ink-primary">{item?.name}</span>
                  <StatusPill severity={t.available ? "good" : "critical"} text={t.available ? "Available" : "Unavailable"} />
                </li>
              );
            })}
          </ul>

          <h2 className="mb-3 mt-6 text-sm font-semibold text-ink-primary">Active alerts</h2>
          <AlertList alerts={snapshot.alerts} />
        </div>
      </div>
    </div>
  );
}
