// Client for the kimi-coder edge function (SSE agent loop).
// Emits typed events the UI can render as: todo list, files, bash logs, text.
import { supabase } from "@/integrations/supabase/client";


export type KimiTodo = { id: string; title: string; done: boolean };
export type KimiFile = { path: string; content: string };

export type KimiEvent =
  | { type: "start"; model: string }
  | { type: "text"; text: string }
  | { type: "todo"; todos: KimiTodo[] }
  | { type: "file"; path: string; content: string }
  | { type: "bash"; command: string; output: string; ok: boolean }
  | { type: "python"; code: string; output: string; ok: boolean }
  | { type: "integration"; kind: "github" | "supabase"; reason: string }
  | { type: "tool_call"; id: string; name: string; args: any }
  | { type: "done"; summary?: string; files: KimiFile[] }
  | { type: "error"; error: string };

const URL_ = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kimi-coder`;

export async function runKimiCoder({
  prompt,
  history,
  onEvent,
  signal,
}: {
  prompt: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  onEvent: (ev: KimiEvent) => void;
  signal?: AbortSignal;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const token = session?.access_token || anon;
  const resp = await fetch(URL_, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anon,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt, history: history ?? [] }),
    signal,
  });
  if (!resp.ok || !resp.body) {
    const txt = await resp.text().catch(() => "");
    onEvent({ type: "error", error: txt || `http ${resp.status}` });
    return;
  }
  const reader = resp.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (payload === "[DONE]") return;
      try {
        const obj = JSON.parse(payload);
        const ev = obj.event as string | undefined;
        if (!ev) continue;
        onEvent({ ...obj, type: ev } as KimiEvent);
      } catch {
        // ignore
      }
    }
  }
}
