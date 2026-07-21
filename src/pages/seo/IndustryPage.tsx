/** @doc Programmatic SEO industry page (/for/<industry>) — AI website builder by vertical. */
import { useParams, Navigate } from "react-router-dom";
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import { Helmet } from "react-helmet-async";
import { INDUSTRIES, getIndustry } from "@/data/programmaticSeo";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

export default function IndustryPage() {
  const { industry } = useParams<{ industry: string }>();
  const data = industry ? getIndustry(industry) : undefined;

  if (!data) return <Navigate to="/for" replace />;

  const title = `${data.headline} — Megsy AI`;
  const description = data.subheadline;
  const url = `/for/${data.slug}`;

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
      </Helmet>

      {/* Hero */}
      <section className="px-6 pt-20 pb-12 max-w-5xl mx-auto text-center">
        <div className="text-6xl mb-4">{data.emoji}</div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">{data.headline}</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          {data.subheadline}
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              Build your site free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/pricing">
            <Button size="lg" variant="outline">
              View pricing
            </Button>
          </Link>
        </div>
      </section>

      {/* Pain points */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          Common challenges we solve
        </h2>
        <ul className="grid md:grid-cols-2 gap-4">
          {data.painPoints.map((p, i) => (
            <li key={i} className="rounded-xl border p-5 bg-card">
              <span className="text-destructive font-semibold mr-2">✗</span>
              {p}
            </li>
          ))}
        </ul>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          Built for {data.name.toLowerCase()}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {data.features.map((f, i) => (
            <div key={i} className="rounded-xl border p-6 bg-card">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Examples */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-center text-muted-foreground">
          Perfect for
        </h2>
        <div className="flex gap-2 flex-wrap justify-center">
          {data.examples.map((e) => (
            <span key={e} className="px-4 py-2 rounded-full border bg-card text-sm">
              {e}
            </span>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          Frequently asked questions
        </h2>
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
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to launch your {data.name.toLowerCase()} site?
        </h2>
        <p className="text-muted-foreground mb-8">
          Build it in minutes with AI. No credit card required.
        </p>
        <Link to="/auth">
          <Button size="lg" className="gap-2">
            Start building free <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Related */}
      <section className="px-6 py-12 max-w-5xl mx-auto border-t">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
          Other industries
        </h2>
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.filter((i) => i.slug !== data.slug).map((i) => (
            <Link
              key={i.slug}
              to={`/for/${i.slug}`}
              className="text-sm px-3 py-1.5 rounded-full border hover:bg-accent"
            >
              {i.emoji} {i.name}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
