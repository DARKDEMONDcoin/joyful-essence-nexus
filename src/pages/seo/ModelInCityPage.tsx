/** @doc AI Model × City landing page (/models/:slug/in/:city) — local SEO landing per model. */

import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import { Helmet } from "react-helmet-async";
import { Sparkles, MapPin, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CITIES, getCity } from "@/data/cities";
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
    const { data } = await supabase
      .from("image_models")
      .select("slug,display_name,provider,description")
      .eq("slug", slug.slice(6))
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
    const { data } = await supabase
      .from("video_models")
      .select("slug,display_name,provider,description")
      .eq("slug", slug.slice(6))
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
      description: `${found.label} on Megsy AI.`,
    };
  }
  return null;
}

function kindAction(kind: ModelLite["kind"], city: string) {
  if (kind === "image") return `Generate localized visuals for businesses in ${city}`;
  if (kind === "video") return `Produce short-form video content for the ${city} market`;
  return `Draft copy, ads and replies tuned for ${city} customers`;
}

export default function ModelInCityPage() {
  const { slug, city: citySlug } = useParams<{ slug: string; city: string }>();
  const city = citySlug ? getCity(citySlug) : undefined;
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

  if (!city) return <Navigate to="/models" replace />;
  if (notFound) return <Navigate to="/models" replace />;
  if (loading || !model)
    return (
      <main className="min-h-dvh flex items-center justify-center bg-background text-muted-foreground">
        Loading…
      </main>
    );

  const title = `${model.name} in ${city.name} — AI on Megsy`;
  const description = `Use ${model.name} to ${kindAction(model.kind, city.name).toLowerCase()}. Built for ${city.flavor}.`;
  const url = `/models/${model.slug}/in/${city.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Models", item: "/models" },
        { "@type": "ListItem", position: 2, name: model.name, item: `/models/${model.slug}` },
        { "@type": "ListItem", position: 3, name: city.name, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `${model.name} for ${city.name}`,
      areaServed: {
        "@type": "City",
        name: city.name,
        address: { "@type": "PostalAddress", addressCountry: city.countryCode },
      },
      provider: { "@type": "Organization", name: "Megsy AI" },
    },
  ];

  const relatedCities = CITIES.filter(
    (c) => c.region === city.region && c.slug !== city.slug,
  ).slice(0, 8);

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
          <span className="text-foreground">in {city.name}</span>
        </nav>

        <div className="mt-6 flex items-start gap-4 flex-wrap">
          <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {city.name}, {city.country}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-2">
              {model.name} in {city.name}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-3xl">
              {kindAction(model.kind, city.name)} — tailored for {city.flavor}.
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
        <h2 className="text-2xl font-bold mb-4">
          Why {city.name} teams pick {model.name}
        </h2>
        <p className="text-muted-foreground max-w-3xl">
          {city.name} is a {city.flavor}. {model.name} adapts tone, pacing and visuals to that
          audience — whether you're a local shop, an agency, or a fast-growing startup serving the{" "}
          {city.region} market.
        </p>
      </section>

      <section className="px-6 py-10 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">{model.name} in nearby cities</h2>
        <div className="flex flex-wrap gap-2">
          {relatedCities.map((c) => (
            <Link
              key={c.slug}
              to={`/models/${model.slug}/in/${c.slug}`}
              className="text-sm px-3 py-1.5 rounded-full border border-border hover:bg-muted transition"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
