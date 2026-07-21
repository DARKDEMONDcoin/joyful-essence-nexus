/** @doc Dedicated marketing page for our in-house Megsy 3.9 model. Route: /megsy-model */
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { m as motion } from "framer-motion";
import { Sparkles, Zap, Globe2, Shield, Cpu, MessageSquare, ArrowRight, Check } from "lucide-react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import { MODELS, MODEL_HERO_VIDEOS } from "@/data/aiModels";
import { Button } from "@/components/ui/button";

const megsy = MODELS.find((m) => m.id === "megsy-v1")!;

export default function MegsyModelPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const heroVideo = MODEL_HERO_VIDEOS["megsy-v1"];

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Helmet>
        <title>Megsy 3.9 — Our In-House AI Model | Megsy AI</title>
        <meta
          name="description"
          content="Megsy 3.9 is our in-house AI model — free on every plan, tuned for Arabic and 100+ languages, with native web search, image generation, and code tools built in."
        />
        <link rel="canonical" href="https://megsyai.com/megsy-model" />
        <meta property="og:title" content="Megsy 3.9 — Our In-House AI Model" />
        <meta
          property="og:description"
          content="Fast, multilingual, tool-native. The default brain behind every Megsy conversation — built and trained in-house."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://megsyai.com/megsy-model" />
        <meta property="og:image" content="https://megsyai.com/og-megsy.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Megsy 3.9 — Our In-House AI Model" />
        <meta
          name="twitter:description"
          content="Fast, multilingual, tool-native. Free on every plan."
        />
        <meta name="twitter:image" content="https://megsyai.com/og-megsy.jpg" />
      </Helmet>

      <LandingNavbar />

      <main className="relative isolate overflow-hidden">
        {/* HERO */}
        <section className="relative min-h-[80vh] w-full overflow-hidden pt-32 pb-24">
          <div className="absolute inset-0 -z-10">
            {heroVideo ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={megsy.image}
                className="size-full object-cover opacity-40"
              >
                <source src={heroVideo} type="video/mp4" />
              </video>
            ) : (
              <img src={megsy.image} alt="" className="size-full object-cover opacity-40" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
          </div>

          <div className="mx-auto max-w-5xl px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur"
            >
              <Sparkles className="size-4" />
              Made in-house · Free on every plan
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-6 bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl lg:text-7xl"
            >
              Meet Megsy 3.9
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 text-xl leading-relaxed text-muted-foreground sm:text-2xl"
            >
              {megsy.tagline}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground/90"
            >
              {megsy.body}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <Button asChild size="lg" className="min-h-12 gap-2 rounded-full px-8 text-base">
                <Link to="/auth" aria-label="Try Megsy 3.9 free">
                  <MessageSquare className="size-5" />
                  Try Megsy free
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="min-h-12 rounded-full px-8 text-base"
              >
                <Link to="/ai-chat/models/megsy-v1">Full model details</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* WHY MEGSY */}
        <section className="border-t border-border/40 bg-muted/20 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Why we built our own model
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                We didn't want to be another wrapper. Megsy is trained, tuned and served in-house —
                so we can guarantee cost, latency, and Arabic-first quality.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Zap,
                  title: "Sub-400ms first token",
                  body: "Streaming starts almost instantly — no waiting for a token to appear on screen.",
                },
                {
                  icon: Globe2,
                  title: "Native Arabic + RTL",
                  body: "Trained with Arabic dialects as first-class citizens, not translations.",
                },
                {
                  icon: Cpu,
                  title: "Tool-native by design",
                  body: "Web search, code execution, file Q&A and image generation without leaving chat.",
                },
                {
                  icon: Shield,
                  title: "Your data, protected",
                  body: "Conversations are encrypted at rest and in transit. Never sold, never used to train external models.",
                },
                {
                  icon: Sparkles,
                  title: "Free on every plan",
                  body: "Unlimited conversations on the free tier — no credit card, no trial timer.",
                },
                {
                  icon: MessageSquare,
                  title: "100+ languages",
                  body: "From Egyptian Arabic to Japanese — one model handles them all fluently.",
                },
              ].map(({ icon: Icon, title, body }) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.4 }}
                  className="group relative rounded-2xl border border-border/60 bg-card/50 p-6 backdrop-blur transition hover:border-primary/40 hover:bg-card"
                >
                  <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SPECS */}
        <section className="py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Specifications</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Enterprise-grade capabilities available to every user, on every plan.
                </p>
                <div className="mt-8 space-y-3">
                  {megsy.strengths.map((s) => (
                    <div key={s} className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <Check className="size-3" />
                      </div>
                      <p className="text-muted-foreground">{s}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-border/60 bg-card/50 p-8 backdrop-blur">
                <dl className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                  {megsy.specs.map((spec) => (
                    <div key={spec.label}>
                      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {spec.label}
                      </dt>
                      <dd className="mt-1.5 text-lg font-semibold">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* BENCHMARKS */}
        <section className="border-t border-border/40 bg-muted/20 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Benchmarks</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Independent evaluations against public test sets.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {megsy.benchmarks.map((b) => (
                <div
                  key={b.name}
                  className="rounded-2xl border border-border/60 bg-card/50 p-8 text-center backdrop-blur"
                >
                  <div className="text-5xl font-bold tracking-tight text-primary">{b.score}</div>
                  <div className="mt-3 text-lg font-semibold">{b.name}</div>
                  {b.note && (
                    <div className="mt-1.5 text-sm text-muted-foreground">{b.note}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* USE CASES */}
        <section className="py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                What Megsy does best
              </h2>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
              {megsy.useCases.map((u) => (
                <div
                  key={u.title}
                  className="rounded-2xl border border-border/60 bg-card/50 p-8 backdrop-blur"
                >
                  <h3 className="text-xl font-semibold">{u.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{u.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden py-24">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Chat with Megsy — right now
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              No credit card. No trial timer. Just open a chat and start.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg" className="min-h-12 gap-2 rounded-full px-8 text-base">
                <Link to="/auth">
                  Get started free
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="min-h-12 rounded-full px-8 text-base"
              >
                <Link to="/pricing">See plans</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
