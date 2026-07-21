/** @doc Public home page — hero, showcase, featured demos and pricing preview. */
import { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import type Lenis from "lenis";
import { LazyMotion, domAnimation } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import LandingNavbar from "@/components/landing/LandingNavbar";
import SkipToContent from "@/components/common/SkipToContent";
import HeroSection from "@/components/landing/HeroSection";
import SEOHead from "@/components/common/SEOHead";
import InViewSection from "@/components/common/InViewSection";
import { LandingContentProvider, useLandingContent } from "@/lib/landing/LandingContentContext";
import type { LocaleCode } from "@/lib/landing/i18n/locales";
import { getUserLang } from "@/lib/authI18n";

// Non-critical decorative overlay — defer to idle so it doesn't compete
// with hero paint. Load only after the browser goes idle post-hydration.
const FlyingMegsyStar = lazy(() => import("@/components/landing/FlyingMegsyStar"));

// Below-the-fold — lazy load to keep landing FCP fast on weak devices
const StatsMarquee = lazy(() => import("@/components/landing/StatsMarquee"));

const HorizontalGallery = lazy(() => import("@/components/landing/HorizontalGallery"));
const StickyFeatureTabs = lazy(() => import("@/components/landing/StickyFeatureTabs"));
const ParallaxShowcase = lazy(() => import("@/components/landing/ParallaxShowcase"));
const ShowcaseGallery = lazy(() => import("@/components/landing/ShowcaseGallery"));
const CreativeBlueprintsSection = lazy(
  () => import("@/components/landing/CreativeBlueprintsSection"),
);
const MegsyChatModelsSection = lazy(() => import("@/components/landing/MegsyChatModelsSection"));
const MegsyCodeModelsSection = lazy(() => import("@/components/landing/MegsyCodeModelsSection"));
const HowItWorks = lazy(() => import("@/components/landing/HowItWorks"));
const PricingPreview = lazy(() => import("@/components/landing/PricingPreview"));
const ReferralSection = lazy(() => import("@/components/landing/ReferralSection"));
const FAQSection = lazy(() => import("@/components/landing/FAQSection"));
const CTASection = lazy(() => import("@/components/landing/CTASection"));
const FinalHeroCTA = lazy(() => import("@/components/landing/FinalHeroCTA"));
const LandingFooter = lazy(() => import("@/components/landing/LandingFooter"));

const SectionFallback = () => (
  <div className="min-h-[200px] w-full px-4 py-16 mx-auto max-w-7xl">
    <div className="h-8 w-48 rounded-md bg-foreground/[0.04] animate-pulse mb-6" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="h-32 rounded-xl bg-foreground/[0.04] animate-pulse" />
      <div className="h-32 rounded-xl bg-foreground/[0.04] animate-pulse" />
      <div className="h-32 rounded-xl bg-foreground/[0.04] animate-pulse" />
    </div>
  </div>
);

const LandingSEO = () => {
  const { locale, content } = useLandingContent();
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Megsy AI",
    url: "https://megsyai.com",
    logo: "https://megsyai.com/icons/icon-512.png",
    sameAs: ["https://twitter.com/MegsyAI"],
  };
  const siteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Megsy AI",
    url: "https://megsyai.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://megsyai.com/?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
  return (
    <>
    <SEOHead
      title={content.meta.title}
      description={content.meta.description}
      path={locale.path || "/"}
      locale={locale.code}
      emitLandingAlternates
    />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(orgLd)}</script>
        <script type="application/ld+json">{JSON.stringify(siteLd)}</script>
      </Helmet>
    </>
  );
};

interface LandingPageProps {
  locale?: LocaleCode;
}

