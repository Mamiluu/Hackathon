"use client";

import { useEffect, useRef, useState } from "react";
import { t, type Lang } from "@/lib/i18n/translations";

const SLOW_HINT_AFTER_MS = 8000;

export function ComplianceClient({ lang }: { lang: Lang }) {
  const [report, setReport] = useState<string | null>(null);
  const [mocked, setMocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState(false);
  const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (slowTimer.current) clearTimeout(slowTimer.current);
  }, []);

  async function generate() {
    setLoading(true);
    setSlow(false);
    setError(false);
    slowTimer.current = setTimeout(() => setSlow(true), SLOW_HINT_AFTER_MS);

    try {
      const res = await fetch("/api/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang }),
      });
      if (!res.ok) throw new Error(`compliance report request failed: ${res.status}`);
      const json = await res.json();
      setReport(json.report);
      setMocked(json.mocked);
    } catch {
      setError(true);
    } finally {
      if (slowTimer.current) clearTimeout(slowTimer.current);
      setLoading(false);
      setSlow(false);
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

      {loading && slow && <p className="mt-2 text-xs text-ink-muted">{t("complianceGeneratingSlow", lang)}</p>}
      {error && <p className="mt-2 text-xs text-status-critical">{t("complianceError", lang)}</p>}

      {report && (
        <div className="mt-4 whitespace-pre-wrap rounded-lg border border-series-1/20 bg-series-1/5 p-4 text-sm text-ink-primary">
          {report}
          {mocked && <div className="mt-2 text-[10px] text-ink-muted">{t("offlineDraft", lang)}</div>}
        </div>
      )}
    </div>
  );
}
