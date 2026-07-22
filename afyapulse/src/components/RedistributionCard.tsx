"use client";

import { useEffect, useState, useTransition } from "react";
import type { RedistributionProposal } from "@/lib/data/types";
import { StatusPill, type Severity } from "./StatusPill";
import { TraceDisclosure } from "./TraceDisclosure";
import { LOOKAHEAD_DAYS } from "@/lib/redistributionConfig";
import { readLocalOverride, writeLocalOverride } from "@/lib/localOverrideStore";
import { t, type Lang } from "@/lib/i18n/translations";

interface LocalOverride {
  status: RedistributionProposal["status"];
  brief?: string;
}

export function RedistributionCard({
  proposal,
  itemName,
  itemUnit,
  sourceFacilityName,
  destFacilityName,
  lang = "en",
}: {
  proposal: RedistributionProposal;
  itemName: string;
  itemUnit: string;
  sourceFacilityName: string;
  destFacilityName: string;
  lang?: Lang;
}) {
  const [status, setStatus] = useState(proposal.status);
  const [brief, setBrief] = useState(proposal.brief);
  const [briefLoading, setBriefLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const overrideKey = `redistribution:${proposal.id}`;

  // The server-side override store (lib/data/store.ts) doesn't reliably persist in Vercel's
  // production environment -- this browser's own localStorage is the source of truth for
  // "did I already act on this" across a refresh during an actual demo session.
  useEffect(() => {
    const local = readLocalOverride<LocalOverride>(overrideKey);
    if (local) {
      setStatus(local.status);
      if (local.brief) setBrief(local.brief);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overrideKey]);

  function dispatch() {
    startTransition(async () => {
      await fetch("/api/redistribution/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: proposal.id, status: "dispatched" }),
      });
      setStatus("dispatched");
      writeLocalOverride<LocalOverride>(overrideKey, { status: "dispatched", brief });
    });
  }

  async function generateBrief() {
    setBriefLoading(true);
    try {
      const res = await fetch("/api/redistribution/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: proposal.id, lang }),
      });
      const json = await res.json();
      setBrief(json.brief);
      writeLocalOverride<LocalOverride>(overrideKey, { status, brief: json.brief });
    } finally {
      setBriefLoading(false);
    }
  }

  const statusLabel =
    status === "dispatched" ? t("statusDispatched", lang) : status === "approved" ? t("statusApproved", lang) : t("statusProposed", lang);

  return (
    <div className="rounded-xl border border-hairline bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-ink-primary">{itemName}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-secondary">
            <span className="font-medium text-ink-primary">{sourceFacilityName}</span>
            <span aria-hidden>→</span>
            <span className="font-medium text-ink-primary">{destFacilityName}</span>
          </div>
        </div>
        <StatusPill severity={proposal.urgency as Severity} lang={lang} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
        <div>
          <div className="text-ink-muted">{t("quantity", lang)}</div>
          <div className="mt-0.5 font-medium tabular text-ink-primary">
            {proposal.quantity} {itemUnit}
          </div>
        </div>
        <div>
          <div className="text-ink-muted">{t("estTransit", lang)}</div>
          <div className="mt-0.5 font-medium tabular text-ink-primary">
            {proposal.estTransitMinutes} {t("minutes", lang)}
          </div>
        </div>
        <div>
          <div className="text-ink-muted">{t("statusLabel", lang)}</div>
          <div className="mt-0.5 font-medium text-ink-primary">{statusLabel}</div>
        </div>
      </div>

      <p className="mt-3 border-t border-hairline pt-3 text-xs text-ink-secondary">{proposal.reasoning}</p>

      <TraceDisclosure
        summary={t("traceShowTransferWork", lang)}
        rows={[
          { label: t("traceTransferMethod", lang), value: t("traceTransferMethodValue", lang) },
          { label: t("traceTransferHorizon", lang), value: t("traceTransferHorizonValue", lang, { horizon: LOOKAHEAD_DAYS }) },
          { label: t("traceTransferDistance", lang), value: `${proposal.distanceKm} km` },
          { label: t("traceTransferSafetyBuffer", lang), value: t("traceTransferSafetyBufferValue", lang) },
        ]}
        footnote={t("traceTransferFootnote", lang)}
      />

      {brief && (
        <div className="mt-3 rounded-lg border border-series-1/20 bg-series-1/5 p-3 text-xs text-ink-primary">
          <div className="mb-1 flex items-center gap-1.5 font-medium text-series-1">
            <span aria-hidden>◎</span> {t("gemmaBrief", lang)}
          </div>
          {brief}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        {status === "dispatched" ? (
          // Deliberately a <span>, not a disabled <button>: a colored, undimmed disabled button
          // still reads as clickable at a glance. Once dispatched this is a closed fact, not an
          // action -- it shouldn't be shaped like one.
          <span className="inline-flex items-center gap-1.5 rounded-md bg-status-good/15 px-3 py-1.5 text-xs font-medium text-status-good">
            {t("dispatchedCheck", lang)}
          </span>
        ) : (
          <button
            onClick={dispatch}
            disabled={isPending}
            className="rounded-md bg-series-1 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-series-1/90 disabled:opacity-60"
          >
            {isPending ? t("dispatching", lang) : t("approveDispatch", lang)}
          </button>
        )}
        <button
          onClick={generateBrief}
          disabled={briefLoading}
          className="rounded-md border border-hairline px-3 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink-primary disabled:opacity-60"
        >
          {briefLoading ? t("writingBrief", lang) : brief ? t("regenerateBrief", lang) : t("generateBrief", lang)}
        </button>
      </div>
    </div>
  );
}