const LandingPage = ({ locale }: LandingPageProps) => {
  const navigate = useNavigate();
  // Render landing immediately; auth check happens in background so the
  // first paint is not blocked by a Supabase network round-trip.
  const [ready, setReady] = useState(true);
  const [autoLocale, setAutoLocale] = useState<LocaleCode>(locale ?? "en");
  const effectiveLocale = locale ?? autoLocale;
  // Defer the decorative FlyingMegsyStar until the browser is idle so it
  // doesn't compete with the hero paint / hydration.
  const [starReady, setStarReady] = useState(false);
  useEffect(() => {
    if (locale) return;
    const syncLocale = () => setAutoLocale(getUserLang() as LocaleCode);
    syncLocale();
    window.addEventListener("languagechange-custom", syncLocale);
    window.addEventListener("storage", syncLocale);
    return () => {
      window.removeEventListener("languagechange-custom", syncLocale);
      window.removeEventListener("storage", syncLocale);
    };
  }, [locale]);

  useEffect(() => {
    type IdleWin = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    };
    const w = window as IdleWin;
    const schedule = w.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 400));
    const id = schedule(() => setStarReady(true), { timeout: 1500 });
    return () => {
      if (typeof id === "number") clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const isTouch =
      window.matchMedia("(hover: none) and (pointer: coarse)").matches || window.innerWidth < 1024;

    // On touch devices, native scroll feels far better than Lenis' synthetic touch sync.
    // Skip Lenis entirely on mobile/tablets to fix laggy/sticky scroll.
    if (isTouch) return;

    let rafId = 0;
    let lenis: Lenis | null = null;
    let cancelled = false;

    // Dynamic import — keeps Lenis out of the landing's initial JS bundle.
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
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      lenis?.stop();
      lenis?.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
      document.documentElement.removeAttribute("data-lenis-smooth");
    };
  }, [ready]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/chat", { replace: true });
      }
    });
  }, [navigate]);


  return (
    <LandingContentProvider locale={effectiveLocale}>
      <LandingSEO />
      <LazyMotion features={domAnimation}>
        <>
          <div data-theme="dark" className="min-h-dvh overflow-x-clip bg-background text-foreground">
          <SkipToContent />
          <LandingNavbar />
          {starReady && (
            <Suspense fallback={null}>
              <FlyingMegsyStar />
            </Suspense>
          )}
          <main id="main">
            <HeroSection />
            {/* Product showcase video (works on desktop + mobile). */}
            {/* Each section is InViewSection: chunk downloads + component
                hydrates only when the placeholder is near the viewport. This
                keeps landing initial JS tiny even with 14 sections. */}
            <InViewSection fallback={<SectionFallback />}><ParallaxShowcase /></InViewSection>
            <InViewSection fallback={<SectionFallback />}><StatsMarquee /></InViewSection>
            <InViewSection fallback={<SectionFallback />}><HorizontalGallery /></InViewSection>
            <InViewSection fallback={<SectionFallback />}><StickyFeatureTabs /></InViewSection>
            <InViewSection fallback={<SectionFallback />}><MegsyChatModelsSection /></InViewSection>
            <InViewSection fallback={<SectionFallback />}><ShowcaseGallery /></InViewSection>
            <InViewSection fallback={<SectionFallback />}><MegsyCodeModelsSection /></InViewSection>
            <InViewSection fallback={<SectionFallback />}><CreativeBlueprintsSection /></InViewSection>
            <InViewSection fallback={<SectionFallback />}><HowItWorks /></InViewSection>
            <InViewSection fallback={<SectionFallback />}><PricingPreview /></InViewSection>
            <InViewSection fallback={<SectionFallback />}><ReferralSection /></InViewSection>
            <InViewSection fallback={<SectionFallback />}><FAQSection /></InViewSection>
            <InViewSection fallback={<SectionFallback />}><CTASection /></InViewSection>
            <InViewSection fallback={<SectionFallback />}><FinalHeroCTA /></InViewSection>
          </main>
          <InViewSection fallback={<SectionFallback />}><LandingFooter /></InViewSection>
          </div>
        </>
      </LazyMotion>
    </LandingContentProvider>
  );
};

export default LandingPage;
