import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ALL_MODEL_DETAILS, type ModelDetail } from "@/lib/modelDetails";

// Provider → logo URL (served from /public/model-logos/)
const PROVIDER_LOGO: Record<string, string> = {
  apify: "/model-logos/apify.ico",
  openrouter: "/model-logos/openrouter.svg",
  fal: "/model-logos/fal.ico",
  google: "/model-logos/google.ico",
  openai: "/model-logos/openai.svg",
  bytedance: "/model-logos/bytedance.ico",
  bfl: "/model-logos/bfl.webp",
  ideogram: "/model-logos/ideogram.webp",
  kling: "/model-logos/kling.webp",
  luma: "/model-logos/luma.webp",
  pika: "/model-logos/pika.webp",
  recraft: "/model-logos/recraft.webp",
  megsy: "/model-logos/megsy.png",
  minimax: "/model-logos/minimax.webp",
  runway: "/model-logos/runway.webp",
  qwen: "/model-logos/qwen.webp",
  hidream: "/model-logos/hidream.webp",
  stability: "/model-logos/stability.webp",
  playground: "/model-logos/playground.webp",
  lightricks: "/model-logos/lightricks.webp",
  xai: "/model-logos/xai.ico",
};

// Pick a logo for a model based on provider or slug substring
function pickLogo(provider: string, slug: string): string | undefined {
  const s = slug.toLowerCase();
  if (s.includes("nano-banana")) return "/model-logos/nano-banana.webp";
  if (s.includes("gpt-image")) return PROVIDER_LOGO.openai;
  if (s.includes("flux")) return PROVIDER_LOGO.bfl;
  if (s.includes("ideogram")) return PROVIDER_LOGO.ideogram;
  if (s.includes("recraft")) return PROVIDER_LOGO.recraft;
  if (s.includes("seedream") || s.includes("seedance")) return PROVIDER_LOGO.bytedance;
  if (s.includes("kling")) return PROVIDER_LOGO.kling;
  if (s.includes("veo")) return PROVIDER_LOGO.google;
  if (s.includes("luma") || s.includes("ray")) return PROVIDER_LOGO.luma;
  if (s.includes("pika")) return PROVIDER_LOGO.pika;
  if (s.includes("minimax") || s.includes("hailuo")) return PROVIDER_LOGO.minimax;
  if (s.includes("runway") || s.includes("gen")) return PROVIDER_LOGO.runway;
  if (s.includes("ltx") || s.includes("lightricks")) return PROVIDER_LOGO.lightricks;
  if (s.includes("megsy")) return PROVIDER_LOGO.megsy;
  if (s.includes("hidream")) return PROVIDER_LOGO.hidream;
  if (s.includes("stable") || s.includes("sd-")) return PROVIDER_LOGO.stability;
  return PROVIDER_LOGO[provider?.toLowerCase()] ?? PROVIDER_LOGO.fal;
}

function cleanModelName(name = ""): string {
  return name
    .replace(/\s*\(Alibaba Backup\)/gi, "")
    .replace(/\s*\(Backup\)/gi, "")
    .replace(/\s*\(Beta\)/gi, "")
    .replace(/\s*\(Experimental\)/gi, "")
    .replace(/\s*\(Deprecated\)/gi, "")
    .replace(/\s*T2I\s+(Turbo|Plus)\b/gi, "")
    .replace(/\s*T2I\b/gi, "")
    .replace(/\s*I2V\b/gi, "")
    .replace(/\s*T2V\b/gi, "")
    .replace(/\s*Sketch→Image\b/gi, " Sketch")
    .replace(/\s+\d+\.\d+\s*(Turbo|Plus)\b/gi, (m) => m.replace(/\s+(Turbo|Plus)/gi, ""))
    .trim();
}

