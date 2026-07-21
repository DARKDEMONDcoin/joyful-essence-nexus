// Megsy Coder edge function — powered by Alibaba Qwen (qwen3-coder-plus) with
// a persistent E2B sandbox per run, real read/edit/install tools, and
// GitHub push + PR via the user's Pipedream GitHub connection.
// Streams SSE frames matching the KimiEvent contract in src/lib/kimiCoder.ts.
// deno-lint-ignore-file no-explicit-any
import { alibabaChatJSON } from "../_shared/alibabaClient.ts";
import { SessionSandbox } from "../_shared/e2bRunner.ts";
import { getUserPlan } from "../_shared/systemPromptBuilder.ts";
import { resolveUserId } from "../_shared/rateLimit.ts";

const PAID_PLANS = new Set(["pro", "max"]);
const MODEL = "qwen3-coder-plus";
const MAX_STEPS = 32;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Body = {
  prompt: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  agent_profile?: string;
  locale?: string;
};

const enc = new TextEncoder();
function frame(event: string, payload: Record<string, unknown>): Uint8Array {
  return enc.encode(`data: ${JSON.stringify({ event, ...payload })}\n\n`);
}
function endFrame(): Uint8Array { return enc.encode(`data: [DONE]\n\n`); }

// ─── Tool schemas exposed to Qwen ───────────────────────────────────────────
const TOOLS = [
  { type: "function", function: {
    name: "update_todo",
    description: "Update the plan/todo list shown to the user.",
    parameters: { type: "object", properties: { todos: { type: "array", items: {
      type: "object",
      properties: { id: { type: "string" }, title: { type: "string" }, done: { type: "boolean" } },
      required: ["id", "title", "done"],
    } } }, required: ["todos"] },
  }},
  { type: "function", function: {
    name: "write_file",
    description: "Create or overwrite a file in the sandbox workspace. Content is shown to the user.",
    parameters: { type: "object", properties: {
      path: { type: "string" }, content: { type: "string" },
    }, required: ["path", "content"] },
  }},
  { type: "function", function: {
    name: "read_file",
    description: "Read an existing file from the sandbox workspace.",
    parameters: { type: "object", properties: { path: { type: "string" } }, required: ["path"] },
  }},
  { type: "function", function: {
    name: "edit_file",
    description: "Replace the first occurrence of `find` with `replace` in the given file. Use for surgical edits instead of rewriting the whole file.",
    parameters: { type: "object", properties: {
      path: { type: "string" }, find: { type: "string" }, replace: { type: "string" },
    }, required: ["path", "find", "replace"] },
  }},
  { type: "function", function: {
    name: "run_bash",
    description: "Execute bash in the persistent sandbox (cwd is workspace). Returns stdout/stderr/exit_code.",
    parameters: { type: "object", properties: {
      command: { type: "string" }, timeout_ms: { type: "number" },
    }, required: ["command"] },
  }},
  { type: "function", function: {
    name: "run_python",
    description: "Execute Python in the persistent sandbox's Jupyter kernel.",
    parameters: { type: "object", properties: { code: { type: "string" } }, required: ["code"] },
  }},
  { type: "function", function: {
    name: "install_deps",
    description: "Install npm or pip packages in the sandbox. Use for real code execution needs.",
    parameters: { type: "object", properties: {
      manager: { type: "string", enum: ["npm", "pip"] },
      packages: { type: "array", items: { type: "string" } },
    }, required: ["manager", "packages"] },
  }},
  { type: "function", function: {
    name: "github_push",
    description: "Commit and push written files to the user's GitHub repo via their Pipedream GitHub connection.",
    parameters: { type: "object", properties: {
      owner: { type: "string" }, repo: { type: "string" },
      branch: { type: "string" }, message: { type: "string" },
      files: { type: "array", items: { type: "object", properties: {
        path: { type: "string" }, content: { type: "string" },
      }, required: ["path", "content"] } },
    }, required: ["owner", "repo", "message"] },
  }},
  { type: "function", function: {
    name: "github_pr",
    description: "Open a Pull Request from `head` branch to `base` (default main).",
    parameters: { type: "object", properties: {
      owner: { type: "string" }, repo: { type: "string" },
      head: { type: "string" }, base: { type: "string" },
      title: { type: "string" }, body: { type: "string" },
    }, required: ["owner", "repo", "head", "title"] },
  }},
  { type: "function", function: {
    name: "finish",
    description: "Task complete. Provide a short summary.",
    parameters: { type: "object", properties: { summary: { type: "string" } }, required: ["summary"] },
  }},
];

