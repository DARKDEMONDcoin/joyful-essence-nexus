/** @doc Multi-purpose HTTP fetch utility.
 *  Default action="crawl": Jina Reader markdown fetch (rate-limited, SSRF-guarded).
 *  action="mcp_probe" / "mcp_refresh": Model Context Protocol server probing (auth required).
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { corsHeaders } from "../_shared/cors.ts";
import {
  assertSafeUrl,
  auditLog,
  checkRateLimit,
  rateLimitResponse,
  resolveUserId,
} from "../_shared/rateLimit.ts";

const ENDPOINT = "crawl-url";
const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

// ─── MCP helpers ──────────────────────────────────────────────────
interface McpTool { name: string; description?: string; inputSchema?: unknown }

async function mcpRpc(
  url: string,
  headers: Record<string, string>,
  method: string,
  params: unknown,
  id: number,
) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      ...headers,
    },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  if (!res.ok) {
    throw new Error(`MCP ${method} HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("text/event-stream")) {
    const text = await res.text();
    const line = text.split("\n").find((l) => l.startsWith("data:"));
    if (!line) throw new Error("Empty SSE response");
    return JSON.parse(line.slice(5).trim());
  }
  return await res.json();
}

async function probeMcp(url: string, headers: Record<string, string>): Promise<McpTool[]> {
  await mcpRpc(url, headers, "initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "megsy-ai", version: "1.0.0" },
  }, 1);
  const res = await mcpRpc(url, headers, "tools/list", {}, 2);
  return (res?.result?.tools ?? []) as McpTool[];
}

async function handleMcp(req: Request, body: Record<string, unknown>) {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: jsonHeaders });
  }
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;
  if (!user) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: jsonHeaders });
  }
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const action = String(body.action ?? "");
  if (action === "mcp_probe") {
    const url = String(body.url ?? "").trim();
    const headers = (body.headers ?? {}) as Record<string, string>;
    if (!url || !/^https:\/\//i.test(url)) {
      return new Response(JSON.stringify({ error: "https url required" }), { status: 400, headers: jsonHeaders });
    }
    try {
      const tools = await probeMcp(url, headers);
      return new Response(
        JSON.stringify({
          ok: true,
          tools,
          tool_names: tools.map((t) => t.name),
          tool_schemas: tools,
        }),
        { headers: jsonHeaders },
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ ok: false, error: String((err as Error).message ?? err) }),
        { headers: jsonHeaders },
      );
    }
  }


  if (action === "mcp_refresh") {
    const id = String(body.id ?? "");
    const { data: row, error } = await admin
      .from("mcp_connections").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
    if (error || !row) {
      return new Response(JSON.stringify({ error: "not_found" }), { status: 404, headers: jsonHeaders });
    }
    try {
      const tools = await probeMcp(row.url, (row.auth_headers ?? {}) as Record<string, string>);
      await admin.from("mcp_connections").update({
        state: "ready",
        tool_names: tools.map((t) => t.name),
        tool_schemas: tools,
        last_error: null,
      }).eq("id", id);
      return new Response(JSON.stringify({ ok: true, tools }), { headers: jsonHeaders });
    } catch (err) {
      const message = String((err as Error).message ?? err);
      await admin.from("mcp_connections").update({ state: "failed", last_error: message }).eq("id", id);
      return new Response(JSON.stringify({ ok: false, error: message }), { headers: jsonHeaders });
    }
  }


  if (action === "mcp_call_tool") {
    const id = String(body.id ?? "");
    const toolName = String(body.tool ?? "");
    const args = (body.arguments ?? {}) as Record<string, unknown>;
    if (!id || !toolName) {
      return new Response(JSON.stringify({ error: "id and tool required" }), { status: 400, headers: jsonHeaders });
    }
    const { data: row, error } = await admin
      .from("mcp_connections").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
    if (error || !row) {
      return new Response(JSON.stringify({ error: "not_found" }), { status: 404, headers: jsonHeaders });
    }
    if (row.enabled === false) {
      return new Response(JSON.stringify({ error: "disabled" }), { status: 400, headers: jsonHeaders });
    }
    try {
      const headers = (row.auth_headers ?? {}) as Record<string, string>;
      await mcpRpc(row.url, headers, "initialize", {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "megsy-ai", version: "1.0.0" },
      }, 1);
      const res = await mcpRpc(row.url, headers, "tools/call", { name: toolName, arguments: args }, 2);
      return new Response(JSON.stringify({ ok: true, result: res?.result ?? res }), { headers: jsonHeaders });
    } catch (err) {
      return new Response(
        JSON.stringify({ ok: false, error: String((err as Error).message ?? err) }),
        { headers: jsonHeaders },
      );
    }
  }

  return new Response(JSON.stringify({ error: "unknown_action" }), { status: 400, headers: jsonHeaders });
}

// ─── main handler ─────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405, headers: jsonHeaders,
    });
  }

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const action = typeof body?.action === "string" ? body.action : "crawl";

  // MCP branch — action="mcp_probe" | "mcp_refresh"
  if (action.startsWith("mcp_")) {
    return handleMcp(req, body);
  }

  // Default crawl branch (unchanged behavior)
  const userId = await resolveUserId(req);
  const rl = await checkRateLimit(req, { endpoint: ENDPOINT, limit: 30, windowSeconds: 60 });
  if (!rl.allowed) {
    await auditLog({ endpoint: ENDPOINT, action: "rate_limited", status: 429, userId, req });
    return rateLimitResponse(rl, corsHeaders);
  }

  try {
    const raw = typeof body?.url === "string" ? (body.url as string).trim() : "";
    if (!raw || raw.length > 2048) {
      return new Response(JSON.stringify({ error: "url required (max 2048 chars)" }), {
        status: 400, headers: jsonHeaders,
      });
    }

    let safe: URL;
    try {
      safe = assertSafeUrl(raw);
    } catch (err) {
      await auditLog({
        endpoint: ENDPOINT, action: "ssrf_blocked", status: 400, userId, req,
        metadata: { reason: String(err), url: raw.slice(0, 200) },
      });
      return new Response(JSON.stringify({ error: `Blocked: ${String(err)}` }), {
        status: 400, headers: jsonHeaders,
      });
    }

    const clean = safe.toString().replace(/^https?:\/\//, "");
    const r = await fetch(`https://r.jina.ai/https://${clean}`, {
      headers: { Accept: "text/plain", "X-Return-Format": "markdown" },
    });
    if (!r.ok) throw new Error(`jina ${r.status}`);
    const md = await r.text();

    await auditLog({
      endpoint: ENDPOINT, action: "crawl", status: 200, userId, req,
      metadata: { host: safe.hostname, bytes: md.length },
    });

    return new Response(JSON.stringify({ url: safe.toString(), markdown: md.slice(0, 200_000) }), {
      headers: { ...jsonHeaders, "X-RateLimit-Remaining": String(rl.remaining) },
    });
  } catch (e) {
    await auditLog({ endpoint: ENDPOINT, action: "error", status: 500, userId, req,
      metadata: { error: String(e).slice(0, 300) } });
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: jsonHeaders,
    });
  }
});
