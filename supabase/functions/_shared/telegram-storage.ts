// Telegram-based media storage handlers (upload / refresh / proxy)
// Designed to be mounted under another edge function to stay within
// the project's edge-function limit.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const CHAT_ID = Deno.env.get("TELEGRAM_STORAGE_CHAT_ID");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FALLBACK_BUCKET = "media-fallback";

const TG_LIMITS: Record<string, number> = {
  photo: 10 * 1024 * 1024,
  video: 2 * 1024 * 1024 * 1024,
  document: 2 * 1024 * 1024 * 1024,
  audio: 50 * 1024 * 1024,
  voice: 50 * 1024 * 1024,
  animation: 50 * 1024 * 1024,
};

const METHOD_MAP: Record<string, string> = {
  photo: "sendPhoto",
  video: "sendVideo",
  document: "sendDocument",
  audio: "sendAudio",
  voice: "sendVoice",
  animation: "sendAnimation",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function buildCachedUrl(filePath: string) {
  return `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
}

async function tgGetFile(fileId: string) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_id: fileId }),
  });
  const j = await res.json();
  if (!j.ok) throw new Error(`getFile failed: ${JSON.stringify(j)}`);
  return j.result.file_path as string;
}

function extractMeta(kind: string, result: any) {
  if (kind === "photo") {
    const arr = result.photo as any[];
    const best = arr[arr.length - 1];
    return {
      file_id: best.file_id,
      file_unique_id: best.file_unique_id,
      width: best.width,
      height: best.height,
      size_bytes: best.file_size ?? null,
      thumbnail_file_id: arr[0]?.file_id ?? null,
    };
  }
  const obj = result[kind];
  return {
    file_id: obj.file_id,
    file_unique_id: obj.file_unique_id,
    width: obj.width ?? null,
    height: obj.height ?? null,
    duration: obj.duration ?? null,
    size_bytes: obj.file_size ?? null,
    thumbnail_file_id: obj.thumbnail?.file_id ?? obj.thumb?.file_id ?? null,
    mime_type: obj.mime_type ?? null,
  };
}

async function uploadToFallback(supabase: any, userId: string, file: File, _kind: string) {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(FALLBACK_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(FALLBACK_BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

async function authedClient(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return { error: json({ error: "Unauthorized" }, 401) };
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  if (!user) return { error: json({ error: "Unauthorized" }, 401) };
  return { supabase, user };
}

async function handleUpload(req: Request) {
  if (!BOT_TOKEN || !CHAT_ID) {
    return json({ error: "TELEGRAM_BOT_TOKEN or TELEGRAM_STORAGE_CHAT_ID not configured" }, 500);
  }
  const a = await authedClient(req);
  if ("error" in a) return a.error;
  const { supabase, user } = a;

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const kind = (form.get("kind") as string) || "document";
  const caption = (form.get("caption") as string) || `user:${user.id}`;

  if (!file) return json({ error: "file is required" }, 400);
  if (!METHOD_MAP[kind]) return json({ error: `invalid kind: ${kind}` }, 400);

  const overLimit = file.size > (TG_LIMITS[kind] ?? 0);
  let provider: "telegram" | "supabase" = "telegram";
  let row: any = {
    user_id: user.id,
    kind,
    mime_type: file.type || null,
    size_bytes: file.size,
    original_filename: file.name,
  };

  if (!overLimit) {
    try {
      const tgForm = new FormData();
      tgForm.append("chat_id", CHAT_ID);
      tgForm.append("caption", caption.slice(0, 1000));
      tgForm.append(kind, file, file.name);
      const tgRes = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/${METHOD_MAP[kind]}`,
        { method: "POST", body: tgForm },
      );
      const tgJson = await tgRes.json();
      if (!tgJson.ok) throw new Error(`Telegram error: ${JSON.stringify(tgJson)}`);
      const meta = extractMeta(kind, tgJson.result);
      const filePath = await tgGetFile(meta.file_id);
      const url = buildCachedUrl(filePath);
      row = {
        ...row,
        file_id: meta.file_id,
        file_unique_id: meta.file_unique_id,
        width: meta.width ?? null,
        height: meta.height ?? null,
        duration: (meta as any).duration ?? null,
        thumbnail_file_id: meta.thumbnail_file_id ?? null,
        mime_type: (meta as any).mime_type ?? row.mime_type,
        cached_url: url,
        cached_until: new Date(Date.now() + 55 * 60 * 1000).toISOString(),
        storage_provider: "telegram",
      };
    } catch (e) {
      console.error("[telegram-storage:upload] telegram failed, falling back:", e);
      provider = "supabase";
    }
  } else {
    provider = "supabase";
  }

  if (provider === "supabase") {
    try {
      const fb = await uploadToFallback(supabase, user.id, file, kind);
      row = {
        ...row,
        file_id: `fallback:${fb.path}`,
        cached_url: fb.url,
        cached_until: null,
        storage_provider: "supabase",
        fallback_path: fb.path,
      };
    } catch (e) {
      return json({ error: "Upload failed", detail: String(e) }, 500);
    }
  }

  const { data: inserted, error } = await supabase
    .from("telegram_media").insert(row).select().single();
  if (error) return json({ error: error.message }, 500);

  return json({
    id: inserted.id,
    url: inserted.cached_url,
    provider: inserted.storage_provider,
    kind: inserted.kind,
    width: inserted.width,
    height: inserted.height,
    duration: inserted.duration,
    size_bytes: inserted.size_bytes,
    mime_type: inserted.mime_type,
  });
}

