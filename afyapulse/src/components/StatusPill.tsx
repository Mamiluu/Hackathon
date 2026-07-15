import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/i18n/translations";

export type Severity = "critical" | "warning" | "info" | "good";

const SEVERITY_META: Record<Severity, { color: string; bg: string; icon: string; label: Record<Lang, string> }> = {
  critical: { color: "text-status-critical", bg: "bg-status-critical/10", icon: "⛔", label: { en: "Critical", sw: "Dharura" } },
  warning: { color: "text-status-warning", bg: "bg-status-warning/15", icon: "▲", label: { en: "Warning", sw: "Onyo" } },
  info: { color: "text-series-1", bg: "bg-series-1/10", icon: "ℹ", label: { en: "Info", sw: "Taarifa" } },
  good: { color: "text-status-good", bg: "bg-status-good/10", icon: "●", label: { en: "Good", sw: "Nzuri" } },
};

export function StatusPill({ severity, text, lang = "en" }: { severity: Severity; text?: string; lang?: Lang }) {
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
      {text ?? meta.label[lang]}
    </span>
  );
}
