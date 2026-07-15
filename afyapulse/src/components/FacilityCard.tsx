import Link from "next/link";
import type { FacilitySnapshot } from "@/lib/data/types";
import { HealthMeter } from "./HealthMeter";
import { StatusPill } from "./StatusPill";
import { titleCase } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  dispensary: "Dispensary",
  health_centre: "Health Centre",
  district_hospital: "District Hospital",
};

export function FacilityCard({ snapshot }: { snapshot: FacilitySnapshot }) {
  const { facility, healthScore, stockRisk, bedOccupancyPct, doctorAttendancePct, footfallToday, alerts } = snapshot;
  const worstAlert = alerts[0];

  return (
    <Link
      href={`/facility/${facility.id}`}
      className="group flex flex-col rounded-xl border border-hairline bg-surface p-4 transition-colors hover:border-series-1/40 hover:bg-surface-raised"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-ink-primary group-hover:text-series-1">{facility.name}</div>
          <div className="text-xs text-ink-muted">
            {TYPE_LABEL[facility.type]} · {facility.ward} Ward
          </div>
        </div>
        {stockRisk !== "ok" && (
          <StatusPill severity={stockRisk === "critical" ? "critical" : "warning"} text={titleCase(stockRisk)} />
        )}
      </div>

      <div className="mt-4">
        <HealthMeter score={healthScore} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
        <div>
          <div className="text-ink-muted">Beds</div>
          <div className="mt-0.5 font-medium tabular text-ink-primary">{bedOccupancyPct}%</div>
        </div>
        <div>
          <div className="text-ink-muted">Staff present</div>
          <div className="mt-0.5 font-medium tabular text-ink-primary">{doctorAttendancePct}%</div>
        </div>
        <div>
          <div className="text-ink-muted">Footfall today</div>
          <div className="mt-0.5 font-medium tabular text-ink-primary">{footfallToday}</div>
        </div>
      </div>

      {worstAlert && (
        <div className="mt-3 line-clamp-1 border-t border-hairline pt-3 text-xs text-ink-secondary">
          {worstAlert.message}
        </div>
      )}
    </Link>
  );
}
