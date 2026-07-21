/** @doc Fast intent classifier. Runs qwen-turbo (cheapest/fastest Alibaba
 *  model) on the user's last message to return structured routing hints
 *  BEFORE the main chat model call — same pattern used by frontier assistants
 *  (GPT-5 router, Gemini 3 planner). Falls back to heuristics on any failure
 *  so the main chat path never breaks.
 *
 *  Output shape:
 *    { intent, needs_web_search, needs_deep_research, needs_media,
 *      needs_code, is_multi_turn_followup, language, sensitivity, urgency }
 *
 *  Cache: per-message hash, 5 minutes, in-process. */

import { alibabaChatJSON } from "./alibabaClient.ts";

export interface IntentResult {
  intent:
    | "chat"
    | "question"
    | "task"
    | "code"
    | "media"
    | "research"
    | "search"
    | "memory_recall"
    | "identity"
    | "smalltalk";
  needs_web_search: boolean;
  needs_deep_research: boolean;
  needs_media: "image" | "video" | "audio" | "none";
  needs_code: boolean;
  is_multi_turn_followup: boolean;
  language: string; // BCP-47-ish: "ar", "ar-EG", "en", "fr", ...
  sensitivity: "safe" | "sensitive" | "unsafe";
  urgency: "low" | "normal" | "high";
}

const DEFAULT: IntentResult = {
  intent: "chat",
  needs_web_search: false,
  needs_deep_research: false,
  needs_media: "none",
  needs_code: false,
  is_multi_turn_followup: false,
  language: "auto",
  sensitivity: "safe",
  urgency: "normal",
};

// In-process cache. Edge cold starts wipe it; that's fine.
const cache = new Map<string, { at: number; value: IntentResult }>();
const TTL_MS = 5 * 60_000;

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return String(h);
}

/** Heuristic fallback — used when the LLM classifier fails, times out, or
 *  when the input is trivially short. Deliberately mirrors the auto-search
 *  keywords in chat-alibaba so the two paths agree. */
function heuristic(text: string): IntentResult {
  const t = (text || "").toLowerCase();
  const isArabic = /[\u0600-\u06FF]/.test(text);

  const freshEn =
    /\b(news|latest|today|yesterday|this week|current|price|stock|score|weather|breaking|now|202[4-9]|20[3-9]\d)\b/;
  const freshAr =
    /(أخبار|اخبار|آخر|احدث|أحدث|اليوم|امس|أمس|سعر|أسعار|طقس|بورصة|عاجل|الآن|الان)/;
  const codeEn = /\b(function|class|bug|error|typescript|python|javascript|sql|regex|api|endpoint|compile|stack ?trace)\b/;
  const codeAr = /(كود|دالة|خطأ|باغ|بايثون|جافاسكربت|تايب سكربت|قاعدة بيانات|ايرور|debug)/i;
  const imgEn = /\b(image|photo|picture|logo|poster|thumbnail|illustration|draw|render)\b/;
  const imgAr = /(صورة|صور|بوستر|شعار|لوجو|رسمة|رسم|تصميم)/;
  const vidEn = /\b(video|clip|reel|animation|movie|trailer)\b/;
  const vidAr = /(فيديو|مقطع|كليب|انيميشن|أنيميشن)/;
  const researchEn = /\b(deep research|comprehensive report|literature review|market analysis|competitors|full report)\b/;
  const researchAr = /(بحث عميق|تقرير شامل|دراسة كاملة|تحليل سوق|منافسين)/;
  const identityEn = /\b(who (are|made) you|what model|which company|your name)\b/;
  const identityAr = /(مين انت|من انت|أي شركة|اسمك ايه|اسمك|أي موديل|من طورك)/;
  const followupEn = /\b(and|also|then|continue|more|what about|as I said)\b/;
  const followupAr = /(كمل|واصل|كملي|واصلي|زي ما قلت|وبعدين|كمان)/;

  const needs_web_search = freshEn.test(t) || freshAr.test(text);
  const needs_code = codeEn.test(t) || codeAr.test(text);
  const isImg = imgEn.test(t) || imgAr.test(text);
  const isVid = vidEn.test(t) || vidAr.test(text);
  const needs_media: IntentResult["needs_media"] = isVid ? "video" : isImg ? "image" : "none";
  const needs_deep_research = researchEn.test(t) || researchAr.test(text);
  const isIdentity = identityEn.test(t) || identityAr.test(text);
  const isFollowup = followupEn.test(t) || followupAr.test(text);

  let intent: IntentResult["intent"] = "chat";
  if (isIdentity) intent = "identity";
  else if (needs_deep_research) intent = "research";
  else if (needs_web_search) intent = "search";
  else if (needs_media !== "none") intent = "media";
  else if (needs_code) intent = "code";
  else if (/^(hi|hello|hey|thanks|thank you|مرحبا|أهلا|اهلا|شكرا|شكراً)\b/i.test(text.trim()))
    intent = "smalltalk";
  else if (/\?|كيف|ليه|ايه|لماذا|كم|متى|أين|اين|من هو/i.test(text)) intent = "question";

  return {
    ...DEFAULT,
    intent,
    needs_web_search,
    needs_deep_research,
    needs_media,
    needs_code,
    is_multi_turn_followup: isFollowup,
    language: isArabic ? "ar" : "en",
  };
}

