/** @doc Long-running deep-research job — plans, browses, synthesizes a full report. */
import { buildCors } from "../_shared/cors.ts";
// Deep Research background-job worker — plan-approval + multi-agent edition.
// Actions: start (legacy auto), plan, approve, update_plan, cancel.
//
// Flow:
//   plan       -> creates job, runs planner agent, sets awaiting_approval=true
//   update_plan-> regenerates plan from user feedback, still awaiting_approval
//   approve    -> runs the search + extract + multi-agent synthesis pipeline
//   start      -> legacy single-shot (used as fallback)
//
// Multi-agent synthesis: planner → image-decider → analyst → critic
// All agent outputs are AI-generated (intro/ready texts, plan goal, thinking).

import { createClient } from "npm:@supabase/supabase-js@2";
import { getLLM, ROUTER_MODELS } from "../_shared/llm-router.ts";
import { withKeyRotation } from "../_shared/key-pool.ts";
import {
  createFindAll,
  createMonitor,
  createTaskRun,
  getTaskRunResult,
  parallelChat,
  parallelExtract,
  parallelSearch as parallelSearchApi,
  verifyParallelWebhook,
  type WebhookConfig,
} from "../_shared/parallel.ts";
const corsHeaders = buildCors({
  methods: "POST, GET, OPTIONS, PUT, DELETE",
  extraHeaders: "webhook-id, webhook-timestamp, webhook-signature",
});
const PARALLEL_API_KEY = Deno.env.get("PARALLEL_API_KEY");
const PARALLEL_WEBHOOK_SECRET = Deno.env.get("PARALLEL_WEBHOOK_SECRET") ?? "";

// @ts-ignore Deno global in edge runtime
declare const EdgeRuntime: { waitUntil: (p: Promise<unknown>) => void };

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERPER_API_KEY = Deno.env.get("SERPER_API_KEY");
const HB_API_KEY = Deno.env.get("HYPERBROWSER_API_KEY");
const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
const TODAY_ISO = new Date().toISOString().slice(0, 10);

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const SELF_URL = `${SUPABASE_URL}/functions/v1/deep-research-job`;

/**
 * Fire-and-forget self invocation. Each call runs in its own edge function
 * runtime instance so the 150s CPU budget resets per section. We do NOT await
 * the response body — only the request being accepted matters.
 */
async function selfInvoke(action: string, payload: Record<string, unknown>) {
  const delayMs = Number((payload as any)?.delayMs ?? 0);
  const doFetch = async () => {
    try {
      await fetch(SELF_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SERVICE_ROLE}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, __internal: SERVICE_ROLE, ...payload }),
      });
    } catch (e) {
      console.warn("[selfInvoke] failed", action, e);
    }
  };
  if (delayMs > 0) {
    wait(
      (async () => {
        await new Promise((r) => setTimeout(r, delayMs));
        await doFetch();
      })(),
    );
  } else {
    await doFetch();
  }
}

async function queueTick(jobId: string, delayMs = 500) {
  await selfInvoke("tick", { jobId, delayMs });
}

type JobPatch = Record<string, unknown>;

async function patchJob(jobId: string, patch: JobPatch) {
  await admin.from("research_jobs").update(patch).eq("id", jobId);
}

async function appendStep(jobId: string, step: Record<string, unknown>) {
  const { data } = await admin.from("research_jobs").select("steps").eq("id", jobId).maybeSingle();
  const steps = Array.isArray((data as any)?.steps) ? (data as any).steps : [];
  steps.push({ at: new Date().toISOString(), ...step });
  await admin.from("research_jobs").update({ steps }).eq("id", jobId);
}

// ---- LLM helpers ----
async function llmJSON<T = unknown>(systemPrompt: string, userPrompt: string): Promise<T | null> {
  const router = await getLLM();
  if (!router) return null;
  // Keep JSON calls short; if they time out we fall back to safe defaults so
  // the edge runtime never burns its whole budget waiting on one model call.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(router.url, {
        method: "POST",
        headers: { Authorization: `Bearer ${router.key}`, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(12_000),
        body: JSON.stringify({
          model: router.mapModel(ROUTER_MODELS.deepResearch),
          messages: [
            {
              role: "system",
              content:
                systemPrompt + "\n\nRespond ONLY with valid JSON. No markdown, no code fences.",
            },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.15,
          response_format: { type: "json_object" },
        }),
      });
      const json = await res.json();
      const text: string = json?.choices?.[0]?.message?.content || "";
      const cleaned = text.replace(/^```json\s*|\s*```$/g, "").trim();
      if (!cleaned) throw new Error("empty_llm_response");
      return JSON.parse(cleaned) as T;
    } catch (e) {
      console.warn(`[llmJSON] attempt ${attempt + 1} failed`, e);
      if (attempt < 1) await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return null;
}

async function llmText(
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.4,
  maxTokens = 3000,
  timeoutMs = 60_000,
): Promise<string> {
  const router = await getLLM();
  if (!router) throw new Error("no_llm_router");
  const res = await fetch(router.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${router.key}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify({
      model: router.mapModel(ROUTER_MODELS.deepResearch),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`llm_http_${res.status}: ${errText.slice(0, 200)}`);
  }
  const json = await res.json();
  const out = json?.choices?.[0]?.message?.content || "";
  if (!out) throw new Error("empty_llm_text");
  return out;
}

// ---- Planner agent: produces goal + 4-6 step plan + intro/ready text ----
type PlanShape = {
  goal: string;
  steps: string[];
  intro: string;
  ready: string;
  needs_images: boolean;
};

async function planAgent(
  query: string,
  language: string | null,
  feedback?: string,
  previousPlan?: PlanShape,
): Promise<PlanShape> {
  const sys = `You are a senior research planner. Given the user's research topic, produce a focused research plan.
LANGUAGE: detect the user's exact language and dialect (Arabic dialects must be preserved: Egyptian مصري, Khaleeji, Levantine, Maghrebi, MSA). Write EVERY field in that same language and dialect. Never default to MSA when user wrote in dialect. Language hint: ${language || "auto-detect"}.

Output JSON with these fields:
{
  "goal": "1-2 sentence headline describing the research objective (user's language)",
  "steps": ["4-6 concrete research steps as imperative phrases (user's language)"],
  "intro": "1 short sentence the assistant says BEFORE the plan card, like 'Let me draft a research plan for you' but in YOUR OWN WORDS and in the user's language. Must feel natural, not templated.",
  "ready": "1 short sentence the assistant says AFTER drafting, like 'Here is the plan — review or edit it' in YOUR OWN WORDS and in user's language.",
  "needs_images": true if the topic benefits from visual references (people, places, products, art, design, history); false for pure abstract/code/financial topics
}

Make every sentence sound human, varied, and tailored to THIS specific topic — never reuse generic phrasing.`;

  const usr =
    feedback && previousPlan
      ? `Original topic: ${query}\n\nPrevious plan:\n${JSON.stringify(previousPlan, null, 2)}\n\nUser's latest edit/request:\n"""${feedback}"""\n\nRegenerate the plan using the user's latest edit as the authoritative instruction. If the latest edit changes the topic completely, discard the old topic and make the new plan about the latest edit only. If it is a small adjustment, apply it to the old topic. The returned goal and steps must match the latest edit.`
      : `Research topic: ${query}\n\nDraft the plan now.`;

  const parsed = await llmJSON<PlanShape>(sys, usr);
  if (parsed && Array.isArray(parsed.steps) && parsed.steps.length > 0) {
    return {
      goal: String(parsed.goal || query).slice(0, 400),
      steps: parsed.steps.slice(0, 8).map(String),
      intro: String(parsed.intro || "").slice(0, 300),
      ready: String(parsed.ready || "").slice(0, 300),
      needs_images: parsed.needs_images !== false,
    };
  }
  // Fallback
  return {
    goal: query,
    steps: [query],
    intro: "",
    ready: "",
    needs_images: true,
  };
}

// ---- Serper search ----
type Source = {
  title: string;
  url: string;
  snippet?: string;
  query?: string;
  date?: string;
  source?: string;
  kind?: "organic" | "news" | "answer";
};

function hasArabic(value: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F]/.test(value || "");
}

