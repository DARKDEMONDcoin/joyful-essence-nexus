// Operator Orchestrator — Megsy-native implementation.
// Fully powered by our own services (Alibaba DashScope / OpenRouter via the
// shared llm-router). No external Manus / third-party agent runtimes.
//
// Contract expected by src/hooks/useOperatorRun.ts:
//   POST { goal, user_id }                 -> { run_id }
//   POST { run_id, sync: true }            -> { ok: true } (drives the loop)
//
// Persists progress into: operator_runs, operator_steps, operator_agent_messages.

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { getLLM } from "../_shared/llm-router.ts";

const MAX_STEPS = 12;

function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

// ─── Built-in tools (all internal, no external services) ────────────────────

async function webSearch(query: string): Promise<string> {
  // DuckDuckGo HTML endpoint — free, no API key.
  const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const r = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 MegsyOperator/1.0" },
  });
  const html = await r.text();
  const results: { title: string; url: string; snippet: string }[] = [];
  const re =
    /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) && results.length < 8) {
    results.push({
      url: decodeURIComponent(m[1].replace(/^\/\/duckduckgo\.com\/l\/\?uddg=/, "").split("&")[0]),
      title: m[2].replace(/<[^>]+>/g, "").trim(),
      snippet: m[3].replace(/<[^>]+>/g, "").trim(),
    });
  }
  return JSON.stringify(results.slice(0, 6));
}

async function fetchUrl(url: string): Promise<string> {
  const r = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 MegsyOperator/1.0" },
  });
  const html = await r.text();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, 6000);
}

