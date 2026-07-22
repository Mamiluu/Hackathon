import { NextRequest, NextResponse } from "next/server";
import { generateComplianceReport } from "@/lib/gemma/compliance";
import { parseLang } from "@/lib/i18n/translations";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { lang?: string };
  const lang = parseLang(body.lang);
  const result = await generateComplianceReport(lang);
  return NextResponse.json(result);
}
