import { gatherComplianceStats } from "@/lib/gemma/compliance";
import { StatTile } from "@/components/StatTile";
import { ComplianceClient } from "@/components/ComplianceClient";
import { getLang } from "@/lib/i18n/getLang";
import { t } from "@/lib/i18n/translations";
import { ensureAutoTranslated } from "@/lib/i18n/autoTranslate.server";

export const dynamic = "force-dynamic";

export default async function CompliancePage() {
  const lang = getLang();
  await ensureAutoTranslated(lang);
  const stats = await gatherComplianceStats(lang);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <div className="text-xs font-medium uppercase tracking-wide text-series-1">{t("complianceEyebrow", lang)}</div>
        <h1 className="text-2xl font-semibold text-ink-primary">{t("complianceTitle", lang)}</h1>
        <p className="max-w-2xl text-sm text-ink-secondary">{t("complianceSubtitle", lang)}</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label={t("complianceDigitized", lang)} value={`${stats.facilitiesDigitized}/${stats.facilitiesMonitored}`} />
        <StatTile label={t("statCriticalAlerts", lang)} value={String(stats.criticalAlerts)} />
        <StatTile label={t("complianceDispatched", lang)} value={`${stats.proposalsDispatched}/${stats.proposalsProposed}`} />
        <StatTile label={t("outbreakWatchTitle", lang)} value={String(stats.outbreakSignals)} />
      </div>

      <ComplianceClient lang={lang} />
    </div>
  );
}
