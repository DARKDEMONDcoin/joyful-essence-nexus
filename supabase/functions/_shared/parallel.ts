/**
 * Shared Parallel AI client for all edge functions.
 * Docs: https://docs.parallel.ai/llms.txt
 *
 * Wraps the Parallel APIs we use:
 *  - Search     POST /v1/search                    (sync)
 *  - Extract    POST /v1/extract                   (sync)
 *  - Task Run   POST /v1/tasks/runs                (async, webhook)
 *  - FindAll    POST /v1beta/findall/runs          (async, webhook)
 *  - Chat       POST /v1beta/chat/completions      (sync, OpenAI-compatible)
 *  - Monitor    POST /v1/monitors                  (continuous, webhook)
 *
 * All calls read PARALLEL_API_KEY from env and forward it as the x-api-key header.
 */

const PARALLEL_BASE = "https://api.parallel.ai";

export type ParallelProcessor = "lite" | "base" | "core" | "pro" | "ultra";
export type ParallelChatModel = "speed" | "base" | "core" | "pro" | "ultra";

export interface WebhookConfig {
  url: string;
  event_types: string[];
}

function apiKey(): string {
  const k = Deno.env.get("PARALLEL_API_KEY");
  if (!k) throw new Error("PARALLEL_API_KEY not configured");
  return k;
}

async function req(
  path: string,
  body: Record<string, unknown>,
  init: { method?: string; beta?: boolean } = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": apiKey(),
  };
  if (init.beta) headers["parallel-beta"] = "webhook-2025-08-12";
  const res = await fetch(`${PARALLEL_BASE}${path}`, {
    method: init.method ?? "POST",
    headers,
    body: JSON.stringify(body),
  });
  return res;
}

async function json<T = unknown>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Parallel API ${res.status}: ${text.slice(0, 500)}`);
  }
  try { return JSON.parse(text) as T; } catch { return text as unknown as T; }
}

// ============ Search API (sync) ============
export interface SearchInput {
  objective?: string;
  search_queries?: string[];
  processor?: "base" | "pro";
  max_results?: number;
  max_chars_per_result?: number;
  source_policy?: Record<string, unknown>;
}
export interface SearchResult {
  url: string;
  title: string;
  excerpts: string[];
}
export interface SearchResponse {
  search_id: string;
  results: SearchResult[];
}
export async function parallelSearch(input: SearchInput): Promise<SearchResponse> {
  const res = await req("/v1/search", {
    objective: input.objective,
    search_queries: input.search_queries,
    processor: input.processor ?? "base",
    max_results: input.max_results ?? 10,
    max_chars_per_result: input.max_chars_per_result ?? 6000,
    source_policy: input.source_policy,
  });
  return json<SearchResponse>(res);
}

// ============ Extract API (sync) ============
export interface ExtractInput {
  urls: string[];
  objective?: string;
  excerpts?: boolean;
  full_content?: boolean;
  max_chars_per_result?: number;
}
export interface ExtractResult {
  url: string;
  title?: string;
  full_content?: string;
  excerpts?: string[];
}
export interface ExtractResponse {
  extract_id: string;
  results: ExtractResult[];
}
export async function parallelExtract(input: ExtractInput): Promise<ExtractResponse> {
  const res = await req("/v1/extract", {
    urls: input.urls,
    objective: input.objective,
    excerpts: input.excerpts ?? true,
    full_content: input.full_content ?? false,
    max_chars_per_result: input.max_chars_per_result ?? 6000,
  });
  return json<ExtractResponse>(res);
}

// ============ Task Runs / Deep Research (async) ============
export interface CreateTaskRunInput {
  input: string | Record<string, unknown>;
  processor?: ParallelProcessor;
  task_spec?: {
    output_schema?: string | Record<string, unknown>;
    input_schema?: string | Record<string, unknown>;
  };
  webhook?: WebhookConfig;
  metadata?: Record<string, unknown>;
  source_policy?: Record<string, unknown>;
  mcp_servers?: Array<Record<string, unknown>>;
  enable_events?: boolean;
}
export interface TaskRun {
  run_id: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled" | "action_required";
  processor?: string;
  created_at?: string;
  modified_at?: string;
  error?: { message?: string; ref_id?: string };
}
export async function createTaskRun(input: CreateTaskRunInput): Promise<TaskRun> {
  const res = await req("/v1/tasks/runs", input as unknown as Record<string, unknown>, { beta: true });
  return json<TaskRun>(res);
}

export async function getTaskRun(runId: string): Promise<TaskRun> {
  const res = await fetch(`${PARALLEL_BASE}/v1/tasks/runs/${runId}`, {
    headers: { "x-api-key": apiKey() },
  });
  return json<TaskRun>(res);
}

export interface TaskRunResult {
  run: TaskRun;
  output: {
    type?: string;
    content?: string | Record<string, unknown>;
    basis?: Array<{ field?: string; citations?: Array<{ url: string; title?: string; excerpts?: string[] }>; reasoning?: string; confidence?: string }>;
  };
}
export async function getTaskRunResult(runId: string): Promise<TaskRunResult> {
  const res = await fetch(`${PARALLEL_BASE}/v1/tasks/runs/${runId}/result`, {
    headers: { "x-api-key": apiKey() },
  });
  return json<TaskRunResult>(res);
}

// ============ FindAll (async) ============
export interface CreateFindAllInput {
  objective: string;
  processor?: "preview" | "base" | "core" | "pro";
  max_matches?: number;
  webhook?: WebhookConfig;
  metadata?: Record<string, unknown>;
}
export interface FindAllRun {
  findall_id: string;
  status: string;
}
export async function createFindAll(input: CreateFindAllInput): Promise<FindAllRun> {
  const res = await req("/v1beta/findall/runs", input as unknown as Record<string, unknown>);
  return json<FindAllRun>(res);
}
export async function getFindAllResult(id: string): Promise<unknown> {
  const res = await fetch(`${PARALLEL_BASE}/v1beta/findall/runs/${id}/result`, {
    headers: { "x-api-key": apiKey() },
  });
  return json(res);
}

// ============ Chat Completions (sync, OpenAI-compatible) ============
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}
export interface ChatInput {
  model?: ParallelChatModel | string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
}
export async function parallelChat(input: ChatInput): Promise<Response> {
  return fetch(`${PARALLEL_BASE}/v1beta/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey(),
    },
    body: JSON.stringify({
      model: `parallel/${input.model ?? "speed"}`,
      messages: input.messages,
      stream: input.stream ?? false,
      temperature: input.temperature,
    }),
  });
}