function looksTimeSensitive(value: string): boolean {
  return /\b(today|tomorrow|tonight|yesterday|latest|schedule|fixture|fixtures|match|game|vs|world cup|qualifier|qualifiers|date|time|official)\b/i.test(
    value,
  ) || /اليوم|بكره|بكرة|غدا|غدًا|النهارده|الليلة|موعد|مباراة|ماتش|ضد|كأس العالم|تصفيات|جدول|رسمي|الرسمية|آخر|احدث|أحدث/.test(value);
}

function buildSearchQueries(query: string, plan: string[], depth: "lite" | "medium" | "max"): string[] {
  const q = query.trim();
  const arabic = hasArabic(q);
  const timeSensitive = looksTimeSensitive(q);
  const currentDate = `date ${TODAY_ISO}`;
  const base = [q];

  if (timeSensitive) {
    base.push(
      arabic ? `${q} موعد رسمي ${TODAY_ISO}` : `${q} official schedule ${TODAY_ISO}`,
      arabic ? `${q} آخر الأخبار ${TODAY_ISO}` : `${q} latest news ${TODAY_ISO}`,
      arabic ? `${q} نتيجة بحث الأخبار` : `${q} news`,
      arabic ? `${q} موقع فيفا` : `${q} FIFA official`,
      arabic ? `${q} جدول مباريات` : `${q} fixture schedule`,
    );
  } else {
    base.push(arabic ? `${q} مصادر موثوقة` : `${q} reliable sources`);
  }

  for (const step of plan) {
    const s = String(step || "").trim();
    if (!s) continue;
    base.push(s);
    if (timeSensitive) base.push(arabic ? `${s} ${currentDate}` : `${s} ${currentDate}`);
  }

  const limit = depth === "lite" ? 7 : depth === "max" ? 16 : 11;
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of base) {
    const normalized = item.replace(/\s+/g, " ").trim();
    const key = normalized.toLowerCase();
    if (!normalized || seen.has(key)) continue;
    seen.add(key);
    out.push(normalized);
    if (out.length >= limit) break;
  }
  return out;
}

