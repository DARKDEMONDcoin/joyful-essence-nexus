// Lazy locale registry for the mobile landing hero. English ships with the
// initial bundle; every supported locale is a dynamic import that downloads only when
// a visitor hits their URL prefix.
import { useEffect, useState } from "react";
import type { LocaleCode } from "../i18n/locales";
import type { MobileContent } from "./types";
import en from "./en";

const LOADERS: Partial<Record<LocaleCode, () => Promise<{ default: MobileContent }>>> = {
  ar: () => import("./ar"),
  "ar-eg": () => import("./ar-eg"),
  es: () => import("./es"),
  fr: () => import("./fr"),
  de: () => import("../i18n/de").then((m) => ({ default: landingToMobile(m.default) })),
  pt: () => import("../i18n/pt").then((m) => ({ default: landingToMobile(m.default) })),
  it: () => import("../i18n/it").then((m) => ({ default: landingToMobile(m.default) })),
  tr: () => import("../i18n/tr").then((m) => ({ default: landingToMobile(m.default) })),
  ru: () => import("../i18n/ru").then((m) => ({ default: landingToMobile(m.default) })),
  zh: () => import("../i18n/zh").then((m) => ({ default: landingToMobile(m.default) })),
  ja: () => import("../i18n/ja").then((m) => ({ default: landingToMobile(m.default) })),
  ko: () => import("../i18n/ko").then((m) => ({ default: landingToMobile(m.default) })),
  hi: () => import("../i18n/hi").then((m) => ({ default: landingToMobile(m.default) })),
  id: () => import("../i18n/id").then((m) => ({ default: landingToMobile(m.default) })),
  nl: () => import("../i18n/nl").then((m) => ({ default: landingToMobile(m.default) })),
  sv: () => import("../i18n/sv").then((m) => ({ default: landingToMobile(m.default) })),
  cs: () => import("../i18n/cs").then((m) => ({ default: landingToMobile(m.default) })),
  ro: () => import("../i18n/ro").then((m) => ({ default: landingToMobile(m.default) })),
  el: () => import("../i18n/el").then((m) => ({ default: landingToMobile(m.default) })),
  uk: () => import("../i18n/uk").then((m) => ({ default: landingToMobile(m.default) })),
  he: () => import("../i18n/he").then((m) => ({ default: landingToMobile(m.default) })),
  fa: () => import("../i18n/fa").then((m) => ({ default: landingToMobile(m.default) })),
  vi: () => import("../i18n/vi").then((m) => ({ default: landingToMobile(m.default) })),
  th: () => import("../i18n/th").then((m) => ({ default: landingToMobile(m.default) })),
  pl: () => import("../i18n/pl").then((m) => ({ default: landingToMobile(m.default) })),
};

function landingToMobile(landing: import("../i18n/types").LandingContent): MobileContent {
  return {
    ...en,
    hero: {
      ...en.hero,
      line1: `${landing.hero.h1Pre} ${landing.hero.h1Highlight}`,
      subtitle: landing.hero.subtitle,
    },
    services: {
      ...en.services,
      title: landing.howItWorks.title,
      subtitle: landing.howItWorks.subtitle,
      items: en.services.items.map((item, index) => ({
        ...item,
        title: landing.howItWorks.steps[index % landing.howItWorks.steps.length]?.title || item.title,
        body: landing.howItWorks.steps[index % landing.howItWorks.steps.length]?.description || item.body,
      })),
    },
    faq: {
      ...en.faq,
      title: landing.faq.title,
      subtitle: landing.faq.subtitle,
      items: landing.faq.items,
    },
    stickyCta: {
      ...en.stickyCta,
      primary: landing.hero.ctaPrimary,
      secondary: landing.hero.ctaSecondary,
    },
  };
}

// Module-scope cache so switching locales twice never re-downloads.
const cache: Partial<Record<LocaleCode, MobileContent>> = { en };

async function loadMobileContent(code: LocaleCode): Promise<MobileContent> {
  if (cache[code]) return cache[code]!;
  const loader = LOADERS[code];
  if (!loader) return en;
  try {
    const mod = await loader();
    cache[code] = mod.default;
    return mod.default;
  } catch {
    return en;
  }
}

/**
 * Returns the mobile landing content for the given locale.
 * Falls back to English until the locale chunk resolves.
 */
export function useMobileContent(locale: LocaleCode): MobileContent {
  const initial = cache[locale] ?? en;
  const [content, setContent] = useState<MobileContent>(initial);
  useEffect(() => {
    let cancelled = false;
    if (cache[locale]) {
      setContent(cache[locale]!);
      return;
    }
    void loadMobileContent(locale).then((c) => {
      if (!cancelled) setContent(c);
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);
  return content;
}

export { en as defaultMobileContent };
export type { MobileContent } from "./types";
