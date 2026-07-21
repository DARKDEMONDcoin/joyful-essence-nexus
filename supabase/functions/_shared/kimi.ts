/** @doc Shared Kimi-compatible chat helpers used by the Telegram tasks bot agents. */
import { getLLM, ROUTER_MODELS } from "./llm-router.ts";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type KimiOptions = {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  model?: string;
};

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
    if (fenced) return JSON.parse(fenced);
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1));
    throw new Error("AI response did not contain valid JSON");
  }
}

export async function kimiChat(options: KimiOptions): Promise<string> {
  const llm = await getLLM();
  if (!llm) throw new Error("No LLM provider configured");

  const model = llm.mapModel(options.model ?? ROUTER_MODELS.chat);
  const response = await fetch(llm.url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${llm.key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1200,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Kimi-compatible chat failed [${response.status}]: ${(await response.text()).slice(0, 500)}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Kimi-compatible chat returned no content");
  return content;
}

export async function kimiJson<T = unknown>(options: KimiOptions): Promise<T> {
  const content = await kimiChat({
    ...options,
    messages: [
      ...options.messages,
      { role: "system", content: "Return valid JSON only. Do not include markdown fences or explanatory text." },
    ],
  });
  return extractJson(content) as T;
}