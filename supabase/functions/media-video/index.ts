/** @doc Generates videos via Alibaba DashScope free-trial Wan video models. Uses ALIBABA_DASHSCOPE_KEY and silently rotates through free-tier T2V/I2V models on failure. Returns a `job_id` (DashScope task_id) callers poll via media-video-poll. */
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { getAlibabaKey } from "../_shared/alibabaClient.ts";
import { withKeyRotation, pickActiveKey } from "../_shared/pickKey.ts";
import { getUserPlan } from "../_shared/systemPromptBuilder.ts";
import { resolveUserId } from "../_shared/rateLimit.ts";

const DS_BASE = "https://dashscope-intl.aliyuncs.com/api/v1";
const PAID_PLANS = new Set(["pro", "max"]);

// deAPI music models ordered by observed queue reliability. Use the public
// docs slug first; the underscore aliases can validate differently and have
// repeatedly fallen through to Base, which accepts the job but may stay queued.
const MUSIC_MODEL_CHAIN = [
  "ACE-Step-v1.5-turbo",
  "AceStep_1_5_Base",
  "AceStep_1_5_Turbo",
  "AceStep_1_5_XL_Turbo_INT8",
];
const MUSIC_V1_MODEL_CHAIN = [
  "ACE-Step-v1.5-turbo",
  "ACE-Step-v1.5",
  "AceStep_1_5_Turbo",
  "AceStep_1_5_XL_Turbo_INT8",
  "AceStep_1_5_Base",
];

// Free-tier text-to-video models — ordered by proven reliability.
// `wan2.7-t2v-2026-04-25` is currently free-quota-exhausted on our account
// (returns AllocationQuota.FreeTierOnly 403); it stays in the chain in case
// quota resets, but `wan2.6-t2v` is proven-working and goes first.
const T2V_CHAIN = [
  "wan2.6-t2v",
  "wan2.5-t2v-preview",
  "wan2.2-t2v-plus",
  "wan2.1-t2v-plus",
  "wan2.1-t2v-turbo",
  "wanx2.1-t2v-turbo",
  "wanx2.1-t2v-plus",
  "wan2.7-t2v-2026-04-25",
];

// Free-tier image-to-video / VACE (reference-image) models.
const I2V_CHAIN = [
  "wan2.6-i2v",
  "wan2.6-i2v-flash",
  "wan2.5-i2v-preview",
  "wan2.2-i2v-plus",
  "wan2.2-i2v-flash",
  "wan2.1-i2v-plus",
  "wan2.1-i2v-turbo",
  "wan2.1-vace-plus",
  "wan2.7-i2v",
  "wan2.7-i2v-2026-04-25",
  "wanx2.1-i2v-turbo",
  "wanx2.1-i2v-plus",
];


const SIZE_MAP: Record<string, string> = {
  "1:1": "960*960",
  "16:9": "1280*720",
  "9:16": "720*1280",
};

async function submit(
  model: string,
  prompt: string,
  size: string,
  duration: number,
  startFrame: string | null,
  endFrame: string | null,
  apiKey: string,
) {
  const isVace = /vace/i.test(model);
  const endpoint = isVace
    ? `${DS_BASE}/services/aigc/video-generation/video-synthesis`
    : startFrame || endFrame
      ? `${DS_BASE}/services/aigc/video-generation/video-synthesis`
      : `${DS_BASE}/services/aigc/video-generation/video-synthesis`;

  const input: Record<string, unknown> = { prompt };
  if (startFrame) input.first_frame_url = startFrame;
  if (endFrame) input.last_frame_url = endFrame;
  if (isVace && startFrame) input.ref_images_url = [startFrame];

  const body = {
    model,
    input,
    parameters: {
      size,
      duration: Math.max(3, Math.min(10, duration | 0 || 5)),
      prompt_extend: true,
    },
  };

  const r = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",
    },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`submit ${r.status}: ${text.slice(0, 300)}`);
  const j = JSON.parse(text);
  const taskId = j?.output?.task_id;
  if (!taskId) throw new Error(`no task_id: ${text.slice(0, 200)}`);
  return taskId as string;
}

/**
 * Uses Lovable AI Gateway to write structured song lyrics from a user prompt.
 * Output is plain text with AceStep-style tags ([verse], [chorus], [bridge]).
 * Detects Arabic prompts and writes the lyrics in Arabic when appropriate.
 */
