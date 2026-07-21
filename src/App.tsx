import {
  useEffect,
  useState,
  useRef,
  Suspense,
  startTransition,
  useTransition,
} from "react";
import { lazyWithRetry as lazy } from "@/lib/lazyWithRetry";
import MobileSettingsTheme from "@/components/settings/MobileSettingsTheme";
import CommandPalette from "@/components/CommandPalette";
import ShortcutsHelp from "@/components/ShortcutsHelp";

import { SettingsShell } from "@/components/settings/SettingsShell";
import LithosPage from "@/pages/LithosPage";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ErrorBoundary, { RouteErrorBoundary } from "@/components/common/ErrorBoundary";
// These shell banners pull lucide-react + framer-motion, which are large
// shared chunks. Loading them lazily keeps the `icons` (~595 KB) and
// `motion` (~265 KB) chunks OUT of the initial landing-page preload
// waterfall — they only download after the app becomes interactive.
const OfflineBanner = lazy(() => import("@/components/common/OfflineBanner"));
const CookieConsent = lazy(() => import("./components/common/CookieConsent"));
import PwaSplash from "./components/common/PwaSplash";
import TranslationWrapper from "./components/common/TranslationWrapper";
import AmbientBackground from "./components/common/AmbientBackground";
const UnlimitedPromoBanner = lazy(() => import("./components/promo/UnlimitedPromoBanner"));
import { PromoBannerProvider } from "./components/promo/PromoBannerContext";
import { ZoneProvider } from "@/contexts/ZoneContext";
import { ConfirmProvider } from "./components/common/ConfirmDialog";

import { usePromoBanner } from "./components/promo/usePromoBanner";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";
// Vercel analytics deferred to a lazy chunk so they don't inflate the initial landing payload.
const Analytics = lazy(() => import("@vercel/analytics/react").then((m) => ({ default: m.Analytics })));
const SpeedInsights = lazy(() => import("@vercel/speed-insights/react").then((m) => ({ default: m.SpeedInsights })));
import { pathForZone, stripZonePrefix } from "@/lib/zoneRouting";

// Redirect legacy /tools/<slug> to /images/tools/<slug>
const LegacyToolsRedirect = () => {
  const location = useLocation();
  const rest = location.pathname.replace(/^\/tools/, "");
  return <Navigate to={`/images/tools${rest}`} replace />;
};

// LandingPage is lazy so its ~300KB+ tree doesn't sit in the entry chunk for
// authenticated users who never hit "/". The Suspense fallback (SplashFallback)
// visually matches the index.html splash exactly, so first-load feels seamless.
const LandingPage = lazy(() => import("./pages/marketing/LandingPage"));

// Lazy-loaded auth + chat (huge bundles, not needed on landing)
const AuthPage = lazy(() => import("./pages/auth/AuthPage"));
const OAuthCallbackPage = lazy(() => import("./pages/auth/OAuthCallbackPage"));
const ChatPage = lazy(() => import("./pages/chat/ChatPage"));
const AppsPage = lazy(() => import("./pages/apps/AppsPage"));
const PublishedSitePage = lazy(() => import("./pages/PublishedSitePage"));
const LandingGalleryPage = lazy(() => import("./pages/landing-gallery/LandingGalleryPage"));
const ServiceLandingPage = lazy(() => import("./pages/landings/ServiceLandingPage"));
const PromoUnlockPage = lazy(() => import("./pages/PromoUnlockPage"));
const PromoMasrPage = lazy(() => import("./pages/PromoMasrPage"));
const XPromoPage = lazy(() => import("./pages/XPromoPage"));
const PublicStatusPage = lazy(() => import("./pages/PublicStatusPage"));
const SeoLandingPage = lazy(() => import("./pages/seo/SeoLandingPage"));


const SePage = lazy(() => import("./pages/SePage"));
// Imported design: Megsy PR programming UI
// Lazy-loaded pages
const PricingPage = lazy(() => import("./pages/marketing/PricingPage"));
const AIChatLandingPage = lazy(() => import("./pages/marketing/AIChatLandingPage"));
const ModelDetailPage = lazy(() => import("./pages/marketing/ModelDetailPage"));

const FeaturesGuidePage = lazy(() => import("./pages/marketing/FeaturesGuidePage"));
const SettingsPage = lazy(() => import("./pages/settings/SettingsPage"));
const CustomizationPage = lazy(() => import("./pages/settings/CustomizationPage"));
const ProfileEditPage = lazy(() => import("./pages/settings/ProfileEditPage"));
const SecuritySettingsPage = lazy(() => import("./pages/settings/SecuritySettingsPage"));
const LanguagePage = lazy(() => import("./pages/settings/LanguagePage"));
const BillingPage = lazy(() => import("./pages/billing/BillingPage"));
const BillingSuccessPage = lazy(() => import("./pages/billing/BillingSuccessPage"));
const ReferralsPage = lazy(() => import("./pages/billing/ReferralsPage"));
const ReferralsDashboardTab = lazy(() => import("./pages/billing/referrals/DashboardTab"));
const ReferralsProgramTab = lazy(() => import("./pages/billing/referrals/ProgramTab"));
const ReferralsTasksTab = lazy(() => import("./pages/billing/referrals/TasksTab"));
const ReferralsWithdrawalsTab = lazy(() => import("./pages/billing/referrals/WithdrawalsTab"));
const ReferralResourcesPage = lazy(() => import("./pages/billing/ReferralResourcesPage"));


const IntegrationsPage = lazy(() => import("./pages/integrations/IntegrationsPage"));
const IntegrationDetailPage = lazy(() => import("./pages/integrations/IntegrationDetailPage"));
const IntegrationAppTest = lazy(() => import("./pages/integrations/IntegrationAppTest"));
const McpSettingsPage = lazy(() => import("./pages/settings/McpSettingsPage"));

const LibraryPage = lazy(() => import("./pages/library/LibraryPage"));
const NotFound = lazy(() => import("./pages/misc/NotFound"));
// PlansModelsPage removed — stale design with outdated plan names; PricingPage is the source of truth.

