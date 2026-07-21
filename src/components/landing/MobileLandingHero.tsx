/** @doc Mobile-only agent landing page — fully i18n-driven for /en /ar /ar-eg /es /fr. */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  CalendarDays,
  Check,
  Code2,
  Database,
  FileText,
  Film,
  GraduationCap,
  Image as ImageIcon,
  Languages,
  Mail,
  Megaphone,
  Menu,
  X,
  MessageSquare,
  Mic,
  Microscope,
  Minus,
  PenLine,
  Plus,
  Presentation,
  Sheet,
  Sparkles,
  Star,
  ShieldCheck,
  Users,
  Wand2,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import MegsyStar from "@/components/branding/MegsyStar";
import VelorahHero from "@/components/landing/VelorahHero";
import heroEnVideo from "@/assets/landing/parallax-showcase-en.mp4.asset.json";
import heroArMobileVideo from "@/assets/landing/parallax-showcase-ar.mp4.asset.json";
import { lazyWithRetry as lazy } from "@/lib/lazyWithRetry";
import { Suspense } from "react";
import { LazyOnVisible } from "@/components/common/LazyOnVisible";
import { usePrefetchOnIdle } from "@/hooks/usePrefetchOnIdle";
import { useLandingContent } from "@/lib/landing/LandingContentContext";
import { useMobileContent } from "@/lib/landing/mobile-i18n";
import type {
  MobilePersona,
  MobileServiceItem,
} from "@/lib/landing/mobile-i18n/types";

// Footer is below the fold and imports its own icon/asset graph — defer it.
const LandingFooter = lazy(() => import("@/components/landing/LandingFooter"));

/* ---------- Demo video with mute/unmute toggle ---------- */
const DemoVideo = ({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    const v = videoRef.current;
    if (!v) return;
    v.muted = next;
    if (!next) v.play().catch(() => void 0);
  };

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted={muted}
        loop
        playsInline
        preload="auto"
        className="w-full h-full block object-cover"
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          v.play().catch(() => void 0);
        }}
      />
      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? "Unmute video" : "Mute video"}
        className="absolute bottom-3 right-3 w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md active:scale-95 transition"
        style={{
          background: "var(--overlay-black-55)",
          border: "1px solid var(--overlay-white-18)",
          color: "#fff",
        }}
      >
        {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>
    </div>
  );
};

/* ---------- language-neutral data ---------- */
const comparisonModels = [
  { name: "Claude Code", price: "$20", domain: "claude.ai" },
  { name: "HiggsField", price: "$49", domain: "higgsfield.ai" },
  { name: "Lovable", price: "$25", domain: "lovable.dev" },
  { name: "ChatGPT", price: "$20", domain: "openai.com" },
  { name: "Midjourney", price: "$10", domain: "midjourney.com" },
  { name: "Perplexity", price: "$20", domain: "perplexity.ai" },
  { name: "Gamma", price: "$20", domain: "gamma.app" },
  { name: "Codex", price: "$20", domain: "openai.com" },
  { name: "Bolt", price: "$20", domain: "bolt.new" },
];

