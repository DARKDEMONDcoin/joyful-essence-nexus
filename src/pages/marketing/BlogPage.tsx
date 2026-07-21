/** @doc The Megsy blog index — long-form articles plus 3 fresh AI-published posts per day. */
import { useParams, Navigate } from "react-router-dom";
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import { useEffect, useState } from "react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import { lazy, Suspense } from "react";
import { LazyOnVisible } from "@/components/common/LazyOnVisible";
const LandingFooter = lazy(() => import("@/components/landing/LandingFooter"));
import SEOHead from "@/components/common/SEOHead";
import { Helmet } from "react-helmet-async";
import { BLOG_POSTS } from "@/data/blogPosts";
import { supabase } from "@/integrations/supabase/client";
import { BLOG_LANGS, blogPath, getLang } from "@/data/blogLangs";

type DbPost = {
  slug: string;
  title: string;
  meta_description: string | null;
  excerpt: string | null;
  category: string | null;
  reading_minutes: number | null;
  published_at: string | null;
  hero_image_url: string | null;
  language: string | null;
};

const SITE_ORIGIN = "https://megsyai.com";

const BlogPage = () => {
  const { lang: langParam } = useParams<{ lang?: string }>();

  // Validate lang — if a non-language segment hit this route, bail to /not-found.
  if (langParam && !getLang(langParam)) return <Navigate to="/not-found" replace />;
  const lang = langParam || "en";
  const langMeta = getLang(lang)!;

  const [dbPosts, setDbPosts] = useState<DbPost[]>([]);
  useEffect(() => {
    supabase
      .from("blog_posts")
      .select(
        "slug,title,meta_description,excerpt,category,reading_minutes,published_at,hero_image_url,language",
      )
      .eq("status", "published")
      .eq("language", lang)
      .order("published_at", { ascending: false })
      .limit(500)
      .then(({ data }) => setDbPosts((data as DbPost[]) ?? []));
  }, [lang]);

  const dbCards = dbPosts.map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.meta_description || p.excerpt || "",
    category: p.category || "AI Guides",
    date: p.published_at || new Date().toISOString(),
    readTime: `${p.reading_minutes || 6} min read`,
  }));

  // Static posts are English-only; merge only for English page.
  const allPosts = lang === "en" ? [...dbCards, ...BLOG_POSTS] : dbCards;

  const headingHero =
    lang === "ar"
      ? {
          kicker: "مجلة Megsy",
          h1: "نكتب عن العمل، لا عن الضجيج.",
          sub: "أدلة عملية حول الذكاء الاصطناعي للصور والفيديو والكتابة.",
        }
      : {
          kicker: "The Megsy Journal",
          h1: "Writing about the work, not the hype.",
          sub: "Practical guides on AI image generation, video, prompt engineering, and the modern creator stack.",
        };

  return (
    <div
      data-theme="dark"
      dir={langMeta.dir}
      lang={lang}
      className="min-h-dvh overflow-x-hidden bg-background text-foreground"
    >
      <SEOHead
        title={`Megsy AI Blog — ${langMeta.nativeName}`}
        description="Practical guides on AI image generation, video generation, prompt engineering, and how to build a creator stack with all-in-one AI tools."
        path={lang === "en" ? "/blog" : `/${lang}/blog`}
      />
      <Helmet htmlAttributes={{ lang, dir: langMeta.dir }}>
        {BLOG_LANGS.map((l) => (
          <link
            key={l.code}
            rel="alternate"
            hrefLang={l.code}
            href={`${SITE_ORIGIN}${l.code === "en" ? "/blog" : `/${l.code}/blog`}`}
          />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${SITE_ORIGIN}/blog`} />
      </Helmet>
      <LandingNavbar />

      <main className="px-4 pt-32 pb-24 mx-auto max-w-5xl">
        <header className="mb-10 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
            {headingHero.kicker}
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
            {headingHero.h1}
          </h1>
          <p className="mt-6 text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            {headingHero.sub}
          </p>
        </header>

        {/* Language switcher for /blog index */}
        <nav aria-label="Languages" className="mb-12 flex flex-wrap gap-2 justify-center">
          {BLOG_LANGS.map((l) => {
            const active = l.code === lang;
            return (
              <Link
                key={l.code}
                to={l.code === "en" ? "/blog" : `/${l.code}/blog`}
                hrefLang={l.code}
                className={`text-[12px] px-3 py-1.5 rounded-full border transition-colors ${active ? "bg-foreground text-background border-foreground" : "border-border/60 text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]"}`}
              >
                {l.nativeName}
              </Link>
            );
          })}
        </nav>

        <ul className="space-y-3">
          {allPosts.map((post) => (
            <li key={post.slug}>
              <Link
                to={blogPath(post.slug, lang)}
                className="block rounded-2xl border border-border/60 bg-background/60 p-6 md:p-8 hover:bg-foreground/[0.03] transition-colors group"
              >
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-3">
                  <span>{post.category}</span>
                  <span aria-hidden>·</span>
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString(lang, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                  <span aria-hidden>·</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="font-display text-xl md:text-2xl font-semibold tracking-tight group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="mt-3 text-muted-foreground text-[15px] leading-relaxed">
                  {post.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <LazyOnVisible minHeight={320} rootMargin="600px"><Suspense fallback={<div style={{ minHeight: 320 }} />}><LandingFooter /></Suspense></LazyOnVisible>
    </div>
  );
};

export default BlogPage;
