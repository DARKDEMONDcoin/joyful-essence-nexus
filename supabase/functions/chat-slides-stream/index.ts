/** @doc Slides generation via Plus AI Presentations API. Returns a downloadable .pptx URL. */
// Thin adapter around the Plus AI Presentations API
// (https://guide.plusai.com/apis-for-presentations/presentations-api).
//
// Two entry points:
//  1) POST { action: "message", mode: "plan"|"summary", topic, kind, slideCount?, title? }
//     -> { message: "<short freeform narration>" } (no side effects)
//  2) POST { topic, templateId?, templateName?, templateColors?, numberOfSlides?, language?,
//           conversation_id?, message_id? }
//     -> { jobId } — kicks off a background_jobs row (kind="slides") that ends with
//        output = { standardSlides: { title, templateName, url, colors, slides, slideCount } }

import { corsHeaders } from "../_shared/cors.ts";
import { getAuthUser } from "../_shared/auth.ts";
import { createJob, runInBackground, JobWriter } from "../_shared/jobs.ts";
import { getLLM, getLovableGateway } from "../_shared/llm-router.ts";

const PLUS_AI_API = "https://api.plusdocs.com/r/v0/presentation";
const PLUS_AI_KEY = Deno.env.get("PLUS_AI_API_KEY") || Deno.env.get("PLUSAI_API_KEY") || "";

// Rough language detector so we can pass ISO-639-1 to Plus AI.
function detectLang(text: string): string {
  const t = String(text || "");
  if (/[\u0600-\u06FF]/.test(t)) return "ar";
  if (/[\u3040-\u30ff]/.test(t)) return "ja"; // hiragana/katakana → JP (check before CJK)
  if (/[\uac00-\ud7af]/.test(t)) return "ko";
  if (/[\u4e00-\u9fff]/.test(t)) return "zh"; // CJK unified ideographs
  if (/[\u0400-\u04FF]/.test(t)) return "ru";
  // Latin-script languages: use script-unique markers first
  if (/[ß]/.test(t)) return "de";
  if (/[ñ¿¡]/i.test(t)) return "es";
  if (/[çœæàâèêëîïôùûÿ]/i.test(t)) return "fr";
  if (/[äöü]/i.test(t)) return "de"; // ä/ö shared, but no ß/ñ → likely German
  if (/[áíóú]/i.test(t)) return "es";
  if (/[é]/i.test(t)) return "fr";
  return "en";
}

// Narration bodies for the plan/summary side-messages the chat UI shows.
// Static fallbacks only — the primary path calls an LLM below so the copy
// is fresh every time and NEVER mentions the underlying provider.
function narrateFallback(mode: "plan" | "summary", topic: string, lang: string, slideCount?: number): string {
  const n = Math.max(1, Number(slideCount) || 0);
  const T: Record<string, { plan: string; sumN: string; sum0: string }> = {
    ar: {
      plan: `تمام — بجهز لك عرض عن "${topic}" دلوقتي. هيستغرق دقيقة تقريبًا…`,
      sumN: `خلصت! جهزت لك ${n} شريحة. تقدر تحمّل الملف من الكارت فوق.`,
      sum0: `خلصت! العرض جاهز للتحميل من الكارت فوق.`,
    },
    en: {
      plan: `On it — putting together a presentation about "${topic}". Give me about a minute…`,
      sumN: `Done! I built ${n} slides for you. Grab them from the card above.`,
      sum0: `Done! Your presentation is ready to download from the card above.`,
    },
    fr: {
      plan: `C'est parti — je prépare une présentation sur "${topic}". Environ une minute…`,
      sumN: `Terminé ! J'ai préparé ${n} diapositives. Téléchargez-les depuis la carte ci-dessus.`,
      sum0: `Terminé ! Votre présentation est prête depuis la carte ci-dessus.`,
    },
    de: {
      plan: `Bin dran — ich erstelle eine Präsentation über „${topic}". Dauert etwa eine Minute…`,
      sumN: `Fertig! ${n} Folien erstellt. Lade sie oben aus der Karte herunter.`,
      sum0: `Fertig! Deine Präsentation kann oben heruntergeladen werden.`,
    },
    es: {
      plan: `¡En ello! Estoy preparando una presentación sobre "${topic}". Un minuto…`,
      sumN: `¡Listo! Preparé ${n} diapositivas. Descárgalas desde la tarjeta de arriba.`,
      sum0: `¡Listo! Tu presentación está lista para descargar arriba.`,
    },
    zh: {
      plan: `好的 — 正在为你准备关于"${topic}"的演示文稿,大约需要一分钟…`,
      sumN: `完成!已为你准备了 ${n} 张幻灯片,可以从上方卡片下载。`,
      sum0: `完成!你的演示文稿已准备好,可以从上方卡片下载。`,
    },
    ja: {
      plan: `了解しました — 「${topic}」のプレゼンテーションを準備しています。1分ほどかかります…`,
      sumN: `完了しました!${n} 枚のスライドを用意しました。上のカードからダウンロードできます。`,
      sum0: `完了しました!プレゼンテーションは上のカードからダウンロードできます。`,
    },
    ko: {
      plan: `알겠습니다 — "${topic}"에 대한 프레젠테이션을 준비 중입니다. 약 1분 정도 걸립니다…`,
      sumN: `완료! ${n}장의 슬라이드를 준비했습니다. 위 카드에서 다운로드하세요.`,
      sum0: `완료! 프레젠테이션이 준비되었습니다. 위 카드에서 다운로드하세요.`,
    },
    ru: {
      plan: `Уже занимаюсь — готовлю презентацию на тему "${topic}". Займёт около минуты…`,
      sumN: `Готово! Подготовил ${n} слайдов. Скачайте из карточки выше.`,
      sum0: `Готово! Ваша презентация готова к скачиванию из карточки выше.`,
    },
  };
  const t = T[lang] || T.en;
  if (mode === "plan") return t.plan;
  return n ? t.sumN : t.sum0;
}