const partnerLogos = [
  { name: "Zoom", domain: "zoom.us" },
  { name: "Netflix", domain: "netflix.com" },
  { name: "Sony", domain: "sony.com" },
  { name: "Uber", domain: "uber.com" },
  { name: "Pinterest", domain: "pinterest.com" },
  { name: "Walmart", domain: "walmart.com" },
  { name: "eBay", domain: "ebay.com" },
  { name: "Cisco", domain: "cisco.com" },
  { name: "Spotify", domain: "spotify.com" },
  { name: "Airbnb", domain: "airbnb.com" },
  { name: "Adobe", domain: "adobe.com" },
  { name: "Shopify", domain: "shopify.com" },
  { name: "Notion", domain: "notion.so" },
  { name: "Figma", domain: "figma.com" },
  { name: "Stripe", domain: "stripe.com" },
  { name: "Slack", domain: "slack.com" },
  { name: "Google", domain: "google.com" },
  { name: "Microsoft", domain: "microsoft.com" },
  { name: "Apple", domain: "apple.com" },
  { name: "Amazon", domain: "amazon.com" },
  { name: "Meta", domain: "meta.com" },
  { name: "IBM", domain: "ibm.com" },
  { name: "Oracle", domain: "oracle.com" },
  { name: "Intel", domain: "intel.com" },
  { name: "NVIDIA", domain: "nvidia.com" },
  { name: "Samsung", domain: "samsung.com" },
  { name: "Tesla", domain: "tesla.com" },
  { name: "PayPal", domain: "paypal.com" },
  { name: "Salesforce", domain: "salesforce.com" },
  { name: "Dropbox", domain: "dropbox.com" },
  { name: "GitHub", domain: "github.com" },
  { name: "GitLab", domain: "gitlab.com" },
  { name: "Atlassian", domain: "atlassian.com" },
  { name: "Asana", domain: "asana.com" },
  { name: "Trello", domain: "trello.com" },
  { name: "Zendesk", domain: "zendesk.com" },
  { name: "HubSpot", domain: "hubspot.com" },
  { name: "Mailchimp", domain: "mailchimp.com" },
  { name: "Canva", domain: "canva.com" },
  { name: "Miro", domain: "miro.com" },
  { name: "Loom", domain: "loom.com" },
  { name: "Discord", domain: "discord.com" },
  { name: "Twitch", domain: "twitch.tv" },
  { name: "Reddit", domain: "reddit.com" },
  { name: "LinkedIn", domain: "linkedin.com" },
  { name: "X", domain: "x.com" },
  { name: "YouTube", domain: "youtube.com" },
  { name: "TikTok", domain: "tiktok.com" },
  { name: "Snapchat", domain: "snap.com" },
  { name: "WhatsApp", domain: "whatsapp.com" },
  { name: "Telegram", domain: "telegram.org" },
  { name: "Cloudflare", domain: "cloudflare.com" },
  { name: "Vercel", domain: "vercel.com" },
  { name: "Supabase", domain: "supabase.com" },
  { name: "OpenAI", domain: "openai.com" },
  { name: "Anthropic", domain: "anthropic.com" },
  { name: "HuggingFace", domain: "huggingface.co" },
  { name: "Databricks", domain: "databricks.com" },
  { name: "Snowflake", domain: "snowflake.com" },
  { name: "MongoDB", domain: "mongodb.com" },
  { name: "Redis", domain: "redis.io" },
  { name: "Docker", domain: "docker.com" },
  { name: "Twilio", domain: "twilio.com" },
  { name: "SendGrid", domain: "sendgrid.com" },
  { name: "Coinbase", domain: "coinbase.com" },
  { name: "Binance", domain: "binance.com" },
  { name: "Robinhood", domain: "robinhood.com" },
  { name: "Revolut", domain: "revolut.com" },
  { name: "Booking", domain: "booking.com" },
  { name: "Expedia", domain: "expedia.com" },
  { name: "Delta", domain: "delta.com" },
  { name: "Nike", domain: "nike.com" },
  { name: "Puma", domain: "puma.com" },
  { name: "BMW", domain: "bmw.com" },
  { name: "Mercedes", domain: "mercedes-benz.com" },
  { name: "Toyota", domain: "toyota.com" },
  { name: "Ford", domain: "ford.com" },
  { name: "Disney", domain: "disney.com" },
  { name: "HBO", domain: "hbo.com" },
  { name: "Xbox", domain: "xbox.com" },
  { name: "PlayStation", domain: "playstation.com" },
  { name: "Steam", domain: "steampowered.com" },
  { name: "Epic Games", domain: "epicgames.com" },
];

// Icon mapping so translated content stays plain-string while icons stay typed.
const SERVICE_ICONS: Record<MobileServiceItem["iconKey"], LucideIcon> = {
  chat: MessageSquare,
  writing: PenLine,
  code: Code2,
  image: ImageIcon,
  video: Film,
  research: Microscope,
  docs: FileText,
  sheets: Database,
  slides: Presentation,
  voice: Mic,
  translate: Languages,
  agents: Wand2,
};

