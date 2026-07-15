import { IntakeClient } from "@/components/IntakeClient";
import { getLang } from "@/lib/i18n/getLang";

export const dynamic = "force-dynamic";

export default function IntakePage() {
  const lang = getLang();
  return <IntakeClient lang={lang} />;
}
