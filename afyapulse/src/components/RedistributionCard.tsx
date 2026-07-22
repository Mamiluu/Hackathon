"use client";

import { useState, useTransition } from "react";
import type { RedistributionProposal } from "@/lib/data/types";
import { StatusPill, type Severity } from "./StatusPill";
import { TraceDisclosure } from "./TraceDisclosure";
import { cn } from "@/lib/utils";
import { t, type Lang } from "@/lib/i18n/translations";

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

  function dispatch() {
    startTransition(async () => {
      await fetch("/api/redistribution/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: proposal.id, status: "dispatched" }),
      });
      setStatus("dispatched");
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

      {brief && (
        <div className="mt-3 rounded-lg border border-series-1/20 bg-series-1/5 p-3 text-xs text-ink-primary">
          <div className="mb-1 flex items-center gap-1.5 font-medium text-series-1">
            <span aria-hidden>◎</span> {t("gemmaBrief", lang)}
          </div>
          {brief}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={dispatch}
          disabled={status === "dispatched" || isPending}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            status === "dispatched"
              ? "cursor-default bg-status-good/15 text-status-good"
              : "bg-series-1 text-white hover:bg-series-1/90 disabled:opacity-60"
          )}
        >
          {status === "dispatched" ? t("dispatchedCheck", lang) : isPending ? t("dispatching", lang) : t("approveDispatch", lang)}
        </button>
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
