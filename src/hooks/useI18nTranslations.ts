// useI18nTranslations
// ─────────────────────────────────────────────────────────────────────────────
// React hook that returns a translator function for a given namespace + language.
//
// Behavior:
//   1. Reads cached translations for the requested keys from
//      public.i18n_translations (single Supabase round-trip).
//   2. For any keys missing OR whose source_hash differs from the live English
//      source, fires a background call to the `i18n-translate` edge function
//      and refetches once it finishes.
//   3. While translations are missing, the translator falls back to the
//      English source — so the page is never blank.
//
// Translations live forever in the cache; subsequent visits are instant.

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SITE_LANG_SET } from "@/lib/siteLangs";

export interface I18nEntry {
  key: string;
  value: unknown; // string | object | array — anything JSON-serializable
}

interface UseI18nOptions {
  namespace: string;
  language: string; // BCP-47 (en, ar, …)
  entries: I18nEntry[];
  /** When false, never call the edge function (read-only). Default true. */
  enableBackfill?: boolean;
}

interface UseI18nResult {
  /** Translate a key. Falls back to its English source if missing. */
  t: <T = unknown>(key: string, fallback?: T) => T;
  /** True while either the initial fetch or a backfill is in flight. */
  isLoading: boolean;
  /** True after a backfill has been triggered for this language/namespace. */
  isTranslating: boolean;
}

// Cheap browser sha-256 → hex (matches the edge function's stable hash).
async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const stable = (v: unknown): string => JSON.stringify(v, Object.keys((v as object) || {}).sort());

export function useI18nTranslations({
  namespace,
  language,
  entries,
  enableBackfill = true,
}: UseI18nOptions): UseI18nResult {
  const qc = useQueryClient();
  const sourceMap = useMemo(() => {
    const m = new Map<string, unknown>();
    for (const e of entries) m.set(e.key, e.value);
    return m;
  }, [entries]);

  const keys = useMemo(() => Array.from(sourceMap.keys()).sort(), [sourceMap]);
  const keysSignature = keys.join("|");

  // English is the canonical source — no DB round-trip.
  const isEnglish = language === "en" || !SITE_LANG_SET.has(language);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["i18n", namespace, language, keysSignature],
    enabled: !isEnglish && keys.length > 0,
    staleTime: 60 * 60 * 1000, // 1 h
    queryFn: async () => {
      const { data, error } = await supabase
        .from("i18n_translations")
        .select("entry_key, source_hash, translated_value")
        .eq("language", language)
        .in("entry_key", keys);
      if (error) throw error;
      return data || [];
    },
  });

  const translatedMap = useMemo(() => {
    const m = new Map<string, { hash: string; value: unknown }>();
    for (const r of (rows || []) as any[]) {
      m.set(r.entry_key, { hash: r.source_hash, value: r.translated_value });
    }
    return m;
  }, [rows]);

  // Backfill: figure out which keys are missing or stale, and call the edge fn.
  const [isTranslating, setIsTranslating] = useState(false);
  const backfillingRef = useRef(false);

  useEffect(() => {
    if (isEnglish || !enableBackfill) return;
    if (isLoading) return;
    if (backfillingRef.current) return;
    if (keys.length === 0) return;

    let cancelled = false;
    (async () => {
      const stale: I18nEntry[] = [];
      for (const key of keys) {
        const src = sourceMap.get(key);
        const srcSerialized = stable(src);
        const expectedHash = await sha256Hex(srcSerialized);
        const cached = translatedMap.get(key);
        if (!cached || cached.hash !== expectedHash) {
          stale.push({ key, value: src });
        }
      }
      if (cancelled || stale.length === 0) return;

      backfillingRef.current = true;
      setIsTranslating(true);
      try {
        // Chunk to avoid huge payloads — Qwen-Max handles ~30 entries cleanly.
        const CHUNK = 25;
        for (let i = 0; i < stale.length; i += CHUNK) {
          const chunk = stale.slice(i, i + CHUNK);
          await supabase.functions.invoke("i18n-translate", {
            body: { namespace, language, entries: chunk, trigger: "client-lazy" },
          });
        }
        if (!cancelled) {
          qc.invalidateQueries({
            queryKey: ["i18n", namespace, language, keysSignature],
          });
        }
      } catch (e) {
        console.warn("[i18n] backfill failed", e);
      } finally {
        backfillingRef.current = false;
        if (!cancelled) setIsTranslating(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Re-run when language, key set, or fetched rows change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnglish, enableBackfill, isLoading, language, namespace, keysSignature, rows]);

  const t = useMemo(() => {
    return function translate<T = unknown>(key: string, fallback?: T): T {
      if (isEnglish) {
        return (sourceMap.get(key) as T) ?? (fallback as T);
      }
      const cached = translatedMap.get(key);
      if (cached) return cached.value as T;
      // Fall back to English source while translation is being prepared.
      return (sourceMap.get(key) as T) ?? (fallback as T);
    };
  }, [isEnglish, translatedMap, sourceMap]);

  return { t, isLoading, isTranslating };
}
