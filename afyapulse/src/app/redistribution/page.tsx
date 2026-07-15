import { computeAllProposals } from "@/lib/redistribution";
import { getFacility, STOCK_ITEMS } from "@/lib/data/store";
import { RedistributionCard } from "@/components/RedistributionCard";
import { StatTile } from "@/components/StatTile";

export default async function RedistributionPage() {
  const { proposals, serviceUnavailable } = await computeAllProposals();
  const totalUnits = proposals.reduce((sum, p) => sum + p.quantity, 0);
  const critical = proposals.filter((p) => p.urgency === "critical").length;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <div className="text-xs font-medium uppercase tracking-wide text-series-1">Redistribution</div>
        <h1 className="text-2xl font-semibold text-ink-primary">Move stock, not just data</h1>
        <p className="max-w-2xl text-sm text-ink-secondary">
          Solved as a transportation problem (SciPy linear programming) across every facility&apos;s live stock
          position — proposing the minimum-distance transfers that clear deficits without breaching any source
          facility&apos;s own safety buffer.
        </p>
      </div>

      {serviceUnavailable && (
        <div className="mb-6 rounded-lg border border-status-warning/30 bg-status-warning/10 px-4 py-3 text-sm text-ink-primary">
          The forecasting/optimization service isn&apos;t reachable right now — start it with{" "}
          <code className="rounded bg-surface-raised px-1 py-0.5 text-xs">
            services/forecasting: .venv\Scripts\python -m uvicorn main:app --port 8010
          </code>
          .
        </div>
      )}

      <div className="mb-8 grid grid-cols-3 gap-4">
        <StatTile label="Proposed transfers" value={String(proposals.length)} />
        <StatTile label="Critical" value={String(critical)} />
        <StatTile label="Total units in motion" value={String(totalUnits)} />
      </div>

      {proposals.length === 0 ? (
        <div className="rounded-xl border border-hairline bg-surface p-6 text-sm text-ink-secondary">
          No redistribution needed right now — every facility holds adequate stock relative to its neighbors.
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
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
