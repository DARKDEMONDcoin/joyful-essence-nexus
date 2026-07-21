/** @doc Megsy AI Chat — deep SEO landing page with per-model silky sections, Claude Code integration, skills and integrations. */
import { useEffect } from "react";
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import { Helmet } from "react-helmet-async";
import { m as motion } from "framer-motion";
import type Lenis from "lenis";
import LandingNavbar from "@/components/landing/LandingNavbar";
import { lazy, Suspense } from "react";
import { LazyOnVisible } from "@/components/common/LazyOnVisible";
const LandingFooter = lazy(() => import("@/components/landing/LandingFooter"));
import SEOHead from "@/components/common/SEOHead";

import { MODELS } from "@/data/aiModels";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260520_111942_8fc50f9e-4dfd-45c1-81bb-d93342a23d87.mp4";



const CAPABILITIES = [
  { title: "Web search with citations", body: "Live Google + Bing index, news, finance, papers, Reddit. Every answer ships with inline source links." },
  { title: "Files, PDFs, sheets, audio & video", body: "Up to 100MB per file. PDFs page-by-page, Excel formulas, audio transcription, video frames." },
  { title: "Vision", body: "Upload screenshots, mockups, charts, whiteboards. Megsy describes, extracts text, and rewrites them." },
  { title: "Voice in, voice out", body: "Push-to-talk dictation and natural TTS replies in 30+ languages." },
  { title: "Persistent memory", body: "Megsy remembers preferences, projects and style across sessions. You can view, edit or wipe at any time." },
  { title: "Canvas & artifacts", body: "Long-form writing, code, slides, SVGs and React components render in an editable side panel." },
  { title: "Code execution sandbox", body: "Python, Node, Bash and SQL run server-side. Charts, scrapes, conversions returned as files." },
  { title: "Image & video generation", body: "Nano Banana 2, Flux, Seedance 2.5, Sora and Veo 3 — inside the same chat." },
];

const SKILLS = [
  { name: "Web Researcher", body: "Multi-step search and a cited briefing." },
  { name: "Data Analyst", body: "Reads CSV/XLSX, runs pandas, returns charts." },
  { name: "Slide Designer", body: "PowerPoint and Google Slides from a one-line brief." },
  { name: "Doc Builder", body: "SOPs, contracts, RFCs and PRDs from your notes." },
  { name: "Translator", body: "Native-quality across 100+ languages with tone control." },
  { name: "SEO Writer", body: "Clusters, briefs, audits and full articles with internal links." },
  { name: "Email Composer", body: "Cold outreach and replies matched to your voice." },
  { name: "Study Tutor", body: "Step-by-step explanations and flashcards." },
];

const INTEGRATIONS: { name: string; slug: string }[] = [
  { name: "GitHub", slug: "github" },
  { name: "GitLab", slug: "gitlab" },
  { name: "Google Drive", slug: "google-drive" },
  { name: "Google Calendar", slug: "google-calendar" },
  { name: "Gmail", slug: "google-gmail" },
  { name: "Notion", slug: "notion-icon" },
  { name: "Slack", slug: "slack-icon" },
  { name: "Linear", slug: "linear-icon" },
  { name: "Jira", slug: "jira" },
  { name: "Figma", slug: "figma" },
  { name: "Dropbox", slug: "dropbox" },
  { name: "OneDrive", slug: "microsoft-onedrive" },
  { name: "Confluence", slug: "confluence" },
  { name: "Zapier", slug: "zapier-icon" },
  { name: "n8n", slug: "n8n" },
  { name: "HubSpot", slug: "hubspot" },
  { name: "Salesforce", slug: "salesforce" },
  { name: "Stripe", slug: "stripe" },
  { name: "Supabase", slug: "supabase-icon" },
  { name: "Postgres", slug: "postgresql" },
  { name: "MySQL", slug: "mysql-icon" },
  { name: "Airtable", slug: "airtable" },
  { name: "Webflow", slug: "webflow" },
  { name: "Shopify", slug: "shopify" },
];

