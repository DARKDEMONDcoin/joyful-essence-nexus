/** @doc Cross-product SEO page (/solutions/:slug/for/:industry) — combines a use-case with an industry, e.g. "AI Website Builder for Restaurants". */
import { useParams, Navigate } from "react-router-dom";
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import { Helmet } from "react-helmet-async";
import { getUseCase, USE_CASES } from "@/data/useCases";
import { getIndustry, INDUSTRIES } from "@/data/programmaticSeo";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Sparkles } from "lucide-react";

export default function SolutionForIndustryPage() {
  const { slug, industry } = useParams<{ slug: string; industry: string }>();
  const useCase = slug ? getUseCase(slug) : undefined;
  const ind = industry ? getIndustry(industry) : undefined;
  if (!useCase) return <Navigate to="/solutions" replace />;
  if (!ind) return <Navigate to={`/solutions/${slug}`} replace />;

  // Tailored title: replace generic "AI X" → "AI X for <Industry>"
  const baseTitle = useCase.title.replace(/^AI /, "AI ");
  const title = `${baseTitle} for ${ind.name} — Megsy AI`;
  const url = `/solutions/${useCase.slug}/for/${ind.slug}`;
  const description =
    `${useCase.intent} — purpose-built for ${ind.name.toLowerCase()}. ${useCase.description}`.slice(
      0,
      300,
    );

  // Industry-tailored benefits (mix the two)
  const benefits = [
    ...useCase.benefits.slice(0, 2),
    `Built around ${ind.name.toLowerCase()} workflows`,
    ...ind.features.slice(0, 2).map((f) => f.title),
  ];

  const steps = [
    {
      title: "Describe your business",
      description: `Tell Megsy you're in ${ind.name.toLowerCase()} and what you need.`,
    },
    ...useCase.steps,
    {
      title: `Launch your ${ind.name.toLowerCase()} project`,
      description: "Publish on a custom domain, share with customers, iterate from real feedback.",
    },
  ];

  const faqs = [...useCase.faqs, ...ind.faqs.slice(0, 2).map((f) => ({ q: f.q, a: f.a }))];

  // Related: other industries with same use-case + same industry with other use-cases (build category)
  const sameUseCaseOtherIndustries = INDUSTRIES.filter((i) => i.slug !== ind.slug).slice(0, 10);
  const sameIndustryOtherTools = USE_CASES.filter(
    (u) => u.category === useCase.category && u.slug !== useCase.slug,
  ).slice(0, 10);

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
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Solutions", item: "/solutions" },
              {
                "@type": "ListItem",
                position: 2,
                name: useCase.title,
                item: `/solutions/${useCase.slug}`,
              },
              { "@type": "ListItem", position: 3, name: ind.name, item: url },
            ],
          })}
        </script>
      </Helmet>

      {/* Hero */}
      <section className="px-6 pt-20 pb-12 max-w-5xl mx-auto text-center">
        <div className="text-6xl mb-4">
          {useCase.emoji} <span aria-hidden>×</span> {ind.emoji}
        </div>
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-4">
          <Sparkles className="h-3 w-3" /> {useCase.title} • {ind.name}
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          {baseTitle} for {ind.name}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-3">
          {useCase.intent} — tailored for {ind.name.toLowerCase()}.
        </p>
        <p className="text-base text-muted-foreground max-w-3xl mx-auto mb-8">{ind.subheadline}</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              Start free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/pricing">
            <Button size="lg" variant="outline">
              View pricing
            </Button>
          </Link>
        </div>
      </section>

      {/* Pain points (industry) */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
          Common problems for {ind.name.toLowerCase()}
        </h2>
        <ul className="space-y-2 max-w-2xl mx-auto">
          {ind.painPoints.map((p, i) => (
            <li key={i} className="rounded-xl border p-4 bg-card text-sm flex gap-2 items-start">
              <span className="text-destructive">✕</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Benefits */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Why this combo works</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {benefits.map((b, i) => (
            <div key={i} className="rounded-xl border p-5 bg-card">
              <Check className="h-5 w-5 text-primary mb-2" />
              <p className="text-sm">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Industry features */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          Built for {ind.name.toLowerCase()}
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {ind.features.map((f, i) => (
            <div key={i} className="rounded-xl border p-5 bg-card">
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">How it works</h2>
        <ol className="space-y-4">
          {steps.map((s, i) => (
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

      {/* Examples */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-muted-foreground">Perfect for</h2>
        <div className="flex flex-wrap gap-2">
          {ind.examples.map((e) => (
            <span key={e} className="px-4 py-2 rounded-full border bg-card text-sm">
              {e}
            </span>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">FAQ</h2>
        <div className="space-y-4">
          {faqs.map((f, i) => (
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
      <section className="px-6 py-20 max-w-3xl mx-auto text-center border-t">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {baseTitle} for your {ind.name.toLowerCase().replace(/s$/, "")} business
        </h2>
        <p className="text-muted-foreground mb-8">
          Free credits on signup. No credit card required.
        </p>
        <Link to="/auth">
          <Button size="lg" className="gap-2">
            Get started free <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Related cross-pages */}
      <section className="px-6 py-12 max-w-5xl mx-auto border-t space-y-8">
        <div>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
            {baseTitle} for other industries
          </h2>
          <div className="flex flex-wrap gap-2">
            {sameUseCaseOtherIndustries.map((i) => (
              <Link
                key={i.slug}
                to={`/solutions/${useCase.slug}/for/${i.slug}`}
                className="text-sm px-3 py-1.5 rounded-full border hover:bg-accent"
              >
                {i.emoji} {i.name}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
            More AI tools for {ind.name.toLowerCase()}
          </h2>
          <div className="flex flex-wrap gap-2">
            {sameIndustryOtherTools.map((u) => (
              <Link
                key={u.slug}
                to={`/solutions/${u.slug}/for/${ind.slug}`}
                className="text-sm px-3 py-1.5 rounded-full border hover:bg-accent"
              >
                {u.emoji} {u.title}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
