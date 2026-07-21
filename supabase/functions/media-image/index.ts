/** @doc Generates images via Alibaba DashScope free-trial models. Uses ALIBABA_DASHSCOPE_KEY and silently rotates through free-tier image models on failure. */
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { getAlibabaKey } from "../_shared/alibabaClient.ts";
import { archiveRemoteMedia } from "../_shared/mediaArchive.ts";
import { callAI, CircuitOpenError } from "../_shared/aiClient.ts";

const DS_BASE = "https://dashscope-intl.aliyuncs.com/api/v1";

// Confirmed free-tier models (Alibaba Bailian). Ordered by quality → reliability.
const IMAGE_FALLBACK = [
  "wan2.7-image-pro",
  "wan2.7-image",
  "wan2.6-image",
  "wan2.6-t2i",
  "wan2.5-t2i-preview",
  "qwen-image-max",
  "qwen-image-plus",
  "qwen-image-2.0-pro",
  "qwen-image-2.0",
  "qwen-image",
  "wan2.2-t2i-flash",
  "wan2.2-t2i-plus",
  "wan2.1-t2i-turbo",
  "wan2.1-t2i-plus",
  "z-image-turbo",
];

const SIZE_MAP: Record<string, string> = {
  "1:1": "1024*1024",
  "16:9": "1280*720",
  "9:16": "720*1280",
  "4:3": "1024*768",
  "3:4": "768*1024",
};

async function submitTask(model: string, prompt: string, size: string, apiKey: string) {
  const r = await callAI(
    `${DS_BASE}/services/aigc/text2image/image-synthesis`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable",
      },
      body: JSON.stringify({
        model,
        input: { prompt },
        parameters: { size, n: 1 },
      }),
    },
    { provider: "dashscope-image", timeoutMs: 30_000 },
  );
  const text = await r.text();
  if (!r.ok) throw new Error(`submit ${r.status}: ${text.slice(0, 300)}`);
  const j = JSON.parse(text);
  const taskId = j?.output?.task_id;
  if (!taskId) throw new Error(`no task_id: ${text.slice(0, 200)}`);
  return taskId as string;
}

async function pollTask(taskId: string, apiKey: string, timeoutMs = 180_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    await new Promise((r) => setTimeout(r, 2500));
    const r = await fetch(`${DS_BASE}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const j = await r.json();
    const status = j?.output?.task_status;
    if (status === "SUCCEEDED") {
      const url = j?.output?.results?.[0]?.url;
      if (!url) throw new Error("succeeded but no url");
      return url as string;
    }
    if (status === "FAILED" || status === "UNKNOWN") {
      throw new Error(j?.output?.message || `task ${status}`);
    }
  }
  throw new Error("poll timeout");
}

import {
  auditLog,
  checkRateLimit,
  rateLimitResponse,
  resolveUserId,
} from "../_shared/rateLimit.ts";

const ENDPOINT = "media-image";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const userId = await resolveUserId(req);
  // Anonymous: 3/hour. Authenticated: 30/hour.
  const rl = await checkRateLimit(req, {
    endpoint: ENDPOINT,
    limit: userId ? 30 : 3,
    windowSeconds: 3600,
  });
  if (!rl.allowed) {
    await auditLog({ endpoint: ENDPOINT, action: "rate_limited", status: 429, userId, req });
    return rateLimitResponse(rl, corsHeaders);
  }

  try {
    const body = await req.json();
    const prompt: string = String(body?.prompt || "").trim();
    if (!prompt) return jsonResponse({ error: "prompt required" }, 400);
    if (prompt.length > 2000) return jsonResponse({ error: "prompt too long (max 2000)" }, 400);
    const size = SIZE_MAP[body?.aspect_ratio || "1:1"] || "1024*1024";
    const requested = String(body?.model_slug || "").trim();
    const chain = Array.from(new Set([
      requested && /^(wan|qwen|z-)/i.test(requested) ? requested : IMAGE_FALLBACK[0],
      ...IMAGE_FALLBACK,
    ]));

    const apiKey = await getAlibabaKey();
    const errors: string[] = [];
    for (const model of chain) {
      try {
        const taskId = await submitTask(model, prompt, size, apiKey);
        const url = await pollTask(taskId, apiKey);
        const archivedUrl = await archiveRemoteMedia(req, url, "image");
        await auditLog({
          endpoint: ENDPOINT, action: "generate", status: 200, userId, req,
          metadata: { model_used: model, prompt_len: prompt.length },
        });
        return jsonResponse({ image_url: archivedUrl, image_urls: [archivedUrl], source_url: url, model_used: model });
      } catch (e) {
        errors.push(`${model}: ${String(e).slice(0, 200)}`);
        console.error(`[media-image] ${model} failed`, e);
        // Circuit is open — provider is down; no point trying more models via same provider.
        if (e instanceof CircuitOpenError) {
          await auditLog({ endpoint: ENDPOINT, action: "circuit_open", status: 503, userId, req });
          return jsonResponse(
            { error: "provider_unavailable", message: e.message, retry_after_ms: e.retryAfterMs },
            503,
          );
        }
      }
    }
    await auditLog({ endpoint: ENDPOINT, action: "all_failed", status: 502, userId, req });
    return jsonResponse({ error: "all_models_failed", message: errors.join(" | ") }, 502);
  } catch (e) {
    await auditLog({ endpoint: ENDPOINT, action: "error", status: 500, userId, req,
      metadata: { error: String(e).slice(0, 300) } });
    return jsonResponse({ error: String(e) }, 500);
  }
});