const SYSTEM_PROMPT = `You are Megsy Coder, an autonomous senior software engineer.

Tools:
- update_todo: 3-7 concrete steps, mark done as you progress.
- write_file / read_file / edit_file: manage code in the persistent workspace.
- install_deps: npm or pip packages before running code that needs them.
- run_bash / run_python: verify with tests, scripts, type-checks.
- github_push then github_pr: only if user asks to push or open a PR.
- finish: 1-2 sentence summary. Always finish.

Rules: plan first, prefer edit_file over rewriting large files, verify with run_* when it matters, keep prose short between tool calls.`;

// ─── GitHub via Pipedream proxy ─────────────────────────────────────────────
const SB_URL = Deno.env.get("SUPABASE_URL")!;
async function pdProxy(authHeader: string, targetUrl: string, method: string, body?: unknown) {
  const res = await fetch(`${SB_URL}/functions/v1/pipedream-connect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
      apikey: Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    },
    body: JSON.stringify({ action: "proxy", app_slug: "github", target_url: targetUrl, method, body }),
  });
  return await res.json().catch(() => ({})) as { ok: boolean; status: number; data: any; error?: string };
}

async function githubPush(authHeader: string, args: {
  owner: string; repo: string; branch?: string; message: string;
  files: Array<{ path: string; content: string }>;
}): Promise<{ ok: boolean; commit_url?: string; branch?: string; error?: string }> {
  const branch = args.branch || "main";
  const base = `https://api.github.com/repos/${args.owner}/${args.repo}`;
  const refRes = await pdProxy(authHeader, `${base}/git/ref/heads/${branch}`, "GET");
  let baseSha: string | null = null;
  let baseTree: string | null = null;
  if (refRes.ok) {
    baseSha = refRes.data?.object?.sha ?? null;
    const commit = await pdProxy(authHeader, `${base}/git/commits/${baseSha}`, "GET");
    baseTree = commit.data?.tree?.sha ?? null;
  } else if (refRes.status !== 404) {
    return { ok: false, error: refRes.error || `git/ref failed: ${refRes.status}` };
  }
  const treeItems: any[] = [];
  for (const f of args.files) {
    const blob = await pdProxy(authHeader, `${base}/git/blobs`, "POST", {
      content: f.content, encoding: "utf-8",
    });
    if (!blob.ok) return { ok: false, error: blob.error || "blob failed" };
    treeItems.push({ path: f.path, mode: "100644", type: "blob", sha: blob.data.sha });
  }
  const tree = await pdProxy(authHeader, `${base}/git/trees`, "POST", {
    base_tree: baseTree ?? undefined, tree: treeItems,
  });
  if (!tree.ok) return { ok: false, error: tree.error || "tree failed" };
  const commit = await pdProxy(authHeader, `${base}/git/commits`, "POST", {
    message: args.message, tree: tree.data.sha, parents: baseSha ? [baseSha] : [],
  });
  if (!commit.ok) return { ok: false, error: commit.error || "commit failed" };
  const upd = baseSha
    ? await pdProxy(authHeader, `${base}/git/refs/heads/${branch}`, "PATCH", { sha: commit.data.sha, force: false })
    : await pdProxy(authHeader, `${base}/git/refs`, "POST", { ref: `refs/heads/${branch}`, sha: commit.data.sha });
  if (!upd.ok) return { ok: false, error: upd.error || "ref update failed" };
  return { ok: true, commit_url: commit.data.html_url, branch };
}

async function githubPR(authHeader: string, args: {
  owner: string; repo: string; head: string; base?: string; title: string; body?: string;
}): Promise<{ ok: boolean; url?: string; error?: string }> {
  const base = args.base || "main";
  const r = await pdProxy(authHeader,
    `https://api.github.com/repos/${args.owner}/${args.repo}/pulls`,
    "POST",
    { title: args.title, head: args.head, base, body: args.body ?? "" });
  if (!r.ok) return { ok: false, error: r.error || `pr failed: ${r.status}` };
  return { ok: true, url: r.data?.html_url };
}

// ─── Agent loop ─────────────────────────────────────────────────────────────
async function alibabaChatJSONTimeout(body: any, ms: number): Promise<any> {
  const ac = new AbortController();
  const to = setTimeout(() => ac.abort(), ms);
  try {
    const key = await (await import("../_shared/alibabaClient.ts")).getAlibabaKey();
    const res = await fetch("https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, stream: false }),
      signal: ac.signal,
    });
    if (!res.ok) throw new Error(`Alibaba ${res.status}: ${(await res.text()).slice(0, 400)}`);
    return await res.json();
  } finally { clearTimeout(to); }
}

