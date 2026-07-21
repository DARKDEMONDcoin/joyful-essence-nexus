/** @doc Renders a single blog post by slug with TOC and translations. */
import { useParams, Navigate } from "react-router-dom";
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import LandingNavbar from "@/components/landing/LandingNavbar";
import { lazy, Suspense } from "react";
import { LazyOnVisible } from "@/components/common/LazyOnVisible";
const LandingFooter = lazy(() => import("@/components/landing/LandingFooter"));
import SEOHead from "@/components/common/SEOHead";
import { getBlogPost, BLOG_POSTS } from "@/data/blogPosts";
import { supabase } from "@/integrations/supabase/client";
import { BLOG_LANGS, blogPath, getLang } from "@/data/blogLangs";

type DbPost = {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  content_md: string;
  hero_image_url: string | null;
  keywords: string[] | null;
  category: string | null;
  reading_minutes: number | null;
  published_at: string | null;
  author_name: string | null;
  language: string | null;
  translation_group_id: string | null;
  faq: { q: string; a: string }[] | null;
};

type Sibling = { slug: string; language: string; title: string };

const SITE_ORIGIN = "https://megsyai.com";

const BlogPostPage = () => {
  const { slug = "", lang: langParam } = useParams<{ slug: string; lang?: string }>();
  const lang = langParam && getLang(langParam) ? langParam : "en";
  const langMeta = getLang(lang)!;

  const staticPost = lang === "en" ? getBlogPost(slug) : undefined;
  const [dbPost, setDbPost] = useState<DbPost | null>(null);
  const [enFallbackExists, setEnFallbackExists] = useState<boolean | null>(null);
  const [siblings, setSiblings] = useState<Sibling[]>([]);
  const [dbRelated, setDbRelated] = useState<
    Array<{ slug: string; title: string; meta_description: string | null; category: string | null }>
  >([]);
  const [loading, setLoading] = useState(!staticPost);

  useEffect(() => {
    if (staticPost) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select(
          "id,slug,title,meta_description,content_md,hero_image_url,keywords,category,reading_minutes,published_at,author_name,language,translation_group_id,faq",
        )
        .eq("slug", slug)
        .eq("language", lang)
        .eq("status", "published")
        .maybeSingle();
      if (cancelled) return;
      setDbPost(data as DbPost | null);

      // If the requested locale has no row, check whether the EN version exists
      // (either static or in DB) so we can redirect to the canonical instead of /blog.
      if (!data && lang !== "en") {
        if (getBlogPost(slug)) {
          if (!cancelled) setEnFallbackExists(true);
        } else {
          const { data: enRow } = await supabase
            .from("blog_posts")
            .select("slug")
            .eq("slug", slug)
            .eq("language", "en")
            .eq("status", "published")
            .maybeSingle();
          if (!cancelled) setEnFallbackExists(Boolean(enRow));
        }
      }
      setLoading(false);

      if (data?.translation_group_id) {
        const { data: sibs } = await supabase
          .from("blog_posts")
          .select("slug,language,title")
          .eq("translation_group_id", data.translation_group_id)
          .eq("status", "published");
        if (!cancelled) setSiblings((sibs as Sibling[]) ?? []);
      }

      // Same-language related posts (E-E-A-T + internal linking)
      const { data: rel } = await supabase
        .from("blog_posts")
        .select("slug,title,meta_description,category,published_at")
        .eq("language", lang)
        .eq("status", "published")
        .neq("slug", slug)
        .order("published_at", { ascending: false })
        .limit(3);
      if (!cancelled) setDbRelated((rel as any) ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, lang, staticPost]);

  // hreflang alternates — MUST be declared before any early return to keep hook order stable.
  const alts = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of siblings) map.set(s.language, blogPath(s.slug, s.language));
    const effectiveSlug = staticPost?.slug ?? dbPost?.slug ?? slug;
    if (!map.has(lang)) map.set(lang, blogPath(effectiveSlug, lang));
    return Array.from(map.entries());
  }, [siblings, lang, staticPost, dbPost, slug]);

  if (loading) {
    return (
      <div
        data-theme="dark"
        className="min-h-dvh bg-background text-foreground flex items-center justify-center"
      >
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!staticPost && !dbPost) {
    // If the requested non-English translation doesn't exist yet but the
    // English article does (static OR DB), send the user to the English
    // canonical instead of dumping them on /blog with no context.
    const enStatic = lang !== "en" ? getBlogPost(slug) : undefined;
    const hasEn = Boolean(enStatic) || enFallbackExists === true;
    return (
      <Navigate to={hasEn ? `/blog/${slug}` : lang === "en" ? "/blog" : `/${lang}/blog`} replace />
    );
  }

  const post =
    staticPost ??
    ({
      slug: dbPost!.slug,
      title: dbPost!.title,
      description: dbPost!.meta_description || "",
      category: dbPost!.category || "AI Guides",
      date: dbPost!.published_at || new Date().toISOString(),
      readTime: `${dbPost!.reading_minutes || 6} min read`,
      keywords: dbPost!.keywords || [],
      body: dbPost!.content_md,
      heroImage: dbPost!.hero_image_url,
    } as any);

  const faq = dbPost?.faq ?? null;
  // Related posts: prefer DB same-language posts; fallback to static EN list.
  const related =
    dbRelated.length > 0
      ? dbRelated.map((r) => ({
          slug: r.slug,
          title: r.title,
          description: r.meta_description || "",
          category: r.category || "AI Guides",
          href: blogPath(r.slug, lang),
        }))
      : BLOG_POSTS.filter((p) => p.slug !== post.slug)
          .slice(0, 3)
          .map((p) => ({
            slug: p.slug,
            title: p.title,
            description: p.description,
            category: p.category,
            href: `/blog/${p.slug}`,
          }));

  // Strip $$md$$ delimiters if present (DB posts wrap content).
  const cleanBody = String(post.body ?? "")
    .replace(/\$\$md\$\$/g, "")
    .trim();
  const blocks = cleanBody.split(/\n\n+/);

  const xDefaultHref = siblings.find((s) => s.language === "en")?.slug
    ? blogPath(siblings.find((s) => s.language === "en")!.slug, "en")
    : blogPath(post.slug, lang);

  const canonicalPath = blogPath(post.slug, lang);
  const fullCanonical = `${SITE_ORIGIN}${canonicalPath}`;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_ORIGIN}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_ORIGIN}${lang === "en" ? "/blog" : `/${lang}/blog`}`,
      },
      { "@type": "ListItem", position: 3, name: post.title, item: fullCanonical },
    ],
  };

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    inLanguage: lang,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: dbPost?.author_name || "Megsy Editorial" },
    publisher: {
      "@type": "Organization",
      name: "Megsy AI",
      logo: { "@type": "ImageObject", url: `${SITE_ORIGIN}/pwa-512.png` },
    },
    mainEntityOfPage: fullCanonical,
    keywords: post.keywords.join(", "),
    image: post.heroImage ? [post.heroImage] : undefined,
  };

  const faqLd =
    faq && faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }
      : null;

  return (
    <div
      data-theme="dark"
      dir={langMeta.dir}
      lang={lang}
      className="min-h-dvh overflow-x-hidden bg-background text-foreground"
    >
      <SEOHead
        title={post.title}
        description={post.description}
        path={canonicalPath}
        type="article"
      />
      <Helmet htmlAttributes={{ lang, dir: langMeta.dir }}>
        {alts.map(([code, path]) => (
          <link key={code} rel="alternate" hrefLang={code} href={`${SITE_ORIGIN}${path}`} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${SITE_ORIGIN}${xDefaultHref}`} />
        <script type="application/ld+json">{JSON.stringify(articleLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
        {faqLd && <script type="application/ld+json">{JSON.stringify(faqLd)}</script>}
      </Helmet>
      <LandingNavbar />

      <main className="px-4 pt-32 pb-20 mx-auto max-w-3xl">
        <Link
          to={lang === "en" ? "/blog" : `/${lang}/blog`}
          className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
        >
          ← {lang === "ar" ? "كل المقالات" : "Back to all posts"}
        </Link>

        <header className="mt-8 mb-10">
          {(post as any).heroImage && (
            <img
              src={(post as any).heroImage}
              alt={post.title}
              className="w-full rounded-2xl mb-6 border border-border/60"
              loading="eager"
            />
          )}
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-4">
            <span>{post.category}</span>
            <span aria-hidden>·</span>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString(lang, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
            <span aria-hidden>·</span>
            <span>{post.readTime}</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight leading-tight">
            {post.title}
          </h1>
          <p className="mt-5 text-muted-foreground text-lg leading-relaxed">{post.description}</p>
        </header>

        {/* Language switcher — only render when translations exist */}
        {siblings.length > 1 && (
          <nav aria-label="Languages" className="mb-10 flex flex-wrap gap-2">
            {siblings
              .slice()
              .sort(
                (a, b) =>
                  BLOG_LANGS.findIndex((l) => l.code === a.language) -
                  BLOG_LANGS.findIndex((l) => l.code === b.language),
              )
              .map((s) => {
                const meta = getLang(s.language);
                const active = s.language === lang;
                return (
                  <Link
                    key={s.language}
                    to={blogPath(s.slug, s.language)}
                    hrefLang={s.language}
                    className={`text-[12px] px-3 py-1.5 rounded-full border transition-colors ${active ? "bg-foreground text-background border-foreground" : "border-border/60 text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]"}`}
                  >
                    {meta?.nativeName || s.language}
                  </Link>
                );
              })}
          </nav>
        )}

        <article className="space-y-5 text-foreground/90 text-[16.5px] leading-[1.75]">
          {blocks.map((block, i) => {
            if (block.startsWith("## ")) {
              return (
                <h2
                  key={i}
                  className="font-display text-2xl font-semibold tracking-tight pt-6 pb-1"
                >
                  {block.replace(/^##\s+/, "")}
                </h2>
              );
            }
            if (block.startsWith("### ")) {
              return (
                <h3 key={i} className="font-display text-xl font-semibold tracking-tight pt-4 pb-1">
                  {block.replace(/^###\s+/, "")}
                </h3>
              );
            }
            if (/^[-*]\s/m.test(block)) {
              const items = block.split("\n").filter((l) => /^[-*\d]/.test(l.trim()));
              return (
                <ul key={i} className="list-disc pl-6 space-y-2 marker:text-muted-foreground/50">
                  {items.map((it, j) => (
                    <li key={j}>{it.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "")}</li>
                  ))}
                </ul>
              );
            }
            return <p key={i}>{block}</p>;
          })}
        </article>

        {faq && faq.length > 0 && (
          <section className="mt-16 pt-10 border-t border-border/60">
            <h2 className="font-display text-2xl font-semibold tracking-tight mb-6">
              {lang === "ar" ? "أسئلة شائعة" : "Frequently asked questions"}
            </h2>
            <dl className="space-y-5">
              {faq.map((item, i) => (
                <div key={i}>
                  <dt className="font-semibold text-foreground">{item.q}</dt>
                  <dd className="mt-1.5 text-muted-foreground leading-relaxed">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {related.length > 0 && (
          <aside className="mt-20 pt-10 border-t border-border/60">
            <h3 className="font-display text-sm uppercase tracking-[0.16em] text-muted-foreground mb-5">
              {lang === "ar" ? "اقرأ أيضاً" : "Keep reading"}
            </h3>
            <ul className="space-y-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <Link
                    to={p.href}
                    className="block rounded-xl border border-border/60 p-5 hover:bg-foreground/[0.03] transition-colors"
                  >
                    <h4 className="font-display text-lg font-semibold tracking-tight">{p.title}</h4>
                    <p className="mt-1.5 text-sm text-muted-foreground">{p.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </main>

      <LazyOnVisible minHeight={320} rootMargin="600px"><Suspense fallback={<div style={{ minHeight: 320 }} />}><LandingFooter /></Suspense></LazyOnVisible>
    </div>
  );
};

export default BlogPostPage;