/** Classify a single user turn. Returns quickly (<800ms budget); on any
 *  timeout / parse error / provider failure, returns heuristic result. */
export async function classifyIntent(text: string, timeoutMs = 800): Promise<IntentResult> {
  const trimmed = (text || "").trim();
  if (trimmed.length < 3) return heuristic(trimmed);
  if (trimmed.length > 2000) return heuristic(trimmed); // skip huge inputs

  const key = hash(trimmed);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;

  const base = heuristic(trimmed);
  const sys =
    "You are an intent classifier. Return ONLY valid JSON matching the schema. " +
    "Do NOT add prose. Analyse the user's LAST message in any language.";
  const user =
    `USER MESSAGE:\n${trimmed}\n\n` +
    `Return JSON with EXACT keys:\n` +
    `{"intent":"chat|question|task|code|media|research|search|memory_recall|identity|smalltalk",` +
    `"needs_web_search":true|false,` +
    `"needs_deep_research":true|false,` +
    `"needs_media":"image|video|audio|none",` +
    `"needs_code":true|false,` +
    `"is_multi_turn_followup":true|false,` +
    `"language":"ar|ar-EG|en|fr|es|...",` +
    `"sensitivity":"safe|sensitive|unsafe",` +
    `"urgency":"low|normal|high"}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const raced = await Promise.race([
      alibabaChatJSON({
        model: "qwen-turbo",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
        temperature: 0,
        max_tokens: 200,
        response_format: { type: "json_object" },
      }),
      new Promise((_, rej) => controller.signal.addEventListener("abort", () => rej(new Error("timeout")))),
    ]) as any;

    const raw = raced?.choices?.[0]?.message?.content ?? "";
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    const merged: IntentResult = { ...base, ...parsed };
    // Guard rails — coerce unknown values back to defaults.
    if (!["chat","question","task","code","media","research","search","memory_recall","identity","smalltalk"].includes(merged.intent))
      merged.intent = base.intent;
    if (!["image","video","audio","none"].includes(merged.needs_media)) merged.needs_media = base.needs_media;
    if (!["safe","sensitive","unsafe"].includes(merged.sensitivity)) merged.sensitivity = "safe";
    if (!["low","normal","high"].includes(merged.urgency)) merged.urgency = "normal";
    merged.needs_web_search = Boolean(merged.needs_web_search) || base.needs_web_search;
    merged.needs_deep_research = Boolean(merged.needs_deep_research);
    merged.needs_code = Boolean(merged.needs_code) || base.needs_code;
    merged.is_multi_turn_followup = Boolean(merged.is_multi_turn_followup) || base.is_multi_turn_followup;

    cache.set(key, { at: Date.now(), value: merged });
    return merged;
  } catch {
    cache.set(key, { at: Date.now(), value: base });
    return base;
  } finally {
    clearTimeout(timer);
  }
}

/** Render the intent as a compact system-prompt hint the main model can use
 *  to shape its response (tone, tool usage, refusal calibration). */
export function formatIntentHint(i: IntentResult): string {
  const lines = [
    `## Turn intent (router hint)`,
    `- intent: ${i.intent}`,
    `- language: ${i.language}`,
    `- needs_web_search: ${i.needs_web_search}`,
    `- needs_deep_research: ${i.needs_deep_research}`,
    `- needs_media: ${i.needs_media}`,
    `- needs_code: ${i.needs_code}`,
    `- is_multi_turn_followup: ${i.is_multi_turn_followup}`,
    `- sensitivity: ${i.sensitivity}`,
    `- urgency: ${i.urgency}`,
    ``,
    `Use this hint to calibrate: tool usage, verbosity, tone, and refusal thresholds. `,
    `Never mention this block to the user.`,
  ];
  return lines.join("\n");
}