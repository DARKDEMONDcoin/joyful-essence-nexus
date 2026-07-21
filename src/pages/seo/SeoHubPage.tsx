/** @doc Hub pages (/for, /compare, /templates) listing all programmatic SEO entries for crawl discovery. */
import { useLocation } from "react-router-dom";
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import { Helmet } from "react-helmet-async";
import { INDUSTRIES, COMPETITORS, TEMPLATE_CATEGORIES } from "@/data/programmaticSeo";

type HubType = "for" | "compare" | "templates";

const HUB_CONFIG: Record<HubType, { title: string; heading: string; description: string }> = {
  for: {
    title: "AI Website Builder by Industry — Megsy AI",
    heading: "Built for every industry",
    description:
      "Industry-specific AI website builder solutions — pick yours and launch in minutes.",
  },
  compare: {
    title: "Megsy AI vs Other Website Builders — Comparisons",
    heading: "Compare Megsy AI",
    description: "See how Megsy AI stacks up against Wix, Squarespace, Webflow, Framer, and more.",
  },
  templates: {
    title: "Free Website Templates — AI-Powered | Megsy AI",
    heading: "Browse template categories",
    description: "Beautiful, modern templates for every use case — customize with AI in minutes.",
  },
};

export default function SeoHubPage() {
  const location = useLocation();
  const type: HubType = location.pathname.startsWith("/compare")
    ? "compare"
    : location.pathname.startsWith("/templates")
      ? "templates"
      : "for";

  const cfg = HUB_CONFIG[type];

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <Helmet>
        <title>{cfg.title}</title>
        <meta name="description" content={cfg.description} />
        <link rel="canonical" href={`/${type}`} />
        <meta property="og:title" content={cfg.title} />
        <meta property="og:description" content={cfg.description} />
        <meta property="og:url" content={`/${type}`} />
        <meta property="og:type" content="website" />
      </Helmet>

      <section className="px-6 pt-20 pb-12 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">{cfg.heading}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{cfg.description}</p>
      </section>

      <section className="px-6 py-12 max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {type === "for" &&
            INDUSTRIES.map((i) => (
              <Link
                key={i.slug}
                to={`/for/${i.slug}`}
                className="rounded-xl border p-6 bg-card hover:shadow-lg hover:border-primary transition"
              >
                <div className="text-4xl mb-3">{i.emoji}</div>
                <h2 className="font-bold mb-1">{i.name}</h2>
                <p className="text-sm text-muted-foreground line-clamp-2">{i.subheadline}</p>
              </Link>
            ))}
          {type === "compare" &&
            COMPETITORS.map((c) => (
              <Link
                key={c.slug}
                to={`/compare/megsy-vs-${c.slug}`}
                className="rounded-xl border p-6 bg-card hover:shadow-lg hover:border-primary transition"
              >
                <h2 className="font-bold mb-1">Megsy AI vs {c.name}</h2>
                <p className="text-sm text-muted-foreground line-clamp-2">{c.tagline}</p>
              </Link>
            ))}
          {type === "templates" &&
            TEMPLATE_CATEGORIES.map((t) => (
              <Link
                key={t.slug}
                to={`/templates/${t.slug}`}
                className="rounded-xl border p-6 bg-card hover:shadow-lg hover:border-primary transition"
              >
                <div className="text-4xl mb-3">{t.emoji}</div>
                <h2 className="font-bold mb-1">{t.name}</h2>
                <p className="text-sm text-muted-foreground line-clamp-2">{t.description}</p>
              </Link>
            ))}
        </div>
      </section>
    </main>
  );
}
