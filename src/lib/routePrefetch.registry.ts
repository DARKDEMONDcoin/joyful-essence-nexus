/**
 * Central registry of routes → chunk loaders. Imported once at app startup.
 * Powers hover/focus/touch prefetch via `<PrefetchLink>` and `<NavLink>`.
 *
 * Rules:
 *   - Patterns are matched against `location.pathname` (no query/hash).
 *   - Use RegExp with `^...$` anchors for exact routes, or partial for prefixes.
 *   - The loader MUST be the same `() => import("...")` used by React.lazy in
 *     App.tsx so the browser dedupes on the module cache key.
 *   - Registering a route that isn't in the router is harmless — it just
 *     never matches — but stale entries pointing at deleted files WILL break
 *     the build. Keep this list in sync when adding/removing routes.
 */
import { registerRoute } from "@/lib/routePrefetch";

// -- Top-level app routes --------------------------------------------------
registerRoute(/^\/auth(\/|$)/, () => import("@/pages/auth/AuthPage"));
registerRoute(/^\/chat(\/|$)/, () => import("@/pages/chat/ChatPage"));
registerRoute(/^\/library(\/|$)/, () => import("@/pages/library/LibraryPage"));

// -- Settings --------------------------------------------------------------
registerRoute(/^\/settings(\/|$)/, () => import("@/pages/settings/SettingsPage"));
registerRoute(/^\/settings\/customization$/, () => import("@/pages/settings/CustomizationPage"));
registerRoute(/^\/settings\/security$/, () => import("@/pages/settings/SecuritySettingsPage"));
registerRoute(/^\/settings\/profile\/edit$/, () => import("@/pages/settings/ProfileEditPage"));

// -- Billing / referrals ---------------------------------------------------
registerRoute(/^\/billing(\/|$)/, () => import("@/pages/billing/BillingPage"));
registerRoute(/^\/billing\/success$/, () => import("@/pages/billing/BillingSuccessPage"));
registerRoute(/^\/referrals(\/|$)/, () => import("@/pages/billing/ReferralsPage"));
registerRoute(/^\/referrals\/resources$/, () => import("@/pages/billing/ReferralResourcesPage"));

// -- Marketing / SEO -------------------------------------------------------
registerRoute(/^\/pricing$/, () => import("@/pages/marketing/PricingPage"));
registerRoute(/^\/ai-chat/, () => import("@/pages/marketing/AIChatLandingPage"));
registerRoute(/^\/models\/[^/]+$/, () => import("@/pages/marketing/ModelDetailPage"));
registerRoute(/^\/features/, () => import("@/pages/marketing/FeaturesGuidePage"));
registerRoute(/^\/contact$/, () => import("@/pages/marketing/ContactPage"));
registerRoute(/^\/egypt$/, () => import("@/pages/marketing/EgyptPage"));
registerRoute(/^\/terms$/, () => import("@/pages/marketing/TermsPage"));
registerRoute(/^\/privacy$/, () => import("@/pages/marketing/PrivacyPage"));
registerRoute(/^\/refund$/, () => import("@/pages/marketing/RefundPage"));
registerRoute(/^\/cookies$/, () => import("@/pages/marketing/CookiePolicyPage"));

// -- Integrations ----------------------------------------------------------
registerRoute(/^\/integrations$/, () => import("@/pages/integrations/IntegrationsPage"));
registerRoute(/^\/integrations\/[^/]+$/, () => import("@/pages/integrations/IntegrationDetailPage"));

// -- Landings / promos -----------------------------------------------------
registerRoute(/^\/landings(\/|$)/, () => import("@/pages/landings/ServiceLandingPage"));
registerRoute(/^\/gallery(\/|$)/, () => import("@/pages/landing-gallery/LandingGalleryPage"));
registerRoute(/^\/promo\/unlock/, () => import("@/pages/PromoUnlockPage"));
registerRoute(/^\/promo\/masr/, () => import("@/pages/PromoMasrPage"));

export {};
