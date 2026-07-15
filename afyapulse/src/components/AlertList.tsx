import Link from "next/link";
import type { Alert } from "@/lib/data/types";
import { StatusPill, type Severity } from "./StatusPill";
import { getFacility } from "@/lib/data/store";

export function AlertList({ alerts, limit }: { alerts: Alert[]; limit?: number }) {
  const shown = limit ? alerts.slice(0, limit) : alerts;

  if (shown.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-hairline bg-surface p-4 text-sm text-ink-secondary">
        <StatusPill severity="good" text="No active alerts" />
        <span>Every facility in Kilifi County is within normal operating range.</span>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-hairline overflow-hidden rounded-xl border border-hairline bg-surface">
      {shown.map((alert) => {
        const facility = getFacility(alert.facilityId);
        return (
          <li key={alert.id}>
            <Link
              href={`/facility/${alert.facilityId}`}
              className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-surface-raised"
            >
              <StatusPill severity={alert.severity as Severity} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-ink-primary">{alert.message}</div>
                <div className="text-xs text-ink-muted">{facility?.name}</div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