async function runAgent(
  body: Body,
  authHeader: string,
  writer: WritableStreamDefaultWriter<Uint8Array>,
  signal: AbortSignal,
) {
  const files = new Map<string, string>();
  const messages: any[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...(body.history ?? []).slice(-8).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: body.prompt },
  ];

  await writer.write(frame("text", { text: "🧪 Booting sandbox…" }));
  const sandbox = await SessionSandbox.create();
  if (!sandbox) {
    await writer.write(frame("error", { error: "No active E2B key available" }));
    return;
  }
  await writer.write(frame("text", { text: "✅ Sandbox ready. Planning…" }));

  try {
    for (let step = 0; step < MAX_STEPS; step++) {
      if (signal.aborted) return;
      let resp: any;
      try {
        resp = await alibabaChatJSONTimeout({
          model: MODEL, messages, tools: TOOLS, tool_choice: "auto", temperature: 0.2,
        }, 110_000);
      } catch (e) {
        await writer.write(frame("error", { error: `alibaba: ${e instanceof Error ? e.message : String(e)}` }));
        return;
      }
      const msg = resp?.choices?.[0]?.message;
      if (!msg) { await writer.write(frame("error", { error: "no response from model" })); return; }


      if (msg.content && typeof msg.content === "string" && msg.content.trim()) {
        await writer.write(frame("text", { text: msg.content }));
      }

      const toolCalls: any[] = msg.tool_calls ?? [];
      if (!toolCalls.length) {
        await writer.write(frame("done", {
          summary: (msg.content ?? "").toString().slice(0, 500),
          files: [...files.entries()].map(([path, content]) => ({ path, content })),
        }));
        return;
      }

      messages.push({ role: "assistant", content: msg.content ?? "", tool_calls: toolCalls });

      for (const call of toolCalls) {
        if (signal.aborted) return;
        const name = call?.function?.name;
        let args: any = {};
        try { args = JSON.parse(call?.function?.arguments ?? "{}"); } catch { /* ignore */ }

        await writer.write(frame("tool_call", { id: call.id, name, args }));
        let toolResult: any = { ok: true };

        try {
          if (name === "update_todo") {
            const todos = Array.isArray(args.todos) ? args.todos : [];
            await writer.write(frame("todo", { todos }));
            toolResult = { ok: true, count: todos.length };
          } else if (name === "write_file") {
            const path = String(args.path ?? "").trim();
            const content = String(args.content ?? "");
            if (!path) throw new Error("path required");
            const w = await sandbox.writeFile(path, content);
            if (!w.ok) throw new Error(w.error);
            files.set(path, content);
            await writer.write(frame("file", { path, content }));
            toolResult = { ok: true, path, bytes: content.length };
          } else if (name === "read_file") {
            const path = String(args.path ?? "").trim();
            const r = await sandbox.readFile(path);
            if (!r.ok) throw new Error(r.error);
            toolResult = { ok: true, path, content: r.content };
          } else if (name === "edit_file") {
            const path = String(args.path ?? "").trim();
            const find = String(args.find ?? "");
            const replace = String(args.replace ?? "");
            const r = await sandbox.readFile(path);
            if (!r.ok) throw new Error(r.error);
            const current = r.content ?? "";
            if (!find || !current.includes(find)) throw new Error("`find` string not found in file");
            const updated = current.replace(find, replace);
            const w = await sandbox.writeFile(path, updated);
            if (!w.ok) throw new Error(w.error);
            files.set(path, updated);
            await writer.write(frame("file", { path, content: updated }));
            toolResult = { ok: true, path, bytes: updated.length };
          } else if (name === "run_bash") {
            const r = await sandbox.bash(String(args.command ?? ""), Number(args.timeout_ms ?? 30000));
            await writer.write(frame("bash", {
              command: String(args.command ?? ""),
              output: [r.stdout, r.stderr && `[stderr]\n${r.stderr}`, r.error && `[err] ${r.error}`].filter(Boolean).join("\n"),
              ok: r.exit_code === 0 && !r.error,
            }));
            toolResult = { stdout: r.stdout, stderr: r.stderr, exit_code: r.exit_code, error: r.error };
          } else if (name === "run_python") {
            const r = await sandbox.python(String(args.code ?? ""), 60000);
            await writer.write(frame("python", {
              code: String(args.code ?? ""),
              output: [r.stdout, r.stderr && `[stderr]\n${r.stderr}`, r.error && `[err] ${r.error}`].filter(Boolean).join("\n"),
              ok: r.exit_code === 0 && !r.error,
            }));
            toolResult = { stdout: r.stdout, stderr: r.stderr, exit_code: r.exit_code, error: r.error };
          } else if (name === "install_deps") {
            const manager = String(args.manager ?? "npm");
            const pkgs = (Array.isArray(args.packages) ? args.packages : []).map(String).filter(Boolean);
            if (!pkgs.length) throw new Error("packages required");
            const cmd = manager === "pip"
              ? `pip install --no-cache-dir ${pkgs.map((p) => `'${p.replace(/'/g, "")}'`).join(" ")}`
              : `npm install --no-audit --no-fund ${pkgs.map((p) => `'${p.replace(/'/g, "")}'`).join(" ")}`;
            const r = await sandbox.bash(cmd, 120000);
            await writer.write(frame("bash", {
              command: cmd,
              output: [r.stdout, r.stderr && `[stderr]\n${r.stderr}`, r.error && `[err] ${r.error}`].filter(Boolean).join("\n"),
              ok: r.exit_code === 0 && !r.error,
            }));
            toolResult = { ok: r.exit_code === 0 && !r.error, exit_code: r.exit_code };
          } else if (name === "github_push") {
            const filesArg = Array.isArray(args.files) && args.files.length
              ? args.files
              : [...files.entries()].map(([path, content]) => ({ path, content }));
            const r = await githubPush(authHeader, {
              owner: String(args.owner), repo: String(args.repo),
              branch: args.branch ? String(args.branch) : undefined,
              message: String(args.message ?? "chore: update from Megsy Coder"),
              files: filesArg,
            });
            await writer.write(frame("integration", {
              kind: "github",
              reason: r.ok ? `Pushed to ${args.owner}/${args.repo}@${r.branch} — ${r.commit_url}` : `GitHub push failed: ${r.error}`,
            }));
            toolResult = r;
          } else if (name === "github_pr") {
            const r = await githubPR(authHeader, {
              owner: String(args.owner), repo: String(args.repo),
              head: String(args.head), base: args.base ? String(args.base) : "main",
              title: String(args.title), body: args.body ? String(args.body) : "",
            });
            await writer.write(frame("integration", {
              kind: "github",
              reason: r.ok ? `PR opened: ${r.url}` : `PR failed: ${r.error}`,
            }));
            toolResult = r;
          } else if (name === "finish") {
            await writer.write(frame("done", {
              summary: String(args.summary ?? ""),
              files: [...files.entries()].map(([path, content]) => ({ path, content })),
            }));
            return;
          } else {
            toolResult = { ok: false, error: `unknown tool: ${name}` };
          }
        } catch (e) {
          toolResult = { ok: false, error: e instanceof Error ? e.message : String(e) };
        }

        messages.push({
          role: "tool", tool_call_id: call.id,
          content: JSON.stringify(toolResult).slice(0, 8000),
        });
      }
    }

    await writer.write(frame("done", {
      summary: "Reached step limit.",
      files: [...files.entries()].map(([path, content]) => ({ path, content })),
    }));
  } finally {
    await sandbox.close();
  }
}

