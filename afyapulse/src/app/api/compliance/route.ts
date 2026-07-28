import { NextRequest, NextResponse } from "next/server";
import { generateComplianceReport } from "@/lib/gemma/compliance";
import { parseLang } from "@/lib/i18n/translations";

// Gemma's non-streaming generateContent call for this route has measured 60+s in production --
// well past Vercel's default function timeout. Without this, the platform kills the request
// before Gemma can finish, and the user sees a 500 error. This is a temporary workaround until we can
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { lang?: string };
  const lang = parseLang(body.lang);
  const result = await generateComplianceReport(lang);
  return NextResponse.json(result);
}
