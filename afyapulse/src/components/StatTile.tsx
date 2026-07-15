import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  delta,
  deltaGood,
  hint,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaGood?: boolean;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-surface p-4">
      <div className="text-xs font-medium text-ink-secondary">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-ink-primary">{value}</span>
        {delta && (
          <span className={cn("text-xs font-medium", deltaGood ? "text-success" : "text-status-critical")}>
            {delta}
          </span>
        )}
      </div>
      {hint && <div className="mt-1 text-xs text-ink-muted">{hint}</div>}
    </div>
  );
}