async function generateLyrics(prompt: string, durationSec: number): Promise<string> {
  // Fallback lyric generator using Alibaba DashScope (Qwen). The primary path
  // is the chat edge function (chat-alibaba), which writes the full lyrics
  // before calling generate_music; this only runs when the caller sent an
  // empty `lyrics` field (e.g. a direct API user).
  const apiKey = Deno.env.get("ALIBABA_DASHSCOPE_KEY") || Deno.env.get("DASHSCOPE_API_KEY");
  if (!apiKey) return "";
  const isArabic = /[\u0600-\u06FF]/.test(prompt);
  const targetVerses = durationSec <= 45 ? 1 : durationSec <= 90 ? 2 : 3;
  const system = isArabic
    ? `أنت كاتب أغاني محترف. اكتب كلمات أغنية عربية أصلية بناءً على وصف المستخدم. استخدم التنسيق التالي حرفياً: أسطر تبدأ بـ [verse]، [chorus]، [bridge]. اكتب ${targetVerses} كوبليه على الأقل وكورس واحد قوي يتكرر. لا تضف أي شرح أو مقدمة، فقط الكلمات.`
    : `You are a professional songwriter. Write original song lyrics based on the user's description. Use these exact section tags on their own lines: [verse], [chorus], [bridge]. Include at least ${targetVerses} verse(s) and one strong repeating chorus. Return ONLY the lyrics — no preamble, no explanation.`;
  const r = await fetch(
    "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen-plus",
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
      }),
    },
  );
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`lyrics qwen ${r.status}: ${t.slice(0, 200)}`);
  }
  const j = await r.json();
  return String(j?.choices?.[0]?.message?.content || "").trim();
}

function detectVocalLanguage(text: string): string {
  if (/[\u0600-\u06FF]/.test(text)) return "ar";
  return /[a-z]/i.test(text) ? "en" : "unknown";
}

