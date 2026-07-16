import { NextRequest, NextResponse } from "next/server";
import { computeAllProposals } from "@/lib/redistribution";
import { getRedistributionOverride, setRedistributionOverride } from "@/lib/data/store";
import { chatComplete } from "@/lib/gemma/client";
import { LANGUAGE_NAME, parseLang } from "@/lib/i18n/translations";

export async function POST(req: NextRequest) {
  const { id, lang: rawLang } = (await req.json()) as { id?: string; lang?: string };
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const lang = parseLang(rawLang);

  const { proposals } = await computeAllProposals(lang);
  const proposal = proposals.find((p) => p.id === id);
  if (!proposal) return NextResponse.json({ error: "proposal not found" }, { status: 404 });

  const result = await chatComplete({
    systemInstruction:
      "You are AfyaPulse's district logistics assistant, writing for a District Health Officer in Kilifi County, Kenya. " +
      `Write a short, concrete dispatch brief (3-4 sentences, no markdown) authorizing a stock transfer between two health facilities, entirely in ${LANGUAGE_NAME[lang]}. ` +
      "Name the facilities, the item, the quantity, the urgency, and the transit estimate exactly as given. Do not invent numbers not provided.",
    messages: [{ role: "user", text: proposal.reasoning + ` Quantity to move: ${proposal.quantity}. Urgency: ${proposal.urgency}.` }],
    mockFallback: () => ({
      text:
        lang === "sw"
          ? `(Rasimu ya Nje ya Mtandao — unganisha GEMINI_API_KEY kwa Gemma 4 halisi) ` +
            `Idhinisha uhamishaji wa haraka: vitengo ${proposal.quantity} kulingana na upungufu ulioainishwa. ${proposal.reasoning} ` +
            `Pendekezo: tuma katika safari ijayo ya gari kutokana na dharura ya ${proposal.urgency}.`
          : `(Offline draft — connect GEMINI_API_KEY for live Gemma 4 generation) ` +
            `Authorize immediate transfer: ${proposal.quantity} units per the flagged deficit. ${proposal.reasoning} ` +
            `Recommend dispatch within the next courier run given ${proposal.urgency} urgency.`,
      functionCalls: [],
      mocked: true,
    }),
  });

  const existing = getRedistributionOverride(id);
  setRedistributionOverride(id, { status: existing?.status ?? "proposed", brief: result.text });

  return NextResponse.json({ brief: result.text, mocked: result.mocked });
}
