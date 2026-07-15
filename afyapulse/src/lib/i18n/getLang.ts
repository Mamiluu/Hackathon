import { cookies } from "next/headers";
import type { Lang } from "./translations";
import { LANG_COOKIE_NAME } from "./constants";

/** Server-side: read the visitor's language preference from the cookie set by <LanguageToggle>. */
export function getLang(): Lang {
  const value = cookies().get(LANG_COOKIE_NAME)?.value;
  return value === "sw" ? "sw" : "en";
}
