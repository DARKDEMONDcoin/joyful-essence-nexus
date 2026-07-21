/**
 * @doc Client-side helper for Parallel AI actions (merged into deep-research-job edge function).
 * Wraps: search, extract, deep_research, findall, chat, monitor.create.
 */
import { supabase } from "@/integrations/supabase/client";

async function invoke<T = unknown>(sub: string, body: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("deep-research-job", {
    body: { action: `parallel:${sub}`, ...body },
  });
  if (error) throw error;
  if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
  return data as T;
}

// ============ Search ============
export interface ParallelSearchResult {
  url: string;
  title: string;
  excerpts: string[];
}
export interface ParallelSearchResponse {
  task_id: string;
  result: { search_id: string; results: ParallelSearchResult[] };
}
export function parallelSearch(input: {
  objective?: string;
  search_queries?: string[];
  processor?: "base" | "pro";
  max_results?: number;
}) {
  return invoke<ParallelSearchResponse>("search", input as Record<string, unknown>);
}

// ============ Extract ============
export interface ParallelExtractResult {
  url: string;
  title?: string;
  full_content?: string;
  excerpts?: string[];
}
export function parallelExtract(input: {
  urls: string[];
  objective?: string;
  full_content?: boolean;
}) {
  return invoke<{ task_id: string; result: { extract_id: string; results: ParallelExtractResult[] } }>(
    "extract",
    input as Record<string, unknown>,
  );
}

// ============ Deep Research (async — arrives via webhook + Realtime) ============
export interface DeepResearchStart {
  task_id: string;          // parallel_tasks.id (local db row)
  parallel_run_id: string;  // Parallel's run_id
  status: string;
}
export function startDeepResearch(input: {
  input: string;
  processor?: "lite" | "base" | "core" | "pro" | "ultra";
  conversation_id?: string;
  message_id?: string;
  metadata?: Record<string, unknown>;
}) {
  return invoke<DeepResearchStart>("deep_research", input as Record<string, unknown>);
}

// ============ FindAll (async) ============
export function startFindAll(input: {
  objective: string;
  processor?: "preview" | "base" | "core" | "pro";
  max_matches?: number;
  conversation_id?: string;
}) {
  return invoke<{ task_id: string; parallel_run_id: string; status: string }>(
    "findall",
    input as Record<string, unknown>,
  );
}

// ============ Chat (sync, non-stream) ============
export function parallelChat(input: {
  model?: "speed" | "base" | "core" | "pro" | "ultra";
  messages: { role: "system" | "user" | "assistant"; content: string }[];
}) {
  return invoke<{ task_id: string; result: unknown }>("chat", input as Record<string, unknown>);
}

// ============ Monitor ============
export function createParallelMonitor(input: {
  name: string;
  objective?: string;
  search_queries?: string[];
  task_run_id?: string;
  monitor_type?: "event_stream" | "snapshot";
  frequency?: "hourly" | "daily" | "weekly";
  conversation_id?: string;
}) {
  return invoke<{ monitor_db_id: string; parallel_monitor_id: string }>(
    "monitor.create",
    input as Record<string, unknown>,
  );
}

// ============ Live subscription to a task's completion ============
export function subscribeToParallelTask(
  taskId: string,
  onUpdate: (row: { status: string; output: unknown; error: string | null }) => void,
) {
  const channel = supabase
    .channel(`parallel-task-${taskId}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "parallel_tasks", filter: `id=eq.${taskId}` },
      (payload) => {
        const row = payload.new as { status: string; output: unknown; error: string | null };
        onUpdate(row);
      },
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}
