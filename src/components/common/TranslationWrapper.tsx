import { useEffect, type ReactNode } from "react";
import { detectLang, getUserLang, setUserLang } from "@/lib/authI18n";
import { retranslateAll, startDomTranslator, stopDomTranslator } from "@/lib/domTranslator";
import { scheduleFallbackTranslate } from "@/lib/translation/fallback";

interface TranslationWrapperProps {
  children: ReactNode;
}

const RTL_LANGUAGES = new Set(["ar", "ar-eg", "fa", "he"]);
const ROUTE_LANGS = new Set([
  "en",
  "ar",
  "ar-eg",
  "es",
  "fr",
  "de",
  "pt",
  "it",
  "tr",
  "ru",
  "zh",
  "ja",
  "ko",
  "hi",
  "id",
  "nl",
  "sv",
  "cs",
  "ro",
  "el",
  "uk",
  "he",
  "fa",
  "vi",
  "th",
  "pl",
]);

function applyLanguage(lang: string) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang;
  document.documentElement.dir = RTL_LANGUAGES.has(lang) ? "rtl" : "ltr";
}

function ensureDetectedLanguage() {
  if (typeof window === "undefined") return;
  try {
    const routeLang = window.location.pathname.split("/").filter(Boolean)[0]?.toLowerCase();
    if (routeLang && ROUTE_LANGS.has(routeLang)) {
      void setUserLang(routeLang as ReturnType<typeof getUserLang>, { syncRemote: false });
      return;
    }
    if (!localStorage.getItem("language") && !localStorage.getItem("app_lang")) {
      void setUserLang(detectLang(), { syncRemote: false });
      return;
    }
    applyLanguage(getUserLang());
  } catch {
    applyLanguage("en");
  }
}

const TranslationWrapper = ({ children }: TranslationWrapperProps) => {
  useEffect(() => {
    ensureDetectedLanguage();
    startDomTranslator();
    scheduleFallbackTranslate();

    const sync = () => {
      const routeLang = window.location.pathname.split("/").filter(Boolean)[0]?.toLowerCase();
      if (routeLang && ROUTE_LANGS.has(routeLang) && routeLang !== getUserLang()) {
        void setUserLang(routeLang as ReturnType<typeof getUserLang>, { syncRemote: false });
        return;
      }
      applyLanguage(getUserLang());
      retranslateAll();
      scheduleFallbackTranslate();
    };
    window.addEventListener("languagechange-custom", sync);
    window.addEventListener("storage", sync);
    window.addEventListener("popstate", sync);

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    history.pushState = function (...args) {
      originalPushState.apply(history, args);
      window.setTimeout(sync, 0);
    };
    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args);
      window.setTimeout(sync, 0);
    };

    // Watch for DOM mutations (route changes, lazy-loaded content, dialogs)
    // and schedule fallback translation for any new English text.
    const mo = new MutationObserver(() => scheduleFallbackTranslate());
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => {
      window.removeEventListener("languagechange-custom", sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("popstate", sync);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      mo.disconnect();
      stopDomTranslator();
    };
  }, []);

  return <>{children}</>;
};

export default TranslationWrapper;