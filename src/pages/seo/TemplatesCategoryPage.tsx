/** @doc Programmatic SEO templates category page (/templates/<category>). */
import { useParams, Navigate } from "react-router-dom";
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import { Helmet } from "react-helmet-async";
import { TEMPLATE_CATEGORIES, getTemplateCategory } from "@/data/programmaticSeo";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function TemplatesCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const data = category ? getTemplateCategory(category) : undefined;

  if (!data) return <Navigate to="/templates" replace />;

  const title = `${data.name} — Free AI-Generated Templates | Megsy AI`;
  const description = `${data.description} Browse ${data.templates.length}+ ${data.name.toLowerCase()} you can customize with AI in minutes.`;
  const url = `/templates/${data.slug}`;

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
      </Helmet>

      <section className="px-6 pt-20 pb-10 max-w-5xl mx-auto text-center">
        <div className="text-6xl mb-4">{data.emoji}</div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">{data.name}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">{data.description}</p>
        <Link to="/auth">
          <Button size="lg" className="gap-2">
            Build with AI <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Templates grid */}
      <section className="px-6 py-12 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.templates.map((t, i) => (
            <div key={i} className="rounded-xl border p-6 bg-card hover:shadow-lg transition">
              <h3 className="font-bold text-lg mb-2">{t.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t.description}</p>
              <div className="flex gap-2 flex-wrap mb-4">
                {t.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 rounded bg-muted">
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                to="/auth"
                className="text-sm text-primary font-medium inline-flex items-center gap-1"
              >
                Use this template <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-muted-foreground">Common use cases</h2>
        <div className="flex flex-wrap gap-2">
          {data.useCases.map((u) => (
            <span key={u} className="px-4 py-2 rounded-full border bg-card text-sm">
              {u}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Don't see what you need?</h2>
        <p className="text-muted-foreground mb-8">
          Describe your idea — Megsy AI builds a custom template in seconds.
        </p>
        <Link to="/auth">
          <Button size="lg" className="gap-2">
            Generate custom template <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Related */}
      <section className="px-6 py-12 max-w-5xl mx-auto border-t">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
          Other categories
        </h2>
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_CATEGORIES.filter((t) => t.slug !== data.slug).map((t) => (
            <Link
              key={t.slug}
              to={`/templates/${t.slug}`}
              className="text-sm px-3 py-1.5 rounded-full border hover:bg-accent"
            >
              {t.emoji} {t.name}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