const TOOLS = [
  {
    type: "function",
    function: {
      name: "web_search",
      description: "Search the web and return top results (title, url, snippet).",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "fetch_url",
      description: "Fetch a URL and return its cleaned text (first 6k chars).",
      parameters: {
        type: "object",
        properties: { url: { type: "string" } },
        required: ["url"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "finish",
      description: "Finish the task and return the final answer to the user.",
      parameters: {
        type: "object",
        properties: { summary: { type: "string" } },
        required: ["summary"],
      },
    },
  },
];

async function runTool(name: string, args: any): Promise<string> {
  try {
    if (name === "web_search") return await webSearch(String(args?.query ?? ""));
    if (name === "fetch_url") return await fetchUrl(String(args?.url ?? ""));
    if (name === "finish") return String(args?.summary ?? "");
    return `unknown tool: ${name}`;
  } catch (e) {
    return `tool_error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

// ─── Orchestrator loop ──────────────────────────────────────────────────────

async function tick(runId: string) {
  const sb = admin();
  const { data: run } = await sb.from("operator_runs").select("*").eq("id", runId).maybeSingle();
  if (!run) return;
  if (run.status === "completed" || run.status === "failed") return;

  await sb
    .from("operator_runs")
    .update({ status: "running", current_phase: "thinking", last_tick_at: new Date().toISOString() })
    .eq("id", runId);

  const llm = await getLLM();
  if (!llm) {
    await sb
      .from("operator_runs")
      .update({ status: "failed", error: "No LLM provider configured" })
      .eq("id", runId);
    return;
  }

  const messages: any[] = [
    {
      role: "system",
      content:
        "You are Megsy Operator, an autonomous agent. Use web_search and fetch_url to research, then call `finish` with a clear, well-structured final answer in the user's language. Take at most " +
        MAX_STEPS +
        " tool steps.",
    },
    { role: "user", content: String(run.goal ?? "") },
  ];

  let stepNo = 1;
  let finalAnswer: string | null = null;

  for (let i = 0; i < MAX_STEPS; i++) {
    const model = llm.mapModel("qwen-plus");
    const resp = await fetch(llm.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${llm.key}`,
      },
      body: JSON.stringify({ model, messages, tools: TOOLS, temperature: 0.4 }),
    });
    if (!resp.ok) {
      const t = await resp.text().catch(() => "");
      await sb
        .from("operator_runs")
        .update({ status: "failed", error: `llm ${resp.status}: ${t.slice(0, 300)}` })
        .eq("id", runId);
      return;
    }
    const json: any = await resp.json();
    const msg = json?.choices?.[0]?.message;
    if (!msg) break;
    messages.push(msg);

    const calls: any[] = msg.tool_calls ?? [];
    if (!calls.length) {
      finalAnswer = String(msg.content ?? "");
      break;
    }

    for (const call of calls) {
      const name = call.function?.name ?? "";
      let args: any = {};
      try {
        args = JSON.parse(call.function?.arguments ?? "{}");
      } catch { /* ignore */ }

      const { data: stepRow } = await sb
        .from("operator_steps")
        .insert({
          run_id: runId,
          step_no: stepNo++,
          agent: "operator",
          title: `${name}${args?.query ? `: ${args.query}` : args?.url ? `: ${args.url}` : ""}`.slice(0, 200),
          description: null,
          tool: name,
          tool_input: args,
          status: "running",
          started_at: new Date().toISOString(),
        })
        .select("id")
        .maybeSingle();

      await sb.from("operator_runs").update({ current_phase: name }).eq("id", runId);

      const output = await runTool(name, args);

      await sb
        .from("operator_steps")
        .update({
          status: "completed",
          finished_at: new Date().toISOString(),
          tool_output: { text: output.slice(0, 4000) },
        })
        .eq("id", stepRow?.id ?? "");

      await sb.from("operator_agent_messages").insert({
        run_id: runId,
        agent: "operator",
        role: "tool",
        content: output.slice(0, 4000),
        metadata: { tool: name, args },
      });

      messages.push({
        role: "tool",
        tool_call_id: call.id,
        name,
        content: output.slice(0, 4000),
      });

      if (name === "finish") {
        finalAnswer = String(args?.summary ?? output);
      }
    }

    if (finalAnswer !== null) break;
  }

  if (finalAnswer === null) {
    finalAnswer = "Task ended without a final answer (max steps reached).";
  }

  await sb.from("operator_agent_messages").insert({
    run_id: runId,
    agent: "operator",
    role: "assistant",
    content: finalAnswer,
    metadata: {},
  });

  await sb
    .from("operator_runs")
    .update({
      status: "completed",
      current_phase: "done",
      chat_response: finalAnswer,
      result: { answer: finalAnswer },
      last_tick_at: new Date().toISOString(),
    })
    .eq("id", runId);
}

// ─── HTTP entry ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);

  let body: any = {};
  try {
    body = await req.json();
  } catch { /* ignore */ }

  const sb = admin();

  // Kick an existing run.
  if (body?.run_id) {
    const runId = String(body.run_id);
    if (body.sync) {
      try {
        await tick(runId);
      } catch (e) {
        await sb
          .from("operator_runs")
          .update({ status: "failed", error: e instanceof Error ? e.message : String(e) })
          .eq("id", runId);
      }
      return jsonResponse({ ok: true, run_id: runId });
    }
    // fire-and-forget
    (async () => {
      try {
        await tick(runId);
      } catch (e) {
        await sb
          .from("operator_runs")
          .update({ status: "failed", error: e instanceof Error ? e.message : String(e) })
          .eq("id", runId);
      }
    })();
    return jsonResponse({ ok: true, run_id: runId });
  }

  // Create a new run.
  const goal = String(body?.goal ?? "").trim();
  const userId = String(body?.user_id ?? "").trim();
  if (!goal || !userId) return jsonResponse({ error: "goal and user_id are required" }, 400);

  const { data: created, error } = await sb
    .from("operator_runs")
    .insert({
      user_id: userId,
      goal,
      status: "pending",
      current_phase: "queued",
      mode: "operator",
    })
    .select("id")
    .maybeSingle();
  if (error || !created?.id) {
    return jsonResponse({ error: error?.message ?? "failed to create run" }, 500);
  }
  return jsonResponse({ run_id: created.id });
});
