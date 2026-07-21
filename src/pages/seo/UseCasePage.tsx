/** @doc Use-case landing page (/solutions/<slug>) — programmatic SEO for "AI X" queries. */
import { useParams, Navigate } from "react-router-dom";
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import { Helmet } from "react-helmet-async";
import { USE_CASES, getUseCase, USE_CASE_CATEGORIES } from "@/data/useCases";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Sparkles } from "lucide-react";

export default function UseCasePage() {
  const { slug } = useParams<{ slug: string }>();
  const data = slug ? getUseCase(slug) : undefined;
  if (!data) return <Navigate to="/solutions" replace />;

  const title = `${data.title} — Megsy AI`;
  const description = data.description;
  const url = `/solutions/${data.slug}`;
  const category = USE_CASE_CATEGORIES[data.category];

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
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: data.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: data.title,
            description: data.description,
            step: data.steps.map((s, i) => ({
              "@type": "HowToStep",
              position: i + 1,
              name: s.title,
              text: s.description,
            })),
          })}
        </script>
      </Helmet>

      {/* Hero */}
      <section className="px-6 pt-20 pb-12 max-w-5xl mx-auto text-center">
        <div className="text-6xl mb-4">{data.emoji}</div>
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-4">
          <Sparkles className="h-3 w-3" /> {category}
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">{data.title}</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-3">
          {data.intent}
        </p>
        <p className="text-base text-muted-foreground max-w-3xl mx-auto mb-8">{data.description}</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              Try it free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/pricing">
            <Button size="lg" variant="outline">
              View pricing
            </Button>
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Why Megsy AI</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {data.benefits.map((b, i) => (
            <div key={i} className="rounded-xl border p-5 bg-card">
              <Check className="h-5 w-5 text-primary mb-2" />
              <p className="text-sm">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">How it works</h2>
        <ol className="space-y-4">
          {data.steps.map((s, i) => (
            <li key={i} className="rounded-xl border p-5 bg-card flex gap-4 items-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                {i + 1}
              </div>
              <div>
                <h3 className="font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQs */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">FAQ</h2>
        <div className="space-y-4">
          {data.faqs.map((f, i) => (
            <details key={i} className="rounded-xl border p-5 bg-card group">
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                {f.q}
                <span className="text-muted-foreground group-open:rotate-180 transition">▾</span>
              </summary>
              <p className="mt-3 text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to try {data.title}?</h2>
        <p className="text-muted-foreground mb-8">No credit card required.</p>
        <Link to="/auth">
          <Button size="lg" className="gap-2">
            Get started free <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Related */}
      <section className="px-6 py-12 max-w-5xl mx-auto border-t">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
          More AI tools
        </h2>
        <div className="flex flex-wrap gap-2">
          {USE_CASES.filter((u) => u.slug !== data.slug)
            .slice(0, 24)
            .map((u) => (
              <Link
                key={u.slug}
                to={`/solutions/${u.slug}`}
                className="text-sm px-3 py-1.5 rounded-full border hover:bg-accent"
              >
                {u.emoji} {u.title}
              </Link>
            ))}
        </div>
      </section>
    </main>
  );
}