/** Ask an LLM for a fresh, natural narration line. Never mentions the
 *  underlying slides provider. Returns "" on any failure so caller falls
 *  back to a static line. */
async function narrateWithLLM(
  mode: "plan" | "summary",
  topic: string,
  lang: string,
  slideCount?: number,
): Promise<string> {
  try {
    const llm = (await getLLM()) || (getLovableGateway()
      ? { ...getLovableGateway()!, provider: "lovable" as const, mapModel: (m: string) => m }
      : null);
    if (!llm) return "";
    const model = llm.provider === "lovable" ? "google/gemini-2.5-flash" : llm.mapModel("google/gemini-2.5-flash");
    const n = Math.max(0, Number(slideCount) || 0);
    const system = [
      "You write ONE short chat line (max ~22 words) that the assistant says to the user around slide generation.",
      "STRICT RULES:",
      "- Never name any provider, brand, company, API, model, or template (no 'Plus AI', 'OpenAI', 'Gemini', 'PowerPoint', etc).",
      "- Do not say 'AI'.",
      "- Warm, natural, first-person, no emojis, no quotes around your reply, no markdown.",
      `- Reply in language code: ${lang}.`,
      "- Vary phrasing every time; do NOT reuse a template.",
    ].join("\n");
    const userMsg = mode === "plan"
      ? `Tell the user you're starting to build their presentation about: ${topic || "their topic"}. Mention it will take a moment.`
      : n > 0
        ? `Tell the user the presentation is ready with ${n} slides and they can grab it from the card above.`
        : `Tell the user the presentation is ready and available in the card above.`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(llm.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${llm.key}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.9,
        max_tokens: 120,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));
    if (!res.ok) return "";
    const data = await res.json().catch(() => null);
    let text = String(data?.choices?.[0]?.message?.content || "").trim();
    // Strip stray surrounding quotes / markdown noise.
    text = text.replace(/^["'`\s]+|["'`\s]+$/g, "").trim();
    // Guardrail: if the model still slipped a brand name, drop it.
    if (/plus\s*ai|openai|gemini|powerpoint|pptx|anthropic|claude/i.test(text)) return "";
    return text;
  } catch {
    return "";
  }
}


async function plusFetch(path: string, init: RequestInit = {}): Promise<Response> {
  if (!PLUS_AI_KEY) throw new Error("PLUS_AI_API_KEY is not configured");
  return await fetch(path.startsWith("http") ? path : `${PLUS_AI_API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PLUS_AI_KEY}`,
      ...(init.headers || {}),
    },
  });
}