const ChangeEmailPage = lazy(() => import("./pages/auth/ChangeEmailPage"));
const ChangePasswordPage = lazy(() => import("./pages/auth/ChangePasswordPage"));
const TwoFactorPage = lazy(() => import("./pages/auth/TwoFactorPage"));
const MfaChallengePage = lazy(() => import("./pages/auth/MfaChallengePage"));
const DeleteAccountPage = lazy(() => import("./pages/auth/DeleteAccountPage"));
const WithdrawPage = lazy(() => import("./pages/billing/WithdrawPage"));

const OAuthAuthorizePage = lazy(() => import("./pages/auth/OAuthAuthorizePage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const SharedChatPage = lazy(() => import("./pages/chat/SharedChatPage"));
const AcceptInvitePage = lazy(() => import("./pages/auth/AcceptInvitePage"));
const ContactPage = lazy(() => import("./pages/marketing/ContactPage"));
const EgyptPage = lazy(() => import("./pages/marketing/EgyptPage"));
const CookiePolicyPage = lazy(() => import("./pages/marketing/CookiePolicyPage"));
const TermsPage = lazy(() => import("./pages/marketing/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/marketing/PrivacyPage"));
const RefundPage = lazy(() => import("./pages/marketing/RefundPage"));
const ReferralRedirectPage = lazy(() => import("./pages/auth/ReferralRedirectPage"));
const ReferralLandingPage = lazy(() => import("./pages/referral/ReferralLandingPage"));

// Programmatic SEO pages
const SeoHubPage = lazy(() => import("./pages/seo/SeoHubPage"));
const IndustryPage = lazy(() => import("./pages/seo/IndustryPage"));
const ComparePage = lazy(() => import("./pages/seo/ComparePage"));
const TemplatesCategoryPage = lazy(() => import("./pages/seo/TemplatesCategoryPage"));
const ModelsHubPage = lazy(() => import("./pages/seo/ModelsHubPage"));
const ModelPage = lazy(() => import("./pages/seo/ModelPage"));
const ModelForIndustryPage = lazy(() => import("./pages/seo/ModelForIndustryPage"));
const ModelInCityPage = lazy(() => import("./pages/seo/ModelInCityPage"));
const SolutionsHubPage = lazy(() => import("./pages/seo/SolutionsHubPage"));
const UseCasePage = lazy(() => import("./pages/seo/UseCasePage"));
const SolutionForIndustryPage = lazy(() => import("./pages/seo/SolutionForIndustryPage"));
const CompareForIndustryPage = lazy(() => import("./pages/seo/CompareForIndustryPage"));
const TemplateForIndustryPage = lazy(() => import("./pages/seo/TemplateForIndustryPage"));
const IndustryInCityPage = lazy(() => import("./pages/seo/IndustryInCityPage"));
const UseCaseInCityPage = lazy(() => import("./pages/seo/UseCaseInCityPage"));

const AffiliateTermsPage = lazy(() => import("./pages/marketing/AffiliateTermsPage"));
const DMCAPage = lazy(() => import("./pages/marketing/DMCAPage"));
const AIDisclaimerPage = lazy(() => import("./pages/marketing/AIDisclaimerPage"));
const DPAPage = lazy(() => import("./pages/marketing/DPAPage"));
const ModerationPage = lazy(() => import("./pages/marketing/ModerationPage"));
const SubprocessorsPage = lazy(() => import("./pages/marketing/SubprocessorsPage"));
const AgePolicyPage = lazy(() => import("./pages/marketing/AgePolicyPage"));
const AccessibilityPage = lazy(() => import("./pages/marketing/AccessibilityPage"));
const CompliancePage = lazy(() => import("./pages/marketing/CompliancePage"));
const ContentPolicyPage = lazy(() => import("./pages/marketing/ContentPolicyPage"));
const TrustCenterPage = lazy(() => import("./pages/marketing/TrustCenterPage"));
const SecurityPage = lazy(() => import("./pages/settings/SecurityPage"));
const SupportPage = lazy(() => import("./pages/marketing/SupportPage"));
const EnterprisePage = lazy(() => import("./pages/marketing/EnterprisePage"));
const AboutPage = lazy(() => import("./pages/marketing/AboutPage"));
const MegsyModelPage = lazy(() => import("./pages/marketing/MegsyModelPage"));
const BlogPage = lazy(() => import("./pages/marketing/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/marketing/BlogPostPage"));
const ComparisonPage = lazy(() => import("./pages/marketing/ComparisonPage"));
const DocsPage = lazy(() => import("./pages/marketing/DocsPage"));
const MarketingDashboard = lazy(() => import("./pages/marketing-automation/MarketingDashboard"));
const SlidesPreviewPage = lazy(() => import("./pages/SlidesPreviewPage"));
const SlidesFilePreviewPage = lazy(() => import("./pages/SlidesFilePreviewPage"));
const DocumentPreviewPage = lazy(() => import("./pages/DocumentPreviewPage"));

const AIPersonalizationPage = lazy(() => import("./pages/settings/AIPersonalizationPage"));
const MemoryPage = lazy(() => import("./pages/settings/MemoryPage"));

const SettingsSupportPage = lazy(() => import("./pages/settings/SettingsSupportPage"));
const SettingsHelpPage = lazy(() => import("./pages/settings/SettingsHelpPage"));
const SettingsContactPage = lazy(() => import("./pages/settings/SettingsContactPage"));
const SettingsPrivacyPage = lazy(() => import("./pages/settings/SettingsPrivacyPage"));
const SystemStatusPage = lazy(() => import("./pages/settings/SystemStatusPage"));
const SwitchAccountPage = lazy(() => import("./pages/settings/SwitchAccountPage"));
const ResearchPreviewPage = lazy(() => import("./pages/chat/ResearchPreviewPage"));
const SkillsSettingsPage = lazy(() => import("./pages/settings/SkillsSettingsPage"));
const SkillsNewPage = lazy(() => import("./pages/settings/SkillsNewPage"));


const WorkspacesPage = lazy(() => import("./pages/workspace/WorkspacesPage"));
const WorkspaceCreatePage = lazy(() => import("./pages/workspace/WorkspaceCreatePage"));
const WorkspaceDetailPage = lazy(() => import("./pages/workspace/WorkspaceDetailPage"));
const WorkspaceProGate = lazy(() => import("./components/workspace/WorkspaceProGate"));
const WsOverviewTab = lazy(() => import("./components/workspace/tabs/OverviewTab"));
const WsMembersTab = lazy(() => import("./components/workspace/tabs/MembersTab"));
const WsInvitesTab = lazy(() => import("./components/workspace/tabs/InvitesTab"));
const WsBillingTab = lazy(() => import("./components/workspace/tabs/BillingTab"));
const WsUsageTab = lazy(() => import("./components/workspace/tabs/UsageTab"));

const WsBrandTab = lazy(() => import("./components/workspace/tabs/BrandTab"));
const WsActivityTab = lazy(() => import("./components/workspace/tabs/ActivityTab"));
const WsNotificationsTab = lazy(() => import("./components/workspace/tabs/NotificationsTab"));
const WsSecurityTab = lazy(() => import("./components/workspace/tabs/SecurityTab"));

const WsGeneralTab = lazy(() => import("./components/workspace/tabs/GeneralTab"));
const WsDataTab = lazy(() => import("./components/workspace/tabs/DataTab"));
const WsDangerTab = lazy(() => import("./components/workspace/tabs/DangerTab"));
const WorkspaceTasksPage = lazy(() => import("./pages/workspace/WorkspaceTasksPage"));
const AcceptWorkspaceInvitePage = lazy(() => import("./pages/auth/AcceptWorkspaceInvitePage"));
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reduce loading flashes when navigating between pages — cached data
      // is considered fresh for 5 minutes and kept in memory for 30 minutes,
      // and we don't refetch on every window/tab focus.
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

import PageLoader from "@/components/common/PageLoader";
import SplashFallback from "@/components/common/SplashFallback";
import PageTransition from "@/components/common/PageTransition";
// Suspense fallback used for BOTH the first-load splash and in-app route
// transitions — the PageLoader skeleton matches the app chrome so there's
// no jarring flash whether the app is starting cold or moving between pages.
const LazyFallback = () => <PageLoader />;
// Kept imported so the legacy pre-hydration splash chunk stays available.
void SplashFallback;

// Renders routes directly (no useDeferredValue) so navigations show the
// LazyFallback / PageLoader between pages instead of freezing the old page.
// Wrapped in PageTransition so every route change plays a soft fade+lift
// intro without pulling framer-motion into the entry chunk.
const DeferredRoutes = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return (
    <PageTransition>
      <Routes location={location}>{children}</Routes>
    </PageTransition>
  );
};

const PromoBannerGate = () => {
  const { hidden } = usePromoBanner();
  const location = useLocation();
  const [sidebarCollapsed] = useSidebarCollapsed();
  const appPath = stripZonePrefix(location.pathname);
  const landingPaths = ["/", "/landing"];
  if (hidden) return null;
  if (landingPaths.includes(appPath)) return null;
  const isChatSurface = appPath.startsWith("/chat");
  const chatSurfaceOffset = isChatSurface ? (sidebarCollapsed ? 60 : 280) : 0;
  return <UnlimitedPromoBanner chatSurfaceOffset={chatSurfaceOffset} />;
};


// Preload the most-likely next routes AND the heavy shared chunks (icons,
// framer-motion, lucide-react) during idle time so navigation from the
// landing page feels instant. Since we made those shared chunks lazy to
// speed up first paint, we must warm them ASAP or the first click into any
// authenticated page has to fetch ~1 MB before rendering.
const preloadCommonRoutes = () => {
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia?.("(hover: none) and (pointer: coarse)").matches;

  // 1) Warm heavy shared chunks first — every real page uses them, so
  //    fetching them once here means later route loads are chunk-only.
  const warmShared: Array<() => Promise<unknown>> = [
    () => import("lucide-react"),
    () => import("framer-motion"),
  ];

  // 2) Then warm the most-likely destination routes.
  const routeTasks: Array<() => Promise<unknown>> = isMobile
    ? [
        () => import("./pages/chat/ChatPage"),
        () => import("./pages/auth/AuthPage"),
        () => import("./pages/marketing/PricingPage"),
      ]
    : [
        () => import("./pages/chat/ChatPage"),
        () => import("./pages/auth/AuthPage"),
        () => import("./pages/marketing/PricingPage"),
        () => import("./pages/settings/SettingsPage"),
        () => import("./pages/settings/SecuritySettingsPage"),
        () => import("./pages/settings/ProfileEditPage"),
        () => import("./pages/billing/BillingPage"),
        () => import("./pages/workspace/WorkspacesPage"),
      ];

  const tasks = isMobile ? routeTasks : [...warmShared, ...routeTasks];
  const run = () => {
    tasks.forEach((t, i) => {
      // Shared chunks fire immediately (i=0,1). Route chunks staggered by
      // 250ms so they don't compete with each other on slow connections.
      window.setTimeout(() => {
        t().catch(() => {});
      }, i * 250);
    });
  };
  const ric = (
    window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void;
    }
  ).requestIdleCallback;
  if (typeof ric === "function") ric(run, { timeout: 3000 });
  else window.setTimeout(run, 800);
};
if (typeof window !== "undefined") {
  // Kick off shared-chunk warming as soon as first paint is likely done —
  // ~400 ms after `load` is short enough that even fast clickers find the
  // shared chunks in cache, but long enough not to fight LCP.
  if (document.readyState === "complete") {
    window.setTimeout(preloadCommonRoutes, 400);
  } else {
    window.addEventListener("load", () => window.setTimeout(preloadCommonRoutes, 400), {
      once: true,
    });
  }
}

