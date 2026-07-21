/** @doc AI Model × Industry landing page (/models/:slug/for/:industry) — pairs each model with industry use-cases. */

import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import { Helmet } from "react-helmet-async";
import { Sparkles, Check, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { INDUSTRIES, getIndustry } from "@/data/programmaticSeo";
import { chatIdToSlug } from "./ModelsHubPage";

type ModelLite = {
  slug: string;
  name: string;
  provider: string;
  kind: "chat" | "image" | "video";
  description: string;
};

async function loadModelLite(slug: string): Promise<ModelLite | null> {
  if (slug.startsWith("image-")) {
    const inner = slug.slice(6);
    const { data } = await supabase
      .from("image_models")
      .select("slug,display_name,provider,description")
      .eq("slug", inner)
      .eq("is_active", true)
      .maybeSingle();
    if (!data) return null;
    return {
      slug,
      name: data.display_name,
      provider: data.provider,
      kind: "image",
      description: data.description ?? "",
    };
  }
  if (slug.startsWith("video-")) {
    const inner = slug.slice(6);
    const { data } = await supabase
      .from("video_models")
      .select("slug,display_name,provider,description")
      .eq("slug", inner)
      .eq("is_active", true)
      .maybeSingle();
    if (!data) return null;
    return {
      slug,
      name: data.display_name,
      provider: data.provider,
      kind: "video",
      description: data.description ?? "",
    };
  }
  if (slug.startsWith("chat-")) {
    const { data } = await supabase
      .from("model_pricing")
      .select("id,label,provider,kind")
      .eq("enabled", true);
    const found = (data as any[] | null)?.find((m) => chatIdToSlug(m.id) === slug);
    if (!found) return null;
    return {
      slug,
      name: found.label,
      provider: found.provider,
      kind: "chat",
      description: `${found.label} is a high-performance ${found.kind} model on Megsy AI.`,
    };
  }
  return null;
}

function kindAction(kind: ModelLite["kind"], industry: string) {
  if (kind === "image") return `Generate on-brand visuals for ${industry}`;
  if (kind === "video") return `Produce short marketing videos for ${industry}`;
  return `Draft copy, scripts and replies for ${industry}`;
}

export default function ModelForIndustryPage() {
  const { slug, industry: industrySlug } = useParams<{ slug: string; industry: string }>();
  const industry = industrySlug ? getIndustry(industrySlug) : undefined;
  const [model, setModel] = useState<ModelLite | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    loadModelLite(slug).then((m) => {
      if (cancelled) return;
      if (!m) setNotFound(true);
      else setModel(m);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!industry) return <Navigate to="/models" replace />;
  if (notFound) return <Navigate to={`/for/${industry.slug}`} replace />;
  if (loading || !model) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-background text-muted-foreground">
        Loading…
      </main>
    );
  }

  const title = `${model.name} for ${industry.name} — AI on Megsy`;
  const description = `Use ${model.name} to ${kindAction(model.kind, industry.name).toLowerCase()}. Real workflows, prompts and templates tailored for ${industry.name.toLowerCase()}.`;
  const url = `/models/${model.slug}/for/${industry.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Models", item: "/models" },
        { "@type": "ListItem", position: 2, name: model.name, item: `/models/${model.slug}` },
        { "@type": "ListItem", position: 3, name: industry.name, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: industry.faqs.slice(0, 4).map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  const relatedIndustries = INDUSTRIES.filter((i) => i.slug !== industry.slug).slice(0, 8);

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description.slice(0, 158)} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description.slice(0, 158)} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <section className="px-6 pt-16 pb-10 max-w-5xl mx-auto">
        <nav className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
          <Link to="/models" className="hover:text-foreground">
            Models
          </Link>
          <span>/</span>
          <Link to={`/models/${model.slug}`} className="hover:text-foreground">
            {model.name}
          </Link>
          <span>/</span>
          <span className="text-foreground">for {industry.name}</span>
        </nav>

        <div className="mt-6 flex items-start gap-4 flex-wrap">
          <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {industry.emoji} {industry.name}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-2">
              {model.name} for {industry.name}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-3xl">
              {kindAction(model.kind, industry.name)} using {model.name} — on Megsy AI.
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-3 flex-wrap">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
          >
            Try {model.name} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to={`/models/${model.slug}`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border hover:bg-muted transition"
          >
            Model details
          </Link>
        </div>
      </section>

      <section className="px-6 py-10 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">
          Why {industry.name} teams use {model.name}
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {industry.painPoints.slice(0, 6).map((p) => (
            <div key={p} className="flex gap-3 p-4 rounded-xl border border-border bg-card">
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">{p}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-10 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">What you can build</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {industry.features.slice(0, 6).map((f) => (
            <div key={f.title} className="p-5 rounded-xl border border-border bg-card">
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {industry.faqs.length > 0 && (
        <section className="px-6 py-10 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">FAQs</h2>
          <div className="space-y-3">
            {industry.faqs.slice(0, 6).map((f) => (
              <details key={f.q} className="p-5 rounded-xl border border-border bg-card">
                <summary className="font-medium cursor-pointer">{f.q}</summary>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <section className="px-6 py-10 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">{model.name} for other industries</h2>
        <div className="flex flex-wrap gap-2">
          {relatedIndustries.map((i) => (
            <Link
              key={i.slug}
              to={`/models/${model.slug}/for/${i.slug}`}
              className="text-sm px-3 py-1.5 rounded-full border border-border hover:bg-muted transition"
            >
              {i.emoji} {i.name}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
