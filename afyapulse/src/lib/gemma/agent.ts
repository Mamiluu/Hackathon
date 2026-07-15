import { generateContent, isGemmaConfigured, type Content } from "./client";
import { TOOL_DECLARATIONS, executeTool } from "./tools";
import { getAllAlerts } from "@/lib/data/alertEngine";
import { LANGUAGE_NAME, type Lang } from "@/lib/i18n/translations";

function systemInstruction(lang: Lang) {
  return (
    "You are the AfyaPulse Copilot, an assistant for the District Health Officer overseeing primary health " +
    "facilities in Kilifi County, Kenya. Answer using the provided tools to fetch live facility, stock, forecast, " +
    "and redistribution data -- never invent numbers. Be concise and operational: name facilities and figures " +
    `directly. Respond entirely in ${LANGUAGE_NAME[lang]}. If a question needs data you don't have a tool for, say so plainly.`
  );
}

const MAX_TOOL_ROUNDS = 4;

export interface CopilotTurnResult {
  text: string;
  mocked: boolean;
  toolsUsed: string[];
}

async function mockTurn(userMessage: string, lang: Lang): Promise<CopilotTurnResult> {
  const lower = userMessage.toLowerCase();
  const toolsUsed: string[] = [];

  const riskWords = ["risk", "stockout", "stock-out", "critical", "hatari", "dharura"];
  if (riskWords.some((w) => lower.includes(w))) {
    toolsUsed.push("list_at_risk_facilities");
    const alerts = getAllAlerts(lang).slice(0, 5);
    const lines = alerts.map((a) => `- ${a.message}`).join("\n");
    return {
      text:
        lang === "sw"
          ? `(Rasimu ya Nje ya Mtandao — unganisha GEMINI_API_KEY kwa uwezo halisi wa Gemma 4)\n` +
            `Hatari kuu za vituo sasa hivi:\n${lines || "Hakuna tahadhari zinazoendelea."}`
          : `(Offline draft — connect GEMINI_API_KEY for live Gemma 4 reasoning)\n` +
            `Top facility risks right now:\n${lines || "No active alerts."}`,
      mocked: true,
      toolsUsed,
    };
  }

  return {
    text:
      lang === "sw"
        ? "(Rasimu ya Nje ya Mtandao — unganisha GEMINI_API_KEY kwa uwezo halisi wa Gemma 4) " +
          "Naweza kujibu maswali kuhusu hali ya vituo, utabiri wa akiba, na mapendekezo ya ugawaji nikiwa nimeunganishwa. " +
          "Jaribu kuuliza: \"ni vituo gani viko hatarini kuishiwa na dawa?\""
        : "(Offline draft — connect GEMINI_API_KEY for live Gemma 4 reasoning) " +
          "I can answer questions about facility status, stock forecasts, and redistribution proposals once connected. " +
          "Try asking: \"which facilities are at stockout risk?\"",
    mocked: true,
    toolsUsed,
  };
}

export async function runCopilotTurn(
  history: { role: "user" | "model"; text: string }[],
  userMessage: string,
  lang: Lang = "en"
): Promise<CopilotTurnResult> {
  if (!isGemmaConfigured) return mockTurn(userMessage, lang);

  const contents: Content[] = [
    ...history.map((h) => ({ role: h.role, parts: [{ text: h.text }] }) as Content),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  const toolsUsed: string[] = [];

  try {
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await generateContent({
        contents,
        systemInstruction: systemInstruction(lang),
        tools: TOOL_DECLARATIONS,
      });

      if (response.functionCalls.length === 0) {
        return { text: response.text, mocked: false, toolsUsed };
      }

      contents.push({ role: "model", parts: response.functionCalls.map((fc) => ({ functionCall: fc })) });

      const functionResponseParts = await Promise.all(
        response.functionCalls.map(async (fc) => {
          toolsUsed.push(fc.name);
          const result = await executeTool(fc.name, fc.args);
          return { functionResponse: { name: fc.name, response: result } };
        })
      );
      contents.push({ role: "function", parts: functionResponseParts });
    }

    return {
      text:
        lang === "sw"
          ? "Nimepata data lakini hatua za kufikiri zimeisha -- jaribu kubainisha swali lako kwa kituo au bidhaa moja."
          : "I gathered the data but ran out of reasoning steps -- try narrowing your question to one facility or item.",
      mocked: false,
      toolsUsed,
    };
  } catch (err) {
    console.error("[gemma] runCopilotTurn failed, falling back to mock:", err);
    const fallback = await mockTurn(userMessage, lang);
    return { ...fallback, mocked: true };
  }
}