// Scroll to top on every route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    // Safety net: clear any stale scroll-locks left behind by dialogs/drawers
    // (Radix/vaul set these on <body>; if a modal was open during navigation
    // the page can arrive with scrolling frozen, especially on mobile).
    const b = document.body;
    if (b.style.overflow === "hidden") b.style.overflow = "";
    if (b.style.position === "fixed") {
      b.style.position = "";
      b.style.top = "";
    }
    if (b.style.touchAction) b.style.touchAction = "";
    if (b.style.pointerEvents === "none") b.style.pointerEvents = "";
    b.removeAttribute("data-scroll-locked");
    const h = document.documentElement;
    if (h.style.overflow === "hidden") h.style.overflow = "";
    if (h.style.touchAction) h.style.touchAction = "";
    if (h.style.pointerEvents === "none") h.style.pointerEvents = "";
    h.classList.remove("lenis-stopped");
  }, [pathname]);
  return null;
};

// Thin top progress bar shown during route transitions so navigation feels
// responsive even when the next chunk needs to download.
const TopProgressBar = ({ active }: { active: boolean }) => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (active) {
      setVisible(true);
      setProgress(8);
      let p = 8;
      const tick = () => {
        p = p + (90 - p) * 0.15;
        setProgress(p);
        timerRef.current = window.setTimeout(tick, 180);
      };
      timerRef.current = window.setTimeout(tick, 120);
    } else {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      setProgress(100);
      const hide = window.setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 220);
      return () => window.clearTimeout(hide);
    }
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [active]);

  if (!visible) return null;
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 9999,
        pointerEvents: "none",
        background: "transparent",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: "hsl(var(--primary))",
          boxShadow: "0 0 8px hsl(var(--primary) / 0.6)",
          transition: "width 200ms ease-out, opacity 200ms ease-out",
          opacity: progress >= 100 ? 0 : 1,
        }}
      />
    </div>
  );
};

