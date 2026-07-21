/** @doc Hub for all AI use-case landing pages (/solutions). */
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import { Helmet } from "react-helmet-async";
import { USE_CASES, USE_CASE_CATEGORIES } from "@/data/useCases";

export default function SolutionsHubPage() {
  const grouped = Object.entries(USE_CASE_CATEGORIES).map(([key, label]) => ({
    key,
    label,
    items: USE_CASES.filter((u) => u.category === key),
  }));

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <Helmet>
        <title>AI Tools & Solutions — Megsy AI</title>
        <meta
          name="description"
          content="Every AI tool from Megsy AI: website builders, image generators, video, code, marketing, and more."
        />
        <link rel="canonical" href="/solutions" />
        <meta property="og:title" content="AI Tools & Solutions — Megsy AI" />
        <meta property="og:url" content="/solutions" />
        <meta property="og:type" content="website" />
      </Helmet>

      <section className="px-6 pt-20 pb-12 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          All AI Tools by Megsy
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {USE_CASES.length}+ AI tools in one platform. Pick a use case and start free.
        </p>
      </section>

      <section className="px-6 pb-20 max-w-6xl mx-auto space-y-12">
        {grouped.map((g) => (
          <div key={g.key}>
            <h2 className="text-2xl font-bold mb-4">{g.label}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {g.items.map((u) => (
                <Link
                  key={u.slug}
                  to={`/solutions/${u.slug}`}
                  className="rounded-xl border p-5 bg-card hover:bg-accent transition"
                >
                  <div className="text-3xl mb-2">{u.emoji}</div>
                  <h3 className="font-semibold mb-1">{u.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{u.intent}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
