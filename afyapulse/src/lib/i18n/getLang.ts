import { cookies } from "next/headers";
import type { Lang } from "./translations";

const COOKIE_NAME = "afyapulse-lang";

/** Server-side: read the visitor's language preference from the cookie set by <LanguageToggle>. */
export function getLang(): Lang {
  const value = cookies().get(COOKIE_NAME)?.value;
  return value === "sw" ? "sw" : "en";
}

export { COOKIE_NAME as LANG_COOKIE_NAME };