const InternalLinkInterceptor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPending, startNav] = useTransition();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const rawHref = anchor.getAttribute("href");
      if (
        !rawHref ||
        rawHref.startsWith("#") ||
        rawHref.startsWith("mailto:") ||
        rawHref.startsWith("tel:") ||
        rawHref.startsWith("javascript:") ||
        anchor.hasAttribute("download") ||
        (anchor.target && anchor.target !== "_self")
      ) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      const nextPath = `${url.pathname}${url.search}${url.hash}`;
      const currentPath = `${location.pathname}${location.search}${location.hash}`;
      if (nextPath === currentPath) return;

      event.preventDefault();
      startNav(() => navigate(nextPath));
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [location.hash, location.pathname, location.search, navigate, startNav]);

  return <TopProgressBar active={isPending} />;
};

// Suppress unused-import warning for startTransition (kept for future use elsewhere).
void startTransition;

const DodoReturnRedirect = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (params.get("dodo_return") === "1") {
      const next = new URLSearchParams(params);
      next.delete("dodo_return");
      navigate(`/billing/success?${next.toString()}`, { replace: true });
    } else if (params.get("checkout_cancelled") === "1") {
      navigate("/pricing", { replace: true });
    }
  }, [navigate, params]);

  return null;
};

// Module-level auth cache so navigating between protected routes doesn't
// flash a blank screen while ProtectedRoute remounts and re-checks session.
let cachedAuthState: { authenticated: boolean; resolved: boolean } = {
  authenticated: false,
  resolved: false,
};
const authListeners = new Set<(s: { authenticated: boolean; resolved: boolean }) => void>();
let authBootstrapped = false;

const bootstrapAuth = () => {
  if (authBootstrapped) return;
  authBootstrapped = true;
  supabase.auth.onAuthStateChange((_event, session) => {
    cachedAuthState = { authenticated: !!session, resolved: true };
    authListeners.forEach((cb) => cb(cachedAuthState));
  });
  supabase.auth.getSession().then(({ data: { session } }) => {
    cachedAuthState = { authenticated: !!session, resolved: true };
    authListeners.forEach((cb) => cb(cachedAuthState));
  });
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  bootstrapAuth();
  const [state, setState] = useState(cachedAuthState);

  useEffect(() => {
    setState(cachedAuthState);
    const cb = (s: typeof cachedAuthState) => setState(s);
    authListeners.add(cb);
    return () => {
      authListeners.delete(cb);
    };
  }, []);

  const location = useLocation();

  if (!state.resolved) return <LazyFallback />;
  if (!state.authenticated) return <Navigate to={pathForZone("/auth", location.pathname)} replace />;
  return <>{children}</>;
};

// Root route:
// - Signed-in users → ChatPage.
// - Guests (desktop AND mobile) → LandingPage. This prevents the "empty black
//   chat page" first-open experience for guests on phones/PWA installs.
//   Chat is still reachable directly via /chat once signed in.
const RootRoute = ({ authedElement }: { authedElement: React.ReactNode }) => {
  bootstrapAuth();
  const [state, setState] = useState(cachedAuthState);
  useEffect(() => {
    setState(cachedAuthState);
    const cb = (s: typeof cachedAuthState) => setState(s);
    authListeners.add(cb);
    return () => {
      authListeners.delete(cb);
    };
  }, []);

  // No landing page: send every visitor straight into the app.
  void authedElement;
  if (!state.resolved) return <LazyFallback />;
  return <Navigate to="/chat" replace />;
};




