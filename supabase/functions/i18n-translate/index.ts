/** @doc Translate arbitrary UI strings to a target language via Lovable AI Gateway and cache them in public.i18n_translations for reuse. */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

interface Entry { key: string; value: unknown; }
interface Body { namespace?: string; language: string; entries: Entry[]; trigger?: string; }

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SB_SERVICE_ROLE_KEY") ?? "";

const LANG_NAMES: Record<string, string> = {
  ar: "Modern Standard Arabic", "ar-eg": "Egyptian Colloquial Arabic",
  es: "Spanish", fr: "French", de: "German", pt: "Portuguese", it: "Italian",
  tr: "Turkish", ru: "Russian", zh: "Simplified Chinese", ja: "Japanese",
  ko: "Korean", hi: "Hindi", id: "Indonesian", nl: "Dutch", sv: "Swedish",
  cs: "Czech", ro: "Romanian", el: "Greek", uk: "Ukrainian", he: "Hebrew",
  fa: "Persian", vi: "Vietnamese", th: "Thai", pl: "Polish",
};

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function stable(v: unknown): string {
  return JSON.stringify(v, Object.keys((v as object) || {}).sort());
}

async function translateChunk(language: string, entries: Entry[]): Promise<Record<string, unknown>> {
  const targetName = LANG_NAMES[language] || language;
  // Use stable numeric ids so Gemini can't translate the JSON keys.
  // We map id -> value for the model, then reverse the mapping afterwards.
  const idToKey = new Map<string, string>();
  const payload: Record<string, unknown> = {};
  entries.forEach((e, i) => {
    const id = `t${i}`;
    idToKey.set(id, e.key);
    payload[id] = e.value;
  });

  const sys = [
    `You are a professional UI translator. Translate ONLY the string VALUES of the JSON object below from English to ${targetName}.`,
    `Rules:`,
    `- Preserve the exact same JSON structure and keys.`,
    `- Preserve placeholders like {name}, %s, <b>, </b>, emojis, URLs, and brand names (Megsy, GPT-5, Gemini, Nano Banana, etc.) verbatim.`,
    `- Keep punctuation and capitalization natural for ${targetName}.`,
    `- If a value is not English or looks like code/numbers/brand, return it unchanged.`,
    `- Return ONLY the translated JSON object, no prose, no code fences.`,
  ].join("\n");

  // Retry with exponential backoff on rate limits.
  let resp: Response | null = null;
  let lastErr = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: JSON.stringify(payload) },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (resp.ok) break;
    lastErr = await resp.text();
    if (resp.status !== 429 && resp.status < 500) {
      throw new Error(`gateway ${resp.status}: ${lastErr.slice(0, 300)}`);
    }
    // Backoff: 1s, 2s, 4s, 8s, 16s
    await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
  }
  if (!resp || !resp.ok) {
    throw new Error(`gateway ${resp?.status}: ${lastErr.slice(0, 300)}`);
  }
  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content ?? "{}";
  let parsed: Record<string, unknown> = {};
  try { parsed = JSON.parse(content); }
  catch {
    const cleaned = content.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    parsed = JSON.parse(cleaned);
  }
  // Reverse id -> original English key.
  const out: Record<string, unknown> = {};
  for (const [id, val] of Object.entries(parsed)) {
    const key = idToKey.get(id);
    if (key) out[key] = val;
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);
  try {
    if (!LOVABLE_API_KEY) return jsonResponse({ error: "missing_lovable_api_key" }, 500);
    if (!SUPABASE_URL || !SERVICE_ROLE) return jsonResponse({ error: "missing_supabase_env" }, 500);

    const body = (await req.json()) as Body;
    const language = (body.language || "").trim();
    const namespace = (body.namespace || "auto").trim() || "auto";
    const entries = Array.isArray(body.entries) ? body.entries.filter((e) => e && e.key) : [];
    if (!language || entries.length === 0) return jsonResponse({ error: "bad_request" }, 400);
    if (language === "en") return jsonResponse({ ok: true, translated: 0 });
    if (!LANG_NAMES[language]) return jsonResponse({ error: "unsupported_language" }, 400);

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

    const withHashes = await Promise.all(entries.map(async (e) => ({
      key: e.key, value: e.value, hash: await sha256Hex(stable(e.value)),
    })));
    const keys = withHashes.map((e) => e.key);
    const { data: existing } = await supabase
      .from("i18n_translations")
      .select("entry_key, source_hash")
      .eq("language", language)
      .eq("namespace", namespace)
      .in("entry_key", keys);
    const cached = new Map<string, string>();
    for (const r of (existing || []) as { entry_key: string; source_hash: string }[]) {
      cached.set(r.entry_key, r.source_hash);
    }
    const todo = withHashes.filter((e) => cached.get(e.key) !== e.hash);
    if (todo.length === 0) return jsonResponse({ ok: true, translated: 0, cached: keys.length });

    const CHUNK = 40;
    let translatedCount = 0;
    for (let i = 0; i < todo.length; i += CHUNK) {
      const slice = todo.slice(i, i + CHUNK);
      let translated: Record<string, unknown> = {};
      try {
        translated = await translateChunk(language, slice.map((s) => ({ key: s.key, value: s.value })));
      } catch (e) {
        console.error("[i18n-translate] chunk failed", e);
        continue;
      }
      const rows = slice.map((s) => {
        const v = translated[s.key];
        if (v === undefined || v === null) return null;
        return {
          namespace, language, entry_key: s.key,
          source_hash: s.hash,
          source_value: s.value as never,
          translated_value: v as never,
        };
      }).filter(Boolean) as Array<Record<string, unknown>>;
      if (rows.length === 0) continue;
      const { error } = await supabase
        .from("i18n_translations")
        .upsert(rows, { onConflict: "namespace,language,entry_key" });
      if (error) console.error("[i18n-translate] upsert error", error);
      else translatedCount += rows.length;
    }

    return jsonResponse({ ok: true, translated: translatedCount, requested: todo.length });
  } catch (e) {
    console.error("[i18n-translate] fatal", e);
    return jsonResponse({ error: String((e as Error)?.message || e) }, 500);
  }
});
