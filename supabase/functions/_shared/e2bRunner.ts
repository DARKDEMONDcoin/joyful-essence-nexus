/** @doc Shared E2B sandbox executor. Provides both one-shot helpers and a
 * per-session persistent sandbox so a Coder run can install deps, keep
 * files on disk, and reuse the same working directory across tool calls. */
import { createClient } from "npm:@supabase/supabase-js@2";
import { Sandbox } from "npm:@e2b/code-interpreter@1.5.1";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

async function pickE2bKey(): Promise<{ id: string; api_key: string } | null> {
  const { data } = await supabase
    .from("e2b_keys")
    .select("id, api_key")
    .eq("status", "active")
    .order("last_used_at", { ascending: true, nullsFirst: true })
    .limit(1)
    .maybeSingle();
  return data as any;
}

async function markE2bUsed(id: string, error?: string) {
  await supabase.from("e2b_keys").update({
    last_used_at: new Date().toISOString(),
    last_error: error || null,
  }).eq("id", id);
}

export interface BashResult { stdout: string; stderr: string; exit_code: number; error?: string }

function trim(s: string, n: number) {
  s = String(s ?? "");
  return s.length > n ? s.slice(0, n) + "\n...[truncated]" : s;
}

// ─── One-shot helpers (kept for backward compatibility) ─────────────────────
export async function runBashInE2B(command: string, timeoutMs = 30000): Promise<BashResult> {
  const s = await SessionSandbox.create();
  if (!s) return { stdout: "", stderr: "", exit_code: -1, error: "No active E2B key" };
  try { return await s.bash(command, timeoutMs); }
  finally { await s.close(); }
}

export async function runPythonInE2B(code: string, timeoutMs = 60000): Promise<BashResult> {
  const s = await SessionSandbox.create();
  if (!s) return { stdout: "", stderr: "", exit_code: -1, error: "No active E2B key" };
  try { return await s.python(code, timeoutMs); }
  finally { await s.close(); }
}

// ─── Persistent per-session sandbox ─────────────────────────────────────────
export class SessionSandbox {
  private constructor(
    private sandbox: any,
    private keyId: string,
    public cwd: string,
  ) {}

  static async create(cwd = "/home/user/workspace"): Promise<SessionSandbox | null> {
    const key = await pickE2bKey();
    if (!key) return null;
    try {
      const sandbox = await Sandbox.create({ apiKey: key.api_key, timeoutMs: 15 * 60_000 });
      // ensure cwd exists
      await sandbox.commands.run(`mkdir -p ${cwd}`, { timeoutMs: 5000 }).catch(() => {});
      return new SessionSandbox(sandbox, key.id, cwd);
    } catch (e: any) {
      await markE2bUsed(key.id, String(e?.message || e));
      return null;
    }
  }

  async bash(command: string, timeoutMs = 30000): Promise<BashResult> {
    try {
      const res = await this.sandbox.commands.run(command, { timeoutMs, cwd: this.cwd });
      return {
        stdout: trim(res.stdout, 8000),
        stderr: trim(res.stderr, 3000),
        exit_code: Number(res.exitCode ?? 0),
      };
    } catch (e: any) {
      return { stdout: "", stderr: "", exit_code: -1, error: String(e?.message || e) };
    }
  }

  async python(code: string, timeoutMs = 60000): Promise<BashResult> {
    try {
      const exec = await this.sandbox.runCode(code, { timeoutMs });
      const stdout = (exec.logs?.stdout ?? []).join("");
      const stderr = (exec.logs?.stderr ?? []).join("");
      const errMsg = exec.error ? `${exec.error.name}: ${exec.error.value}\n${exec.error.traceback ?? ""}` : "";
      return {
        stdout: trim(stdout, 8000),
        stderr: trim([stderr, errMsg].filter(Boolean).join("\n"), 3000),
        exit_code: exec.error ? 1 : 0,
      };
    } catch (e: any) {
      return { stdout: "", stderr: "", exit_code: -1, error: String(e?.message || e) };
    }
  }

  async writeFile(path: string, content: string): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.sandbox.files.write(this.resolve(path), content);
      return { ok: true };
    } catch (e: any) { return { ok: false, error: String(e?.message || e) }; }
  }

  async readFile(path: string): Promise<{ ok: boolean; content?: string; error?: string }> {
    try {
      const content = await this.sandbox.files.read(this.resolve(path));
      return { ok: true, content: trim(String(content), 16000) };
    } catch (e: any) { return { ok: false, error: String(e?.message || e) }; }
  }

  private resolve(p: string) {
    if (p.startsWith("/")) return p;
    return `${this.cwd}/${p}`;
  }

  async close() {
    try { await this.sandbox.kill(); } catch { /* ignore */ }
    await markE2bUsed(this.keyId);
  }
}