const PERSONA_ICONS: Record<MobilePersona["iconKey"], LucideIcon> = {
  creators: Sparkles,
  marketers: Megaphone,
  developers: Code2,
  researchers: Microscope,
};

// Base plan pricing (currency-neutral numbers, formatted per locale below).
const PLAN_PRICING = {
  pro: { monthly: 25, yearly: 250, firstMonth: 7 as number | undefined },
  elite: { monthly: 59, yearly: 590, firstMonth: undefined },
  business: { monthly: 149, yearly: 1490, firstMonth: undefined },
} as const;

/* ---------- palette (inline to bypass any theme override) ---------- */
const C = {
  page: "#FAFAF7",
  card: "#FFFFFF",
  card2: "#F5F3EE",
  featureCard: "#FFFFFF",
  ink: "#1A1A1A",
  ink2: "rgba(26,26,26,0.78)",
  mute: "rgba(26,26,26,0.55)",
  mute2: "rgba(26,26,26,0.38)",
  line: "rgba(26,26,26,0.10)",
  soft: "rgba(26,26,26,0.05)",
  lilac: "#E1E0CC",
  accent: "#C8632A",
};

const SectionTitle = ({ children, center = false }: { children: string; center?: boolean }) => (
  <h2
    className={`font-normal leading-[0.9] ${center ? "text-center" : ""}`}
    style={{
      color: C.ink,
      fontFamily: "'Instrument Serif', serif",
      letterSpacing: "-0.04em",
      fontSize: "clamp(48px, 14vw, 64px)",
    }}
  >
    {children}
  </h2>
);

const StickyCta = ({
  primary,
  secondary,
  caption,
  onPrimary,
  onSecondary,
}: {
  primary: string;
  secondary: string;
  caption: string;
  onPrimary: () => void;
  onSecondary: () => void;
}) => (
  <div
    className="fixed inset-x-0 bottom-0 md:hidden z-50 px-4"
    translate="no"
    lang="en"
    data-no-translate="true"
    style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)", paddingTop: "12px" }}
  >
    <div
      className="mx-auto flex items-center gap-2 rounded-full p-1.5"
      style={{
        background: "rgba(255,255,255,0.92)",
        border: `1px solid ${C.line}`,
        backdropFilter: "blur(18px)",
        boxShadow: "0 12px 40px rgba(26,26,26,0.12)",
      }}
    >
      <button
        onClick={onPrimary}
        className="flex-1 h-11 rounded-full text-[13px] font-semibold whitespace-nowrap truncate active:scale-[.98] transition"
        style={{ background: C.ink, color: C.page }}
      >
        {primary}
      </button>
      <button
        onClick={onSecondary}
        className="flex-1 h-11 rounded-full text-[13px] font-medium whitespace-nowrap truncate active:scale-[.98] transition"
        style={{ background: "transparent", color: C.ink }}
      >
        {secondary}
      </button>
    </div>
  </div>

);

const sectionStyle = { background: C.page };

/* ---------- editorial section index label ---------- */
const IndexLabel = ({ number, label }: { number: string; label: string }) => (
  <div
    className="flex items-center gap-3 mb-5"
    style={{ color: C.mute }}
  >
    <span
      className="text-[11px] tracking-[0.28em] uppercase"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {number}
    </span>
    <span
      className="h-px flex-1"
      style={{ background: C.line }}
    />
    <span
      className="text-[11px] tracking-[0.28em] uppercase"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {label}
    </span>
  </div>
);

