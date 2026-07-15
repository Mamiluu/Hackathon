import { cn } from "@/lib/utils";

export type Severity = "critical" | "warning" | "info" | "good";

const SEVERITY_META: Record<Severity, { color: string; bg: string; icon: string; label: string }> = {
  critical: { color: "text-status-critical", bg: "bg-status-critical/10", icon: "⛔", label: "Critical" },
  warning: { color: "text-status-warning", bg: "bg-status-warning/15", icon: "▲", label: "Warning" },
  info: { color: "text-series-1", bg: "bg-series-1/10", icon: "ℹ", label: "Info" },
  good: { color: "text-status-good", bg: "bg-status-good/10", icon: "●", label: "Good" },
};

export function StatusPill({ severity, text }: { severity: Severity; text?: string }) {
  const meta = SEVERITY_META[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        meta.color,
        meta.bg
      )}
    >
      <span aria-hidden className="text-[10px]">
        {meta.icon}
      </span>
      {text ?? meta.label}
    </span>
  );
}
