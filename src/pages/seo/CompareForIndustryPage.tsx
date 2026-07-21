/** @doc Cross-product compare page (/compare/megsy-vs-:competitor/for/:industry) — e.g. "Megsy vs Wix for Restaurants". */
import { useParams, Navigate } from "react-router-dom";
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import { Helmet } from "react-helmet-async";
import { getCompetitor, getIndustry, COMPETITORS, INDUSTRIES } from "@/data/programmaticSeo";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, X } from "lucide-react";

export default function CompareForIndustryPage() {
  const { competitor, industry } = useParams<{ competitor: string; industry: string }>();
  const comp = competitor ? getCompetitor(competitor) : undefined;
  const ind = industry ? getIndustry(industry) : undefined;
  if (!comp) return <Navigate to="/compare" replace />;
  if (!ind) return <Navigate to={`/compare/megsy-vs-${competitor}`} replace />;

  const title = `Megsy AI vs ${comp.name} for ${ind.name} — Megsy AI`;
  const url = `/compare/megsy-vs-${comp.slug}/for/${ind.slug}`;
  const description =
    `Megsy AI vs ${comp.name} compared for ${ind.name.toLowerCase()}. ${comp.verdict}`.slice(
      0,
      280,
    );
  const others = COMPETITORS.filter((c) => c.slug !== comp.slug).slice(0, 10);
  const otherInds = INDUSTRIES.filter((i) => i.slug !== ind.slug).slice(0, 10);

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
              { "@type": "ListItem", position: 1, name: "Compare", item: "/compare" },
              {
                "@type": "ListItem",
                position: 2,
                name: `Megsy vs ${comp.name}`,
                item: `/compare/megsy-vs-${comp.slug}`,
              },
              { "@type": "ListItem", position: 3, name: ind.name, item: url },
            ],
          })}
        </script>
      </Helmet>

      <section className="px-6 pt-20 pb-10 max-w-5xl mx-auto text-center">
        <div className="text-5xl mb-3">⚖️ {ind.emoji}</div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          Megsy AI vs {comp.name}
        </h1>
        <p className="text-xl text-muted-foreground mb-2">for {ind.name}</p>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto mb-8">
          {comp.tagline} — but how do they stack up for {ind.name.toLowerCase()}?
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              Try Megsy free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to={`/for/${ind.slug}`}>
            <Button size="lg" variant="outline">
              Megsy for {ind.name}
            </Button>
          </Link>
        </div>
      </section>

      <section className="px-6 py-10 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">What {ind.name.toLowerCase()} need</h2>
        <ul className="grid md:grid-cols-2 gap-3 max-w-3xl mx-auto">
          {ind.painPoints.map((p, i) => (
            <li key={i} className="rounded-xl border p-4 bg-card text-sm">
              ⚡ {p}
            </li>
          ))}
        </ul>
      </section>

      <section className="px-6 py-10 max-w-5xl mx-auto">
        <div className="overflow-x-auto">
          <table className="w-full border rounded-xl bg-card text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left p-4">Feature</th>
                <th className="text-left p-4 text-primary">Megsy AI</th>
                <th className="text-left p-4 text-muted-foreground">{comp.name}</th>
              </tr>
            </thead>
            <tbody>
              {comp.comparison.map((row, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="p-4 font-medium">{row.feature}</td>
                  <td className="p-4">{row.megsy}</td>
                  <td className="p-4 text-muted-foreground">{row.them}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="px-6 py-10 max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border p-6 bg-card">
          <h3 className="font-bold mb-3 text-primary">
            Why Megsy AI wins for {ind.name.toLowerCase()}
          </h3>
          <ul className="space-y-2">
            {comp.ourStrengths.map((s) => (
              <li key={s} className="flex gap-2 text-sm">
                <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                {s}
              </li>
            ))}
            {ind.features.slice(0, 2).map((f) => (
              <li key={f.title} className="flex gap-2 text-sm">
                <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                {f.title} — built for {ind.name.toLowerCase()}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border p-6 bg-card">
          <h3 className="font-bold mb-3">Where {comp.name} still has an edge</h3>
          <ul className="space-y-2">
            {comp.theirStrengths.map((s) => (
              <li key={s} className="flex gap-2 text-sm text-muted-foreground">
                <X className="h-4 w-4 mt-0.5 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-6 py-10 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-3">The verdict for {ind.name.toLowerCase()}</h2>
        <p className="text-muted-foreground">{comp.verdict}</p>
      </section>

      <section className="px-6 py-16 max-w-3xl mx-auto text-center border-t">
        <h2 className="text-3xl font-bold mb-4">Start your {ind.name.toLowerCase()} site free</h2>
        <Link to="/auth">
          <Button size="lg" className="gap-2">
            Try Megsy AI <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      <section className="px-6 py-10 max-w-5xl mx-auto border-t space-y-6">
        <div>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
            Compare Megsy to other tools for {ind.name.toLowerCase()}
          </h2>
          <div className="flex flex-wrap gap-2">
            {others.map((c) => (
              <Link
                key={c.slug}
                to={`/compare/megsy-vs-${c.slug}/for/${ind.slug}`}
                className="text-sm px-3 py-1.5 rounded-full border hover:bg-accent"
              >
                vs {c.name}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
            Megsy vs {comp.name} for other industries
          </h2>
          <div className="flex flex-wrap gap-2">
            {otherInds.map((i) => (
              <Link
                key={i.slug}
                to={`/compare/megsy-vs-${comp.slug}/for/${i.slug}`}
                className="text-sm px-3 py-1.5 rounded-full border hover:bg-accent"
              >
                {i.emoji} {i.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
