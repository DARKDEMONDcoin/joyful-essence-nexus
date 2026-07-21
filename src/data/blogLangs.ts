// Frontend mirror of supabase/functions/_shared/blog-langs.ts
// Keep in sync if you add or remove a language.
export interface BlogLang {
  code: string;
  name: string;
  nativeName: string;
  dir: "ltr" | "rtl";
}

export const BLOG_LANGS: BlogLang[] = [
  { code: "en", name: "English", nativeName: "English", dir: "ltr" },
  { code: "es", name: "Spanish", nativeName: "Español", dir: "ltr" },
  { code: "fr", name: "French", nativeName: "Français", dir: "ltr" },
  { code: "de", name: "German", nativeName: "Deutsch", dir: "ltr" },
  { code: "pt", name: "Portuguese", nativeName: "Português", dir: "ltr" },
  { code: "it", name: "Italian", nativeName: "Italiano", dir: "ltr" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", dir: "ltr" },
  { code: "pl", name: "Polish", nativeName: "Polski", dir: "ltr" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", dir: "ltr" },
  { code: "cs", name: "Czech", nativeName: "Čeština", dir: "ltr" },
  { code: "ro", name: "Romanian", nativeName: "Română", dir: "ltr" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", dir: "ltr" },
  { code: "ru", name: "Russian", nativeName: "Русский", dir: "ltr" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", dir: "ltr" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", dir: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", dir: "rtl" },
  { code: "he", name: "Hebrew", nativeName: "עברית", dir: "rtl" },
  { code: "fa", name: "Persian", nativeName: "فارسی", dir: "rtl" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", dir: "ltr" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", dir: "ltr" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", dir: "ltr" },
  { code: "th", name: "Thai", nativeName: "ไทย", dir: "ltr" },
  { code: "ja", name: "Japanese", nativeName: "日本語", dir: "ltr" },
  { code: "ko", name: "Korean", nativeName: "한국어", dir: "ltr" },
  { code: "zh", name: "Chinese", nativeName: "中文", dir: "ltr" },
];

export const BLOG_LANG_CODES = BLOG_LANGS.map((l) => l.code);

export function getLang(code: string): BlogLang | undefined {
  return BLOG_LANGS.find((l) => l.code === code);
}

export function blogPath(slug: string, lang = "en"): string {
  return lang === "en" ? `/blog/${slug}` : `/${lang}/blog/${slug}`;
}
