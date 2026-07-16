import { CopilotClient } from "@/components/CopilotClient";
import { getLang } from "@/lib/i18n/getLang";
import { ensureAutoTranslated } from "@/lib/i18n/autoTranslate.server";

export const dynamic = "force-dynamic";

export default async function CopilotPage() {
  const lang = getLang();
  await ensureAutoTranslated(lang);
  return <CopilotClient lang={lang} />;
}
