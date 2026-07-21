import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { LandingContent } from "./i18n/types";
import { LOCALES, type LocaleCode, type LocaleMeta, getLocale } from "./i18n/locales";

// Only English ships in the initial landing bundle. Every other locale is a
// dynamic import that downloads ONLY when a visitor hits its URL prefix
// (/ar, /es, /fr, ...). This removes ~24 translation modules × ~200 lines
// each from the landing critical path — the biggest single win on the
// LandingPage chunk.
import en from "./i18n/en";

const LAZY_CONTENT: Record<Exclude<LocaleCode, "en">, () => Promise<{ default: LandingContent }>> = {
  ar: () => import("./i18n/ar"),
  "ar-eg": () => import("./i18n/ar-eg"),
  es: () => import("./i18n/es"),
  fr: () => import("./i18n/fr"),
  de: () => import("./i18n/de"),
  pt: () => import("./i18n/pt"),
  it: () => import("./i18n/it"),
  tr: () => import("./i18n/tr"),
  ru: () => import("./i18n/ru"),
  zh: () => import("./i18n/zh"),
  ja: () => import("./i18n/ja"),
  ko: () => import("./i18n/ko"),
  hi: () => import("./i18n/hi"),
  id: () => import("./i18n/id"),
  nl: () => import("./i18n/nl"),
  sv: () => import("./i18n/sv"),
  cs: () => import("./i18n/cs"),
  ro: () => import("./i18n/ro"),
  el: () => import("./i18n/el"),
  uk: () => import("./i18n/uk"),
  he: () => import("./i18n/he"),
  fa: () => import("./i18n/fa"),
  vi: () => import("./i18n/vi"),
  th: () => import("./i18n/th"),
  pl: () => import("./i18n/pl"),
};

// Module-scope cache so switching locales twice never re-downloads.
const cache: Partial<Record<LocaleCode, LandingContent>> = { en };

async function loadLocaleContent(code: LocaleCode): Promise<LandingContent> {
  if (cache[code]) return cache[code]!;
  const loader = (LAZY_CONTENT as Record<string, undefined | (() => Promise<{ default: LandingContent }>)>)[code];
  if (!loader) return en;
  try {
    const mod = await loader();
    cache[code] = mod.default;
    return mod.default;
  } catch {
    return en;
  }
}

interface Ctx {
  locale: LocaleMeta;
  content: LandingContent;
}

const LandingContentContext = createContext<Ctx | null>(null);

export const LandingContentProvider = ({
  locale,
  children,
}: {
  locale: LocaleCode;
  children: ReactNode;
}) => {
  const meta = getLocale(locale);
  // English is available synchronously; non-English starts on English until
  // the locale chunk resolves. Visitors on /ar see a very brief English
  // flash on first paint, then the Arabic content swaps in — which is far
  // better than shipping all 25 languages to every visitor.
  const initial = cache[locale] ?? en;
  const [content, setContent] = useState<LandingContent>(initial);
  useEffect(() => {
    let cancelled = false;
    if (cache[locale]) {
      setContent(cache[locale]!);
      return;
    }
    void loadLocaleContent(locale).then((c) => {
      if (!cancelled) setContent(c);
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  return (
    <LandingContentContext.Provider value={{ locale: meta, content }}>
      {children}
    </LandingContentContext.Provider>
  );
};

export const useLandingContent = () => {
  const ctx = useContext(LandingContentContext);
  if (!ctx) {
    return { locale: LOCALES[0], content: en };
  }
  return ctx;
};

export { LOCALES };
export type { LocaleCode, LocaleMeta };
