/** @doc Archives generated image/video provider URLs into Supabase Storage so library media does not expire. */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const ARCHIVE_BUCKET = "model-media";

function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}

function extFromContentType(contentType: string, kind: "image" | "video") {
  const ct = contentType.toLowerCase();
  if (ct.includes("png")) return "png";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("gif")) return "gif";
  if (ct.includes("jpeg") || ct.includes("jpg")) return "jpg";
  if (ct.includes("webm")) return "webm";
  if (ct.includes("quicktime") || ct.includes("mov")) return "mov";
  if (ct.includes("mp4") || kind === "video") return "mp4";
  return kind === "image" ? "png" : "mp4";
}

function extFromUrl(url: string, kind: "image" | "video") {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    const match = pathname.match(/\.([a-z0-9]{2,5})$/i);
    if (match?.[1]) return match[1];
  } catch {
    // fall through
  }
  return kind === "image" ? "png" : "mp4";
}

async function getUserId(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return "anonymous";
  try {
    const { data } = await admin().auth.getUser(token);
    return data.user?.id || "anonymous";
  } catch {
    return "anonymous";
  }
}

export async function archiveRemoteMedia(
  req: Request,
  sourceUrl: string,
  kind: "image" | "video",
) {
  if (!sourceUrl || !/^https?:\/\//i.test(sourceUrl)) return sourceUrl;
  if (sourceUrl.includes(`/storage/v1/object/public/${ARCHIVE_BUCKET}/`)) return sourceUrl;

  try {
    const response = await fetch(sourceUrl);
    if (!response.ok) return sourceUrl;

    const contentType = response.headers.get("content-type") ||
      (kind === "image" ? "image/png" : "video/mp4");
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (!bytes.byteLength) return sourceUrl;

    const userId = await getUserId(req);
    const ext = extFromContentType(contentType, kind) || extFromUrl(sourceUrl, kind);
    const path = `generated/${userId}/${kind}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const supabase = admin();
    const { error } = await supabase.storage
      .from(ARCHIVE_BUCKET)
      .upload(path, bytes, { contentType, upsert: false });

    if (error) {
      console.error("[media-archive] upload failed", error.message);
      return sourceUrl;
    }

    const { data } = supabase.storage.from(ARCHIVE_BUCKET).getPublicUrl(path);
    return data.publicUrl || sourceUrl;
  } catch (error) {
    console.error("[media-archive] failed", error);
    return sourceUrl;
  }
}