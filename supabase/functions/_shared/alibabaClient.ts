/** @doc Alibaba DashScope (OpenAI-compatible) client used by all chat features.
 *  Reads the Alibaba/Qwen key from the `public.alibaba_keys` table first
 *  (categories: qwen, memory, image, video — any active row), then falls back
 *  to the ALIBABA_DASHSCOPE_KEY env secret. */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const DASHSCOPE_BASE = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";
const TTL_MS = 5 * 60_000;

let cachedKey: { key: string; expiry: number } | null = null;
let cachedRow: { id: string; key: string } | null = null;

function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

/** Reads the Alibaba key from env secrets ONLY (ALIBABA_DASHSCOPE_KEY or DASHSCOPE_API_KEY). */
export async function getAlibabaKey(): Promise<string> {
  if (cachedKey && Date.now() < cachedKey.expiry) return cachedKey.key;
  const env =
    Deno.env.get("ALIBABA_DASHSCOPE_KEY") ||
    Deno.env.get("DASHSCOPE_API_KEY");
  if (env && env.length > 20) {
    cachedKey = { key: env, expiry: Date.now() + TTL_MS };
    return env;
  }
  throw new Error("No Alibaba/DashScope key in env (ALIBABA_DASHSCOPE_KEY / DASHSCOPE_API_KEY)");
}

/** Best-effort check without throwing. */
export async function hasAlibabaKey(): Promise<boolean> {
  try {
    await getAlibabaKey();
    return true;
  } catch {
    return false;
  }
}

async function markFailure(err: string) {
  if (!cachedRow) return;
  try {
    const sb = admin();
    await sb.rpc as unknown;
    await sb
      .from("alibaba_keys")
      .update({ last_error: err.slice(0, 500) })
      .eq("id", cachedRow.id);
  } catch {
    /* ignore */
  }
}

export async function alibabaChat(body: any, attempt = 0): Promise<Response> {
  const apiKey = await getAlibabaKey();
  const res = await fetch(`${DASHSCOPE_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (res.status === 429 && attempt < 2) {
    await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    return alibabaChat(body, attempt + 1);
  }
  if (res.status === 401 || res.status === 403) {
    // invalidate cache so the next call re-reads from DB
    cachedKey = null;
    await markFailure(`HTTP ${res.status}`);
  }
  return res;
}

export async function alibabaChatJSON<T = any>(body: any): Promise<T> {
  const res = await alibabaChat({ ...body, stream: false });
  if (!res.ok) throw new Error(`Alibaba ${res.status}: ${await res.text()}`);
  return (await res.json()) as T;
}

export async function alibabaChatStream(body: any): Promise<Response> {
  return alibabaChat({ ...body, stream: true });
}
