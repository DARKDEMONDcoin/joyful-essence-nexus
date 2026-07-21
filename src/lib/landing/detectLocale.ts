// Detects the best landing locale for the visitor across all supported
// locales. Rules (in priority order):
//   1. Timezone Africa/Cairo → ar-eg (Egyptian phones)
//   2. navigator.language starts with "ar-EG" → ar-eg (Egyptian dialect)
//   3. navigator.language starts with "ar"    → ar    (MSA)
//   4. Match language prefix (e.g. "pt-BR" → "pt") against LOCALES
//   5. Fallback → en
import { LOCALES, type LocaleCode, getLocale } from "./i18n/locales";

export type SupportedLandingLocale = LocaleCode;

export function detectLandingLocale(): SupportedLandingLocale {
  if (typeof window === "undefined") return "en";

  // Timezone is only used as a *tie-breaker* for Arabic dialect selection.
  // It must NOT override the visitor's explicit browser language — e.g. an
  // English-speaking visitor in Cairo should still see the English landing.
  let tz = "";
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    // ignore
  }
  const EGYPT_TZS = new Set(["Africa/Cairo"]);
  const isEgyptTz = EGYPT_TZS.has(tz);

  const langs: string[] = Array.isArray(navigator.languages) && navigator.languages.length
    ? [...navigator.languages]
    : [navigator.language || "en"];

  const codes = new Set<string>(LOCALES.map((l) => l.code));

  for (const raw of langs) {
    const lang = raw.toLowerCase();

    // Arabic special cases — dialect first, then MSA
    if (lang === "ar-eg" || lang.startsWith("ar-eg")) return "ar-eg";
    if (lang.startsWith("ar")) {
      // If the browser only says "ar" but the visitor is in Egypt, prefer the Egyptian dialect.
      return isEgyptTz ? "ar-eg" : "ar";
    }

    // Chinese variants → zh
    if (lang.startsWith("zh")) return "zh";

    // Exact match
    if (codes.has(lang as LocaleCode)) return lang as LocaleCode;

    // Prefix match ("pt-br" → "pt")
    const prefix = lang.split("-")[0];
    if (codes.has(prefix as LocaleCode)) return prefix as LocaleCode;
  }
  return "en";
}

/** URL path (with leading slash) for a detected locale, or "" for English. */
export function landingPathForLocale(code: SupportedLandingLocale): string {
  return getLocale(code).path;
}