const FAQ = [
  { q: "What is Megsy 3.9?", a: "Megsy 3.9 is our in-house default model — fast, multilingual, and free on every plan. It powers chat, skills, file Q&A and tool use with native web search, image generation and code execution built in." },
  { q: "Is Claude Code really inside Megsy Chat?", a: "Yes. We integrated Anthropic's Claude Code agent natively. It has the same file-edit, shell, Git and planning capabilities as the standalone agent, running in a sandbox tied to your conversation. You are not redirected anywhere." },
  { q: "Which AI models can I chat with?", a: "Megsy 3.9, Gemini 3.5, GPT‑5.5, Grok 4, Claude Sonnet 4.6 and Claude Opus 4.8 — switchable any time mid-conversation, with your context following you." },
  { q: "Does Megsy browse the web in real time?", a: "Yes. Web search is on by default for time-sensitive questions, with Google, Bing and specialised indexes. Megsy cites every source inline." },
  { q: "What files can I upload?", a: "PDFs up to 100MB, Word, Excel, CSV, PowerPoint, Markdown, code files, images, audio (mp3/wav/m4a) and short videos. Megsy parses them natively." },
  { q: "Is my data used to train AI?", a: "No. Your chats, files and code are never used to train Megsy or any third-party model. GDPR-compliant, SOC 2 Type II audited, with signed DPAs for business plans." },
  { q: "How is Megsy different from ChatGPT or Claude.ai?", a: "One subscription gives you every flagship model, plus native Claude Code, image and video generation, web search, skills and integrations — instead of paying for ChatGPT Plus, Claude Pro and Midjourney separately." },
  { q: "What does it cost?", a: "Free tier with daily credits across all features. Pro starts at $14/mo with higher limits, premium models and unlimited Claude Code. Workspace and Enterprise plans available." },
];

/* ----------------------------- COMPONENTS ----------------------------- */

const fadeUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