/* ---------- component ---------- */
const MobileLandingHero = () => {
  const navigate = useNavigate();
  const { locale } = useLandingContent();
  const t = useMobileContent(locale.code);
  const isRtl = locale.dir === "rtl";

  usePrefetchOnIdle(["/auth", "/pricing", "/chat"], 1500);
  const [billing, setBilling] = useState<"annual" | "monthly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const partnerScrollerRef = useRef<HTMLDivElement | null>(null);

  // Close the menu on route navigation.
  const go = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  // Localized labels for the mobile menu overlay. Keep inline so we don't
  // have to widen the mobile i18n schema for a small UI addition.
  const menuLabels = (() => {
    const code = locale.code;
    if (code.startsWith("ar")) {
      return { chat: "افتح الشات", login: "دخول", signup: "ابدأ مجاناً", pricing: "الأسعار", close: "إغلاق" };
    }
    if (code.startsWith("es")) {
      return { chat: "Ir al chat", login: "Iniciar sesión", signup: "Empezar gratis", pricing: "Precios", close: "Cerrar" };
    }
    if (code.startsWith("fr")) {
      return { chat: "Aller au chat", login: "Se connecter", signup: "Commencer gratuitement", pricing: "Tarifs", close: "Fermer" };
    }
    return { chat: "Go to chat", login: "Log in", signup: "Start free", pricing: "Pricing", close: "Close" };
  })();

  useEffect(() => {
    const scroller = partnerScrollerRef.current;
    if (!scroller) return;
    let frameId = 0;
    let lastTime = performance.now();
    const start = () => {
      const loopWidth = scroller.scrollWidth / 2;
      if (loopWidth > 0) scroller.scrollLeft = loopWidth;
    };
    const tick = (time: number) => {
      const delta = Math.min(time - lastTime, 32);
      lastTime = time;
      const loopWidth = scroller.scrollWidth / 2;
      if (loopWidth > scroller.clientWidth) {
        scroller.scrollLeft -= delta * 0.035;
        if (scroller.scrollLeft <= 0) scroller.scrollLeft = loopWidth;
      }
      frameId = requestAnimationFrame(tick);
    };
    start();
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Testimonials + services rows use pure CSS marquees (see index.css).

  const testimonials = useMemo(
    () =>
      t.testimonials.map((x) => ({
        ...x,
        avatar: `https://api.dicebear.com/9.x/notionists/svg?seed=${x.seed}&backgroundColor=f1f5f9,e0e7ff,fef3c7,fce7f3,dcfce7`,
      })),
    [t.testimonials],
  );

  const goAuth = () => navigate("/auth");
  const goPricing = () => navigate("/pricing");

  const serviceByKey = (keys: MobileServiceItem["iconKey"][]) =>
    keys.map((key) => t.services.items.find((item) => item.iconKey === key)).filter(Boolean) as MobileServiceItem[];

  const toolGroups = [
    { title: isRtl ? "اعمل" : "Create", items: serviceByKey(["image", "video"]) },
    { title: isRtl ? "اكتب" : "Write", items: serviceByKey(["chat", "docs"]) },
    { title: isRtl ? "ابني" : "Build", items: serviceByKey(["code", "agents"]) },
  ];

  const proofStats = isRtl
    ? ["80+ موديل", "أداة واحدة", "من أول شهر"]
    : ["80+ models", "One workspace", "Save first month"];

  const personaPrompts = isRtl
    ? ["اعمل حملة كاملة", "طلع صور وفيديو", "ابني MVP", "لخّص مصادر"]
    : ["Launch a campaign", "Make visuals", "Build an MVP", "Digest sources"];

  return (
    <div
      className="md:hidden min-h-dvh pb-40 relative"
      dir={locale.dir}
      lang={locale.code}
      style={{
        background: C.page,
        color: C.ink,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <VelorahHero />

      {/* Partners */}
      <section className="pt-16" style={sectionStyle}>
        <p className="text-center text-[11px] uppercase tracking-[0.24em] px-5" style={{ color: C.mute2 }}>{t.partnersLabel}</p>
        <div
          ref={partnerScrollerRef}
          dir="ltr"
          className="mt-6 overflow-hidden"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          <div
            dir="ltr"
            className="mobile-partners-marquee flex items-center gap-8 w-max pb-2 notranslate"
            translate="no"
            lang="en"
            data-no-translate="true"
          >
            {[...partnerLogos, ...partnerLogos].map((p, i) => (
              <span
                key={`${p.name}-${i}`}
                className="text-[14px] font-medium tracking-tight shrink-0 notranslate"
                style={{ color: C.mute, fontFamily: "'Inter', sans-serif", letterSpacing: "0.02em" }}
                translate="no"
                lang="en"
              >
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Demo video */}
      <section className="px-5 pt-20" style={sectionStyle}>
        <IndexLabel number="01" label="Live demo" />
        <div
          className="rounded-[24px] overflow-hidden relative promo-noise"
          style={{
            background: C.card,
            border: `1px solid ${C.line}`,
            aspectRatio: "16 / 9",
            boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
          }}
        >
          <LazyOnVisible
            rootMargin="400px"
            minHeight="100%"
            fallback={<div style={{ width: "100%", height: "100%", background: C.card }} />}
          >
            <DemoVideo src={locale.code.startsWith("ar") ? heroArMobileVideo.url : heroEnVideo.url} />
          </LazyOnVisible>
        </div>
      </section>

      {/* Proof */}
      <section className="px-5 pt-24" style={sectionStyle}>
        <IndexLabel number="02" label="Proof" />
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[22px]" style={{ border: `1px solid ${C.line}`, background: C.line }}>
          {proofStats.map((stat) => (
            <div key={stat} className="px-3 py-4 text-center" style={{ background: C.card }}>
              <div className="text-[12px] font-semibold leading-tight" style={{ color: C.ink }}>{stat}</div>
            </div>
          ))}
        </div>
        <div
          className="mt-4 rounded-[28px] p-6"
          style={{ background: C.ink, color: C.page }}
        >
          <div className="flex gap-1 mb-5">
            {Array.from({ length: 5 }).map((_, s) => (
              <Star key={s} className="w-3.5 h-3.5" style={{ color: C.accent }} fill="currentColor" />
            ))}
          </div>
          <p
            className="text-[30px] leading-[1.02]"
            style={{ fontFamily: "'Instrument Serif', serif", letterSpacing: "-0.025em" }}
          >
            &ldquo;{testimonials[0]?.quote}&rdquo;
          </p>
          <div className="mt-6 flex items-center gap-3">
            {testimonials[0]?.avatar && (
              <img src={testimonials[0].avatar} alt={testimonials[0].name} loading="lazy" className="w-10 h-10 rounded-full object-cover" />
            )}
            <span className="text-[13px] font-semibold" style={{ color: "rgba(250,250,247,0.76)" }}>{testimonials[0]?.name}</span>
          </div>
        </div>
      </section>

      {/* Services showcase */}
      <section className="px-5 pt-24" style={sectionStyle}>
        <IndexLabel number="03" label="Toolkit" />
        <div>
          <h2
            className="font-normal leading-[0.88]"
            style={{
              color: C.ink,
              fontFamily: "'Instrument Serif', serif",
              letterSpacing: "-0.045em",
              fontSize: "clamp(56px, 17vw, 76px)",
            }}
          >
            {t.services.title}
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed max-w-[340px]" style={{ color: C.mute }}>
            {t.services.subtitle}
          </p>
        </div>

        <div className="mt-12 space-y-10">
          {toolGroups.map((group, groupIndex) => (
            <div key={group.title}>
              {/* Category header — editorial index style */}
              <div className="flex items-baseline gap-3 pb-3" style={{ borderBottom: `1px solid ${C.ink}` }}>
                <span
                  className="text-[11px] tracking-[0.28em] uppercase font-semibold"
                  style={{ color: C.accent, fontFamily: "'Inter', sans-serif" }}
                >
                  0{groupIndex + 1}
                </span>
                <h3
                  className="text-[32px] leading-none"
                  style={{ fontFamily: "'Instrument Serif', serif", letterSpacing: "-0.03em", color: C.ink }}
                >
                  {group.title}
                </h3>
                <span className="ms-auto text-[11px]" style={{ color: C.mute }}>
                  {group.items.length}
                </span>
              </div>

              {/* Tools as editorial rows */}
              <ul>
                {group.items.map((s, i) => {
                  const Icon = SERVICE_ICONS[s.iconKey];
                  const isLast = i === group.items.length - 1;
                  return (
                    <li
                      key={s.title}
                      className="flex items-start gap-4 py-4"
                      style={{ borderBottom: isLast ? "none" : `1px solid ${C.line}` }}
                    >
                      <span
                        className="flex items-center justify-center rounded-full shrink-0"
                        style={{
                          width: 40, height: 40,
                          background: C.soft,
                          border: `1px solid ${C.line}`,
                        }}
                      >
                        <Icon className="w-[18px] h-[18px]" style={{ color: C.ink }} strokeWidth={1.6} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-[19px] leading-tight"
                          style={{ fontFamily: "'Instrument Serif', serif", letterSpacing: "-0.02em", color: C.ink }}
                        >
                          {s.title}
                        </div>
                        <p className="mt-1 text-[13px] leading-snug" style={{ color: C.mute }}>
                          {s.body}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-5 pt-24" style={sectionStyle}>
        <IndexLabel number="04" label="Pricing" />
        <h2
          className="text-center font-normal leading-[0.9]"
          style={{
            color: C.ink,
            fontFamily: "'Instrument Serif', serif",
            letterSpacing: "-0.04em",
            fontSize: "clamp(48px, 14vw, 64px)",
          }}
        >
          {t.pricing.sectionTitle}
        </h2>

        {/* Billing toggle */}
        <div className="mt-6 mx-auto w-fit p-1 rounded-full flex items-center" style={{ background: C.soft }}>
          <button
            onClick={() => setBilling("monthly")}
            className="px-5 py-2 rounded-full text-[14px] font-medium transition"
            style={{ background: billing === "monthly" ? C.card : "transparent", color: billing === "monthly" ? C.ink : C.mute, boxShadow: billing === "monthly" ? "0 1px 3px rgba(0,0,0,.08)" : "none" }}
          >
            {t.pricing.monthly}
          </button>
          <button
            onClick={() => setBilling("annual")}
            className="px-4 py-2 rounded-full text-[14px] font-medium transition"
            style={{ background: billing === "annual" ? C.card : "transparent", color: billing === "annual" ? C.ink : C.mute, boxShadow: billing === "annual" ? "0 1px 3px rgba(0,0,0,.08)" : "none" }}
          >
            {t.pricing.annual} <span style={{ color: C.mute }}>{t.pricing.annualBadge}</span>
          </button>
        </div>

        {/* Plan cards */}
        <div className="mt-6 space-y-4">
          {t.pricing.plans.map((p) => {
            const overridePricing = t.pricing.priceOverrides?.[p.id];
            const pricing = overridePricing ?? PLAN_PRICING[p.id];
            const fmt = t.pricing.formatPrice ?? ((n: number) => `$${n}`);
            const isProFirstMonth = p.id === "pro" && billing === "monthly" && typeof pricing.firstMonth === "number";
            const regularPrice = billing === "annual" ? Math.round(pricing.yearly / 12) : pricing.monthly;
            const displayPrice = isProFirstMonth ? pricing.firstMonth! : regularPrice;
            const features = billing === "annual" ? p.yearlyFeatures : p.monthlyFeatures;
            const billingLabel = billing === "annual"
              ? t.pricing.billedYearly(pricing.yearly)
              : t.pricing.billedMonthly;
            return (
              <div
                key={p.id}
                className="rounded-[28px] overflow-hidden"
                style={{
                  background: p.tag ? C.ink : C.card,
                  color: p.tag ? C.page : C.ink,
                  border: `1px solid ${p.tag ? C.ink : C.line}`,
                  boxShadow: p.tag ? "0 18px 44px rgba(26,26,26,0.16)" : "none",
                }}
              >
                <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="text-[34px] font-normal" style={{ fontFamily: "'Instrument Serif', serif", letterSpacing: "-0.03em" }}>{p.name}</div>
                  {p.tag && (
                    <span className="px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-[0.14em]" style={{ background: C.accent, color: "#FFFFFF" }}>{p.tag}</span>
                  )}
                </div>
                <p className="mt-2 text-[14px] leading-snug" style={{ color: p.tag ? "rgba(250,250,247,0.62)" : C.mute }}>{p.tagline}</p>

                <div className="mt-6 flex flex-wrap items-end gap-2">
                  <span className="text-[58px] font-normal leading-none" style={{ fontFamily: "'Instrument Serif', serif", letterSpacing: "-0.03em" }}>{fmt(displayPrice)}</span>
                  <span className="pb-1 text-[14px]" style={{ color: p.tag ? "rgba(250,250,247,0.55)" : C.mute }}>
                    /{isProFirstMonth ? t.pricing.perFirstMonth : t.pricing.perMonth}, {billingLabel}
                  </span>
                </div>
                {isProFirstMonth && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-[13px] line-through" style={{ color: p.tag ? "rgba(250,250,247,0.45)" : C.mute }}>{fmt(pricing.monthly)}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: p.tag ? C.accent : C.ink, color: "#FFFFFF" }}>{t.pricing.firstMonthBadge}</span>
                    <span className="text-[11px]" style={{ color: p.tag ? "rgba(250,250,247,0.55)" : C.mute }}>{t.pricing.thenPricePrefix}{fmt(pricing.monthly)}{t.pricing.thenPriceSuffix}</span>
                  </div>
                )}

                <button
                  onClick={goAuth}
                  className="mt-5 w-full h-13 py-3.5 rounded-full text-[13px] font-semibold active:scale-[.98] transition"
                  style={{
                    background: p.tag ? C.accent : C.ink,
                    color: "#FFFFFF",
                    border: "none",
                    boxShadow: p.tag
                      ? "0 10px 28px rgba(200,99,42,0.35)"
                      : "0 8px 24px rgba(26,26,26,0.15)",
                  }}
                >
                  {p.cta}
                </button>
                </div>

                <div className="grid grid-cols-2 gap-px" style={{ background: p.tag ? "rgba(250,250,247,0.12)" : C.line }}>
                  {features.slice(0, 4).map((f, i) => (
                    <div key={i} className="min-h-[94px] p-4" style={{ background: p.tag ? C.ink : C.card }}>
                      <Check className="w-4 h-4 mb-3" style={{ color: p.tag ? C.accent : C.ink }} strokeWidth={2.4} />
                      <span className="text-[12px] leading-snug" style={{ color: p.tag ? "rgba(250,250,247,0.66)" : C.ink2 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Savings story */}
      <section className="px-5 pt-24" style={sectionStyle}>
        <IndexLabel number="05" label="The math" />
        <h2
          className="font-normal leading-[0.9]"
          style={{
            color: C.ink,
            fontFamily: "'Instrument Serif', serif",
            letterSpacing: "-0.04em",
            fontSize: "clamp(48px, 14vw, 64px)",
          }}
        >
          {t.savings.title1}<br /><span style={{ fontStyle: "italic" }}>{t.savings.title2}</span>
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed" style={{ color: C.mute }}>
          {t.savings.subtitle}
        </p>

        {/* Competitor receipt visual */}
        <div
          className="mt-8 rounded-[28px] overflow-hidden"
          style={{ border: `1px solid ${C.ink}`, background: C.card }}
        >
          <div className="px-5 py-4 flex items-center justify-between" style={{ background: C.ink, color: C.page }}>
            <span className="text-[11px] tracking-[0.24em] uppercase">{isRtl ? "الفاتورة القديمة" : "Old bill"}</span>
            <span className="text-[11px] tracking-[0.24em] uppercase">{isRtl ? "ملغية" : "Cancelled"}</span>
          </div>
          {comparisonModels.map((m) => (
            <div
              key={m.name}
              className="flex items-center justify-between px-5 py-3.5"
              style={{
                borderBottom: `1px solid ${C.line}`,
                color: C.mute,
              }}
            >
              <span className="text-[13px] line-through" style={{ fontFamily: "'Inter', sans-serif" }}>{m.name}</span>
              <span className="text-[12px] line-through" style={{ color: C.mute2 }}>{m.price}/mo</span>
            </div>
          ))}
          <div
            className="flex items-center justify-between px-5 py-5"
            style={{ background: C.accent, color: "#FFFFFF" }}
          >
            <span className="text-[16px] font-semibold">Megsy — all-in</span>
            <span
              className="text-[26px] font-normal"
              style={{ fontFamily: "'Instrument Serif', serif", letterSpacing: "-0.02em", fontStyle: "italic" }}
            >
              $7
            </span>
          </div>
        </div>

      </section>

      {/* Personas */}
      <section className="px-5 pt-24" style={sectionStyle}>
        <IndexLabel number="06" label="Built for you" />
        <SectionTitle>{t.personas.title}</SectionTitle>
        <div className="mt-8 flex gap-3 overflow-x-auto -mx-5 px-5 pb-3 snap-x" style={{ scrollbarWidth: "none" }}>
          {t.personas.items.map((p, i) => {
            const Icon = PERSONA_ICONS[p.iconKey];
            return (
              <div
                key={p.title}
                className="w-[285px] shrink-0 snap-center rounded-[28px] p-5"
                style={{ background: i === 0 ? C.ink : C.card, color: i === 0 ? C.page : C.ink, border: `1px solid ${i === 0 ? C.ink : C.line}` }}
              >
                <div
                  className="flex items-center justify-between mb-12"
                >
                  <span className="text-[11px] tracking-[0.24em] uppercase" style={{ color: i === 0 ? C.accent : C.mute2 }}>0{i + 1}</span>
                  <Icon className="w-5 h-5" style={{ color: i === 0 ? C.accent : C.ink }} strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-[12px] font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: i === 0 ? "rgba(250,250,247,0.52)" : C.accent }}>
                    {personaPrompts[i]}
                  </div>
                  <div
                    className="text-[32px] mb-3 font-normal leading-none"
                    style={{ fontFamily: "'Instrument Serif', serif", letterSpacing: "-0.03em" }}
                  >
                    {p.title}
                  </div>
                  <p className="text-[14px] leading-relaxed" style={{ color: i === 0 ? "rgba(250,250,247,0.62)" : C.mute }}>{p.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 pt-24" style={sectionStyle}>
        <IndexLabel number="07" label="Questions" />
        <SectionTitle>{t.faq.title}</SectionTitle>
        <p className="mt-4 text-[15px] leading-relaxed" style={{ color: C.mute }}>
          {t.faq.subtitle}
        </p>
        <div className="mt-8" style={{ borderTop: `1px solid ${C.line}` }}>
          {t.faq.items.map((f, i) => {
            const open = openFaq === i;
            return (
              <div key={f.q} style={{ borderBottom: `1px solid ${C.line}` }}>
                <button
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left"
                  style={{ color: C.ink }}
                >
                  <span className="text-[16px] font-medium">{f.q}</span>
                  {open ? <Minus className="w-5 h-5 shrink-0" style={{ color: C.mute }} /> : <Plus className="w-5 h-5 shrink-0" style={{ color: C.mute }} />}
                </button>
                {open && (
                  <p className="pb-5 text-[14px] leading-relaxed" style={{ color: C.mute }}>{f.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <LazyOnVisible minHeight={320} rootMargin="600px">
        <Suspense fallback={<div style={{ minHeight: 320 }} />}>
          <LandingFooter />
        </Suspense>
      </LazyOnVisible>

      <StickyCta
        primary={t.stickyCta.primary}
        secondary={t.stickyCta.secondary}
        caption={t.stickyCta.caption}
        onPrimary={goAuth}
        onSecondary={goPricing}
      />
    </div>
  );
};

export default MobileLandingHero;
