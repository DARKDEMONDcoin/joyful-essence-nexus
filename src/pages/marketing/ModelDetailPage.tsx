/** @doc Dedicated SEO landing page for a single AI model, served at /ai-chat/models/:slug. */
import { useRef } from "react";
import { useParams, Navigate } from "react-router-dom";
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import { m as motion, useScroll, useTransform } from "framer-motion";
import LandingNavbar from "@/components/landing/LandingNavbar";
import { lazy, Suspense } from "react";
import { LazyOnVisible } from "@/components/common/LazyOnVisible";
const LandingFooter = lazy(() => import("@/components/landing/LandingFooter"));
import SEOHead from "@/components/common/SEOHead";
import { getModelBySlug, MODELS, MODEL_HERO_VIDEOS } from "@/data/aiModels";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

const fadeUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
};

const ModelDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const model = getModelBySlug(slug);

  useSmoothScroll(true);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.12]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  if (!model) return <Navigate to="/ai-chat" replace />;

  const title = `${model.name} on Megsy — ${model.vendor}`;
  const description = `${model.tagline} ${model.hero}`;
  const portrait = model.portrait ?? model.image;
  const heroVideo = MODEL_HERO_VIDEOS[model.id];

  return (
    <div className="min-h-dvh bg-background text-foreground antialiased">
      <SEOHead title={title} description={description} path={`/ai-chat/models/${model.id}`} image={portrait} />

      <LandingNavbar />

      <main>
        {/* HERO — full-bleed video, parallax, clean centered type */}
        <header
          ref={heroRef}
          className="relative h-[100svh] min-h-[640px] w-full overflow-hidden border-b border-white/5"
        >
          {heroVideo ? (
            <motion.video
              src={heroVideo}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={portrait}
              style={{ y: bgY, scale: bgScale }}
              className="absolute inset-0 h-full w-full object-cover will-change-transform"
            />
          ) : (
            <motion.img
              src={portrait}
              alt={`${model.name} backdrop`}
              style={{ y: bgY, scale: bgScale }}
              className="absolute inset-0 h-full w-full object-cover will-change-transform"
            />
          )}

          {/* Readability scrim */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/45 to-background pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.45)_100%)] pointer-events-none" />

          <motion.div
            style={{ y: contentY, opacity: contentOpacity }}
            className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 text-center"
          >
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-white backdrop-blur-md"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
              {model.vendor}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 font-display text-[15vw] md:text-[8.5vw] font-black uppercase leading-[0.85] tracking-tighter text-white [text-shadow:_0_4px_40px_rgba(0,0,0,0.45)]"
            >
              {model.name}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-7 max-w-2xl text-base md:text-xl text-white/95 leading-relaxed [text-shadow:_0_2px_20px_rgba(0,0,0,0.45)]"
            >
              {model.hero}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 flex flex-wrap justify-center gap-3"
            >
              <Link
                to="/chat"
                className="rounded-full bg-white px-8 py-4 text-sm font-semibold text-black hover:opacity-90 transition-opacity"
              >
                Try {model.name} now →
              </Link>
              <Link
                to="/ai-chat"
                className="rounded-full border border-white/40 bg-white/10 backdrop-blur px-8 py-4 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
              >
                ← All models
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            style={{ opacity: contentOpacity }}
            className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[10px] font-semibold uppercase tracking-[0.4em] text-white/70"
          >
            scroll
          </motion.div>
        </header>

        {/* TAGLINE STRIP */}
        <section className="border-b border-white/5 py-20 md:py-28">
          <motion.div {...fadeUp} className="mx-auto max-w-4xl px-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-foreground/55">
              Overview
            </p>
            <h2 className="mt-6 font-display text-3xl md:text-5xl font-bold leading-tight tracking-tight">
              {model.tagline}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-foreground/70">
              {model.body}
            </p>
          </motion.div>
        </section>

        {/* SPECS */}
        <section className="border-b border-white/5 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <motion.div {...fadeUp} className="mb-12 flex items-end justify-between gap-6 flex-wrap">
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">Specs</h2>
              <p className="text-sm text-foreground/55 max-w-sm">
                Hard numbers — context window, modalities, latency.
              </p>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {model.specs.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-6"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
                    {s.label}
                  </p>
                  <p className="mt-3 font-display text-xl font-semibold text-foreground">{s.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* STRENGTHS */}
        <section className="border-b border-white/5 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <motion.div {...fadeUp} className="mb-12 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-foreground/55">
                Why people pick it
              </p>
              <h2 className="mt-5 font-display text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                What {model.name} is best at
              </h2>
            </motion.div>
            <ul className="grid gap-4 md:grid-cols-2">
              {model.strengths.map((s, i) => (
                <motion.li
                  key={s}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.025] px-6 py-5 text-base text-foreground/85"
                >
                  <span className="mt-2 inline-block h-2 w-2 shrink-0 rounded-full bg-foreground/70" />
                  <span className="leading-relaxed">{s}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        {/* USE CASES */}
        <section className="border-b border-white/5 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <motion.div {...fadeUp} className="mb-12 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-foreground/55">
                In practice
              </p>
              <h2 className="mt-5 font-display text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                Use cases
              </h2>
            </motion.div>
            <div className="grid gap-5 md:grid-cols-2">
              {model.useCases.map((u, i) => (
                <motion.article
                  key={u.title}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-7 md:p-8"
                >
                  <h3 className="font-display text-xl md:text-2xl font-bold tracking-tight">{u.title}</h3>
                  <p className="mt-4 text-sm md:text-base text-foreground/70 leading-relaxed">{u.body}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* BENCHMARKS */}
        <section className="border-b border-white/5 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <motion.div {...fadeUp} className="mb-12 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-foreground/55">
                Receipts
              </p>
              <h2 className="mt-5 font-display text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                Benchmarks
              </h2>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {model.benchmarks.map((b, i) => (
                <motion.div
                  key={b.name}
                  initial={{ opacity: 0, scale: 0.96, y: 16 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.65, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-7"
                >
                  <p className="text-sm text-foreground/60">{b.name}</p>
                  <p className="mt-4 font-display text-5xl md:text-6xl font-black text-foreground tracking-tight">
                    {b.score}
                  </p>
                  {b.note && <p className="mt-3 text-xs text-foreground/50">{b.note}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="border-b border-white/5 py-20 md:py-28">
          <motion.div {...fadeUp} className="mx-auto max-w-3xl px-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-foreground/55">
              Pricing
            </p>
            <h2 className="mt-5 font-display text-3xl md:text-5xl font-bold tracking-tight leading-tight">
              Included in your plan
            </h2>
            <p className="mt-6 text-base md:text-lg text-foreground/75 leading-relaxed">
              {model.pricing}
            </p>
            <Link
              to="/pricing"
              className="mt-10 inline-flex rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
            >
              See all plans
            </Link>
          </motion.div>
        </section>

        {/* FAQ */}
        <section className="border-b border-white/5 py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-6">
            <motion.div {...fadeUp} className="mb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-foreground/55">
                FAQ
              </p>
              <h2 className="mt-5 font-display text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                Quick answers
              </h2>
            </motion.div>
            <div className="space-y-3">
              {model.faq.map((f, i) => (
                <motion.details
                  key={f.q}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.55, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6"
                >
                  <summary className="cursor-pointer list-none font-semibold text-foreground flex items-center justify-between gap-4">
                    <span>{f.q}</span>
                    <span className="text-foreground/50 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 text-sm md:text-base text-foreground/70 leading-relaxed">{f.a}</p>
                </motion.details>
              ))}
            </div>
          </div>
        </section>

        {/* OTHER MODELS */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <motion.div {...fadeUp} className="mb-12 flex items-end justify-between gap-6 flex-wrap">
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
                Explore other models
              </h2>
              <Link
                to="/ai-chat"
                className="text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors"
              >
                View all →
              </Link>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MODELS.filter((m) => m.id !== model.id).map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.65, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    to={`/ai-chat/models/${m.id}`}
                    className="group relative block overflow-hidden rounded-2xl border border-white/10 aspect-[4/3]"
                  >
                    <img
                      src={m.portrait ?? m.image}
                      alt={m.name}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/75">
                        {m.vendor}
                      </p>
                      <p className="mt-2 font-display text-2xl font-bold text-white tracking-tight">
                        {m.name}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <LazyOnVisible minHeight={320} rootMargin="600px"><Suspense fallback={<div style={{ minHeight: 320 }} />}><LandingFooter /></Suspense></LazyOnVisible>
    </div>
  );
};

export default ModelDetailPage;
