import type { ReactNode } from "react";

export interface TraceRow {
  label: string;
  value: ReactNode;
}

/**
 * The "Trust" pillar made visible: an expandable, click-to-open breakdown of exactly which
 * source numbers and which rule produced a given score/forecast/transfer, right next to the
 * number itself. Plain <details> -- no client JS needed, works identically whether the parent
 * is a server component (facility page) or a "use client" one (RedistributionCard).
 */
export function TraceDisclosure({ summary, rows, footnote }: { summary: string; rows: TraceRow[]; footnote?: string }) {
  return (
    <details className="group mt-2 rounded-lg border border-hairline bg-surface-raised open:bg-surface">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 px-3 py-2 text-xs font-medium text-ink-secondary marker:content-none hover:text-series-1">
        <span aria-hidden className="inline-block text-[10px] transition-transform group-open:rotate-90">
          ▸
        </span>
        {summary}
      </summary>
      <div className="space-y-1.5 border-t border-hairline px-3 py-2.5">
        {rows.map((row, i) => (
          <div key={i} className="flex items-start justify-between gap-3 text-xs">
            <span className="text-ink-muted">{row.label}</span>
            <span className="text-right font-medium tabular text-ink-primary">{row.value}</span>
          </div>
        ))}
        {footnote && <p className="mt-2 border-t border-hairline pt-2 text-[11px] text-ink-muted">{footnote}</p>}
      </div>
    </details>
  );
}
