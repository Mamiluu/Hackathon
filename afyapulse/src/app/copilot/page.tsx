// This is a Next.js page component that renders the copilot page of the AfyaPulse application. It imports necessary modules and components, including a CopilotClient component for handling copilot-related interactions, functions to get the user's language preference, and a function to ensure that translations are available for the selected language. The page fetches the user's language preference, ensures that translations are available, and renders the CopilotClient component with the appropriate language setting.
import { CopilotClient } from "@/components/CopilotClient";
import { getLang } from "@/lib/i18n/getLang";
import { ensureAutoTranslated } from "@/lib/i18n/autoTranslate.server";

export const dynamic = "force-dynamic";

export default async function CopilotPage() {
  const lang = getLang();
  await ensureAutoTranslated(lang);
  return <CopilotClient lang={lang} />;
}
