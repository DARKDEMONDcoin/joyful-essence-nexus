/** @doc Industry × City programmatic SEO page (/for/:industry/in/:city) — e.g. "AI Website Builder for Restaurants in Dubai". */
import { useParams, Navigate } from "react-router-dom";
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import { Helmet } from "react-helmet-async";
import { getIndustry, INDUSTRIES } from "@/data/programmaticSeo";
import { getCity, CITIES } from "@/data/cities";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, MapPin } from "lucide-react";

export default function IndustryInCityPage() {
  const { industry, city } = useParams<{ industry: string; city: string }>();
  const ind = industry ? getIndustry(industry) : undefined;
  const loc = city ? getCity(city) : undefined;
  if (!ind) return <Navigate to="/for" replace />;
  if (!loc) return <Navigate to={`/for/${industry}`} replace />;

  const title = `AI Website Builder for ${ind.name} in ${loc.name} — Megsy AI`;
  const url = `/for/${ind.slug}/in/${loc.slug}`;
  const description =
    `Build a modern ${ind.name.toLowerCase()} website tailored for ${loc.name}, ${loc.country}. ${ind.subheadline}`.slice(
      0,
      280,
    );

  const sameCity = INDUSTRIES.filter((i) => i.slug !== ind.slug).slice(0, 12);
  const sameIndustry = CITIES.filter((c) => c.slug !== loc.slug).slice(0, 16);
  const sameRegion = CITIES.filter((c) => c.region === loc.region && c.slug !== loc.slug).slice(
    0,
    8,
  );

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
            "@type": "Service",
            name: title,
            areaServed: {
              "@type": "City",
              name: loc.name,
              address: { "@type": "PostalAddress", addressCountry: loc.countryCode },
            },
            provider: { "@type": "Organization", name: "Megsy AI" },
            description,
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Industries", item: "/for" },
              { "@type": "ListItem", position: 2, name: ind.name, item: `/for/${ind.slug}` },
              { "@type": "ListItem", position: 3, name: loc.name, item: url },
            ],
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: ind.faqs.slice(0, 4).map((f) => ({
              "@type": "Question",
              name: `${f.q} (${loc.name})`,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          })}
        </script>
      </Helmet>

      <section className="px-6 pt-20 pb-10 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <MapPin className="h-4 w-4" /> {loc.name}, {loc.country}
        </div>
        <div className="text-5xl mb-3">{ind.emoji}</div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          AI Website Builder for {ind.name} in {loc.name}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-2">{ind.subheadline}</p>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto mb-8">
          Built for {loc.name}'s {loc.flavor}.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              Start free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to={`/for/${ind.slug}`}>
            <Button size="lg" variant="outline">
              All {ind.name} sites
            </Button>
          </Link>
        </div>
      </section>

      <section className="px-6 py-12 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Why {ind.name.toLowerCase()} in {loc.name} choose Megsy
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {ind.painPoints.map((p, i) => (
            <div key={i} className="rounded-xl border p-5 bg-card">
              <div className="text-sm text-muted-foreground mb-1">Common problem</div>
              <p className="font-medium">{p}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-12 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">What you get</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {ind.features.map((f) => (
            <div key={f.title} className="rounded-xl border p-5 bg-card">
              <div className="flex gap-2 items-start">
                <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold mb-1">{f.title}</div>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-12 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">
          Local examples — {ind.name} in {loc.name}
        </h2>
        <div className="flex flex-wrap gap-2">
          {ind.examples.map((e) => (
            <span key={e} className="px-4 py-2 rounded-full border bg-card text-sm">
              {e} · {loc.name}
            </span>
          ))}
        </div>
      </section>

      <section className="px-6 py-12 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">FAQs for {loc.name}</h2>
        <div className="space-y-4">
          {ind.faqs.map((f, i) => (
            <details key={i} className="rounded-xl border p-4 bg-card group">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="text-sm text-muted-foreground mt-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 max-w-3xl mx-auto text-center border-t">
        <h2 className="text-3xl font-bold mb-4">
          Launch your {ind.name.toLowerCase()} site in {loc.name}
        </h2>
        <Link to="/auth">
          <Button size="lg" className="gap-2">
            Build with AI <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      <section className="px-6 py-10 max-w-5xl mx-auto border-t space-y-6">
        <div>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
            {ind.name} in other cities
          </h2>
          <div className="flex flex-wrap gap-2">
            {sameIndustry.map((c) => (
              <Link
                key={c.slug}
                to={`/for/${ind.slug}/in/${c.slug}`}
                className="text-sm px-3 py-1.5 rounded-full border hover:bg-accent"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
        {sameRegion.length > 0 && (
          <div>
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
              Other cities in {loc.region}
            </h2>
            <div className="flex flex-wrap gap-2">
              {sameRegion.map((c) => (
                <Link
                  key={c.slug}
                  to={`/for/${ind.slug}/in/${c.slug}`}
                  className="text-sm px-3 py-1.5 rounded-full border hover:bg-accent"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}
        <div>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
            Other industries in {loc.name}
          </h2>
          <div className="flex flex-wrap gap-2">
            {sameCity.map((i) => (
              <Link
                key={i.slug}
                to={`/for/${i.slug}/in/${loc.slug}`}
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