const App = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const applyTheme = (theme: string) => {
      document.documentElement.setAttribute("data-theme", theme);
      // Toggle Tailwind `dark` class so `dark:` variants and any `.dark` rules apply
      const isDark = theme === "dark" || theme === "ocean";
      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    };
    // Allow `?theme=dark|light|ocean|sunset` URL override (also persists)
    const urlTheme = new URLSearchParams(window.location.search).get("theme");
    const savedTheme = urlTheme || localStorage.getItem("theme") || "dark";
    if (urlTheme) localStorage.setItem("theme", urlTheme);
    applyTheme(savedTheme);
    const savedAccent = localStorage.getItem("accent");
    if (savedAccent) document.documentElement.style.setProperty("--primary", savedAccent);

    // React to theme changes from anywhere in the app
    const onThemeChange = () => applyTheme(localStorage.getItem("theme") || "dark");
    window.addEventListener("themechange-custom", onThemeChange);
    window.addEventListener("storage", (e) => {
      if (!e.key || e.key === "theme") onThemeChange();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const userId = session?.user?.id || null;
      const lastUserId = localStorage.getItem("megsy_last_user_id");

      if (userId && lastUserId && userId !== lastUserId) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("megsy_cache_")) keysToRemove.push(key);
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
        queryClient.clear();
      }

      if (userId) localStorage.setItem("megsy_last_user_id", userId);

      if (event === "SIGNED_OUT") {
        localStorage.removeItem("megsy_last_user_id");
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("megsy_cache_")) keysToRemove.push(key);
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
        queryClient.clear();
      }

      // Claim pending referral signup bonus after auth (covers email-confirm flow)
      if (userId && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        try {
          const raw = localStorage.getItem("megsy_referral_code");
          if (raw) {
            let storedCode = "";
            try {
              const parsed = JSON.parse(raw);
              storedCode = (parsed?.code || "").toString();
            } catch {
              storedCode = raw;
            }
            if (storedCode) {
              void (async () => {
                try {
                  const { data }: any = await supabase.rpc("claim_referral_signup", {
                    p_code: storedCode,
                  });
                  if (data?.ok) {
                    try {
                      localStorage.removeItem("megsy_referral_code");
                    } catch {}
                  } else if (data?.error && data.error !== "email_not_confirmed") {
                    try {
                      localStorage.removeItem("megsy_referral_code");
                    } catch {}
                  }
                } catch {}
              })();
            }
          }
        } catch {}
      }

      setCurrentUserId(userId);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Route-chunk prefetching is handled once by preloadCommonRoutes (module
  // level) after the window load event, so it never competes with first paint.

  return (
    <TranslationWrapper>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ErrorBoundary>
            {/* Toast notifications globally disabled */}
            <BrowserRouter>
              <ZoneProvider>
              <PromoBannerProvider>
                <ConfirmProvider>
                  <PwaSplash />
                  <ScrollToTop />
                  <InternalLinkInterceptor />
                  <DodoReturnRedirect />
                  <AmbientBackground />
                  
                  <OfflineBanner />
                  <CookieConsent />
                  <MobileSettingsTheme />
                  <CommandPalette />
                  <ShortcutsHelp />


                  <Suspense fallback={<LazyFallback />}>
                    <RouteErrorBoundary>
                      <SettingsShell>
                        <DeferredRoutes>
                          {/* Auth */}
                          <Route path="/auth" element={<AuthPage />} />
                          <Route path="/login" element={<AuthPage />} />
                          <Route path="/signin" element={<AuthPage />} />
                          <Route path="/sign-in" element={<AuthPage />} />
                          <Route path="/signup" element={<AuthPage />} />
                          <Route path="/sign-up" element={<AuthPage />} />
                          <Route path="/register" element={<AuthPage />} />
                          <Route path="/auth/callback/:provider" element={<OAuthCallbackPage />} />
                          <Route path="/oauth/authorize" element={<OAuthAuthorizePage />} />
                          <Route path="/reset-password" element={<ResetPasswordPage />} />

                          {/* Public / marketing */}
                          <Route path="/" element={<RootRoute authedElement={<ChatPage key={currentUserId} />} />} />
                          <Route path="/lithos" element={<LithosPage />} />
                          <Route path="/apps" element={<AppsPage />} />
                          <Route path="/slides/preview/:id" element={<SlidesPreviewPage />} />
                          <Route path="/slides/file-preview/:id" element={<SlidesFilePreviewPage />} />
                          <Route path="/document/:artifactId" element={<DocumentPreviewPage />} />
                          <Route path="/s/:slug" element={<PublishedSitePage />} />



                          <Route path="/landing" element={<Navigate to="/chat" replace />} />
                          <Route path="/home" element={<Navigate to="/chat" replace />} />
                          <Route path="/showcase" element={<Navigate to="/chat" replace />} />
                          <Route path="/landing-gallery" element={<Navigate to="/chat" replace />} />


                          <Route path="/comparison" element={<Navigate to="/pricing" replace />} />
                          <Route path="/se" element={<SePage />} />
                          <Route path="/l/*" element={<ServiceLandingPage />} />

                          {/* Locale-prefixed landing routes disabled — send every visitor to the app. */}
                          <Route path="/en" element={<Navigate to="/chat" replace />} />
                          <Route path="/ar" element={<Navigate to="/chat" replace />} />
                          <Route path="/ar-eg" element={<Navigate to="/chat" replace />} />
                          <Route path="/es" element={<Navigate to="/chat" replace />} />
                          <Route path="/fr" element={<Navigate to="/chat" replace />} />
                          <Route path="/de" element={<Navigate to="/chat" replace />} />
                          <Route path="/pt" element={<Navigate to="/chat" replace />} />
                          <Route path="/it" element={<Navigate to="/chat" replace />} />
                          <Route path="/tr" element={<Navigate to="/chat" replace />} />
                          <Route path="/ru" element={<Navigate to="/chat" replace />} />
                          <Route path="/zh" element={<Navigate to="/chat" replace />} />
                          <Route path="/ja" element={<Navigate to="/chat" replace />} />
                          <Route path="/ko" element={<Navigate to="/chat" replace />} />
                          <Route path="/hi" element={<Navigate to="/chat" replace />} />
                          <Route path="/id" element={<Navigate to="/chat" replace />} />
                          <Route path="/nl" element={<Navigate to="/chat" replace />} />
                          <Route path="/sv" element={<Navigate to="/chat" replace />} />
                          <Route path="/cs" element={<Navigate to="/chat" replace />} />
                          <Route path="/ro" element={<Navigate to="/chat" replace />} />
                          <Route path="/el" element={<Navigate to="/chat" replace />} />
                          <Route path="/uk" element={<Navigate to="/chat" replace />} />
                          <Route path="/he" element={<Navigate to="/chat" replace />} />
                          <Route path="/fa" element={<Navigate to="/chat" replace />} />
                          <Route path="/vi" element={<Navigate to="/chat" replace />} />
                          <Route path="/th" element={<Navigate to="/chat" replace />} />
                          <Route path="/pl" element={<Navigate to="/chat" replace />} />

                          {/* Locale-prefixed landing aliases (25 langs → ServiceLandingPage handles locale + slug) */}
                          <Route path="/ar/*" element={<ServiceLandingPage />} />
                          <Route path="/es/*" element={<ServiceLandingPage />} />
                          <Route path="/fr/*" element={<ServiceLandingPage />} />
                          <Route path="/de/*" element={<ServiceLandingPage />} />
                          <Route path="/pt/*" element={<ServiceLandingPage />} />
                          <Route path="/it/*" element={<ServiceLandingPage />} />
                          <Route path="/tr/*" element={<ServiceLandingPage />} />
                          <Route path="/ru/*" element={<ServiceLandingPage />} />
                          <Route path="/zh/*" element={<ServiceLandingPage />} />
                          <Route path="/ja/*" element={<ServiceLandingPage />} />
                          <Route path="/ko/*" element={<ServiceLandingPage />} />
                          <Route path="/hi/*" element={<ServiceLandingPage />} />
                          <Route path="/id/*" element={<ServiceLandingPage />} />
                          <Route path="/nl/*" element={<ServiceLandingPage />} />
                          <Route path="/sv/*" element={<ServiceLandingPage />} />
                          <Route path="/cs/*" element={<ServiceLandingPage />} />
                          <Route path="/ro/*" element={<ServiceLandingPage />} />
                          <Route path="/el/*" element={<ServiceLandingPage />} />
                          <Route path="/uk/*" element={<ServiceLandingPage />} />
                          <Route path="/he/*" element={<ServiceLandingPage />} />
                          <Route path="/fa/*" element={<ServiceLandingPage />} />
                          <Route path="/vi/*" element={<ServiceLandingPage />} />
                          <Route path="/th/*" element={<ServiceLandingPage />} />
                          <Route path="/pl/*" element={<ServiceLandingPage />} />
                          <Route path="/ref/:code" element={<ReferralRedirectPage />} />
                          <Route path="/r/:code" element={<ReferralLandingPage />} />

                         <Route path="/pricing" element={<PricingPage />} />
                         <Route path="/promo/:code" element={<PromoUnlockPage />} />
                         <Route path="/eg" element={<PromoMasrPage />} />
                         <Route path="/masr" element={<PromoMasrPage />} />
                         <Route path="/promo-masr" element={<PromoMasrPage />} />
                         <Route path="/x" element={<XPromoPage />} />
                          <Route path="/ai-chat" element={<AIChatLandingPage />} />
                          <Route path="/ai-chat/models/:slug" element={<ModelDetailPage />} />
                          <Route path="/megsy-model" element={<MegsyModelPage />} />
                          <Route path="/megsy" element={<Navigate to="/megsy-model" replace />} />


                          <Route path="/features-guide" element={<FeaturesGuidePage />} />
                          
                          <Route path="/docs" element={<DocsPage />} />
                          <Route path="/docs/:groupId" element={<DocsPage />} />
                          <Route path="/docs/:groupId/:sectionId" element={<DocsPage />} />
                          {/* Localized Docs — auto-translated by i18n-translate (Qwen-Max) and
                          cached forever in public.i18n_translations. Each language gets its
                          own indexable URL + hreflang alternates for full multilingual SEO. */}
                          <Route path="/:lang/docs" element={<DocsPage />} />
                          <Route path="/:lang/docs/:groupId" element={<DocsPage />} />
                          <Route path="/:lang/docs/:groupId/:sectionId" element={<DocsPage />} />
                          <Route path="/contact" element={<ContactPage />} />
                          <Route path="/egypt" element={<EgyptPage />} />
                          <Route path="/cookies" element={<CookiePolicyPage />} />
                          <Route path="/terms" element={<TermsPage />} />
                          <Route path="/privacy" element={<PrivacyPage />} />
                          <Route path="/refund" element={<RefundPage />} />
                          <Route
                            path="/acceptable-use"
                            element={<Navigate to="/policies/content" replace />}
                          />
                          <Route path="/policies/content" element={<ContentPolicyPage />} />
                          <Route path="/trust" element={<TrustCenterPage />} />
                          <Route path="/legal/affiliate" element={<AffiliateTermsPage />} />
                          <Route path="/legal/dmca" element={<DMCAPage />} />
                          <Route path="/legal/ai-disclaimer" element={<AIDisclaimerPage />} />
                          <Route path="/legal/dpa" element={<DPAPage />} />
                          {/* Merged into /policies/content */}
                          <Route
                            path="/legal/moderation"
                            element={<Navigate to="/policies/content" replace />}
                          />
                          <Route
                            path="/legal/age"
                            element={<Navigate to="/policies/content" replace />}
                          />
                          {/* Merged into /trust */}
                          <Route
                            path="/legal/subprocessors"
                            element={<Navigate to="/trust" replace />}
                          />
                          <Route
                            path="/legal/accessibility"
                            element={<Navigate to="/trust" replace />}
                          />
                          <Route
                            path="/legal/compliance"
                            element={<Navigate to="/trust" replace />}
                          />
                          {/* Legacy standalone pages — kept reachable for deep links */}
                          <Route path="/legal/moderation-full" element={<ModerationPage />} />
                          <Route path="/legal/age-full" element={<AgePolicyPage />} />
                          <Route path="/legal/subprocessors-full" element={<SubprocessorsPage />} />
                          <Route path="/legal/accessibility-full" element={<AccessibilityPage />} />
                          <Route path="/legal/compliance-full" element={<CompliancePage />} />
                          <Route path="/support" element={<SupportPage />} />
                          <Route path="/security" element={<SecurityPage />} />
                          <Route path="/enterprise" element={<EnterprisePage />} />
                          <Route path="/about" element={<AboutPage />} />
                          <Route path="/blog" element={<BlogPage />} />
                          <Route path="/blog/:slug" element={<BlogPostPage />} />
                          {/* Multilingual blog routes — :lang is one of the 25 BCP-47 codes in src/data/blogLangs.ts.
                          A non-language path segment falls through to the catch-all NotFound below. */}
                          <Route path="/:lang/blog" element={<BlogPage />} />
                          <Route path="/:lang/blog/:slug" element={<BlogPostPage />} />
                          <Route path="/vs/:slug" element={<ComparisonPage />} />

                          {/* Sharing */}
                          <Route path="/share/:shareId" element={<SharedChatPage />} />
                          <Route path="/invite/:token" element={<AcceptInvitePage />} />

                          {/* Chat — public, anonymous can browse and send */}
                          <Route path="/chat" element={<ChatPage key={currentUserId} />} />
                          <Route path="/index" element={<ChatPage key={currentUserId} />} />

                          {/* Admin panel — role-gated inside the page */}
                          {/* Code (AI app builder) — landing public, workspace/build actions require auth */}
                          {/* /build/* aliases — imported design pages internally link to /build/:projectId/* */}

                          {/* Media hub / gallery / studio — hidden: media generation now lives in chat. */}
                          <Route path="/media" element={<Navigate to="/" replace />} />
                          <Route path="/gallery" element={<Navigate to="/" replace />} />
                          <Route path="/preview/:type" element={<Navigate to="/" replace />} />
                          <Route path="/template/:id" element={<Navigate to="/" replace />} />

                          {/* Images */}
                          <Route path="/images/studio" element={<Navigate to="/" replace />} />
                          {/* Legacy redirects: /tools/* -> /images/tools/* */}
                          <Route path="/tools/*" element={<LegacyToolsRedirect />} />

                          {/* Programmatic SEO */}
                          <Route path="/for" element={<SeoHubPage />} />
                          <Route path="/for/:industry" element={<IndustryPage />} />
                          <Route path="/for/:industry/in/:city" element={<IndustryInCityPage />} />
                          <Route path="/compare" element={<SeoHubPage />} />
                          <Route path="/compare/megsy-vs-:competitor" element={<ComparePage />} />
                          <Route
                            path="/compare/megsy-vs-:competitor/for/:industry"
                            element={<CompareForIndustryPage />}
                          />
                          <Route path="/templates" element={<SeoHubPage />} />
                          <Route path="/templates/:category" element={<TemplatesCategoryPage />} />
                          <Route
                            path="/templates/:category/for/:industry"
                            element={<TemplateForIndustryPage />}
                          />
                          <Route path="/models" element={<ModelsHubPage />} />
                          <Route path="/models/:slug" element={<ModelPage />} />
                          <Route
                            path="/models/:slug/for/:industry"
                            element={<ModelForIndustryPage />}
                          />
                          <Route path="/models/:slug/in/:city" element={<ModelInCityPage />} />
                          <Route path="/solutions" element={<SolutionsHubPage />} />
                          <Route path="/solutions/:slug" element={<UseCasePage />} />
                          <Route
                            path="/solutions/:slug/for/:industry"
                            element={<SolutionForIndustryPage />}
                          />
                          <Route path="/solutions/:slug/in/:city" element={<UseCaseInCityPage />} />
                          {/* /tools is an alias for /solutions (use-cases) */}
                          <Route path="/tools" element={<SolutionsHubPage />} />
                          <Route path="/tools/:slug" element={<UseCasePage />} />
                          <Route
                            path="/tools/:slug/for/:industry"
                            element={<SolutionForIndustryPage />}
                          />
                          <Route path="/tools/:slug/in/:city" element={<UseCaseInCityPage />} />

                          {/* Videos / Cinema — hidden: now in chat */}
                          <Route path="/videos" element={<Navigate to="/" replace />} />
                          <Route path="/videos/studio" element={<Navigate to="/" replace />} />
                          <Route path="/cinema" element={<Navigate to="/" replace />} />
                          <Route path="/cinema/studio" element={<Navigate to="/" replace />} />
                          <Route
                            path="/cinema/start-end-frame"
                            element={<Navigate to="/" replace />}
                          />

                          {/* Research */}
                          <Route
                            path="/research/preview/new"
                            element={
                              <ProtectedRoute>
                                <ResearchPreviewPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/research/preview/:id"
                            element={
                              <ProtectedRoute>
                                <ResearchPreviewPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/research/share/:token" element={<ResearchPreviewPage />} />

                          {/* Settings */}
                          <Route
                            path="/settings"
                            element={
                              <ProtectedRoute>
                                <SettingsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/library"
                            element={
                              <ProtectedRoute>
                                <LibraryPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/settings/customization"
                            element={
                              <ProtectedRoute>
                                <CustomizationPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/settings/ai-personalization"
                            element={
                              <ProtectedRoute>
                                <AIPersonalizationPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/settings/profile"
                            element={<Navigate to="/settings/profile/edit" replace />}
                          />
                          <Route
                            path="/settings/profile/edit"
                            element={
                              <ProtectedRoute>
                                <ProfileEditPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/settings/billing"
                            element={
                              <ProtectedRoute>
                                <BillingPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/billing/success" element={<BillingSuccessPage />} />
                          <Route path="/suc" element={<BillingSuccessPage />} />
                          <Route
                            path="/billing"
                            element={<Navigate to="/settings/billing" replace />}
                          />
                          <Route
                            path="/billing/referrals"
                            element={<Navigate to="/settings/referrals" replace />}
                          />
                          <Route
                            path="/referrals"
                            element={<Navigate to="/settings/referrals" replace />}
                          />
                          <Route path="/workspaces" element={<Navigate to="/settings" replace />} />
                          <Route path="/workspace" element={<Navigate to="/settings" replace />} />
                          <Route path="/integrations" element={<Navigate to="/settings/integrations" replace />} />
                          <Route path="/integration" element={<Navigate to="/settings/integrations" replace />} />
                          <Route
                            path="/settings/security"
                            element={
                              <ProtectedRoute>
                                <SecuritySettingsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/settings/help"
                            element={<Navigate to="/settings/support/help" replace />}
                          />
                          <Route
                            path="/settings/contact"
                            element={<Navigate to="/settings/support/contact" replace />}
                          />
                          <Route
                            path="/settings/switch-account"
                            element={<Navigate to="/settings/switch" replace />}
                          />
                          <Route
                            path="/settings/referrals"
                            element={
                              <ProtectedRoute>
                                <ReferralsPage />
                              </ProtectedRoute>
                            }
                          >
                            <Route index element={<ReferralsDashboardTab />} />
                            <Route path="program" element={<ReferralsProgramTab />} />

                            <Route path="tasks" element={<ReferralsTasksTab />} />
                            <Route path="withdrawals" element={<ReferralsWithdrawalsTab />} />
                          </Route>
                          <Route
                            path="/settings/referrals/resources"
                            element={
                              <ProtectedRoute>
                                <ReferralResourcesPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/settings/language"
                            element={
                              <ProtectedRoute>
                                <LanguagePage />
                              </ProtectedRoute>
                            }
                          />

                          <Route
                            path="/settings/integrations"

                            element={
                              <ProtectedRoute>
                                <IntegrationsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/settings/integrations/:id"
                            element={
                              <ProtectedRoute>
                                <IntegrationDetailPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/integration-app-test"
                            element={<IntegrationAppTest />}
                          />
                          <Route
                            path="/settings/mcp"
                            element={
                              <ProtectedRoute>
                                <McpSettingsPage />
                              </ProtectedRoute>
                            }
                          />

                          <Route
                            path="/settings/memory"
                            element={
                              <ProtectedRoute>
                                <MemoryPage />
                              </ProtectedRoute>
                            }
                          />



                          <Route
                            path="/settings/skills"
                            element={
                              <ProtectedRoute>
                                <SkillsSettingsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/agents/skills"
                            element={
                              <ProtectedRoute>
                                <SkillsSettingsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/agents/skills/new"
                            element={
                              <ProtectedRoute>
                                <SkillsNewPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/skills"
                            element={
                              <ProtectedRoute>
                                <SkillsSettingsPage />
                              </ProtectedRoute>
                            }
                          />


                          <Route
                            path="/settings/change-email"
                            element={
                              <ProtectedRoute>
                                <ChangeEmailPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/settings/change-password"
                            element={
                              <ProtectedRoute>
                                <ChangePasswordPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/settings/two-factor"
                            element={
                              <ProtectedRoute>
                                <TwoFactorPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/auth/mfa" element={<MfaChallengePage />} />
                          <Route
                            path="/settings/delete-account"
                            element={
                              <ProtectedRoute>
                                <DeleteAccountPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/settings/withdraw"
                            element={
                              <ProtectedRoute>
                                <WithdrawPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/settings/support"
                            element={
                              <ProtectedRoute>
                                <SettingsSupportPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/settings/support/help"
                            element={
                              <ProtectedRoute>
                                <SettingsHelpPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/settings/support/contact"
                            element={
                              <ProtectedRoute>
                                <SettingsContactPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/settings/privacy"
                            element={
                              <ProtectedRoute>
                                <SettingsPrivacyPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/settings/system-status"
                            element={
                              <ProtectedRoute>
                                <SystemStatusPage />
                              </ProtectedRoute>
                            }
                          />

                          <Route
                            path="/settings/switch"
                            element={
                              <ProtectedRoute>
                                <SwitchAccountPage />
                              </ProtectedRoute>
                            }
                          />

                          <Route
                            path="/settings/workspaces"
                            element={
                              <ProtectedRoute>
                                <WorkspacesPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/settings/workspaces/new"
                            element={
                              <ProtectedRoute>
                                <WorkspaceProGate>
                                  <WorkspaceCreatePage />
                                </WorkspaceProGate>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/settings/workspaces/:id"
                            element={
                              <ProtectedRoute>
                                <WorkspaceDetailPage />
                              </ProtectedRoute>
                            }
                          >
                            <Route index element={<WsOverviewTab />} />
                            <Route path="members" element={<WsMembersTab />} />
                            <Route path="invites" element={<WsInvitesTab />} />
                            <Route path="billing" element={<WsBillingTab />} />
                            <Route path="usage" element={<WsUsageTab />} />

                            <Route path="brand" element={<WsBrandTab />} />
                            <Route path="activity" element={<WsActivityTab />} />
                            <Route path="notifications" element={<WsNotificationsTab />} />
                            <Route path="security" element={<WsSecurityTab />} />

                            <Route path="general" element={<WsGeneralTab />} />
                            <Route path="data" element={<WsDataTab />} />
                            <Route path="danger" element={<WsDangerTab />} />
                          </Route>
                          <Route
                            path="/workspaces/:id/tasks"
                            element={
                              <ProtectedRoute>
                                <WorkspaceTasksPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/invite/workspace/:token"
                            element={<AcceptWorkspaceInvitePage />}
                          />

                          <Route path="/marketing-automation" element={<MarketingDashboard />} />
                          <Route path="/status" element={<PublicStatusPage />} />

                          {/* Alias redirects for commonly-mistyped URLs */}
                          <Route path="/settings/skills/new" element={<Navigate to="/agents/skills/new" replace />} />
                          <Route path="/settings/status" element={<Navigate to="/settings/system-status" replace />} />
                          <Route path="/workspaces/create" element={<Navigate to="/settings/workspaces/new" replace />} />
                          <Route path="/features" element={<Navigate to="/features-guide" replace />} />
                          <Route path="/compliance" element={<Navigate to="/legal/compliance" replace />} />
                          <Route path="/hub" element={<Navigate to="/seo-hub" replace />} />
                          <Route path="/models/megsy" element={<Navigate to="/megsy-model" replace />} />

                          {/* SEO landings — 100 SynapseX-styled pages, catalog in src/data/seoPages.ts */}
                          <Route path="/:seoSlug" element={<SeoLandingPage />} />

                          <Route path="*" element={<NotFound />} />

                        </DeferredRoutes>
                      </SettingsShell>
                    </RouteErrorBoundary>
                  </Suspense>
                </ConfirmProvider>
              </PromoBannerProvider>
              </ZoneProvider>
            </BrowserRouter>
            <Suspense fallback={null}><Analytics /></Suspense>
            <Suspense fallback={null}><SpeedInsights /></Suspense>
          </ErrorBoundary>
        </TooltipProvider>
      </QueryClientProvider>
    </TranslationWrapper>
  );
};

export default App;