async function handleRefresh(req: Request) {
  if (!BOT_TOKEN) return json({ error: "TELEGRAM_BOT_TOKEN not configured" }, 500);
  const a = await authedClient(req);
  if ("error" in a) return a.error;
  const { user } = a;
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  const body = await req.json().catch(() => ({}));
  const mediaId = body.media_id as string | undefined;
  const fileId = body.file_id as string | undefined;
  if (!mediaId && !fileId) return json({ error: "media_id or file_id required" }, 400);

  const query = supabase.from("telegram_media").select("*").eq("user_id", user.id);
  const { data: row } = mediaId
    ? await query.eq("id", mediaId).maybeSingle()
    : await query.eq("file_id", fileId!).maybeSingle();
  if (!row) return json({ error: "media not found" }, 404);

  if (row.storage_provider === "supabase") {
    return json({ url: row.cached_url, provider: "supabase" });
  }
  if (row.cached_url && row.cached_until && new Date(row.cached_until) > new Date(Date.now() + 60_000)) {
    return json({ url: row.cached_url, provider: "telegram", cached: true });
  }

  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_id: row.file_id }),
  });
  const j = await res.json();
  if (!j.ok) return json({ error: "telegram getFile failed", detail: j }, 502);
  const url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${j.result.file_path}`;
  const cached_until = new Date(Date.now() + 55 * 60 * 1000).toISOString();
  await supabase.from("telegram_media").update({ cached_url: url, cached_until }).eq("id", row.id);
  return json({ url, provider: "telegram", cached: false });
}

async function handleProxy(id: string) {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { data: row } = await supabase
    .from("telegram_media").select("*").eq("id", id).maybeSingle();
  if (!row) return new Response("not found", { status: 404, headers: corsHeaders });

  let target = row.cached_url as string | null;
  if (row.storage_provider === "telegram") {
    const stale = !row.cached_until || new Date(row.cached_until) <= new Date(Date.now() + 60_000);
    if (stale && BOT_TOKEN) {
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_id: row.file_id }),
      });
      const j = await res.json();
      if (j.ok) {
        target = `https://api.telegram.org/file/bot${BOT_TOKEN}/${j.result.file_path}`;
        await supabase.from("telegram_media").update({
          cached_url: target,
          cached_until: new Date(Date.now() + 55 * 60 * 1000).toISOString(),
        }).eq("id", row.id);
      }
    }
  }

  if (!target) return new Response("url unavailable", { status: 502, headers: corsHeaders });
  return new Response(null, {
    status: 302,
    headers: { ...corsHeaders, Location: target, "Cache-Control": "public, max-age=3000" },
  });
}

/**
 * Returns a Response if the request matches a storage route, else null
 * so the caller can fall through to its primary handler.
 * Routes (suffix of URL pathname):
 *   POST .../storage-upload
 *   POST .../storage-refresh
 *   GET  .../storage-proxy/:id
 *   OPTIONS on any of the above
 */
export async function tryHandleTelegramStorage(req: Request): Promise<Response | null> {
  const url = new URL(req.url);
  const path = url.pathname;

  const isStorage =
    path.includes("/storage-upload") ||
    path.includes("/storage-refresh") ||
    path.includes("/storage-proxy");
  if (!isStorage) return null;

  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (path.includes("/storage-upload") && req.method === "POST") return await handleUpload(req);
    if (path.includes("/storage-refresh") && req.method === "POST") return await handleRefresh(req);
    if (path.includes("/storage-proxy") && req.method === "GET") {
      const parts = path.split("/").filter(Boolean);
      const id = parts[parts.length - 1];
      if (!id || id === "storage-proxy") {
        return new Response("missing id", { status: 400, headers: corsHeaders });
      }
      return await handleProxy(id);
    }
    return new Response("method not allowed", { status: 405, headers: corsHeaders });
  } catch (e) {
    console.error("[telegram-storage] error:", e);
    return json({ error: String(e) }, 500);
  }
}
