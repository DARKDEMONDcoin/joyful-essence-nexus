/** @doc AI Model detail page (/models/:slug) — full marketing page per model, fetched from Supabase. */
import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { chatIdToSlug } from "./ModelsHubPage";

type ModelDetail = {
  slug: string;
  name: string;
  provider: string;
  kind: "chat" | "image" | "video";
  description: string;
  badge?: string | null;
  isNew?: boolean;
  isPremium?: boolean;
  // Generation-specific
  capabilities: string[];
  specs: { label: string; value: string }[];
  bestFor: string[];
};

const PROVIDER_NAMES: Record<string, string> = {
  openrouter: "OpenRouter",
  fal: "fal.ai",
  wavespeed: "WaveSpeed",
  runbase: "RunBase",
  google: "Google DeepMind",
  bytedance: "ByteDance",
  kling: "Kling AI",
  luma: "Luma AI",
  runway: "Runway",
  megsy: "Megsy AI",
  v0: "Vercel v0",
  alibaba: "Alibaba",
  dashscope: "Alibaba DashScope",
};

function providerName(p: string) {
  return PROVIDER_NAMES[p] ?? p.charAt(0).toUpperCase() + p.slice(1);
}

async function loadModel(slug: string): Promise<ModelDetail | null> {
  if (slug.startsWith("image-")) {
    const inner = slug.slice("image-".length);
    const { data } = await supabase
      .from("image_models")
      .select("*")
      .eq("slug", inner)
      .eq("is_active", true)
      .maybeSingle();
    if (!data) return null;
    const d: any = data;
    const caps: string[] = [];
    if (d.supports_image_editing) caps.push("Image editing");
    if (d.supports_text_rendering) caps.push("Accurate in-image text & typography");
    if (d.supports_multi_image)
      caps.push(`Multi-reference (up to ${d.max_input_images ?? 4} images)`);
    if (d.supports_vector_output) caps.push("Vector output");
    caps.push("Text-to-image");
    const specs: { label: string; value: string }[] = [];
    if (d.max_resolution) specs.push({ label: "Max resolution", value: d.max_resolution });
    if (d.default_aspect) specs.push({ label: "Default aspect", value: d.default_aspect });
    if (Array.isArray(d.supported_aspects) && d.supported_aspects.length)
      specs.push({ label: "Aspect ratios", value: d.supported_aspects.join(" · ") });
    if (Array.isArray(d.supported_resolutions) && d.supported_resolutions.length)
      specs.push({ label: "Resolutions", value: d.supported_resolutions.join(" · ") });
    if (d.credits) specs.push({ label: "Credits per image", value: String(d.credits) });
    return {
      slug,
      name: d.display_name,
      provider: d.provider,
      kind: "image",
      description:
        d.description ||
        `${d.display_name} is an advanced text-to-image model available on Megsy AI. Generate production-ready visuals in seconds — no API setup, no extra subscription.`,
      isNew: d.is_new,
      isPremium: d.is_premium,
      capabilities: caps,
      specs,
      bestFor: [
        "Marketing visuals",
        "Product mockups",
        "Social media content",
        "Hero images",
        "Concept art",
      ],
    };
  }
  if (slug.startsWith("video-")) {
    const inner = slug.slice("video-".length);
    const { data } = await supabase
      .from("video_models")
      .select("*")
      .eq("slug", inner)
      .eq("is_active", true)
      .maybeSingle();
    if (!data) return null;
    const d: any = data;
    const caps: string[] = ["Text-to-video"];
    if (d.endpoint_image_to_video) caps.push("Image-to-video");
    if (d.supports_audio) caps.push("Native audio");
    if (d.supports_lipsync) caps.push("Lip-sync");
    if (d.supports_camera_control) caps.push("Camera control");
    if (d.supports_start_end_frame) caps.push("Start & end frame");
    if (d.supports_multi_shot) caps.push("Multi-shot");
    const specs: { label: string; value: string }[] = [];
    if (d.default_resolution)
      specs.push({ label: "Default resolution", value: d.default_resolution });
    if (Array.isArray(d.supported_resolutions) && d.supported_resolutions.length)
      specs.push({ label: "Resolutions", value: d.supported_resolutions.join(" · ") });
    if (d.default_aspect) specs.push({ label: "Default aspect", value: d.default_aspect });
    if (Array.isArray(d.supported_aspects) && d.supported_aspects.length)
      specs.push({ label: "Aspect ratios", value: d.supported_aspects.join(" · ") });
    if (d.default_duration)
      specs.push({ label: "Default duration", value: `${d.default_duration}s` });
    if (Array.isArray(d.supported_durations) && d.supported_durations.length)
      specs.push({
        label: "Durations",
        value: d.supported_durations.map((x: any) => `${x}s`).join(" · "),
      });
    if (d.credits_per_second)
      specs.push({ label: "Credits per second", value: String(d.credits_per_second) });
    return {
      slug,
      name: d.display_name,
      provider: d.provider,
      kind: "video",
      description:
        d.description ||
        `${d.display_name} is a state-of-the-art video model on Megsy AI. Turn a single prompt or image into cinematic motion — fast, with native cloud GPU, no setup.`,
      isNew: d.is_new,
      isPremium: d.is_premium,
      capabilities: caps,
      specs,
      bestFor: [
        "Ads & promos",
        "Cinematic shorts",
        "Social reels",
        "Product motion",
        "Story scenes",
      ],
    };
  }
  if (slug.startsWith("chat-")) {
    // Fetch all chat/code models, match by chatIdToSlug
    const { data } = await supabase
      .from("model_pricing")
      .select("*")
      .eq("enabled", true)
      .in("kind", ["chat", "code"]);
    const list = (data as any[]) ?? [];
    const found = list.find((m) => chatIdToSlug(m.id) === slug);
    if (!found) return null;
    const caps: string[] = [
      "Long-context conversations",
      "Multilingual",
      "Code reasoning",
      "Function calling",
    ];
    const specs: { label: string; value: string }[] = [];
    if (found.unit) specs.push({ label: "Unit", value: found.unit });
    if (found.credits_per_unit !== null && found.credits_per_unit !== undefined) {
      specs.push({
        label: "Credits",
        value:
          found.credits_per_unit === 0
            ? "Unlimited / Free"
            : `${found.credits_per_unit} per ${found.unit}`,
      });
    }
    if (found.in_price_per_m)
      specs.push({ label: "Input $/1M tokens", value: `$${found.in_price_per_m}` });
    if (found.out_price_per_m)
      specs.push({ label: "Output $/1M tokens", value: `$${found.out_price_per_m}` });
    return {
      slug,
      name: found.label,
      provider: found.provider,
      kind: "chat",
      description: `${found.label} is available inside Megsy AI's chat with built-in tools for code generation, web browsing, and content creation — no separate API key required.`,
      badge: found.badge,
      capabilities: caps,
      specs,
      bestFor: [
        "Coding assistance",
        "Marketing copy",
        "Research summaries",
        "Customer support drafts",
        "Translation",
      ],
    };
  }
  return null;
}