const ModelSection = ({
  index,
  model,
}: {
  index: number;
  model: (typeof MODELS)[number];
}) => {
  const reverse = index % 2 === 1;
  return (
    <section
      id={model.id}
      className="relative overflow-hidden border-t border-white/5 py-24 md:py-36"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div
          className={`grid items-center gap-12 md:gap-20 md:grid-cols-2 ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}
        >
          {/* SILKY VISUAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-sm aspect-square overflow-hidden rounded-3xl border border-white/10"
          >
            <img
              src={model.image}
              alt={`${model.name} silky background`}
              width={1024}
              height={1024}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            {model.badge && (
              <div className="absolute right-4 top-4">
                <span className="rounded-full bg-white text-black px-2.5 py-1 text-[10px] font-bold tracking-wider">
                  {model.badge}
                </span>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <p className="font-display text-white text-[10vw] md:text-[3.4vw] font-black uppercase leading-[0.9] tracking-tight text-center drop-shadow-[0_4px_24px_var(--overlay-black-55)]">
                {model.name}
              </p>
            </div>
          </motion.div>

          {/* CONTENT */}
          <div>
            <motion.h2
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.05 }}
              className="mt-5 font-display text-[8vw] md:text-[3.2vw] font-black uppercase leading-[0.95] tracking-tight text-foreground"
            >
              {model.tagline}
            </motion.h2>
            <motion.p
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
              className="mt-6 text-base leading-relaxed text-foreground/70 md:text-lg"
            >
              {model.body}
            </motion.p>

            <motion.ul
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.15 }}
              className="mt-8 space-y-2.5"
            >
              {model.bullets.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground/85"
                >
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/70" />
                  <span>{b}</span>
                </li>
              ))}
            </motion.ul>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.2 }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <Link
                to={`/ai-chat/models/${model.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
              >
                Explore {model.name} →
              </Link>
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-foreground hover:bg-white/5 transition-colors"
              >
                Try in chat
              </Link>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};

/* -------------------------------- PAGE -------------------------------- */

const AIChatLandingPage = () => {
  const url = "https://megsyai.com/ai-chat";
  const title = "AI Chat — Megsy 3.9, GPT‑5.5, Claude Sonnet 4.6, Gemini 3.5, Grok 4 | Megsy AI";
  const description =
    "Megsy AI Chat — one workspace for Megsy 3.9, Gemini 3.5, GPT‑5.5, Grok 4, Claude Sonnet 4.6 and Claude Opus 4.8, with Anthropic's Claude Code integrated natively. Web search, files, image & video generation.";

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;
    const isTouch =
      window.matchMedia("(hover: none) and (pointer: coarse)").matches || window.innerWidth < 1024;
    if (isTouch) return;

    let rafId = 0;
    let lenis: Lenis | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let cancelled = false;

    import("lenis").then(({ default: LenisCtor }) => {
      if (cancelled) return;
      lenis = new LenisCtor({
        duration: 1.1,
        easing: (t) => 1 - Math.pow(1 - t, 4),
        smoothWheel: true,
        wheelMultiplier: 0.85,
        touchMultiplier: 1.4,
        syncTouch: false,
        overscroll: false,
        autoResize: true,
      });
      document.documentElement.setAttribute("data-lenis-smooth", "true");
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
      resizeObserver = new ResizeObserver(() => lenis?.resize());
      resizeObserver.observe(document.body);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      lenis?.stop();
      lenis?.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
      document.documentElement.removeAttribute("data-lenis-smooth");
    };
  }, []);

  return (
    <div data-theme="dark" className="min-h-dvh overflow-x-clip bg-background text-foreground">
      <SEOHead title={title} description={description} path="/ai-chat" />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Megsy AI Chat",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web, iOS, Android",
            url,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", ratingCount: "12480" },
            description,
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://megsyai.com/" },
              { "@type": "ListItem", position: 2, name: "AI Chat", item: url },
            ],
          })}
        </script>
      </Helmet>

      <LandingNavbar />

      {/* HERO with silky bg */}
      <header className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/40 to-background" />

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-32 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[11px] uppercase tracking-[0.35em] text-white/85 mb-6"
          >
            Megsy AI Chat
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.05 }}
            className="font-display text-[14vw] font-black uppercase leading-[0.88] tracking-tighter text-white md:text-[8vw]"
          >
            Every AI.<br />
            <span className="bg-gradient-to-r from-fuchsia-200 via-pink-100 to-amber-200 bg-clip-text text-transparent">
              One chat.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-8 mx-auto max-w-2xl text-base md:text-xl text-white/90 leading-relaxed"
          >
            Megsy 3.9, Gemini 3.5, GPT‑5.5, Grok 4, Claude Sonnet 4.6 &amp; Opus 4.8 — with Anthropic's
            Claude Code natively integrated. Web search, files, image &amp; video generation.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to="/chat"
              className="inline-flex items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-8 py-4 text-sm md:text-base transition-colors"
            >
              Open Megsy Chat — Free
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center rounded-full border border-white/40 hover:border-white text-white px-8 py-4 text-sm md:text-base transition-colors backdrop-blur-sm bg-white/5"
            >
              See plans
            </Link>
          </motion.div>
        </div>
      </header>

      <main>
        {/* CLAUDE CODE INTEGRATION — top */}
        <section className="border-t border-white/5 pt-12 pb-16 md:pt-16 md:pb-20">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <motion.h2
              {...fadeUp}
              className="text-center font-serif font-semibold leading-[0.95] tracking-[-0.02em] text-white text-[7vw] md:text-[3.2vw]"
              style={{ fontFamily: '"Instrument Serif", "Cormorant Garamond", Georgia, serif' }}
            >
              Claude Code, <em className="italic text-white/70">natively</em> inside Megsy.
            </motion.h2>
            <motion.p
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
              className="mx-auto mt-5 max-w-xl text-center text-sm md:text-base text-foreground/65 leading-relaxed"
            >
              Megsy ships Anthropic's Claude Sonnet 4.5 with the Claude Code SDK wired into every chat —
              repo-aware editing, real shell execution and plan-mode, without leaving the thread.
            </motion.p>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                {
                  mark: "Read · Edit · Grep",
                  title: "Codebase-aware editing",
                  body: "Uses Anthropic's official Read, Write, Edit, Glob and Grep tools to navigate your project and apply surgical multi-file edits inside Claude Sonnet 4.5's 200K context.",
                },
                {
                  mark: "Bash · WebFetch",
                  title: "Real shell + live web",
                  body: "Runs commands through the Bash tool in an isolated runtime and pulls live pages with WebFetch. Install deps, run tests, hit APIs — stdout streams into the message.",
                },
                {
                  mark: "TodoWrite · Task",
                  title: "Plan-mode for long tasks",
                  body: "Long tasks trigger plan-mode: Claude writes a TodoWrite checklist and dispatches parallel subagents via the Task tool — same audit trail as the Claude Code CLI.",
                },
              ].map((c, i) => (
                <motion.article
                  key={c.title}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: 0.05 * i }}
                  className="flex flex-col items-center rounded-t-[120px] rounded-b-[20px] border border-white/10 bg-white/[0.025] px-6 pt-14 pb-8 md:px-7 md:pt-16 md:pb-10 hover:bg-white/[0.05] hover:border-white/20 transition-colors"
                >
                  <div className="flex h-16 md:h-20 items-center justify-center">
                    <span className="font-mono text-lg md:text-xl font-bold tracking-tight text-white">
                      {c.mark}
                    </span>
                  </div>
                  <h3 className="mt-4 text-center font-display text-base md:text-lg font-bold leading-snug text-white">
                    {c.title}
                  </h3>
                  <p className="mt-3 max-w-xs text-center text-xs md:text-sm text-foreground/65 leading-relaxed">
                    {c.body}
                  </p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>





        {/* PER-MODEL SECTIONS */}
        {MODELS.map((m, i) => (
          <ModelSection key={m.id} index={i} model={m} />
        ))}




        {/* CAPABILITIES */}
        <section className="relative overflow-hidden border-t border-white/5 py-24 md:py-32 bg-gradient-to-br from-red-700 via-red-600 to-rose-800 text-white">
          <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,var(--overlay-white-25),transparent_50%),radial-gradient(circle_at_80%_80%,var(--overlay-black-35),transparent_55%)]" />
          <div className="relative mx-auto max-w-7xl px-6">
            <motion.h2
              {...fadeUp}
              className="font-display text-[10vw] font-black uppercase leading-[0.9] tracking-tighter md:text-[5.5vw] text-center max-w-5xl mx-auto"
            >
              Everything a modern chat should do.
            </motion.h2>

            <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {CAPABILITIES.map((c, i) => (
                <motion.article
                  key={c.title}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: 0.05 * i }}
                  className="rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-sm p-6 hover:bg-white/[0.12] hover:border-white/30 transition-colors"
                >
                  <h3 className="font-display text-base font-bold leading-snug text-white">{c.title}</h3>
                  <p className="mt-2 text-sm text-white/80 leading-relaxed">{c.body}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* SKILLS */}
        <section className="relative overflow-hidden border-t border-white/5 bg-white/[0.02] py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <motion.p {...fadeUp} className="text-[11px] uppercase tracking-[0.35em] text-foreground/50">
              Skills
            </motion.p>
            <motion.h2
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.05 }}
              className="mt-5 font-display text-[10vw] font-black uppercase leading-[0.9] tracking-tighter md:text-[5.5vw]"
            >
              A whole team, one keystroke away.
            </motion.h2>
            <motion.p
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
              className="mt-6 max-w-2xl text-base md:text-lg text-foreground/65 leading-relaxed"
            >
              Type <code className="px-1.5 py-0.5 rounded bg-foreground/10 text-foreground/90">/</code>{" "}
              in chat to summon a purpose-built skill. Each carries its own tools, prompts and
              output format.
            </motion.p>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SKILLS.map((s, i) => (
                <motion.article
                  key={s.name}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: 0.05 * i }}
                  className="rounded-2xl border border-white/10 bg-background/60 p-6"
                >
                  <p className="font-mono text-xs text-foreground/50">/{s.name.toLowerCase().replace(/\s+/g, "-")}</p>
                  <h3 className="mt-2 font-display text-base font-bold">{s.name}</h3>
                  <p className="mt-2 text-sm text-foreground/60 leading-relaxed">{s.body}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* INTEGRATIONS */}
        <section className="border-t border-white/5 py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <motion.p {...fadeUp} className="text-[11px] uppercase tracking-[0.35em] text-foreground/50">
              Integrations
            </motion.p>
            <motion.h2
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.05 }}
              className="mt-5 font-display text-[10vw] font-black uppercase leading-[0.9] tracking-tighter md:text-[5.5vw]"
            >
              Plug into the tools you already use.
            </motion.h2>

            <motion.p
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
              className="mt-6 max-w-2xl text-base md:text-lg text-foreground/65 leading-relaxed"
            >
              Bring your stack into the chat — read, write and automate across 24 native integrations,
              plus 6,000 more through Zapier &amp; n8n.
            </motion.p>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.15 }}
              className="mt-14 space-y-5 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
            >
              {[0, 1].map((row) => {
                const items = row === 0 ? INTEGRATIONS.slice(0, 12) : INTEGRATIONS.slice(12);
                return (
                  <div key={row} className="group overflow-hidden">
                    <div
                      className="flex w-max gap-3 animate-marquee"
                      style={{
                        animationDirection: row === 1 ? "reverse" : "normal",
                        animationDuration: row === 1 ? "55s" : "45s",
                      }}
                    >
                      {[...items, ...items, ...items].map((it, idx) => (
                        <div
                          key={`${row}-${idx}-${it.slug}`}
                          className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm text-foreground/90 hover:bg-white/[0.08] hover:border-white/25 transition-colors whitespace-nowrap"
                        >
                          <img
                            src={
                              it.slug === "n8n"
                                ? `https://api.iconify.design/simple-icons/n8n.svg?color=%23ea4b71`
                                : `https://api.iconify.design/logos/${it.slug}.svg`
                            }
                            alt=""
                            width={18}
                            height={18}
                            loading="lazy"
                            className="h-[18px] w-[18px]"
                          />
                          <span>{it.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>

            <motion.p
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.2 }}
              className="mt-8 text-sm text-foreground/50"
            >
              + Zapier &amp; n8n unlock 6,000 more services.
            </motion.p>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-white/5 bg-white/[0.02] py-24 md:py-32">
          <div className="mx-auto max-w-5xl px-6">
            <motion.p {...fadeUp} className="text-[11px] uppercase tracking-[0.35em] text-foreground/50">
              FAQ
            </motion.p>
            <motion.h2
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.05 }}
              className="mt-5 font-display text-[10vw] font-black uppercase leading-[0.9] tracking-tighter md:text-[5vw]"
            >
              Questions, answered.
            </motion.h2>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
              className="mt-12 divide-y divide-white/10 rounded-2xl border border-white/10 bg-background/60"
            >
              {FAQ.map((f) => (
                <details key={f.q} className="group p-6">
                  <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
                    <h3 className="font-display text-base md:text-lg font-semibold">{f.q}</h3>
                    <span className="text-foreground/50 transition-transform group-open:rotate-45 text-2xl leading-none">+</span>
                  </summary>
                  <p className="mt-3 text-sm md:text-base text-foreground/65 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative overflow-hidden border-t border-white/5 px-6 py-32">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260611_183632_c311af08-e4b7-458f-81e7-79847a49b3d3.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative mx-auto max-w-4xl text-center">
            <motion.h2
              {...fadeUp}
              className="font-display text-[12vw] font-black uppercase leading-[0.9] tracking-tighter text-foreground md:text-[6vw]"
            >
              Open Megsy Chat.<br />It's free.
            </motion.h2>
            <motion.p {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="mt-6 text-base md:text-lg text-foreground/75 max-w-xl mx-auto">
              Every model. Native Claude Code. Web search, files, image &amp; video. Sign up in 10
              seconds, no credit card.
            </motion.p>
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}>
              <Link
                to="/chat"
                className="mt-10 inline-flex items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-10 py-4 text-base transition-colors"
              >
                Start chatting now
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <LazyOnVisible minHeight={320} rootMargin="600px"><Suspense fallback={<div style={{ minHeight: 320 }} />}><LandingFooter /></Suspense></LazyOnVisible>
    </div>
  );
};

export default AIChatLandingPage;
