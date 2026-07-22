import Link from "next/link";
import type { OutbreakSignal } from "@/lib/data/types";
import { getFacility } from "@/lib/data/store";
import { cn } from "@/lib/utils";
import { t, type Lang } from "@/lib/i18n/translations";

export function OutbreakWatch({ signals, lang = "en" }: { signals: OutbreakSignal[]; lang?: Lang }) {
  return (
    <div className="rounded-xl border border-hairline bg-surface p-4">
      <div className="mb-1 flex items-center gap-2">
        <span aria-hidden className="text-sm">
          🩺
        </span>
        <h2 className="text-sm font-semibold text-ink-primary">{t("outbreakWatchTitle", lang)}</h2>
      </div>
      <p className="mb-3 text-xs text-ink-secondary">{t("outbreakWatchSubtitle", lang)}</p>

      {signals.length === 0 ? (
        <div className="rounded-lg border border-hairline bg-surface-raised px-3 py-2.5 text-xs text-ink-secondary">
          {t("outbreakWatchClear", lang)}
        </div>
      ) : (
        <ul className="space-y-2">
          {signals.map((signal) => {
            const isCluster = signal.facilityIds.length >= 2;
            return (
              <li
                key={signal.id}
                className={cn(
                  "rounded-lg border p-3",
                  isCluster ? "border-status-critical/25 bg-status-critical/5" : "border-status-warning/25 bg-status-warning/5"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      isCluster ? "bg-status-critical/15 text-status-critical" : "bg-status-warning/15 text-status-warning"
                    )}
                  >
                    {isCluster ? t("outbreakClusterBadge", lang) : t("outbreakWatchBadge", lang)}
                  </span>
                  <span className="text-xs font-medium tabular text-ink-primary">+{signal.weekOverWeekGrowthPct}%</span>
                </div>
                <p className="mt-1.5 text-xs text-ink-secondary">{signal.message}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {signal.facilityIds.map((facilityId) => {
                    const facility = getFacility(facilityId);
                    if (!facility) return null;
                    return (
                      <Link
                        key={facilityId}
                        href={`/facility/${facilityId}`}
                        className="rounded-full border border-hairline bg-surface px-2 py-0.5 text-[11px] text-ink-secondary hover:border-series-1/40 hover:text-series-1"
                      >
                        {facility.name}
                      </Link>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
