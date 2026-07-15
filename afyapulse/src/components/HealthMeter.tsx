import { cn } from "@/lib/utils";

function bandFor(score: number): { fill: string; track: string; label: string } {
  if (score >= 80) return { fill: "bg-status-good", track: "bg-status-good/15", label: "Healthy" };
  if (score >= 60) return { fill: "bg-status-warning", track: "bg-status-warning/15", label: "Watch" };
  if (score >= 40) return { fill: "bg-status-serious", track: "bg-status-serious/15", label: "At risk" };
  return { fill: "bg-status-critical", track: "bg-status-critical/15", label: "Critical" };
}

export function HealthMeter({ score, showLabel = true }: { score: number; showLabel?: boolean }) {
  const band = bandFor(score);
  return (
    <div className="w-full">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-2xl font-semibold tabular text-ink-primary">{score}</span>
        {showLabel && <span className="text-xs font-medium text-ink-secondary">{band.label}</span>}
      </div>
      <div className={cn("h-2 w-full overflow-hidden rounded-full", band.track)}>
        <div
          className={cn("h-full rounded-full transition-all", band.fill)}
          style={{ width: `${Math.max(2, Math.min(100, score))}%` }}
        />
      </div>
    </div>
  );
}
