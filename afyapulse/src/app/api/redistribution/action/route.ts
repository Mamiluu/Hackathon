import { NextRequest, NextResponse } from "next/server";
import { setRedistributionOverride } from "@/lib/data/store";
import type { RedistributionProposal } from "@/lib/data/types";

const VALID_STATUSES: RedistributionProposal["status"][] = ["proposed", "approved", "dispatched"];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, status } = body as { id?: string; status?: string };

  if (!id || !status || !VALID_STATUSES.includes(status as RedistributionProposal["status"])) {
    return NextResponse.json({ error: "id and a valid status are required" }, { status: 400 });
  }

  setRedistributionOverride(id, { status: status as RedistributionProposal["status"] });
  return NextResponse.json({ ok: true });
}
