import Link from "next/link";
import { t, type Lang } from "@/lib/i18n/translations";

interface StoryBannerProps {
  facilityId: string;
  facilityName: string;
  itemName: string;
  sourceName: string;
  distanceKm: number;
  lang?: Lang;
}

const STEPS = [
  { titleKey: "storyStep1", descKey: "storyStep1Desc" },
  { titleKey: "storyStep2", descKey: "storyStep2Desc" },
  { titleKey: "storyStep3", descKey: "storyStep3Desc" },
  { titleKey: "storyStep4", descKey: "storyStep4Desc" },
] as const;

export function StoryBanner({ facilityId, facilityName, itemName, sourceName, distanceKm, lang = "en" }: StoryBannerProps) {
  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-status-critical/25 bg-status-critical/5">
      <div className="p-5">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-status-critical">{t("storyEyebrow", lang)}</div>
        <h2 className="text-lg font-semibold text-ink-primary">{t("storyTitle", lang, { facility: facilityName, item: itemName })}</h2>
        <p className="mt-1.5 max-w-3xl text-sm text-ink-secondary">
          {t("storyBody", lang, { facility: facilityName, source: sourceName, distance: distanceKm })}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.titleKey} className="rounded-lg border border-hairline bg-surface p-3">
              <div className="mb-1 flex h-5 w-5 items-center justify-center rounded-full bg-status-critical/15 text-[10px] font-semibold text-status-critical">
                {i + 1}
              </div>
              <div className="text-xs font-medium text-ink-primary">{t(step.titleKey, lang)}</div>
              <div className="mt-0.5 text-[11px] text-ink-muted">{t(step.descKey, lang)}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            href={`/facility/${facilityId}`}
            className="rounded-md bg-surface px-3 py-1.5 text-xs font-medium text-ink-primary border border-hairline hover:border-series-1/40 hover:text-series-1"
          >
            {t("storySeeForecast", lang)} →
          </Link>
          <Link
            href="/redistribution"
            className="rounded-md bg-status-critical px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
          >
            {t("storySeeFix", lang)} →
          </Link>
        </div>
      </div>
    </div>
  );
}