// ============ Monitor (continuous) ============
export interface CreateMonitorInput {
  name?: string;
  type: "event_stream" | "snapshot";
  objective?: string;
  search_queries?: string[];
  task_run_id?: string;
  frequency?: "hourly" | "daily" | "weekly";
  webhook: WebhookConfig;
  metadata?: Record<string, unknown>;
}
export interface Monitor {
  monitor_id: string;
  status: string;
  name?: string;
}
export async function createMonitor(input: CreateMonitorInput): Promise<Monitor> {
  const res = await req("/v1/monitors", input as unknown as Record<string, unknown>);
  return json<Monitor>(res);
}
export async function cancelMonitor(id: string): Promise<unknown> {
  const res = await fetch(`${PARALLEL_BASE}/v1/monitors/${id}/cancel`, {
    method: "POST",
    headers: { "x-api-key": apiKey() },
  });
  return json(res);
}

// ============ Webhook signature verification ============
/**
 * Verifies a Parallel webhook (Standard Webhooks HMAC-SHA256 + base64).
 * Header format: `webhook-signature: v1,<base64> v1,<base64>`
 * Payload signed: `${webhookId}.${webhookTimestamp}.${rawBody}`
 */
export async function verifyParallelWebhook(
  secret: string,
  webhookId: string,
  webhookTimestamp: string,
  rawBody: string,
  signatureHeader: string,
): Promise<boolean> {
  if (!secret || !webhookId || !webhookTimestamp || !signatureHeader) return false;
  const payload = `${webhookId}.${webhookTimestamp}.${rawBody}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const expected = btoa(String.fromCharCode(...new Uint8Array(sig)));
  for (const part of signatureHeader.split(" ")) {
    const [, val] = part.split(",", 2);
    if (val && val === expected) return true;
  }
  return false;
}
