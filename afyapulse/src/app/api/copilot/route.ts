import { NextRequest, NextResponse } from "next/server";
import { runCopilotTurn } from "@/lib/gemma/agent";
import type { Lang } from "@/lib/i18n/translations";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { history?: { role: "user" | "model"; text: string }[]; message?: string; lang?: string };
  const message = body.message?.trim();
  if (!message) return NextResponse.json({ error: "message is required" }, { status: 400 });
  const lang: Lang = body.lang === "sw" ? "sw" : "en";

  const result = await runCopilotTurn(body.history ?? [], message, lang);
  return NextResponse.json(result);
}
