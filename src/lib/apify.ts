import { supabase } from "@/integrations/supabase/client";

export type ApifyRunInput = {
  actorId: string; // e.g. "apify/instagram-scraper" or "<actorId>"
  input?: Record<string, unknown>;
  mode?: "sync" | "async";
  timeoutSecs?: number;
};

export type ApifyRunResult = {
  items?: unknown[];
  runId?: string;
  status?: string;
  run?: Record<string, unknown>;
  error?: string;
  details?: unknown;
};

/**
 * Run any Apify actor through the `openrouter-media` edge function (kind: "apify").
 * Default mode is "sync" — returns dataset items in one call.
 * Use mode: "async" for long-running actors, then poll with apifyRunStatus(runId).
 */
export async function runApifyActor(input: ApifyRunInput): Promise<ApifyRunResult> {
  const { data, error } = await supabase.functions.invoke("openrouter-media", {
    body: { kind: "apify", ...input },
  });
  if (error) {
    return { error: error.message };
  }
  return (data ?? {}) as ApifyRunResult;
}

/** Poll the status (and items if finished) of an async run. */
export async function apifyRunStatus(runId: string): Promise<ApifyRunResult> {
  const { data, error } = await supabase.functions.invoke("openrouter-media", {
    body: { kind: "apify", runId },
  });
  if (error) return { error: error.message };
  return (data ?? {}) as ApifyRunResult;
}

/**
 * Convenience helper: run an actor and extract the first media URL
 * (image or video) found in the returned dataset items.
 * Looks for common keys: url, imageUrl, image_url, videoUrl, video_url, output, mediaUrl.
 */
export function extractMediaUrl(items: unknown[] | undefined): string | null {
  if (!Array.isArray(items)) return null;
  const keys = [
    "url",
    "imageUrl",
    "image_url",
    "videoUrl",
    "video_url",
    "mediaUrl",
    "output",
    "outputUrl",
    "result",
  ];
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    for (const k of keys) {
      const v = obj[k];
      if (typeof v === "string" && /^https?:\/\//.test(v)) return v;
      if (Array.isArray(v) && typeof v[0] === "string" && /^https?:\/\//.test(v[0] as string)) {
        return v[0] as string;
      }
    }
  }
  return null;
}
