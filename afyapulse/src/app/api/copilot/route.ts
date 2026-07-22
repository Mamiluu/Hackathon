import { NextRequest, NextResponse } from "next/server";
import { runCopilotTurn } from "@/lib/gemma/agent";
import { parseLang } from "@/lib/i18n/translations";

// Up to MAX_TOOL_ROUNDS Gemma round-trips per turn -- give it real headroom rather than let
// Vercel's default function timeout kill a multi-tool-call answer mid-flight.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { history?: { role: "user" | "model"; text: string }[]; message?: string; lang?: string };
  const message = body.message?.trim();
  if (!message) return NextResponse.json({ error: "message is required" }, { status: 400 });
  const lang = parseLang(body.lang);

  const result = await runCopilotTurn(body.history ?? [], message, lang);
  return NextResponse.json(result);
}
