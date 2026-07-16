import { IntakeClient } from "@/components/IntakeClient";
import { getLang } from "@/lib/i18n/getLang";
import { ensureAutoTranslated } from "@/lib/i18n/autoTranslate.server";

export const dynamic = "force-dynamic";

export default async function IntakePage() {
  const lang = getLang();
  await ensureAutoTranslated(lang);
  return <IntakeClient lang={lang} />;
}
