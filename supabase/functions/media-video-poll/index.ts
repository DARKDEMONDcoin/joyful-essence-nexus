/** @doc Polls a DashScope video-generation task by task_id and returns normalized status/url for the chat media flow. */
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { getAlibabaKey } from "../_shared/alibabaClient.ts";
import { archiveRemoteMedia } from "../_shared/mediaArchive.ts";
import { getKeyById, putKeyOnCooldown } from "../_shared/pickKey.ts";
import { getUserPlan } from "../_shared/systemPromptBuilder.ts";
import { resolveUserId } from "../_shared/rateLimit.ts";

const DS_BASE = "https://dashscope-intl.aliyuncs.com/api/v1";
const PAID_PLANS = new Set(["pro", "max"]);

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
    const jobId: string = String(body?.job_id || body?.id || "").trim();
    if (!jobId) return jsonResponse({ error: "job_id required" }, 400);

    // deAPI v1 audio (music) job — uses the faster txt2music queue.
    if (jobId.startsWith("deapi-v1-audio:")) {
      const rest = jobId.slice("deapi-v1-audio:".length);
      const parts = rest.split(":");
      let apiKey: string | undefined;
      let keyId: string | null = null;
      let reqId: string;
      if (parts.length >= 2) {
        keyId = parts[0];
        reqId = parts.slice(1).join(":");
        const row = await getKeyById(keyId);
        if (row?.api_key) apiKey = row.api_key;
      } else {
        reqId = rest;
      }
      if (!apiKey) apiKey = Deno.env.get("DEAPI_API_KEY") ?? undefined;
      if (!apiKey) return jsonResponse({ status: "failed", error: "no deapi key available" });
      const rr = await fetch(`https://api.deapi.ai/api/v1/client/request-status/${reqId}`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${apiKey}` },
      });
      const jj = await rr.json().catch(() => ({}));
      if (rr.status === 429 && keyId) {
        const limitType = rr.headers.get("X-RateLimit-Type") || rr.headers.get("x-ratelimit-type") || "minute";
        const until = /daily|rpd/i.test(limitType) ? undefined : new Date(Date.now() + 65_000).toISOString();
        await putKeyOnCooldown(keyId, `music-v1-poll 429 ${limitType}`, until);
        return jsonResponse({ status: "pending", raw_status: "rate_limited" });
      }
      const st = jj?.data?.status;
      if (st === "done") {
        const url = jj?.data?.result_url || jj?.data?.result;
        return jsonResponse({ status: "succeeded", audio_url: url, url });
      }
      if (st === "error") return jsonResponse({ status: "failed", error: jj?.message || "deapi error" });
      return jsonResponse({ status: "pending", raw_status: st, progress: jj?.data?.progress });
    }

    // deAPI audio (music) job — same shape as deapi video but returns audio_url.
    if (jobId.startsWith("deapi-audio:")) {
      const rest = jobId.slice("deapi-audio:".length);
      const parts = rest.split(":");
      let apiKey: string | undefined;
      let keyId: string | null = null;
      let reqId: string;
      if (parts.length >= 2) {
        keyId = parts[0];
        reqId = parts.slice(1).join(":");
        const row = await getKeyById(keyId);
        if (row?.api_key) apiKey = row.api_key;
      } else {
        reqId = rest;
      }
      if (!apiKey) apiKey = Deno.env.get("DEAPI_API_KEY") ?? undefined;
      if (!apiKey) return jsonResponse({ status: "failed", error: "no deapi key available" });
      const rr = await fetch(`https://api.deapi.ai/api/v2/jobs/${reqId}`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${apiKey}` },
      });
      const jj = await rr.json().catch(() => ({}));
      if (rr.status === 429 && keyId) {
        const limitType = rr.headers.get("X-RateLimit-Type") || rr.headers.get("x-ratelimit-type") || "minute";
        const until = /daily|rpd/i.test(limitType) ? undefined : new Date(Date.now() + 65_000).toISOString();
        await putKeyOnCooldown(keyId, `music-poll 429 ${limitType}`, until);
        return jsonResponse({ status: "pending", raw_status: "rate_limited" });
      }
      const st = jj?.data?.status;
      if (st === "done") {
        const url = jj?.data?.result_url;
        return jsonResponse({ status: "succeeded", audio_url: url, url });
      }
      if (st === "error") return jsonResponse({ status: "failed", error: jj?.message || "deapi error" });
      return jsonResponse({ status: "pending", raw_status: st, progress: jj?.data?.progress });
    }

    // deAPI (deapi.ai) async job. Two shapes:
    //   deapi:<keyId>:<request_id>  (rotated key — new format)
    //   deapi:<request_id>          (legacy — fall back to env key)
    if (jobId.startsWith("deapi:")) {
      const rest = jobId.slice("deapi:".length);
      const parts = rest.split(":");
      let deapiKey: string | undefined;
      let keyId: string | null = null;
      let reqId: string;
      // Heuristic: a key id is a UUID (contains 4 hyphens), request id also may
      // be a UUID. Prefer the two-part form when present.
      if (parts.length >= 2) {
        keyId = parts[0];
        reqId = parts.slice(1).join(":");
        const row = await getKeyById(keyId);
        if (row?.api_key) deapiKey = row.api_key;
      } else {
        reqId = rest;
      }
      if (!deapiKey) deapiKey = Deno.env.get("DEAPI_API_KEY") ?? undefined;
      if (!deapiKey) return jsonResponse({ status: "failed", error: "no deapi key available" });
      const rr = await fetch(`https://api.deapi.ai/api/v2/jobs/${reqId}`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${deapiKey}` },
      });
      const jj = await rr.json();
      if (rr.status === 429 && keyId) {
        // Poll endpoint rate-limit — park the key so we stop hammering with it today.
        const limitType = rr.headers.get("X-RateLimit-Type") || rr.headers.get("x-ratelimit-type") || "minute";
        const until = /daily|rpd/i.test(limitType) ? undefined : new Date(Date.now() + 65_000).toISOString();
        await putKeyOnCooldown(keyId, `poll 429 ${limitType}`, until);
        return jsonResponse({ status: "pending", raw_status: "rate_limited" });
      }
      const st = jj?.data?.status;
      if (st === "done") {
        const url = jj?.data?.result_url;
        const archived = url ? await archiveRemoteMedia(req, url, "video") : url;
        return jsonResponse({ status: "succeeded", video_url: archived, url: archived, source_url: url });
      }
      if (st === "error") return jsonResponse({ status: "failed", error: jj?.message || "deapi error" });
      return jsonResponse({ status: "pending", raw_status: st, progress: jj?.data?.progress });
    }



    const apiKey = await getAlibabaKey();
    const r = await fetch(`${DS_BASE}/tasks/${jobId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const j = await r.json();
    if (!r.ok) return jsonResponse({ error: j?.message || `poll ${r.status}` }, 502);
    const s = j?.output?.task_status;
    if (s === "SUCCEEDED") {
      const url = j?.output?.video_url
        || j?.output?.results?.[0]?.url
        || j?.output?.results?.video_url;
      const archivedUrl = url ? await archiveRemoteMedia(req, url, "video") : url;
      return jsonResponse({ status: "succeeded", video_url: archivedUrl, url: archivedUrl, source_url: url });
    }
    if (s === "FAILED" || s === "UNKNOWN") {
      return jsonResponse({ status: "failed", error: j?.output?.message || s });
    }
    return jsonResponse({ status: "pending", raw_status: s });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});
