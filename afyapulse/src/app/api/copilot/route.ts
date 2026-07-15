import { NextRequest, NextResponse } from "next/server";
import { runCopilotTurn } from "@/lib/gemma/agent";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { history?: { role: "user" | "model"; text: string }[]; message?: string };
  const message = body.message?.trim();
  if (!message) return NextResponse.json({ error: "message is required" }, { status: 400 });

  const result = await runCopilotTurn(body.history ?? [], message);
  return NextResponse.json(result);
}