function sourceQualityScore(source: Source, originalQuery: string): number {
  const url = (source.url || "").toLowerCase();
  const text = `${source.title || ""} ${source.snippet || ""} ${source.source || ""}`.toLowerCase();
  const original = originalQuery.toLowerCase();
  let score = 0;

  if (source.kind === "news") score += 28;
  if (source.kind === "answer") score += 18;
  if (source.date) score += 12;
  if (/fifa\.com|the-afc\.com|cafonline\.com|olympics\.com|espn\.|bbc\.|reuters\.com|apnews\.com|skysports|bein|filgoal|yallakora|kooora|365scores|flashscore|sofascore/.test(url)) score += 24;
  if (/official|schedule|fixture|fixtures|match centre|match center|موعد|رسمي|الرسمية|جدول|مباراة|ماتش|تصفيات|كأس العالم/.test(text)) score += 16;
  if (/wiki|wikipedia/.test(url)) score -= looksTimeSensitive(originalQuery) ? 35 : 4;
  if (/forum|reddit|facebook|x\.com|twitter|tiktok/.test(url)) score -= 18;

  const queryTerms = original
    .replace(/["'“”‘’.,،:؛!?؟()[\]{}]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 2)
    .slice(0, 12);
  for (const term of queryTerms) {
    if (text.includes(term) || url.includes(term)) score += 2;
  }
  return score;
}

function rankSources(sources: Source[], originalQuery: string): Source[] {
  return [...sources].sort((a, b) => sourceQualityScore(b, originalQuery) - sourceQualityScore(a, originalQuery));
}

function sourceToContext(source: Source, index: number): { url: string; text: string } | null {
  const parts = [
    `Source ${index + 1}`,
    source.title ? `Title: ${source.title}` : "",
    source.source ? `Publisher: ${source.source}` : "",
    source.date ? `Date shown by search/news: ${source.date}` : "",
    source.query ? `Search query: ${source.query}` : "",
    source.snippet ? `Search/news snippet: ${source.snippet}` : "",
  ].filter(Boolean);
  if (parts.length <= 1) return null;
  return { url: source.url, text: parts.join("\n") };
}

function stripHtml(value: string): string {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function wikipediaSearch(q: string): Promise<{ organic: Source[]; images: string[] }> {
  const lang = /[\u0600-\u06FF\u0750-\u077F]/.test(q) ? "ar" : "en";
  try {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=8&format=json`;
    const res = await fetch(url, { headers: { "User-Agent": "MegsyResearch/1.0" } });
    const json = await res.json();
    const organic: Source[] = (json?.query?.search || []).slice(0, 8).map((item: any) => {
      const title = String(item?.title || q);
      return {
        title,
        url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
        snippet: stripHtml(String(item?.snippet || "")),
        query: q,
      };
    });
    return { organic, images: [] };
  } catch {
    return { organic: [], images: [] };
  }
}

async function serperSearch(
  q: string,
  includeImages: boolean,
): Promise<{ organic: Source[]; images: string[] }> {
  // 0) Prefer Parallel Search API when the key is configured.
  if (PARALLEL_API_KEY) {
    try {
      const arabic = hasArabic(q);
      const ps = await parallelSearchApi({
        objective: q,
        search_queries: [q],
        processor: "base",
        max_results: 10,
        max_chars_per_result: 4000,
        source_policy: arabic ? { include_domains: [] } : undefined,
      });
      const organic: Source[] = (ps.results || []).map((r) => ({
        title: r.title || r.url,
        url: r.url,
        snippet: (r.excerpts || []).join("\n").slice(0, 800),
        query: q,
        kind: "organic" as const,
      }));
      if (organic.length > 0) return { organic, images: [] };
    } catch (e) {
      console.warn("[deep-research] parallel search failed, falling back", (e as Error).message);
    }
  }
  const runWith = async (apiKey: string) => {
    const arabic = hasArabic(q);
    const timeSensitive = looksTimeSensitive(q);
    const baseBody = {
      q,
      num: 10,
      gl: arabic ? "eg" : "us",
      hl: arabic ? "ar" : "en",
      autocorrect: true,
      ...(timeSensitive ? { tbs: "qdr:m" } : {}),
    };
    const promises: Promise<Response>[] = [
      fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify(baseBody),
      }),
      fetch("https://google.serper.dev/news", {
        method: "POST",
        headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify(baseBody),
      }),
    ];
    if (includeImages) {
      promises.push(
        fetch("https://google.serper.dev/images", {
          method: "POST",
          headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
          body: JSON.stringify({ ...baseBody, num: 6 }),
        }),
      );
    }
    const responses = await Promise.all(promises);
    const webRes = responses[0];
    if (!webRes.ok) {
      return { ok: false, status: webRes.status, errorText: await webRes.text().catch(() => "") };
    }
    const web = await webRes.json().catch(() => ({}));
    const news = responses[1]?.ok ? await responses[1].json().catch(() => ({})) : {};
    const img =
      includeImages && responses[2]?.ok ? await responses[2].json().catch(() => ({})) : {};
    const organic: Source[] = [];
    if (web?.answerBox?.link) {
      organic.push({
        title: web.answerBox.title || web.answerBox.source || q,
        url: web.answerBox.link,
        snippet: web.answerBox.answer || web.answerBox.snippet,
        source: web.answerBox.source,
        query: q,
        kind: "answer",
      });
    }
    organic.push(...(web?.organic || []).slice(0, 10).map((o: any) => ({
      title: o.title,
      url: o.link,
      snippet: o.snippet,
      source: o.source,
      date: o.date,
      query: q,
      kind: "organic" as const,
    })));
    organic.push(...(news?.news || []).slice(0, 10).map((o: any) => ({
      title: o.title,
      url: o.link,
      snippet: o.snippet,
      source: o.source,
      date: o.date,
      query: q,
      kind: "news" as const,
    })));
    const images: string[] = includeImages
      ? (img?.images || [])
          .slice(0, 6)
          .map((i: any) => i.imageUrl)
          .filter(Boolean)
      : [];
    return { ok: true, status: 200, costUsd: 0.001, data: { organic, images } };
  };

  // 1) Try rotation pool (Telegram-managed keys).
  const pooled = await withKeyRotation("serper", runWith);
  if (pooled.ok && pooled.data) {
    if (pooled.data.organic.length > 0) return pooled.data;
  }
  // 2) Fall back to env key if present.
  if (SERPER_API_KEY) {
    try {
      const res = await runWith(SERPER_API_KEY);
      if (res.ok && res.data && res.data.organic.length > 0) return res.data;
    } catch {
      /* ignore */
    }
  }
  // 3) Wikipedia fallback. Never use it for live/time-sensitive topics such as
  // sports fixtures, prices, laws, breaking news, or schedules; stale encyclopedic
  // pages can create confident but false negatives.
  if (looksTimeSensitive(q)) return { organic: [], images: [] };
  return wikipediaSearch(q);
}

// ---- Page extraction ----
async function extractPage(url: string): Promise<string> {
  const callFirecrawl = async (apiKey: string) => {
    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
    });
    if (!res.ok) {
      return { ok: false, status: res.status, errorText: await res.text().catch(() => "") };
    }
    const json = await res.json().catch(() => ({}));
    const md = (json?.data?.markdown || "").slice(0, 8000);
    return { ok: true, status: 200, costUsd: 0.002, data: md };
  };

  // 1) Pool-managed Firecrawl keys.
  const pooled = await withKeyRotation<string>("firecrawl", callFirecrawl);
  if (pooled.ok && pooled.data) return pooled.data;
  // 2) Env fallback.
  if (FIRECRAWL_API_KEY) {
    try {
      const res = await callFirecrawl(FIRECRAWL_API_KEY);
      if (res.ok && res.data) return res.data;
    } catch {
      /* fall through */
    }
  }
  if (HB_API_KEY) {
    try {
      const res = await fetch("https://app.hyperbrowser.ai/api/scrape", {
        method: "POST",
        headers: { "x-api-key": HB_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ url, outputFormat: ["markdown"], onlyMainContent: true }),
      });
      const json = await res.json();
      return (json?.data?.markdown || json?.markdown || "").slice(0, 8000);
    } catch {
      /* ignore */
    }
  }
  try {
    const res = await fetch(url, { headers: { "User-Agent": "MegsyResearch/1.0" } });
    const html = await res.text();
    return stripHtml(html).slice(0, 8000);
  } catch {
    return "";
  }
}

// ---- Outline builder (replaces inline analyst) ----
type OutlineSection = { heading: string; bullets: string[] };

async function buildOutline(
  query: string,
  language: string | null,
  sources: Source[],
  excerpts: { url: string; text: string }[],
  depth: "lite" | "medium" | "max" = "medium",
): Promise<OutlineSection[]> {
  const cfg =
    depth === "lite"
      ? { min: 5, max: 7, words: "3,000+", bullets: "3-5" }
      : depth === "max"
        ? { min: 18, max: 24, words: "30,000+", bullets: "6-10" }
        : { min: 10, max: 14, words: "12,000+", bullets: "5-8" };
  const context = excerpts
    .filter((e) => e.text)
    .map((e, i) => `### Source ${i + 1}: ${e.url}\n${e.text}`)
    .join("\n\n---\n\n")
    .slice(0, 60_000);
  const sourceList = sources.map((s, i) => `[${i + 1}] ${s.title} — ${s.url}`).join("\n");
  type Outline = { sections: OutlineSection[] };
  const outline = await llmJSON<Outline>(
    `You are the lead editor of a long-form research report (target ${cfg.words} words total).
Return JSON: { "sections": [{ "heading": "...", "bullets": ["...","..."] }, ...] }.
Requirements:
- Today is ${TODAY_ISO}. For time-sensitive topics, prioritize the latest source dates and never infer that an event does not exist unless the provided context explicitly supports that conclusion.
- Use the source list and context as the only basis for the outline. If the context is thin or contradictory, include a verification/uncertainty section instead of inventing certainty.
- ${cfg.min} to ${cfg.max} H2 sections covering background, history, key concepts, deep technical/strategic angles, comparisons, case studies, data/numbers, real-world examples, controversies, future outlook, practical takeaways, FAQs.
- Each section has ${cfg.bullets} specific bullets describing exactly what that section must cover (very concrete, not generic).
- Avoid generic headings. Tailor every heading to the topic.
- Match the user's exact language AND dialect. Language hint: ${language || "auto-detect"}.`,
    `Topic: ${query}\n\nSource list:\n${sourceList}\n\nContext (truncated):\n${context.slice(0, 30_000)}`,
  );
  const plan = (outline?.sections || []).slice(0, cfg.max).filter((s) => s?.heading);
  return plan;
}

/**
 * Write a single section. Runs in its own edge function invocation so it has
 * its own ~150s CPU budget — plenty for 1500-2500 words.
 */
async function writeSectionAndSave(jobId: string, sectionIndex: number) {
  const { data: job } = await admin.from("research_jobs").select("*").eq("id", jobId).maybeSingle();
  if (!job) return;
  if (["succeeded", "failed", "cancelled"].includes(String((job as any).status))) return;
  const outline: OutlineSection[] = Array.isArray((job as any).outline) ? (job as any).outline : [];
  const sec = outline[sectionIndex];
  if (!sec) return;

  const sections: string[] = Array.isArray((job as any).report_sections)
    ? (job as any).report_sections
    : [];
  if (sections[sectionIndex] && sections[sectionIndex].length > 200) {
    // already written — skip
    return await maybeFinalize(jobId);
  }

  const excerpts: { url: string; text: string }[] = Array.isArray((job as any).context_excerpts)
    ? (job as any).context_excerpts
    : [];
  const sources: Source[] = Array.isArray(job.sources) ? job.sources : [];
  const language: string | null = job.language;
  const query: string = job.plan_goal || job.query;
  const depth: "lite" | "medium" | "max" = (job as any).depth || "medium";
  const wordTarget = depth === "lite" ? "350-600" : depth === "max" ? "800-1100" : "650-900";
  const maxTokens = depth === "lite" ? 1800 : depth === "max" ? 3200 : 2800;
  const timeoutMs = depth === "max" ? 90_000 : 60_000;

  const context = excerpts
    .filter((e) => e.text)
    .map((e, i) => `### Source ${i + 1}: ${e.url}\n${e.text}`)
    .join("\n\n---\n\n")
    .slice(0, 80_000);
  const sourceList = sources.map((s, i) => `[${i + 1}] ${s.title} — ${s.url}`).join("\n");

  let body = "";
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 3 && !body; attempt++) {
    try {
      body = await llmText(
        `You are writing ONE section of a MASSIVE long-form research report.
Write ${wordTarget} words of dense, deeply-specific Markdown for the section heading provided. This must be substantive book-chapter quality.

ACCURACY IS THE #1 PRIORITY:
- Today/current date for interpreting "today", "tomorrow", "latest", and live schedules is ${TODAY_ISO}.
- Use ONLY facts, numbers, names, dates, and quotes that appear explicitly in the "Extracted context" below. Do NOT rely on your prior knowledge.
- If a claim is not supported by the context, either omit it or explicitly mark it as "غير مؤكد" / "unverified" in the same language as the report.
- NEVER say "there is no match/event" unless at least two recent, relevant sources in the context explicitly support that negative conclusion. If sources are insufficient, say the sources available here do not confirm it.
- NEVER invent statistics, quotes, event outcomes, scores, dates, prices, laws, people, or organizations. Fabrication is a critical failure.
- If the context is thin on a bullet, write less rather than filling with speculation. Say plainly what is known vs. what is not.
- Prefer conservative, hedged language ("according to X", "reported by Y") over confident assertions when the source is a single outlet.
- Cross-check names/numbers against the context before writing them. If two sources conflict, note the disagreement.

Formatting rules:
- Start the section with: ## ${sec.heading}
- Use multiple ### sub-headings, tight bullet lists, and at least one markdown table if it helps comparisons or numbers.
- Inline numeric citations like [1], [2] mapping to the provided source list. Cite EVERY concrete fact, number, date, or quote. Do NOT invent citation numbers — only use numbers from the source list.
- Do NOT write an intro/outro for the whole report — just this section. Do NOT add "## Sources".
- Be specific, concrete, example-rich. No filler. No restating the heading in a bland topic sentence.
- Match the user's exact language and dialect. Language hint: ${language || "auto-detect"}.`,
        `Overall topic: ${query}\nSection ${sectionIndex + 1} of ${outline.length}: ${sec.heading}\nKey points to cover:\n- ${sec.bullets.join("\n- ")}\n\nSource list:\n${sourceList}\n\nExtracted context:\n${context}`,
        0.2,
        maxTokens,
        timeoutMs,
      );
    } catch (e) {
      lastErr = e;
      console.warn("[write_section] attempt failed", sectionIndex, attempt, (e as Error)?.message);
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
  if (!body || body.trim().length < 100) {
    // Stub so finalize is never blocked by one broken section.
    body =
      `## ${sec.heading}\n\n_(تعذّر توليد هذا القسم بالكامل — ${(lastErr as Error)?.message || "خطأ مؤقت"}.)_\n\n` +
      sec.bullets.map((b) => `- ${b}`).join("\n");
  }

  // Re-fetch latest sections array (other concurrent writers may have updated it) and merge.
  const { data: cur } = await admin
    .from("research_jobs")
    .select("report_sections, outline")
    .eq("id", jobId)
    .maybeSingle();
  const latest: string[] = Array.isArray((cur as any)?.report_sections)
    ? (cur as any).report_sections
    : [];
  const outlineLen = Array.isArray((cur as any)?.outline)
    ? (cur as any).outline.length
    : outline.length;
  while (latest.length < outlineLen) latest.push("");
  latest[sectionIndex] = (body || "").trim();
  const done = latest.filter((t) => t && t.length > 50).length;

  await patchJob(jobId, {
    report_sections: latest,
    progress: 50 + Math.min(45, Math.round((done / outlineLen) * 45)),
    stage: `Writing section ${done}/${outlineLen}`,
  });

  if (done >= outlineLen) {
    await maybeFinalize(jobId);
  } else {
    const next = latest.findIndex((t, i) => i !== sectionIndex && (!t || t.trim().length < 50));
    if (next >= 0) await selfInvoke("write_section", { jobId, sectionIndex: next });
  }
}

async function maybeFinalize(jobId: string) {
  const { data: job } = await admin
    .from("research_jobs")
    .select("status, outline, report_sections")
    .eq("id", jobId)
    .maybeSingle();
  if (!job) return;
  if ((job as any).status === "succeeded" || (job as any).status === "failed") return;
  const outline: OutlineSection[] = Array.isArray((job as any).outline) ? (job as any).outline : [];
  const sections: string[] = Array.isArray((job as any).report_sections)
    ? (job as any).report_sections
    : [];
  const completed = sections.filter((t) => t && t.length > 50).length;
  if (outline.length === 0 || completed < outline.length) return;
  // Atomically claim finalize: only continue if status is still synthesizing.
  const { data: claimed } = await admin
    .from("research_jobs")
    .update({ status: "synthesizing", stage: "Assembling report" })
    .eq("id", jobId)
    .in("status", ["searching", "synthesizing"])
    .select("id")
    .maybeSingle();
  if (!claimed) return; // someone else is finalizing
  selfInvoke("finalize", { jobId });
}

/**
 * Watchdog: re-dispatches any still-empty sections, then schedules itself again.
 * After `maxRounds` rounds, force-finalizes with whatever sections exist (stubbing the rest).
 */
async function watchdog(jobId: string, round: number) {
  const { data: job } = await admin
    .from("research_jobs")
    .select("status, outline, report_sections")
    .eq("id", jobId)
    .maybeSingle();
  if (!job) return;
  if (
    (job as any).status === "succeeded" ||
    (job as any).status === "failed" ||
    (job as any).status === "cancelled"
  )
    return;

  const outline: OutlineSection[] = Array.isArray((job as any).outline) ? (job as any).outline : [];
  const sections: string[] = Array.isArray((job as any).report_sections)
    ? (job as any).report_sections
    : [];
  const missing: number[] = [];
  for (let i = 0; i < outline.length; i++) {
    if (!sections[i] || sections[i].trim().length < 50) missing.push(i);
  }

  if (missing.length === 0) {
    await maybeFinalize(jobId);
    return;
  }

  const MAX_ROUNDS = 3;
  if (round >= MAX_ROUNDS) {
    // Force-stub remaining sections and finalize.
    const latest = [...sections];
    while (latest.length < outline.length) latest.push("");
    for (const i of missing) {
      const sec = outline[i];
      latest[i] =
        `## ${sec.heading}\n\n_(تعذّر توليد هذا القسم بعد عدة محاولات.)_\n\n` +
        (sec.bullets || []).map((b) => `- ${b}`).join("\n");
    }
    await patchJob(jobId, { report_sections: latest, stage: "Force-finalizing" });
    await maybeFinalize(jobId);
    return;
  }

  // Re-dispatch missing sections.
  for (const i of missing) {
    selfInvoke("write_section", { jobId, sectionIndex: i });
    await new Promise((r) => setTimeout(r, 200));
  }
  await patchJob(jobId, { stage: `Retrying ${missing.length} section(s) (round ${round + 1})` });
  // Schedule next watchdog round in ~90s.
  selfInvoke("watchdog", { jobId, round: round + 1, delayMs: 90_000 });
}

async function finalizeReport(jobId: string) {
  const startedAt = Date.now();
  try {
    const { data: job } = await admin
      .from("research_jobs")
      .select("*")
      .eq("id", jobId)
      .maybeSingle();
    if (!job) return;
    if (job.status === "succeeded") return;
    const sections: string[] = Array.isArray((job as any).report_sections)
      ? (job as any).report_sections
      : [];
    const language: string | null = job.language;
    const query: string = job.plan_goal || job.query;
    const sources: Source[] = Array.isArray(job.sources) ? job.sources : [];
    const excerpts: { url: string; text: string }[] = Array.isArray((job as any).context_excerpts)
      ? (job as any).context_excerpts
      : [];

    const report = sections.filter(Boolean).join("\n\n");
    await patchJob(jobId, { progress: 95, stage: "Reflecting", report });

    const used = excerpts.filter((e) => e.text).length;
    const usedUrls = new Set(excerpts.filter((e) => e.text).map((e) => e.url));
    const unused = sources.filter((s) => !usedUrls.has(s.url));
    const thinking = await criticAgent(query, language, report, used, unused.length);

    const finishedAt = Date.now();
    const dur = finishedAt - new Date(job.started_at || finishedAt).getTime();
    await patchJob(jobId, {
      status: "succeeded",
      progress: 100,
      stage: "Done",
      report,
      thinking,
      unused_sources: unused,
      finished_at: new Date(finishedAt).toISOString(),
      duration_ms: dur,
    });
    await appendStep(jobId, { type: "done", length: report.length, sections: sections.length });
  } catch (e) {
    await patchJob(jobId, {
      status: "failed",
      stage: "Failed",
      error: (e as Error)?.message || String(e),
      finished_at: new Date().toISOString(),
    });
  }
}

async function tickJob(jobId: string) {
  // Heartbeat first so the SQL watchdog (claim_stale_research_jobs) knows
  // this worker is alive. Any tick that runs is proof of life.
  await admin
    .from("research_jobs")
    .update({ last_heartbeat_at: new Date().toISOString() })
    .eq("id", jobId);
  const { data: job } = await admin.from("research_jobs").select("*").eq("id", jobId).maybeSingle();
  if (!job) return { ok: false, reason: "not_found" };
  if (["succeeded", "failed", "cancelled"].includes(String(job.status))) {
    return { ok: true, status: job.status };
  }
  if ((job as any).awaiting_approval) return { ok: true, status: "awaiting_approval" };

  if ((job as any).status === "queued" || (job as any).status === "searching") {
    await runFullPipeline(jobId);
    return { ok: true, status: "searching" };
  }

  const outline: OutlineSection[] = Array.isArray((job as any).outline) ? (job as any).outline : [];
  const sections: string[] = Array.isArray((job as any).report_sections)
    ? (job as any).report_sections
    : [];
  // Recovery: synthesizing but outline never got persisted (worker died
  // before patchJob succeeded after buildOutline). Apply fallback skeleton
  // here so the job can resume instead of hanging forever.
  if ((job as any).status === "synthesizing" && outline.length === 0) {
    const jobDepth: "lite" | "medium" | "max" = (job as any)?.depth || "medium";
    const baseCount = jobDepth === "lite" ? 6 : jobDepth === "max" ? 18 : 10;
    const fallback: OutlineSection[] = Array.from({ length: baseCount }, (_, i) => ({
      heading: `${(job as any).plan_goal || (job as any).query} — Part ${i + 1}`,
      bullets: [
        "Overview and context",
        "Key facts and data",
        "Examples and case studies",
        "Implications and takeaways",
      ],
    }));
    await patchJob(jobId, {
      outline: fallback,
      report_sections: new Array(fallback.length).fill(""),
      progress: 55,
      stage: `Writing 0/${fallback.length} sections`,
    });
    await appendStep(jobId, { type: "outline", sections: fallback.length, fallback: true });
    selfInvoke("write_section", { jobId, sectionIndex: 0 });
    selfInvoke("watchdog", { jobId, round: 0, delayMs: 90_000 });
    return { ok: true, status: "synthesizing", recovered: true };
  }
  if ((job as any).status === "synthesizing" && outline.length > 0) {
    const missing = outline.findIndex(
      (_, i) => !sections[i] || String(sections[i]).trim().length < 50,
    );
    if (missing >= 0) {
      await writeSectionAndSave(jobId, missing);
    }

    const { data: after } = await admin
      .from("research_jobs")
      .select("outline, report_sections, status")
      .eq("id", jobId)
      .maybeSingle();
    const nextOutline: OutlineSection[] = Array.isArray((after as any)?.outline)
      ? (after as any).outline
      : outline;
    const nextSections: string[] = Array.isArray((after as any)?.report_sections)
      ? (after as any).report_sections
      : [];
    const completed = nextSections.filter((t) => t && String(t).trim().length > 50).length;
    if (
      (after as any)?.status !== "succeeded" &&
      nextOutline.length > 0 &&
      completed >= nextOutline.length
    ) {
      await finalizeReport(jobId);
    }
    return { ok: true, status: "synthesizing", completed, total: nextOutline.length };
  }

  return { ok: true, status: job.status };
}

// ---- Critic agent: writes the AI's internal thinking summary ----
async function criticAgent(
  query: string,
  language: string | null,
  report: string,
  usedCount: number,
  unusedCount: number,
): Promise<string> {
  return await llmText(
    `You are the AI's reflective critic. In 3-5 short paragraphs, write the assistant's INTERNAL THINKING about how it produced the report — what tradeoffs were made, which angles were prioritized, what was uncertain, why some sources were excluded. First-person voice. Match the user's exact language and dialect. Language hint: ${language || "auto-detect"}. Plain markdown, no headings.`,
    `Topic: ${query}\nUsed ${usedCount} sources, ignored ${unusedCount}.\n\nReport draft (truncated):\n${report.slice(0, 6000)}`,
    0.6,
  );
}

// ---- Pipeline (after approval) ----
async function runFullPipeline(jobId: string) {
  const startedAt = Date.now();
  try {
    const { data: job } = await admin
      .from("research_jobs")
      .select("*")
      .eq("id", jobId)
      .maybeSingle();
    if (!job) return;
    const query: string = job.plan_goal || job.query;
    const language: string | null = job.language;
    const plan: string[] = Array.isArray(job.plan) ? job.plan : [];
    const needsImages: boolean = job.needs_images !== false;
    const jobDepth: string = (job as any)?.depth || "ultra";

    // ── Parallel AI Deep Research path (default when PARALLEL_API_KEY set).
    // Skips internal search/extract/synth — Parallel does it all and streams the
    // result back via the webhook, which then patches research_jobs.
    if (PARALLEL_API_KEY) {
      const PROCESSOR_MAP: Record<string, string> = {
        pro: "pro",
        ultra: "ultra",
        ultra2x: "ultra2x",
        ultra4x: "ultra4x",
        ultra8x: "ultra8x",
        // legacy fallbacks
        lite: "pro",
        medium: "ultra",
        max: "ultra2x",
      };
      const processor = PROCESSOR_MAP[jobDepth] || "ultra";
      await patchJob(jobId, {
        status: "searching",
        awaiting_approval: false,
        progress: 15,
        stage: language === "ar" ? "جارٍ إجراء البحث المعمّق" : "Running deep research",
        started_at: new Date(startedAt).toISOString(),
      });
      try {
        const planText = plan.length ? `\n\nResearch plan to follow:\n- ${plan.join("\n- ")}` : "";
        const langHint = language === "ar" ? "\n\nReply in Arabic (Egyptian dialect when natural)." : "";
        const run = await createTaskRun({
          input: `${query}${planText}${langHint}`,
          processor: processor as never,
          webhook: { url: PARALLEL_WEBHOOK_URL, event_types: ["task_run.status"] },
          metadata: { research_job_id: jobId, user_id: job.user_id },
        });
        await appendStep(jobId, { type: "parallel_deep_research", run_id: run.run_id, processor });
        // Also register in parallel_tasks for cross-visibility.
        await admin.from("parallel_tasks").insert({
          user_id: job.user_id,
          task_type: "deep_research",
          status: "running",
          parallel_task_id: run.run_id,
          parallel_processor: processor,
          conversation_id: job.conversation_id,
          input: { query, plan, from_research_job: jobId },
        });
        // Webhook will finalize. Return here; watchdog handled below is skipped.
        return;
      } catch (e) {
        console.error("[runFullPipeline] Parallel path failed, falling back to internal", e);
        // fall through to legacy pipeline
      }
    }

    await patchJob(jobId, {
      status: "searching",
      awaiting_approval: false,
      progress: 15,
      stage: language === "ar" ? "جارٍ البحث في المصادر" : "Searching sources",
      started_at: new Date(startedAt).toISOString(),
    });

    const allSources: Source[] = [];
    const allImages: string[] = [];
    const seen = new Set<string>();

    const searchQueries = buildSearchQueries(query, plan, jobDepth);
    for (let i = 0; i < searchQueries.length; i++) {
      const q = searchQueries[i];
      const { organic, images } = await serperSearch(q, needsImages);
      for (const s of organic) {
        if (s.url && !seen.has(s.url)) {
          seen.add(s.url);
          allSources.push(s);
        }
      }
      for (const im of images) if (!allImages.includes(im)) allImages.push(im);

      await patchJob(jobId, {
        sources: rankSources(allSources, query),
        images: allImages,
        progress: 15 + Math.round(((i + 1) / Math.max(searchQueries.length, 1)) * 35),
        stage: `${i + 1}/${searchQueries.length}: ${q.slice(0, 60)}`,
      });
      await appendStep(jobId, { type: "search", query: q, results: organic.length });
    }

    // Extract top pages
    const rankedSources = rankSources(allSources, query);
    const TOP = Math.min(jobDepth === "max" ? 14 : jobDepth === "medium" ? 11 : 8, rankedSources.length);
    await patchJob(jobId, { stage: `Extracting ${TOP} pages` });
    const excerpts: { url: string; text: string }[] = [];
    const top = rankedSources.slice(0, TOP);
    const batchSize = 3;
    for (let i = 0; i < top.length; i += batchSize) {
      const batch = top.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(async (s, localIndex) => {
          const extracted = await extractPage(s.url);
          const snippetContext = sourceToContext(s, i + localIndex);
          const text = [snippetContext?.text || "", extracted || ""].filter(Boolean).join("\n\n--- page extract ---\n\n");
          return { url: s.url, text };
        }),
      );
      excerpts.push(...results);
      await patchJob(jobId, {
        progress: 50 + Math.round(((i + batch.length) / top.length) * 25),
        stage: `Extracted ${Math.min(i + batch.length, top.length)}/${top.length} pages`,
      });
    }

    // Mark unused sources (those without extracted text)
    const usedUrls = new Set(excerpts.filter((e) => e.text).map((e) => e.url));
    const unused = rankedSources.filter((s) => !usedUrls.has(s.url));

    await patchJob(jobId, { status: "synthesizing", progress: 50, stage: "Building outline" });

    // Build the section outline (one LLM call, fast).
    let outline = await buildOutline(query, language, rankedSources, excerpts, jobDepth);
    if (outline.length === 0) {
      // Fallback outline so the job never dies on a transient LLM failure.
      console.warn("[research] outline LLM failed — using fallback skeleton");
      const baseCount = jobDepth === "lite" ? 6 : jobDepth === "max" ? 18 : 10;
      outline = Array.from({ length: baseCount }, (_, i) => ({
        heading: `${query} — Part ${i + 1}`,
        bullets: [
          "Overview and context",
          "Key facts and data",
          "Examples and case studies",
          "Implications and takeaways",
        ],
      }));
    }

    // Persist outline + excerpts + empty sections slots. Each section will be
    // written in its own self-invocation so we never hit a single 150s budget.
    await patchJob(jobId, {
      outline,
      report_sections: new Array(outline.length).fill(""),
      context_excerpts: excerpts,
      sources: rankedSources,
      unused_sources: unused,
      progress: 55,
      stage: `Writing 0/${outline.length} sections`,
    });
    await appendStep(jobId, { type: "outline", sections: outline.length });

    // Start one writer via a follow-up invocation. The public request returns
    // immediately; if the browser/edge runtime dies, ticks can resume it.
    await queueTick(jobId);

    // Watchdog: in ~90s, re-dispatch any still-empty sections; after 3 rounds force-finalize.
    selfInvoke("watchdog", { jobId, round: 0, delayMs: 90_000 });
  } catch (e) {
    const finishedAt = Date.now();
    await patchJob(jobId, {
      status: "failed",
      stage: "Failed",
      error: (e as Error)?.message || String(e),
      finished_at: new Date(finishedAt).toISOString(),
      duration_ms: finishedAt - startedAt,
    });
  }
}

// ---- Plan-only step ----
async function runPlanOnly(
  jobId: string,
  query: string,
  language: string | null,
  feedback?: string,
  previousPlan?: PlanShape,
) {
  try {
    await patchJob(jobId, { status: "planning", progress: 5, stage: "Drafting plan" });
    const plan = await planAgent(query, language, feedback, previousPlan);
    await patchJob(jobId, {
      status: "awaiting_approval",
      awaiting_approval: true,
      progress: 12,
      stage: "Awaiting approval",
      plan: plan.steps,
      plan_goal: plan.goal,
      plan_intro: plan.intro,
      plan_ready: plan.ready,
      needs_images: plan.needs_images,
    });
    await appendStep(jobId, { type: "plan", queries: plan.steps, goal: plan.goal });
  } catch (e) {
    await patchJob(jobId, { status: "failed", error: (e as Error).message });
  }
}

function wait(p: Promise<unknown>) {
  try {
    EdgeRuntime.waitUntil(p);
  } catch {
    void p;
  }
}

// ---- HTTP ----
const PARALLEL_WEBHOOK_URL = `${SUPABASE_URL}/functions/v1/deep-research-job`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // ── Parallel AI webhook receiver (merged from parallel-webhook function).
  // Detected by the Standard Webhooks `webhook-id` header.
  const webhookId = req.headers.get("webhook-id");
  if (webhookId) {
    const webhookTimestamp = req.headers.get("webhook-timestamp") ?? "";
    const webhookSignature = req.headers.get("webhook-signature") ?? "";
    const rawBody = await req.text();
    const valid = await verifyParallelWebhook(
      PARALLEL_WEBHOOK_SECRET, webhookId, webhookTimestamp, rawBody, webhookSignature,
    );
    if (!valid) {
      console.warn("[deep-research-job/webhook] invalid signature", { webhookId });
      return new Response("Invalid signature", { status: 401, headers: corsHeaders });
    }
    // deno-lint-ignore no-explicit-any
    let payload: any;
    try { payload = JSON.parse(rawBody); }
    catch { return new Response("Invalid JSON", { status: 400, headers: corsHeaders }); }
    try {
      const type = String(payload?.type ?? "");
      const nowIso = new Date().toISOString();
      const runId = payload?.data?.run_id ?? payload?.run_id;
      const findallId = payload?.data?.findall_id ?? payload?.findall_id;
      const monitorId = payload?.data?.monitor_id ?? payload?.monitor_id;

      if (type.startsWith("task_run.") || runId) {
        const status = payload?.data?.status ?? payload?.status ?? "completed";
        const err = payload?.data?.error?.message ?? null;
        const terminal = ["completed", "failed", "cancelled"].includes(status);

        // Fetch full result (with basis/citations + content) on terminal.
        let output: any = payload?.data?.output ?? null;
        if (terminal && status === "completed" && runId && !output?.content) {
          try {
            const full = await getTaskRunResult(runId);
            output = full.output ?? output;
          } catch (e) { console.warn("[webhook] getTaskRunResult failed", (e as Error).message); }
        }

        await admin.from("parallel_tasks").update({
          status,
          output,
          error: err,
          citations: output?.basis ?? null,
          webhook_received_at: nowIso,
          completed_at: terminal ? nowIso : null,
        }).eq("parallel_task_id", runId);

        // Bridge into research_jobs when this task was spawned from a research job.
        const metadata = payload?.data?.metadata ?? payload?.metadata;
        const researchJobId = metadata?.research_job_id;
        if (researchJobId) {
          if (terminal && status === "completed") {
            const contentText = typeof output?.content === "string"
              ? output.content
              : output?.content?.text
                ?? (output?.content ? JSON.stringify(output.content) : "");
            const basis: any[] = Array.isArray(output?.basis) ? output.basis : [];
            const sourcesMap = new Map<string, { title: string; url: string; snippet?: string }>();
            for (const b of basis) {
              for (const c of (b?.citations ?? [])) {
                if (c?.url && !sourcesMap.has(c.url)) {
                  sourcesMap.set(c.url, {
                    title: c.title || c.url,
                    url: c.url,
                    snippet: (c.excerpts ?? []).join(" ").slice(0, 400),
                  });
                }
              }
            }
            const sources = Array.from(sourcesMap.values());
            await admin.from("research_jobs").update({
              status: "succeeded",
              progress: 100,
              stage: "Completed",
              report: contentText,
              sources,
              finished_at: nowIso,
            }).eq("id", researchJobId);
          } else if (terminal && status !== "completed") {
            await admin.from("research_jobs").update({
              status: status === "cancelled" ? "cancelled" : "failed",
              stage: status === "cancelled" ? "Cancelled" : "Failed",
              error: err || `Parallel task ${status}`,
              finished_at: nowIso,
            }).eq("id", researchJobId);
          } else {
            // Progress ping.
            await admin.from("research_jobs").update({
              stage: status === "running" ? "Deep research running" : `Deep research: ${status}`,
              progress: status === "running" ? 60 : 30,
            }).eq("id", researchJobId);
          }
        }
      } else if (type.startsWith("findall") || findallId) {
        const status = payload?.data?.status ?? "completed";
        const terminal = ["completed", "failed", "cancelled"].includes(status);
        await admin.from("parallel_tasks").update({
          status,
          output: payload?.data ?? payload,
          webhook_received_at: nowIso,
          completed_at: terminal ? nowIso : null,
        }).eq("parallel_task_id", findallId);
      } else if (type.startsWith("monitor") || monitorId) {
        const { data: mon } = await admin
          .from("parallel_monitors")
          .select("id, user_id, event_count")
          .eq("parallel_monitor_id", monitorId)
          .maybeSingle();
        if (mon) {
          await admin.from("parallel_monitor_events").insert({
            monitor_id: mon.id,
            user_id: mon.user_id,
            event_type: type || "update",
            summary: payload?.data?.summary ?? payload?.data?.title ?? null,
            payload,
            citations: payload?.data?.citations ?? null,
          });
          await admin.from("parallel_monitors").update({
            last_event_at: nowIso,
            event_count: (mon.event_count ?? 0) + 1,
          }).eq("id", mon.id);
        }
      } else {
        console.warn("[deep-research-job/webhook] unknown event", { type });
      }
    } catch (e) {
      console.error("[deep-research-job/webhook] handler error", e);
      return new Response("Handler error", { status: 500, headers: corsHeaders });
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action = body?.action || "start";

    // ── Internal self-invocations (service-role authenticated). Bypass user auth.
    if (
      (action === "write_section" ||
        action === "finalize" ||
        action === "watchdog" ||
        action === "tick") &&
      body?.__internal === SERVICE_ROLE &&
      body?.jobId
    ) {
      if (action === "write_section") {
        const idx = Number(body?.sectionIndex ?? -1);
        if (idx < 0) return json({ error: "bad_index" }, 400);
        wait(writeSectionAndSave(String(body.jobId), idx));
      } else if (action === "finalize") {
        wait(finalizeReport(String(body.jobId)));
      } else if (action === "tick") {
        wait(tickJob(String(body.jobId)));
      } else {
        wait(watchdog(String(body.jobId), Number(body?.round ?? 0)));
      }
      return json({ accepted: true });
    }

    // Public actions require user JWT.
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "auth_required" }, 401);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "invalid_token" }, 401);

    // ── Parallel AI dispatcher (merged from parallel-run function).
    // Actions: parallel:search | parallel:extract | parallel:deep_research
    //          parallel:findall | parallel:chat | parallel:monitor.create
    if (typeof action === "string" && action.startsWith("parallel:")) {
      const sub = action.slice("parallel:".length);
      const wh: WebhookConfig = { url: PARALLEL_WEBHOOK_URL, event_types: [] };
      const trackTask = async (
        type: string,
        input: unknown,
        extra: Partial<{
          parallel_task_id: string; parallel_processor: string; status: string;
          output: unknown; conversation_id: string; message_id: string;
        }> = {},
      ) => {
        const { data, error } = await admin
          .from("parallel_tasks")
          .insert({
            user_id: user.id,
            task_type: type,
            input,
            status: extra.status ?? "pending",
            parallel_task_id: extra.parallel_task_id ?? null,
            parallel_processor: extra.parallel_processor ?? null,
            output: extra.output ?? null,
            conversation_id: extra.conversation_id ?? null,
            message_id: extra.message_id ?? null,
            completed_at: extra.status === "completed" ? new Date().toISOString() : null,
          })
          .select("id")
          .single();
        if (error) throw error;
        return data.id as string;
      };

      try {
        if (sub === "search") {
          const result = await parallelSearchApi({
            objective: body.objective, search_queries: body.search_queries,
            processor: body.processor ?? "base", max_results: body.max_results,
          });
          const taskId = await trackTask("search", body, {
            status: "completed", output: result, parallel_task_id: result.search_id,
          });
          return json({ task_id: taskId, result });
        }
        if (sub === "extract") {
          const result = await parallelExtract({
            urls: body.urls, objective: body.objective,
            excerpts: body.excerpts, full_content: body.full_content,
          });
          const taskId = await trackTask("extract", body, {
            status: "completed", output: result, parallel_task_id: result.extract_id,
          });
          return json({ task_id: taskId, result });
        }
        if (sub === "deep_research") {
          const processor = body.processor ?? "core";
          wh.event_types = ["task_run.status"];
          const run = await createTaskRun({
            input: body.input, processor,
            webhook: wh,
            metadata: { user_id: user.id, ...(body.metadata ?? {}) },
          });
          const taskId = await trackTask("deep_research", body, {
            status: "running", parallel_task_id: run.run_id,
            parallel_processor: processor,
            conversation_id: body.conversation_id, message_id: body.message_id,
          });
          return json({ task_id: taskId, parallel_run_id: run.run_id, status: run.status });
        }
        if (sub === "findall") {
          wh.event_types = ["findall_run.status"];
          const run = await createFindAll({
            objective: body.objective, processor: body.processor ?? "base",
            max_matches: body.max_matches, webhook: wh,
            metadata: { user_id: user.id },
          });
          const taskId = await trackTask("findall", body, {
            status: "running", parallel_task_id: run.findall_id,
            conversation_id: body.conversation_id,
          });
          return json({ task_id: taskId, parallel_run_id: run.findall_id, status: run.status });
        }
        if (sub === "chat") {
          const res = await parallelChat({
            model: body.model ?? "speed", messages: body.messages, stream: false,
          });
          const text = await res.text();
          if (!res.ok) return json({ error: `Parallel chat ${res.status}: ${text.slice(0, 400)}` }, 502);
          const parsed = JSON.parse(text);
          const taskId = await trackTask("chat", body, { status: "completed", output: parsed });
          return json({ task_id: taskId, result: parsed });
        }
        if (sub === "monitor.create") {
          const monWh: WebhookConfig = { url: PARALLEL_WEBHOOK_URL, event_types: ["monitor.event"] };
          const mon = await createMonitor({
            name: body.name, type: body.monitor_type ?? "event_stream",
            objective: body.objective, search_queries: body.search_queries,
            task_run_id: body.task_run_id, frequency: body.frequency ?? "daily",
            webhook: monWh, metadata: { user_id: user.id },
          });
          const { data, error } = await admin
            .from("parallel_monitors")
            .insert({
              user_id: user.id,
              title: body.name ?? "Monitor",
              objective: body.objective ?? "",
              parallel_monitor_id: mon.monitor_id,
              frequency: body.frequency ?? "daily",
              status: "active",
              config: body,
              conversation_id: body.conversation_id ?? null,
            })
            .select("id").single();
          if (error) throw error;
          return json({ monitor_db_id: data.id, parallel_monitor_id: mon.monitor_id });
        }
        return json({ error: `Unknown parallel sub-action: ${sub}` }, 400);
      } catch (e) {
        console.error("[deep-research-job/parallel] error", sub, e);
        return json({ error: e instanceof Error ? e.message : String(e) }, 500);
      }
    }


    if (action === "cancel" && body?.jobId) {
      await admin
        .from("research_jobs")
        .update({ status: "cancelled", stage: "Cancelled", finished_at: new Date().toISOString() })
        .eq("id", body.jobId)
        .eq("user_id", user.id);
      return json({ success: true });
    }

    if (action === "tick" && body?.jobId) {
      const { data: job } = await admin
        .from("research_jobs")
        .select("id")
        .eq("id", body.jobId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!job) return json({ error: "not_found" }, 404);
      wait(tickJob(String(body.jobId)));
      return json({ success: true, jobId: body.jobId });
    }

    // approve: continue an awaiting_approval job (optionally with edited plan)
    if (action === "approve" && body?.jobId) {
      const { data: job } = await admin
        .from("research_jobs")
        .select("*")
        .eq("id", body.jobId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!job) return json({ error: "not_found" }, 404);
      if (Array.isArray(body?.editedSteps) && body.editedSteps.length) {
        await patchJob(body.jobId, { plan: body.editedSteps.slice(0, 8).map(String) });
      }
      wait(runFullPipeline(body.jobId));
      return json({ success: true, jobId: body.jobId });
    }

    // update_plan: regenerate plan with user feedback
    if (action === "update_plan" && body?.jobId && body?.feedback) {
      const { data: job } = await admin
        .from("research_jobs")
        .select("*")
        .eq("id", body.jobId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!job) return json({ error: "not_found" }, 404);
      const previousPlan: PlanShape = {
        goal: job.plan_goal || job.query,
        steps: Array.isArray(job.plan) ? job.plan : [],
        intro: job.plan_intro || "",
        ready: job.plan_ready || "",
        needs_images: job.needs_images !== false,
      };
      wait(runPlanOnly(body.jobId, job.query, job.language, String(body.feedback), previousPlan));
      return json({ success: true, jobId: body.jobId });
    }

    // Only "start" and "plan" can create a new job. Any other action without
    // a matching jobId branch above is a bad request — do NOT fall through to
    // job creation (which would fail with query_required).
    if (action !== "start" && action !== "plan") {
      return json(
        { error: "bad_request", action, hint: "missing or invalid jobId for this action" },
        400,
      );
    }

    // start / plan: create job
    const query: string = (body?.query || "").toString().trim();
    if (!query) return json({ error: "query_required" }, 400);

    const language: string | null = body?.language || null;
    const conversationId: string | null = body?.conversationId || null;
    const depthRaw: string = (body?.depth || "ultra").toString().toLowerCase();
    const ALLOWED_DEPTHS = [
      "pro", "ultra", "ultra2x", "ultra4x", "ultra8x",
      // legacy tolerated
      "lite", "medium", "max",
    ];
    const depth: string = ALLOWED_DEPTHS.includes(depthRaw) ? depthRaw : "ultra";

    const { data: inserted, error: insErr } = await admin
      .from("research_jobs")
      .insert({
        user_id: user.id,
        conversation_id: conversationId,
        query,
        language,
        status: "queued",
        progress: 0,
        stage: "Queued",
        depth,
      })
      .select("id")
      .single();

    if (insErr || !inserted) return json({ error: insErr?.message || "insert_failed" }, 500);

    // Plan step removed — go straight to the full pipeline (Parallel path when
    // available, legacy internal pipeline otherwise). Both `action: "plan"` and
    // `action: "start"` now behave identically.
    await patchJob(inserted.id, {
      plan: [],
      plan_intro: null,
      plan_goal: query,
      plan_ready: null,
      awaiting_approval: false,
    });
    wait(runFullPipeline(inserted.id));

    return json({ jobId: inserted.id });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