function imageRowToModelDetail(r: any): ModelDetail {
  const badges: string[] = [];
  if (r.is_new) badges.push("NEW");
  if (r.is_premium) badges.push("PRO");
  if (r.supports_multi_image) badges.push("Multi-Image");
  const topRes = Array.isArray(r.supported_resolutions)
    ? r.supported_resolutions[r.supported_resolutions.length - 1]
    : null;
  if (topRes) badges.push(String(topRes));
  const cleanName = cleanModelName(r.display_name);
  return {
    id: r.slug,
    slug: r.slug,
    name: cleanName,
    type: "image",
    credits: Number(r.credits) || 0,
    description: r.description || `${cleanName} · ${r.credits} MC / image`,
    longDescription:
      r.description || `${cleanName} via ${r.provider}. Billed ${r.credits} MC per image.`,
    icon: "Image",
    modes: r.endpoint_image_to_image ? ["text-to-image", "image-to-image"] : ["text-to-image"],
    acceptsImages: !!r.endpoint_image_to_image || !!r.supports_multi_image,
    requiresImage: false,
    maxImages: r.max_input_images || 0,
    acceptedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    provider: r.provider,
    speed: "standard",
    quality: "high",
    iconUrl: r.thumbnail_url || pickLogo(r.provider, r.slug),
    thumbnailUrl: r.thumbnail_url,
    badges,
    supportedAspects: r.supported_aspects || [],
    supportedResolutions: r.supported_resolutions || [],
    defaultAspect: r.default_aspect,
    defaultResolution: r.default_resolution,
    supportsMultiImage: !!r.supports_multi_image,
    unit: r.unit,
    isPremium: !!r.is_premium,
    isNew: !!r.is_new,
    isFeatured: !!r.is_featured,
  };
}

function videoRowToModelDetail(r: any): ModelDetail {
  const badges: string[] = [];
  if (r.is_new) badges.push("NEW");
  if (r.is_premium) badges.push("PRO");
  if (r.supports_start_end_frame) badges.push("Start/End");
  if (r.supports_audio) badges.push("Audio");
  const topRes = Array.isArray(r.supported_resolutions)
    ? r.supported_resolutions[r.supported_resolutions.length - 1]
    : null;
  if (topRes) badges.push(String(topRes));
  const isI2VOnly = !r.endpoint_text_to_video && !!r.endpoint_image_to_video;
  const modes: string[] = [];
  if (r.endpoint_text_to_video) modes.push("text-to-video");
  if (r.endpoint_image_to_video) modes.push("image-to-video");
  if (r.endpoint_start_end_frame) modes.push("start-end-frame");
  const pricePerVideo =
    r.unit === "video"
      ? Number(r.credits_per_video) || 0
      : (Number(r.credits_per_second) || 0) * (r.default_duration || 5);
  const cleanName = cleanModelName(r.display_name);
  return {
    id: r.slug,
    slug: r.slug,
    name: cleanName,
    type: isI2VOnly ? "video-i2v" : "video",
    credits: pricePerVideo,
    description:
      r.description ||
      (r.unit === "video"
        ? `${cleanName} · ${r.credits_per_video} MC / video`
        : `${cleanName} · ${r.credits_per_second} MC/s`),
    longDescription: r.description || `${cleanName} via ${r.provider}.`,
    icon: "Video",
    modes: modes.length ? modes : ["text-to-video"],
    acceptsImages:
      !!r.endpoint_image_to_video || !!r.supports_multi_image || !!r.endpoint_start_end_frame,
    requiresImage: isI2VOnly,
    maxImages: r.max_input_images || (r.supports_start_end_frame ? 2 : 1),
    acceptedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    provider: r.provider,
    speed: "standard",
    quality: "high",
    iconUrl: r.thumbnail_url || pickLogo(r.provider, r.slug),
    thumbnailUrl: r.thumbnail_url,
    badges,
    supportedAspects: r.supported_aspects || [],
    supportedResolutions: r.supported_resolutions || [],
    supportedDurations: r.supported_durations || [],
    defaultAspect: r.default_aspect,
    defaultResolution: r.default_resolution,
    defaultDuration: r.default_duration,
    supportsStartEndFrame: !!r.supports_start_end_frame,
    supportsMultiImage: !!r.supports_multi_image,
    supportsAudio: !!r.supports_audio,
    unit: r.unit,
    creditsPerSecond: r.credits_per_second,
    creditsPerVideo: r.credits_per_video,
    isPremium: !!r.is_premium,
    isNew: !!r.is_new,
    isFeatured: !!r.is_featured,
  };
}

