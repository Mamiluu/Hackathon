"use client";

import { useState, useTransition } from "react";
import type { RedistributionProposal } from "@/lib/data/types";
import { StatusPill, type Severity } from "./StatusPill";
import { cn } from "@/lib/utils";

export function RedistributionCard({
  proposal,
  itemName,
  itemUnit,
  sourceFacilityName,
  destFacilityName,
}: {
  proposal: RedistributionProposal;
  itemName: string;
  itemUnit: string;
  sourceFacilityName: string;
  destFacilityName: string;
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
        body: JSON.stringify({ id: proposal.id }),
      });
      const json = await res.json();
      setBrief(json.brief);
    } finally {
      setBriefLoading(false);
    }
  }

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
        <StatusPill severity={proposal.urgency as Severity} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
        <div>
          <div className="text-ink-muted">Quantity</div>
          <div className="mt-0.5 font-medium tabular text-ink-primary">
            {proposal.quantity} {itemUnit}
          </div>
        </div>
        <div>
          <div className="text-ink-muted">Est. transit</div>
          <div className="mt-0.5 font-medium tabular text-ink-primary">{proposal.estTransitMinutes} min</div>
        </div>
        <div>
          <div className="text-ink-muted">Status</div>
          <div className="mt-0.5 font-medium text-ink-primary">
            {status === "dispatched" ? "Dispatched" : status === "approved" ? "Approved" : "Proposed"}
          </div>
        </div>
      </div>

      <p className="mt-3 border-t border-hairline pt-3 text-xs text-ink-secondary">{proposal.reasoning}</p>

      {brief && (
        <div className="mt-3 rounded-lg border border-series-1/20 bg-series-1/5 p-3 text-xs text-ink-primary">
          <div className="mb-1 flex items-center gap-1.5 font-medium text-series-1">
            <span aria-hidden>◎</span> Gemma dispatch brief
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
          {status === "dispatched" ? "✓ Dispatched" : isPending ? "Dispatching…" : "Approve & Dispatch"}
        </button>
        <button
          onClick={generateBrief}
          disabled={briefLoading}
          className="rounded-md border border-hairline px-3 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink-primary disabled:opacity-60"
        >
          {briefLoading ? "Writing brief…" : brief ? "Regenerate brief" : "Generate AI brief"}
        </button>
      </div>
    </div>
  );
}