// ─── HTTP entrypoint ────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: CORS });

  let body: Body;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "invalid json" }), {
      status: 400, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
  if (!body?.prompt || typeof body.prompt !== "string") {
    return new Response(JSON.stringify({ error: "prompt is required" }), {
      status: 400, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const userId = await resolveUserId(req);
  const userPlan = await getUserPlan(userId);
  if (!userId || !PAID_PLANS.has(userPlan)) {
    return new Response(JSON.stringify({
      paywall: true, error: "upgrade_required",
      message: "Coder is available on paid plans only.",
    }), { status: 402, headers: { ...CORS, "Content-Type": "application/json" } });
  }

  const stream = new TransformStream<Uint8Array, Uint8Array>();
  const writer = stream.writable.getWriter();
  const controller = new AbortController();
  req.signal.addEventListener("abort", () => controller.abort());
  const authHeader = req.headers.get("authorization") ?? "";

  (async () => {
    try {
      await writer.write(frame("start", { model: MODEL }));
      await runAgent(body, authHeader, writer, controller.signal);
    } catch (e) {
      try { await writer.write(frame("error", { error: e instanceof Error ? e.message : String(e) })); } catch { /* ignore */ }
    } finally {
      try { await writer.write(endFrame()); } catch { /* ignore */ }
      try { await writer.close(); } catch { /* already closed */ }
    }
  })();

  return new Response(stream.readable, {
    status: 200,
    headers: {
      ...CORS,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      Connection: "keep-alive",
    },
  });
});
