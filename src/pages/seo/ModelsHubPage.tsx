/** @doc AI Models hub (/models) — lists every chat, image, and video model available on Megsy AI. */
import { useEffect, useState } from "react";
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Image as ImageIcon, Video, MessageSquare } from "lucide-react";

type ModelLite = {
  slug: string;
  name: string;
  provider: string;
  kind: "chat" | "image" | "video";
  badge?: string | null;
  description?: string | null;
  isNew?: boolean;
  isPremium?: boolean;
};

const KIND_META: Record<string, { label: string; icon: typeof Sparkles; color: string }> = {
  chat: { label: "Chat & Code Models", icon: MessageSquare, color: "from-blue-500 to-cyan-500" },
  image: { label: "Image Models", icon: ImageIcon, color: "from-purple-500 to-pink-500" },
  video: { label: "Video Models", icon: Video, color: "from-orange-500 to-red-500" },
};

export function chatIdToSlug(id: string): string {
  return (
    "chat-" +
    id
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  );
}

export default function ModelsHubPage() {
  const [models, setModels] = useState<ModelLite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [chat, img, vid] = await Promise.all([
        supabase
          .from("model_pricing")
          .select("id,label,provider,kind,badge")
          .eq("enabled", true)
          .order("sort_order"),
        supabase
          .from("image_models")
          .select("slug,display_name,provider,description,is_new,is_premium,is_featured")
          .eq("is_active", true)
          .order("sort_order"),
        supabase
          .from("video_models")
          .select("slug,display_name,provider,description,is_new,is_premium,is_featured")
          .eq("is_active", true)
          .order("sort_order"),
      ]);
      if (cancelled) return;
      const all: ModelLite[] = [
        ...((chat.data as any[]) ?? [])
          .filter((m) => m.kind === "chat" || m.kind === "code")
          .map((m) => ({
            slug: chatIdToSlug(m.id),
            name: m.label,
            provider: m.provider,
            kind: "chat" as const,
            badge: m.badge,
          })),
        ...((img.data as any[]) ?? []).map((m) => ({
          slug: "image-" + m.slug,
          name: m.display_name,
          provider: m.provider,
          kind: "image" as const,
          description: m.description,
          isNew: m.is_new,
          isPremium: m.is_premium,
        })),
        ...((vid.data as any[]) ?? []).map((m) => ({
          slug: "video-" + m.slug,
          name: m.display_name,
          provider: m.provider,
          kind: "video" as const,
          description: m.description,
          isNew: m.is_new,
          isPremium: m.is_premium,
        })),
      ];
      setModels(all);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = (kind: "chat" | "image" | "video") => models.filter((m) => m.kind === kind);

  const title = "All AI Models — 130+ Image, Video, Chat & Code Models | Megsy AI";
  const description =
    "Every AI model in one place. Generate images with FLUX, GPT Image 2, Nano Banana, Seedream and Imagen. Produce videos with Veo 3, Kling, Sora, Runway and Luma. Chat & code with Claude, Gemini, GPT-5 and Qwen.";

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href="/models" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content="/models" />
        <meta property="og:type" content="website" />
      </Helmet>

      <section className="px-6 pt-20 pb-12 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-card text-sm mb-6">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>130+ models, one platform</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          Every AI model you'll ever need
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Image, video, chat and code. Switch between providers in one click — no separate
          subscriptions, no API keys, no quota juggling.
        </p>
      </section>

      <section className="px-6 pb-20 max-w-6xl mx-auto space-y-16">
        {(["image", "video", "chat"] as const).map((kind) => {
          const list = grouped(kind);
          if (loading && list.length === 0) {
            return (
              <div key={kind} className="text-center text-muted-foreground">
                Loading models…
              </div>
            );
          }
          if (list.length === 0) return null;
          const meta = KIND_META[kind];
          const Icon = meta.icon;
          return (
            <div key={kind}>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`rounded-xl bg-gradient-to-br ${meta.color} p-2.5 text-white shadow-md`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold">{meta.label}</h2>
                <span className="text-sm text-muted-foreground">({list.length})</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {list.map((m) => (
                  <Link
                    key={m.slug}
                    to={`/models/${m.slug}`}
                    className="group rounded-xl border bg-card p-5 hover:shadow-lg hover:border-primary transition relative"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold leading-tight group-hover:text-primary transition">
                        {m.name}
                      </h3>
                      {(m.badge || m.isNew || m.isPremium) && (
                        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary whitespace-nowrap">
                          {m.badge || (m.isNew ? "NEW" : "PRO")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground capitalize mb-1">by {m.provider}</p>
                    {m.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                        {m.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