function randomSeed(): number {
  if (typeof crypto?.getRandomValues === "function") {
    return crypto.getRandomValues(new Uint32Array(1))[0];
  }
  return Math.floor(Math.random() * 4_294_967_295);
}



Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const userId = await resolveUserId(req);
    const userPlan = await getUserPlan(userId);
    if (!userId || !PAID_PLANS.has(userPlan)) {
      return jsonResponse(
        {
          paywall: true,
          error: "upgrade_required",
          message: "Video and music generation are available on paid plans only.",
        },
        402,
      );
    }
    const body = await req.json();
    // ── Music branch (deAPI audio/music). Uses the same key-rotation pool.
    const kind = String(body?.kind || body?.type || "").toLowerCase();
    if (kind === "music" || kind === "audio") {
      const musicPrompt = String(body?.prompt || body?.style || "").trim();
      const rawLyrics = String(body?.lyrics || "").trim();
      const caption = String(body?.caption || musicPrompt || "melodic song, warm vocals").trim();
      const musicDuration = Math.max(20, Math.min(240, Number(body?.duration) || 90));
      if (!musicPrompt && !rawLyrics) return jsonResponse({ error: "prompt or lyrics required" }, 400);
      // Generate real lyrics with Lovable AI when the caller didn't provide any.
      // AceStep sings the lyrics verbatim, so a proper structured song is far
      // better than repeating the prompt as a placeholder.
      let lyrics = rawLyrics;
      if (!lyrics) {
        try {
          lyrics = await generateLyrics(musicPrompt, musicDuration);
        } catch (e) {
          console.error("lyrics generation failed", e);
        }
        if (!lyrics) {
          lyrics = `[verse]\n${musicPrompt}\n[chorus]\n${musicPrompt}`;
        }
      }
      try {
        const result = await withKeyRotation("deapi", async (keyRow) => {
          const requestedModel = String(body?.model_slug || "").trim();
          const forceProvider = String(body?.force_provider || "").toLowerCase();
          const v2ModelChain = forceProvider === "deapi-v2" ? Array.from(new Set([
            requestedModel && /^(ACE-Step-|AceStep_1_5_)/i.test(requestedModel) ? requestedModel : MUSIC_MODEL_CHAIN[0],
            ...MUSIC_MODEL_CHAIN,
          ])) : [];
          let lastV2Error: { model: string; status: number; body: unknown } | null = null;
          for (const model of v2ModelChain) {
            const form = new FormData();
            form.set("caption", caption);
            form.set("model", model);
            form.set("lyrics", lyrics);
            form.set("duration", String(musicDuration));
            form.set("inference_steps", "8");
            form.set("guidance_scale", "7");
            form.set("seed", "-1");
            form.set("format", "mp3");
            form.set("bpm", "120");
            form.set("keyscale", "C major");
            form.set("timesignature", "4");
            form.set("vocal_language", detectVocalLanguage(`${lyrics}\n${musicPrompt}`));

            const r = await fetch("https://api.deapi.ai/api/v2/audio/music", {
              method: "POST",
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${keyRow.api_key}`,
              },
              body: form,
            });
            const j = await r.json().catch(() => ({}));
            if (r.ok) {
              const reqId = j?.data?.request_id;
              if (!reqId) throw new Error(`deapi-v2: no request_id in ${JSON.stringify(j).slice(0, 200)}`);
              return { reqId, keyId: keyRow.id, modelUsed: model, provider: "deapi-audio" };
            }
            lastV2Error = { model, status: r.status, body: j };
            if (r.status === 401 || r.status === 403) {
              throw new Error(`deapi-v2 ${r.status} (${model}): ${JSON.stringify(j).slice(0, 240)}`);
            }
            // v2 music has an endpoint-level short rate limit. Do not park the
            // only deAPI key here; continue to v1, which often still accepts jobs.
            console.error(`[media-video] deapi-v2 music model ${model} failed`, r.status, JSON.stringify(j).slice(0, 240));
          }

          const v1ModelChain = Array.from(new Set([
            requestedModel && /^(ACE-Step-|AceStep_1_5_)/i.test(requestedModel) ? requestedModel : MUSIC_V1_MODEL_CHAIN[0],
            ...MUSIC_V1_MODEL_CHAIN,
          ]));
          let lastV1Error: { model: string; status: number; body: unknown } | null = null;
          for (const model of v1ModelChain) {
            const form = new FormData();
            form.set("caption", caption);
            form.set("model", model);
            form.set("lyrics", lyrics);
            form.set("duration", String(musicDuration));
            form.set("inference_steps", "8");
            // The legacy /v1/client/txt2music endpoint caps guidance_scale at 1
            // for Turbo aliases. Higher values silently push us to slow Base.
            form.set("guidance_scale", "1");
            form.set("seed", "-1");
            form.set("format", "mp3");
            form.set("bpm", "120");
            form.set("keyscale", "C major");
            form.set("timesignature", "4");
            form.set("vocal_language", detectVocalLanguage(`${lyrics}\n${musicPrompt}`));

            const r = await fetch("https://api.deapi.ai/api/v1/client/txt2music", {
              method: "POST",
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${keyRow.api_key}`,
              },
              body: form,
            });
            const j = await r.json().catch(() => ({}));
            if (r.ok) {
              const reqId = j?.data?.request_id;
              if (!reqId) throw new Error(`deapi-v1: no request_id in ${JSON.stringify(j).slice(0, 200)}`);
              return { reqId, keyId: keyRow.id, modelUsed: model, provider: "deapi-v1-audio" };
            }
            lastV1Error = { model, status: r.status, body: j };
            if (r.status === 401 || r.status === 403 || r.status === 429) {
              throw new Error(`deapi-v1 ${r.status} (${model}): ${JSON.stringify(j).slice(0, 240)}`);
            }
            console.error(`[media-video] deapi-v1 model ${model} failed`, r.status, JSON.stringify(j).slice(0, 240));
            continue;
          }
          throw new Error(`deapi music failed (v2 ${lastV2Error?.model ?? "music"}; v1 ${lastV1Error?.model ?? "music"}): ${JSON.stringify(lastV2Error?.body ?? lastV1Error?.body ?? {}).slice(0, 240)}`);

          const modelChain = Array.from(new Set([
            requestedModel && /^AceStep_1_5_/i.test(requestedModel) ? requestedModel : MUSIC_MODEL_CHAIN[0],
            ...MUSIC_MODEL_CHAIN,
          ]));
          const basePayload: Record<string, unknown> = {
            caption,
            lyrics,
            duration: musicDuration,
            format: "mp3",
            vocal_language: detectVocalLanguage(`${lyrics}\n${musicPrompt}`),
            seed: randomSeed(),
          };
          const safeSteps = Math.max(1, Math.min(Number(body?.inference_steps) || 8, 8));
          const safeGuidance = Math.max(0, Math.min(Number(body?.guidance_scale) || 1, 3));

          let last: { model: string; status: number; body: unknown } | null = null;
          for (const model of modelChain) {
            const modelGuidance = model === "AceStep_1_5_Base" ? Math.max(safeGuidance, 3) : 1;
            const payloadAttempts: Record<string, unknown>[] = [
              { ...basePayload, model, inference_steps: safeSteps, guidance_scale: modelGuidance },
              { ...basePayload, model, inference_steps: safeSteps },
              { ...basePayload, model },
            ];
            for (const payload of payloadAttempts) {
              const r = await fetch("https://api.deapi.ai/api/v2/audio/music", {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  Authorization: `Bearer ${keyRow.api_key}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              });
              const j = await r.json().catch(() => ({}));
              if (r.ok) {
                const reqId = j?.data?.request_id;
                if (!reqId) throw new Error(`deapi: no request_id in ${JSON.stringify(j).slice(0, 200)}`);
                return { reqId, keyId: keyRow.id, modelUsed: model, provider: "deapi-audio" };
              }
              if (r.status === 401 || r.status === 403 || r.status === 429) {
                throw new Error(`deapi ${r.status}: ${JSON.stringify(j).slice(0, 240)}`);
              }
              last = { model, status: r.status, body: j };
              const msg = JSON.stringify(j);
              const canRetryShape = r.status === 422 && /(guidance_scale|inference_steps)/i.test(msg);
              if (!canRetryShape) break;
            }
          }
          throw new Error(`deapi ${last?.status ?? "error"} (${last?.model ?? "music"}): ${JSON.stringify(last?.body ?? {}).slice(0, 240)}`);
        }, { maxAttempts: 1 });
        const jobId = `${result.provider}:${result.keyId}:${result.reqId}`;
        return jsonResponse({ job_id: jobId, id: jobId, model_used: result.modelUsed, status: "pending", lyrics });
      } catch (e) {
        return jsonResponse({ error: "music_failed", message: String(e).slice(0, 300) }, 502);
      }
    }

    const prompt: string = String(body?.prompt || "").trim();
    if (!prompt) return jsonResponse({ error: "prompt required" }, 400);
    const size = SIZE_MAP[body?.aspect_ratio || "16:9"] || "1280*720";
    const duration = Number(body?.duration || 5);
    const startFrame: string | null = body?.start_frame || null;
    const endFrame: string | null = body?.end_frame || null;
    const requested = String(body?.model_slug || "").trim();

    const baseChain = startFrame || endFrame || /vace|i2v|r2v/i.test(requested)
      ? I2V_CHAIN
      : T2V_CHAIN;
    const chain = Array.from(new Set([
      requested && /^(wan|happyhorse)/i.test(requested) ? requested : baseChain[0],
      ...baseChain,
    ]));

    const forceProvider = String(body?.force_provider || "").toLowerCase();
    const apiKey = await getAlibabaKey();
    const errors: string[] = [];
    if (forceProvider !== "deapi") {
    for (const model of chain) {
      try {
        const taskId = await submit(model, prompt, size, duration, startFrame, endFrame, apiKey);
        return jsonResponse({ job_id: taskId, id: taskId, model_used: model, status: "pending" });
      } catch (e) {
        errors.push(`${model}: ${String(e).slice(0, 200)}`);
        console.error(`[media-video] ${model} failed`, e);
      }
    }

    }

    // Fallback provider: deAPI (deapi.ai) unified video generation.
    // Uses api_keys table with service='deapi' and rotates on 429/daily-quota.
    // Async: POST returns { data: { request_id } }; poll via media-video-poll.
    try {
      const [w, h] = size.split("*").map((n) => parseInt(n, 10) || 720);
      const result = await withKeyRotation("deapi", async (keyRow) => {
        const payload: Record<string, unknown> = {
          prompt,
          width: w,
          height: h,
          fps: 24,
          frames: Math.max(24, Math.min(240, duration * 24)),
          guidance: 7.5,
          steps: 20,
          seed: Math.floor(Math.random() * 1_000_000),
          model: "Ltxv_13B_0_9_8_Distilled_FP8",
        };
        if (startFrame) payload.image = startFrame;
        const r = await fetch("https://api.deapi.ai/api/v2/videos/generations", {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${keyRow.api_key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) {
          // throw with status so withKeyRotation can categorize (429 → cooldown, 401 → block)
          throw new Error(`deapi ${r.status}: ${JSON.stringify(j).slice(0, 200)}`);
        }
        const reqId = j?.data?.request_id;
        if (!reqId) throw new Error(`deapi: no request_id in ${JSON.stringify(j).slice(0, 200)}`);
        // Encode the key id in the job_id so polling reuses the same key.
        return { reqId, keyId: keyRow.id };
      });
      return jsonResponse({
        job_id: `deapi:${result.keyId}:${result.reqId}`,
        id: `deapi:${result.keyId}:${result.reqId}`,
        model_used: "deapi-ltxv",
        status: "pending",
      });
    } catch (e) {
      errors.push(`deapi: ${String(e).slice(0, 240)}`);
      console.error("[media-video] deapi rotation exhausted", e);
    }


    return jsonResponse({ error: "all_models_failed", message: errors.join(" | ") }, 502);
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});
