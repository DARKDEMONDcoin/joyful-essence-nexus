/** @doc Cross-product templates page (/templates/:category/for/:industry) — e.g. "Landing Page Templates for Real Estate". */
import { useParams, Navigate } from "react-router-dom";
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import { Helmet } from "react-helmet-async";
import {
  getTemplateCategory,
  getIndustry,
  TEMPLATE_CATEGORIES,
  INDUSTRIES,
} from "@/data/programmaticSeo";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function TemplateForIndustryPage() {
  const { category, industry } = useParams<{ category: string; industry: string }>();
  const cat = category ? getTemplateCategory(category) : undefined;
  const ind = industry ? getIndustry(industry) : undefined;
  if (!cat) return <Navigate to="/templates" replace />;
  if (!ind) return <Navigate to={`/templates/${category}`} replace />;

  const title = `${cat.name} for ${ind.name} — Megsy AI`;
  const url = `/templates/${cat.slug}/for/${ind.slug}`;
  const description =
    `${cat.description} Tailored for ${ind.name.toLowerCase()} — built with AI, ready to launch.`.slice(
      0,
      280,
    );

  const others = INDUSTRIES.filter((i) => i.slug !== ind.slug).slice(0, 12);
  const otherCats = TEMPLATE_CATEGORIES.filter((c) => c.slug !== cat.slug).slice(0, 10);

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
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Templates", item: "/templates" },
              { "@type": "ListItem", position: 2, name: cat.name, item: `/templates/${cat.slug}` },
              { "@type": "ListItem", position: 3, name: ind.name, item: url },
            ],
          })}
        </script>
      </Helmet>

      <section className="px-6 pt-20 pb-10 max-w-5xl mx-auto text-center">
        <div className="text-6xl mb-4">
          {cat.emoji} <span aria-hidden>×</span> {ind.emoji}
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          {cat.name} for {ind.name}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          {cat.description} Designed for {ind.name.toLowerCase()} — customize with AI in minutes.
        </p>
        <Link to="/auth">
          <Button size="lg" className="gap-2">
            Build with AI <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      <section className="px-6 py-12 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cat.templates.map((t, i) => (
            <div key={i} className="rounded-xl border p-6 bg-card hover:shadow-lg transition">
              <h3 className="font-bold text-lg mb-2">
                {t.title} — for {ind.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t.description} Pre-tuned for {ind.name.toLowerCase()} workflows.
              </p>
              <div className="flex gap-2 flex-wrap mb-4">
                {t.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 rounded bg-muted">
                    {tag}
                  </span>
                ))}
                <span className="text-xs px-2 py-1 rounded bg-muted">{ind.name}</span>
              </div>
              <Link
                to="/auth"
                className="text-sm text-primary font-medium inline-flex items-center gap-1"
              >
                Use template <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-12 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Built around {ind.name.toLowerCase()}</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {ind.features.map((f) => (
            <div key={f.title} className="rounded-xl border p-4 bg-card">
              <div className="font-medium text-sm mb-1">{f.title}</div>
              <p className="text-xs text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-12 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-muted-foreground">Common use cases</h2>
        <div className="flex flex-wrap gap-2">
          {[...cat.useCases, ...ind.examples].map((u) => (
            <span key={u} className="px-4 py-2 rounded-full border bg-card text-sm">
              {u}
            </span>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 max-w-3xl mx-auto text-center border-t">
        <h2 className="text-3xl font-bold mb-4">Launch your {ind.name.toLowerCase()} site today</h2>
        <Link to="/auth">
          <Button size="lg" className="gap-2">
            Generate now <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      <section className="px-6 py-10 max-w-5xl mx-auto border-t space-y-6">
        <div>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
            {cat.name} for other industries
          </h2>
          <div className="flex flex-wrap gap-2">
            {others.map((i) => (
              <Link
                key={i.slug}
                to={`/templates/${cat.slug}/for/${i.slug}`}
                className="text-sm px-3 py-1.5 rounded-full border hover:bg-accent"
              >
                {i.emoji} {i.name}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
            Other templates for {ind.name.toLowerCase()}
          </h2>
          <div className="flex flex-wrap gap-2">
            {otherCats.map((c) => (
              <Link
                key={c.slug}
                to={`/templates/${c.slug}/for/${ind.slug}`}
                className="text-sm px-3 py-1.5 rounded-full border hover:bg-accent"
              >
                {c.emoji} {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
