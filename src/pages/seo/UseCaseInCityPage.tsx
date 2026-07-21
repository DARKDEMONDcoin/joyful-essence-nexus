/** @doc Use-case × City programmatic SEO page (/solutions/:slug/in/:city and /tools/:slug/in/:city). */
import { useParams, Navigate } from "react-router-dom";
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import { Helmet } from "react-helmet-async";
import { USE_CASES } from "@/data/useCases";
import { CITIES, getCity } from "@/data/cities";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, MapPin } from "lucide-react";

export default function UseCaseInCityPage() {
  const { slug, city } = useParams<{ slug: string; city: string }>();
  const uc = USE_CASES.find((u) => u.slug === slug);
  const loc = city ? getCity(city) : undefined;
  if (!uc) return <Navigate to="/solutions" replace />;
  if (!loc) return <Navigate to={`/solutions/${slug}`} replace />;

  const title = `${uc.title} in ${loc.name} — Megsy AI`;
  const url = `/solutions/${uc.slug}/in/${loc.slug}`;
  const description =
    `${uc.intent}. Built for teams and creators in ${loc.name}, ${loc.country}.`.slice(0, 280);

  const sameUseCase = CITIES.filter((c) => c.slug !== loc.slug).slice(0, 16);
  const sameCity = USE_CASES.filter((u) => u.slug !== uc.slug).slice(0, 12);
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
            serviceType: uc.title,
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
              { "@type": "ListItem", position: 1, name: "Solutions", item: "/solutions" },
              { "@type": "ListItem", position: 2, name: uc.title, item: `/solutions/${uc.slug}` },
              { "@type": "ListItem", position: 3, name: loc.name, item: url },
            ],
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: uc.faqs.slice(0, 4).map((f) => ({
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
        <div className="text-5xl mb-3">{uc.emoji}</div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          {uc.title} in {loc.name}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-2">{uc.intent}</p>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto mb-8">
          Optimized for {loc.name}'s {loc.flavor}.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              Start free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to={`/solutions/${uc.slug}`}>
            <Button size="lg" variant="outline">
              About {uc.title}
            </Button>
          </Link>
        </div>
      </section>

      <section className="px-6 py-12 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">What it does</h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-8">{uc.description}</p>
        <div className="grid md:grid-cols-2 gap-4">
          {uc.benefits.map((b, i) => (
            <div key={i} className="rounded-xl border p-5 bg-card flex gap-2 items-start">
              <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm">{b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-12 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">How it works</h2>
        <ol className="space-y-4">
          {uc.steps.map((s, i) => (
            <li key={i} className="rounded-xl border p-5 bg-card flex gap-4">
              <span className="text-2xl font-bold text-primary shrink-0">{i + 1}</span>
              <div>
                <div className="font-semibold mb-1">{s.title}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="px-6 py-12 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">
          FAQs — {uc.title} in {loc.name}
        </h2>
        <div className="space-y-4">
          {uc.faqs.map((f, i) => (
            <details key={i} className="rounded-xl border p-4 bg-card group">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="text-sm text-muted-foreground mt-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 max-w-3xl mx-auto text-center border-t">
        <h2 className="text-3xl font-bold mb-4">Launch in {loc.name} today</h2>
        <Link to="/auth">
          <Button size="lg" className="gap-2">
            Build with AI <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      <section className="px-6 py-10 max-w-5xl mx-auto border-t space-y-6">
        <div>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
            {uc.title} in other cities
          </h2>
          <div className="flex flex-wrap gap-2">
            {sameUseCase.map((c) => (
              <Link
                key={c.slug}
                to={`/solutions/${uc.slug}/in/${c.slug}`}
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
              More cities in {loc.region}
            </h2>
            <div className="flex flex-wrap gap-2">
              {sameRegion.map((c) => (
                <Link
                  key={c.slug}
                  to={`/solutions/${uc.slug}/in/${c.slug}`}
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
            Other AI tools in {loc.name}
          </h2>
          <div className="flex flex-wrap gap-2">
            {sameCity.map((u) => (
              <Link
                key={u.slug}
                to={`/solutions/${u.slug}/in/${loc.slug}`}
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