const MODELS_CACHE_KEY = "megsy_cache_dynamic_models_v2";
const MODELS_CACHE_TTL = 24 * 60 * 60 * 1000; // 24h — admin-managed, rarely changes
const MODEL_SOURCE_VERSION = "verified-live-v1";

function readCachedModels(): ModelDetail[] | null {
  try {
    const raw = localStorage.getItem(MODELS_CACHE_KEY);
    if (!raw) return null;
    const { data, expiry, version } = JSON.parse(raw);
    if (version !== MODEL_SOURCE_VERSION) return null;
    if (!Array.isArray(data) || (expiry && Date.now() > expiry)) return null;
    return data as ModelDetail[];
  } catch {
    return null;
  }
}

function writeCachedModels(models: ModelDetail[]) {
  try {
    localStorage.setItem(
      MODELS_CACHE_KEY,
      JSON.stringify({
        data: models,
        expiry: Date.now() + MODELS_CACHE_TTL,
        version: MODEL_SOURCE_VERSION,
      }),
    );
  } catch {
    /* quota — ignore */
  }
}

export function useDynamicModels() {
  const initial = typeof window !== "undefined" ? readCachedModels() : null;
  const [models, setModels] = useState<ModelDetail[]>(initial ?? ALL_MODEL_DETAILS);
  // If we have a cached snapshot, treat as loaded immediately and revalidate in the background.
  const [loading, setLoading] = useState(!initial);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [imgRes, vidRes, memRes] = await Promise.all([
          (supabase as any)
            .from("image_models")
            .select("*")
            .eq("is_active", true)
            .order("sort_order", { ascending: true }),
          (supabase as any)
            .from("video_models")
            .select("*")
            .eq("is_active", true)
            .order("sort_order", { ascending: true }),
          supabase
            .from("memories")
            .select("key, value")
            .or("key.eq.models_hidden,key.like.model_config_%"),
        ]);

        if (cancelled) return;

        const imageModels = (imgRes.data ?? []).map(imageRowToModelDetail);
        const videoModels = (vidRes.data ?? []).map(videoRowToModelDetail);

        const memories = memRes.data ?? [];
        const hiddenRaw = memories.find((m: any) => m.key === "models_hidden");
        const hidden: string[] = hiddenRaw ? safeParse(hiddenRaw.value, []) : [];

        const overrides: Record<string, Record<string, string>> = {};
        memories
          .filter((m: any) => m.key.startsWith("model_config_"))
          .forEach((m: any) => {
            const id = m.key.replace("model_config_", "");
            overrides[id] = safeParse(m.value, {});
          });

        const chatModels = ALL_MODEL_DETAILS.filter((m) => m.type === "chat");

        let result = [...chatModels, ...imageModels, ...videoModels].filter(
          (m) => !hidden.includes(m.id),
        );

        result = result.map((m) => applyOverride(m, overrides[m.id]));

        setModels(result);
        writeCachedModels(result);
      } catch (e) {
        console.error("Failed to load dynamic models:", e);
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { models, loading };
}

function safeParse<T>(s: string, fallback: T): T {
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
}

function applyOverride(m: ModelDetail, ov?: Record<string, string>): ModelDetail {
  if (!ov) return m;
  return {
    ...m,
    ...(ov.name && { name: ov.name }),
    ...(ov.credits !== undefined && { credits: Number(ov.credits) }),
    ...(ov.description && { description: ov.description }),
    ...(ov.icon_url && { iconUrl: ov.icon_url }),
    ...(ov.badges && { badges: ov.badges.split(",").filter(Boolean) }),
  };
}