interface CreateBody {
  action?: string;
  mode?: "plan" | "summary";
  topic?: string;
  kind?: string;
  slideCount?: number;
  numberOfSlides?: number;
  title?: string;
  templateId?: string;
  templateName?: string;
  templateColors?: [string, string];
  language?: string;
  conversation_id?: string | null;
  message_id?: string | null;
  provider?: string;
  stylePrompt?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: CreateBody = {};
  try {
    body = (await req.json()) as CreateBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ---------- narration side-message ----------
  if (body.action === "message") {
    const topic = (body.topic || body.title || "").trim();
    const lang = detectLang(topic);
    const mode = body.mode === "summary" ? "summary" : "plan";
    const llmMsg = await narrateWithLLM(mode, topic, lang, body.slideCount);
    const msg = llmMsg || narrateFallback(mode, topic, lang, body.slideCount);
    return new Response(JSON.stringify({ message: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ---------- real generation: create a background job and return jobId ----------
  const user = await getAuthUser(req);
  if (!user) {
    return new Response(JSON.stringify({ error: "auth_required" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!PLUS_AI_KEY) {
    return new Response(
      JSON.stringify({ error: "PLUS_AI_API_KEY is not configured on the server" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const topic = (body.topic || "").trim();
  if (!topic || topic.length < 3) {
    return new Response(JSON.stringify({ error: "topic is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const language = body.language || detectLang(topic);
  const numberOfSlides = body.numberOfSlides && body.numberOfSlides > 0
    ? Math.min(30, Math.floor(body.numberOfSlides))
    : undefined;
  const templateId = body.templateId || undefined;
  const templateName = body.templateName || templateId || "Default";
  const templateColors: [string, string] = (Array.isArray(body.templateColors) && body.templateColors.length === 2)
    ? [String(body.templateColors[0]), String(body.templateColors[1])]
    : ["#0f172a", "#38bdf8"];

  // Compose the Plus AI prompt. Encourage a specific language + light style
  // guidance from the picked template (so Plus AI knows to use the same tone).
  const promptLines = [
    topic,
    body.stylePrompt ? `Style: ${body.stylePrompt}` : "",
    `Deliver the presentation in language: ${language}.`,
  ].filter(Boolean);
  const prompt = promptLines.join("\n\n");

  const jobId = await createJob({
    userId: user.id,
    kind: "slides",
    input: {
      topic,
      templateId,
      templateName,
      numberOfSlides,
      language,
      provider: "plusai",
    },
    conversationId: body.conversation_id ?? null,
    messageId: body.message_id ?? null,
    meta: { provider: "plusai", templateId, templateName },
  });

  runInBackground(
    jobId,
    async (w: JobWriter) => {
      await w.start({ phase: "outline", status_text: "Preparing your deck…" });
      await w.setProgress(5, "outline");

      // 1) Create the presentation
      const createResp = await plusFetch(PLUS_AI_API, {
        method: "POST",
        body: JSON.stringify({
          prompt,
          language,
          ...(numberOfSlides ? { numberOfSlides } : {}),
          ...(templateId && templateId.startsWith("plus_") ? { templateId } : {}),
        }),
      });
      if (!createResp.ok) {
        const text = await createResp.text().catch(() => "");
        throw new Error(`Plus AI create failed (${createResp.status}): ${text.slice(0, 300)}`);
      }
      const createJson = (await createResp.json()) as {
        pollingUrl?: string;
        id?: string;
        status?: string;
      };
      const pollingUrl = createJson.pollingUrl
        || (createJson.id ? `${PLUS_AI_API}/${createJson.id}` : "");
      if (!pollingUrl) throw new Error("Plus AI did not return a pollingUrl");

      await w.setProgress(15, "content");
      await w.setStatusText("Writing your slides…");

      // 2) Poll until GENERATED / COMPLETED (max ~14 minutes)
      const started = Date.now();
      const maxMs = 14 * 60_000;
      let poll = 0;
      let last: any = null;

      while (Date.now() - started < maxMs) {
        await w.throwIfCanceled();
        await new Promise((r) => setTimeout(r, poll < 5 ? 3_000 : 6_000));
        poll++;

        const r = await plusFetch(pollingUrl, { method: "GET" });
        if (!r.ok) {
          // transient — keep polling unless it's a hard 4xx
          if (r.status >= 400 && r.status < 500 && r.status !== 429) {
            const text = await r.text().catch(() => "");
            throw new Error(`Plus AI poll failed (${r.status}): ${text.slice(0, 200)}`);
          }
          continue;
        }
        last = await r.json();
        const status = String(last?.status || "").toUpperCase();
        const done = status === "GENERATED" || status === "COMPLETED";
        const failed = status === "FAILED" || status === "ERROR";

        // progress bar creeps toward 90% while polling
        const pct = Math.min(90, 20 + poll * 5);
        await w.setProgress(pct, status === "COMPLETED" ? "finalize" : "content");

        if (failed) throw new Error(`Plus AI reported status ${status}`);
        if (done) {
          // For image mode the pptx URL may take another moment; poll once more.
          if (!last?.url && last?.generationMode === "IMAGES") {
            await new Promise((r) => setTimeout(r, 4_000));
            const r2 = await plusFetch(pollingUrl, { method: "GET" });
            if (r2.ok) last = await r2.json();
          }
          break;
        }
      }

      if (!last?.url) {
        throw new Error("Plus AI did not return a downloadable presentation URL in time");
      }

      const slidesTitles: string[] = Array.isArray(last?.slides)
        ? last.slides.filter((s: unknown) => typeof s === "string")
        : [];

      const standardSlides = {
        title: (slidesTitles[0] || topic).slice(0, 140),
        templateName,
        templateId,
        url: String(last.url),
        thumbnailUrl: typeof last?.thumbnailUrl === "string" ? last.thumbnailUrl : undefined,
        images: Array.isArray(last?.images) ? last.images : undefined,
        colors: templateColors,
        slides: slidesTitles,
        slideCount: slidesTitles.length || undefined,
        provider: "plusai" as const,
      };

      await w.setProgress(100, "finalize");
      await w.setStatusText("Done");
      await w.complete({ standardSlides });
    },
    { runner: "chat-slides-stream" },
  );

  return new Response(JSON.stringify({ jobId }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
