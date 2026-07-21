/** @doc Programmatic SEO comparison page (/compare/megsy-vs-<competitor>). */
import { useParams, Navigate } from "react-router-dom";
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import { Helmet } from "react-helmet-async";
import { COMPETITORS, getCompetitor } from "@/data/programmaticSeo";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight } from "lucide-react";

export default function ComparePage() {
  const { competitor } = useParams<{ competitor: string }>();
  const data = competitor ? getCompetitor(competitor) : undefined;

  if (!data) return <Navigate to="/compare" replace />;

  const title = `Megsy AI vs ${data.name} — Which AI Website Builder Wins?`;
  const description = `Detailed comparison of Megsy AI and ${data.name}. ${data.tagline}. See features, pricing, and which is better for your project.`;
  const url = `/compare/megsy-vs-${data.slug}`;

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
      </Helmet>

      {/* Hero */}
      <section className="px-6 pt-20 pb-12 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          Megsy AI <span className="text-muted-foreground">vs</span> {data.name}
        </h1>
        <p className="text-lg text-muted-foreground mb-8">{data.tagline}</p>
        <Link to="/auth">
          <Button size="lg" className="gap-2">
            Try Megsy AI free <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Comparison table */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
          Feature-by-feature comparison
        </h2>
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm md:text-base">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-semibold">Feature</th>
                <th className="text-left p-4 font-semibold text-primary">Megsy AI</th>
                <th className="text-left p-4 font-semibold">{data.name}</th>
              </tr>
            </thead>
            <tbody>
              {data.comparison.map((row, i) => (
                <tr key={i} className="border-t">
                  <td className="p-4 font-medium">{row.feature}</td>
                  <td className="p-4 text-primary">{row.megsy}</td>
                  <td className="p-4 text-muted-foreground">{row.them}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Strengths grid */}
      <section className="px-6 py-12 max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border p-6 bg-card">
          <h3 className="font-bold text-lg mb-4 text-primary">Where Megsy AI wins</h3>
          <ul className="space-y-3">
            {data.ourStrengths.map((s, i) => (
              <li key={i} className="flex gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border p-6 bg-card">
          <h3 className="font-bold text-lg mb-4">Where {data.name} wins</h3>
          <ul className="space-y-3">
            {data.theirStrengths.map((s, i) => (
              <li key={i} className="flex gap-2">
                <Check className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Verdict */}
      <section className="px-6 py-12 max-w-3xl mx-auto">
        <div className="rounded-xl border-2 border-primary/30 p-8 bg-primary/5">
          <h2 className="text-xl font-bold mb-3">Our verdict</h2>
          <p className="text-lg leading-relaxed">{data.verdict}</p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Try Megsy AI yourself</h2>
        <p className="text-muted-foreground mb-8">Free to start. No credit card required.</p>
        <Link to="/auth">
          <Button size="lg" className="gap-2">
            Start free <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Related */}
      <section className="px-6 py-12 max-w-5xl mx-auto border-t">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
          Other comparisons
        </h2>
        <div className="flex flex-wrap gap-2">
          {COMPETITORS.filter((c) => c.slug !== data.slug).map((c) => (
            <Link
              key={c.slug}
              to={`/compare/megsy-vs-${c.slug}`}
              className="text-sm px-3 py-1.5 rounded-full border hover:bg-accent"
            >
              Megsy vs {c.name}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