export default function ModelPage() {
  const { slug } = useParams<{ slug: string }>();
  const [model, setModel] = useState<ModelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    loadModel(slug).then((m) => {
      if (cancelled) return;
      if (!m) setNotFound(true);
      else setModel(m);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (notFound) return <Navigate to="/models" replace />;

  if (loading || !model) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-background text-muted-foreground">
        Loading model…
      </main>
    );
  }

  const kindLabel =
    model.kind === "image"
      ? "AI Image Model"
      : model.kind === "video"
        ? "AI Video Model"
        : "AI Chat & Code Model";
  const title = `${model.name} — ${kindLabel} on Megsy AI`;
  const description = model.description.slice(0, 158);
  const url = `/models/${model.slug}`;
  const cta =
    model.kind === "image"
      ? "Generate images with " + model.name
      : model.kind === "video"
        ? "Create videos with " + model.name
        : "Chat with " + model.name;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: model.name,
    applicationCategory: "AIApplication",
    operatingSystem: "Web",
    description: model.description,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    provider: { "@type": "Organization", name: providerName(model.provider) },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "240" },
  };

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <section className="px-6 pt-16 pb-10 max-w-5xl mx-auto">
        <Link
          to="/models"
          className="text-sm text-muted-foreground hover:text-foreground transition"
        >
          ← All models
        </Link>
        <div className="mt-6 flex items-start gap-4 flex-wrap">
          <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {kindLabel}
              </span>
              {model.badge && (
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {model.badge}
                </span>
              )}
              {model.isNew && (
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-600">
                  New
                </span>
              )}
              {model.isPremium && (
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                  Premium
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{model.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">by {providerName(model.provider)}</p>
          </div>
        </div>
        <p className="mt-6 text-lg text-muted-foreground max-w-3xl">{model.description}</p>
        <div className="mt-6 flex gap-3 flex-wrap">
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              {cta} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/pricing">
            <Button size="lg" variant="outline">
              View pricing
            </Button>
          </Link>
        </div>
      </section>

      <section className="px-6 py-10 max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-bold mb-4">Capabilities</h2>
          <ul className="space-y-2">
            {model.capabilities.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-bold mb-4">Specs</h2>
          <dl className="space-y-2">
            {model.specs.length === 0 && (
              <p className="text-sm text-muted-foreground">No additional specs.</p>
            )}
            {model.specs.map((s) => (
              <div
                key={s.label}
                className="flex justify-between gap-3 text-sm border-b border-border/40 pb-2 last:border-0"
              >
                <dt className="text-muted-foreground">{s.label}</dt>
                <dd className="font-medium text-right">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="px-6 py-10 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Best for</h2>
        <div className="flex flex-wrap gap-2">
          {model.bestFor.map((b) => (
            <span key={b} className="px-4 py-2 rounded-full border bg-card text-sm">
              {b}
            </span>
          ))}
        </div>
      </section>

      <section className="px-6 py-10 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Why use {model.name} on Megsy AI?</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            Most users stitch together 4-5 separate subscriptions just to access the best AI models.
            Megsy AI puts {model.name} and 130+ other models behind one unified credit system — no
            API keys, no juggling.
          </p>
          <p>
            You get the same official endpoints as the provider, with built-in queueing, retries,
            and a chat-first interface that makes it easy to iterate. Whether you're generating one
            image or 1,000, the same workflow applies.
          </p>
          <p>
            Plus everything you create is private, exportable, and royalty-free for commercial use —
            terms vary per model provider, see the docs.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 max-w-3xl mx-auto text-center border-t">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Try {model.name} free</h2>
        <p className="text-muted-foreground mb-6">
          Free credits on signup. No credit card required.
        </p>
        <Link to="/auth">
          <Button size="lg" className="gap-2">
            Start free <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>
    </main>
  );
}
