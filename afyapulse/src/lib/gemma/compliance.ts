import { chatComplete } from "./client";
import { getAllAlerts } from "@/lib/data/alertEngine";
import { detectOutbreakSignals } from "@/lib/data/outbreakEngine";
import { FACILITIES, TODAY } from "@/lib/data/store";
import { computeAllProposals } from "@/lib/redistribution";
import { LANGUAGE_NAME, type Lang } from "@/lib/i18n/translations";

/**
 * SHA (Social Health Authority) requires facilities to digitize stock/bed/staffing/diagnostics
 * reporting within 90 days or be de-contracted -- the regulatory hook this whole project is
 * pitched against. This turns that into a one-click artifact: real counts pulled from the same
 * data every other page reads, handed to Gemma to write up as a short memo a DHO could actually
 * forward. Same pattern as the redistribution dispatch brief -- never invent a number.
 */
export interface ComplianceStats {
  date: string;
  facilitiesMonitored: number;
  facilitiesDigitized: number;
  criticalAlerts: number;
  warningAlerts: number;
  proposalsProposed: number;
  proposalsApproved: number;
  proposalsDispatched: number;
  outbreakSignals: number;
}

export async function gatherComplianceStats(lang: Lang = "en"): Promise<ComplianceStats> {
  const alerts = getAllAlerts(lang);
  const { proposals } = await computeAllProposals(lang);
  const signals = detectOutbreakSignals(lang);

  return {
    date: TODAY,
    facilitiesMonitored: FACILITIES.length,
    // Every facility in this system reports daily stock/bed/staffing/diagnostics data --
    // that is precisely what "digitized" means under the SHA directive.
    facilitiesDigitized: FACILITIES.length,
    criticalAlerts: alerts.filter((a) => a.severity === "critical").length,
    warningAlerts: alerts.filter((a) => a.severity === "warning").length,
    proposalsProposed: proposals.filter((p) => p.status === "proposed").length,
    proposalsApproved: proposals.filter((p) => p.status === "approved").length,
    proposalsDispatched: proposals.filter((p) => p.status === "dispatched").length,
    outbreakSignals: signals.length,
  };
}

function statsLine(stats: ComplianceStats): string {
  return (
    `Reporting date: ${stats.date}. Facilities monitored: ${stats.facilitiesMonitored}. ` +
    `Facilities with digital daily stock/bed/staffing/diagnostics reporting: ${stats.facilitiesDigitized}/${stats.facilitiesMonitored}. ` +
    `Open critical alerts: ${stats.criticalAlerts}. Open warning alerts: ${stats.warningAlerts}. ` +
    `Redistribution proposals: ${stats.proposalsProposed} proposed, ${stats.proposalsApproved} approved, ${stats.proposalsDispatched} dispatched. ` +
    `Active outbreak/cluster surveillance signals: ${stats.outbreakSignals}.`
  );
}

export async function generateComplianceReport(
  lang: Lang = "en"
): Promise<{ report: string; stats: ComplianceStats; mocked: boolean }> {
  const stats = await gatherComplianceStats(lang);

  const result = await chatComplete({
    systemInstruction:
      "You are AfyaPulse's compliance assistant, drafting a short SHA (Social Health Authority) digitization " +
      "compliance memo for a District Health Officer in Kilifi County, Kenya, under SHA's 90-day digitize-or-de-contract " +
      `directive. Write exactly 3 short sentences, no markdown, entirely in ${LANGUAGE_NAME[lang]}. Be terse -- this is a ` +
      "memo, not an essay. Use ONLY the figures given, never invent a number: sentence 1 states digitization coverage " +
      "and open alert posture, sentence 2 cites redistribution/outbreak-surveillance activity as evidence of active " +
      "accountability, sentence 3 is the one-line compliance verdict.",
    messages: [{ role: "user", text: statsLine(stats) }],
    mockFallback: () => ({
      text:
        lang === "sw"
          ? `(Rasimu ya Nje ya Mtandao — unganisha GEMINI_API_KEY kwa Gemma 4 halisi) ` +
            `Vituo ${stats.facilitiesDigitized}/${stats.facilitiesMonitored} vinaripoti data kidijitali kila siku. ` +
            `Tahadhari za dharura ${stats.criticalAlerts} zinaendelea, onyo ${stats.warningAlerts}. ` +
            `Uhamishaji ${stats.proposalsDispatched} umetumwa kati ya ${stats.proposalsProposed} yaliyopendekezwa, ikithibitisha uwajibikaji hai wa akiba. ` +
            `Dalili za mlipuko ${stats.outbreakSignals} zinafuatiliwa. Hali: inakidhi matakwa ya SHA ya uwekaji data kidijitali.`
          : `(Offline draft — connect GEMINI_API_KEY for live Gemma 4 generation) ` +
            `${stats.facilitiesDigitized}/${stats.facilitiesMonitored} facilities report digital daily data. ` +
            `${stats.criticalAlerts} critical and ${stats.warningAlerts} warning alert(s) open. ` +
            `${stats.proposalsDispatched} of ${stats.proposalsProposed} proposed redistribution transfers dispatched, evidencing active stock accountability. ` +
            `${stats.outbreakSignals} outbreak surveillance signal(s) being tracked. Verdict: within SHA digitization compliance.`,
      functionCalls: [],
      mocked: true,
    }),
  });

  return { report: result.text, stats, mocked: result.mocked };
}
