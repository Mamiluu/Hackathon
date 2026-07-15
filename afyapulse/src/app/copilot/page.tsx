import { CopilotClient } from "@/components/CopilotClient";
import { getLang } from "@/lib/i18n/getLang";

export const dynamic = "force-dynamic";

export default function CopilotPage() {
  const lang = getLang();
  return <CopilotClient lang={lang} />;
}
