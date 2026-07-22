"use client";

import { useState } from "react";
import { t, type Lang } from "@/lib/i18n/translations";

export function ComplianceClient({ lang }: { lang: Lang }) {
  const [report, setReport] = useState<string | null>(null);
  const [mocked, setMocked] = useState(false);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang }),
      });
      const json = await res.json();
      setReport(json.report);
      setMocked(json.mocked);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-hairline bg-surface p-4">
      <button
        onClick={generate}
        disabled={loading}
        className="rounded-md bg-series-1 px-4 py-2 text-sm font-medium text-white hover:bg-series-1/90 disabled:opacity-60"
      >
        {loading ? t("complianceGenerating", lang) : report ? t("complianceRegenerate", lang) : t("complianceGenerate", lang)}
      </button>

      {report && (
        <div className="mt-4 whitespace-pre-wrap rounded-lg border border-series-1/20 bg-series-1/5 p-4 text-sm text-ink-primary">
          {report}
          {mocked && <div className="mt-2 text-[10px] text-ink-muted">{t("offlineDraft", lang)}</div>}
        </div>
      )}
    </div>
  );
}
