/** @doc Main chat workspace — all modes, all models, attachments, agents and the composer live here. */
import SEOHead from "@/components/common/SEOHead";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { useState, useRef, useEffect, useCallback, Suspense, lazy } from "react";
import { createPortal } from "react-dom";
import { animate, m as motion, useMotionValue, useTransform } from "framer-motion";
import { toast } from "sonner";
import { useNavigate, useLocation, type NavigateOptions, type To } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MAX_CHAT_MESSAGE_CHARS } from "@/lib/validation/schemas";

import { getCachedUser } from "@/lib/cachedUser";
import { warmEdgeFunctions } from "@/lib/warmEdgeFunctions";
import AppSidebar from "@/components/layout/AppSidebar";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";
import { useUserLang } from "@/lib/authI18n";
import { isPaidUser } from "@/lib/subscriptionGating";

// Background job helpers and one-off lib utilities that are still referenced
// from the surviving body (cancel/cleanup paths, etc.).
import { failStaleJob } from "@/lib/jobs/client";
import { useSkills } from "@/hooks/useSkills";

// State + side-effect hooks that drive ChatPage's enormous state graph.
import { useUrlMode } from "./hooks/useUrlMode";
import { useVideoFrames } from "./hooks/useVideoFrames";
import { useShareDialog } from "./hooks/useShareDialog";
import { useChatRename } from "./hooks/useChatRename";
import { useInviteDialog } from "./hooks/useInviteDialog";
import { useChatReactions } from "./hooks/useChatReactions";
import { useChatPresence } from "./hooks/useChatPresence";
import { useStudyMode } from "./hooks/useStudyMode";
import { useToolActivity } from "./hooks/useToolActivity";
import { useChatTier } from "./hooks/useChatTier";
import { usePlusMenu } from "./hooks/usePlusMenu";
import { usePendingQuestions } from "./hooks/usePendingQuestions";
import { useTrendingSuggestions } from "./hooks/useTrendingSuggestions";
import { useChatModeState } from "./hooks/useChatModeState";
import { useAttachments } from "./hooks/useAttachments";
import { useChatMessages } from "./hooks/useChatMessages";
import { useConversationMeta } from "./hooks/useConversationMeta";

const RTL_UI_LANGS = new Set(["ar", "ar-eg", "he", "fa"]);
const SIDEBAR_EDGE_SWIPE_ZONE = 36;
const SIDEBAR_OPEN_SNAP = 0.22;
const SIDEBAR_CLOSE_SNAP = 0.64;
const SIDEBAR_FLING_VELOCITY = 520;
const SIDEBAR_PUSH_SPRING = { type: "spring" as const, stiffness: 240, damping: 34, mass: 1.05 };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
import { useMobileGreeting } from "./hooks/useMobileGreeting";
import { useChatHeaderUi } from "./hooks/useChatHeaderUi";
import { useChatIdentity } from "./hooks/useChatIdentity";
import { useMessageEdit } from "./hooks/useMessageEdit";
import { useIntegrationsUi } from "./hooks/useIntegrationsUi";
import { useTypingPresence } from "./hooks/useTypingPresence";
import { useMentionDetection } from "./hooks/useMentionDetection";
import { useUserMusic } from "./hooks/useUserMusic";
import { useComposerUploads } from "./hooks/useComposerUploads";
import { useChatEntryEffects } from "./hooks/useChatEntryEffects";
import { useChatSocialActions } from "./hooks/useChatSocialActions";
import { useAuthHydration } from "./hooks/useAuthHydration";
import { useEmbedBackfill } from "./hooks/useEmbedBackfill";
import { useOutsideClickToClose } from "./hooks/useOutsideClickToClose";
import { useChatScroll } from "./hooks/useChatScroll";
import { useChatTableLabels } from "@/hooks/useChatTableLabels";
import { useViewportPersistence } from "@/hooks/useViewportPersistence";
import { useReadsAndReactions } from "./hooks/useReadsAndReactions";
import { useUnreadDocumentTitle } from "./hooks/useUnreadDocumentTitle";
import { useRealtimeMembers } from "./hooks/useRealtimeMembers";
import { usePostSignupPrompt } from "./hooks/usePostSignupPrompt";
import { useRealtimeChat } from "./hooks/useRealtimeChat";
import { useSmartQuestionsParser } from "./hooks/useSmartQuestionsParser";
import { useResearchJobSubscription } from "./hooks/useResearchJobSubscription";
import { useMessageReactionToggle } from "./hooks/useMessageReactionToggle";
import { useKickMember } from "./hooks/useKickMember";
import { useDeleteConversation } from "./hooks/useDeleteConversation";
import { useMessageDerivations } from "./hooks/useMessageDerivations";
import { useIntegrationsFilter } from "./hooks/useIntegrationsFilter";
import { useChatCancel } from "./hooks/useChatCancel";
import { useChatNewChat, useChatModeActions } from "./hooks/useChatLifecycleActions";
import { useMobileModeBarChange } from "./hooks/useMobileModeBarChange";
import { useConnectIntegration } from "./hooks/useConnectIntegration";
import { useMemberColors } from "./hooks/useMemberColors";

// Utils + per-turn services (operator/media/slides/docs/research/chat stream).
import { playNotificationSound } from "./utils/notificationSound";
import { getSeoMeta } from "./data/seoByMode";
import { rowToMessage } from "./services/rowToMessage";
import { loadConversationMembers } from "./services/loadConversationMembers";
// Heavy turn/resume services — dynamic-imported on demand. These only run
// after the user sends a message or when resuming background jobs, so they
// should never be in the initial /chat chunk. Total savings: ~2500 LOC.
const resumeDocsJobs = (...args: Parameters<typeof import("./services/resumeDocsJobs").resumeDocsJobs>) =>
  import("./services/resumeDocsJobs").then((m) => m.resumeDocsJobs(...args));
const resumeSlidesJobs = (...args: Parameters<typeof import("./services/resumeSlidesJobs").resumeSlidesJobs>) =>
  import("./services/resumeSlidesJobs").then((m) => m.resumeSlidesJobs(...args));
const resumeChatJobs = (...args: Parameters<typeof import("./services/resumeChatJobs").resumeChatJobs>) =>
  import("./services/resumeChatJobs").then((m) => m.resumeChatJobs(...args));
const runOperatorTurn = (...args: Parameters<typeof import("./services/runOperatorTurn").runOperatorTurn>) =>
  import("./services/runOperatorTurn").then((m) => m.runOperatorTurn(...args));
const runMediaTurn = (...args: Parameters<typeof import("./services/runMediaTurn").runMediaTurn>) =>
  import("./services/runMediaTurn").then((m) => m.runMediaTurn(...args));
const runSlidesTurn = (...args: Parameters<typeof import("./services/runSlidesTurn").runSlidesTurn>) =>
  import("./services/runSlidesTurn").then((m) => m.runSlidesTurn(...args));
const runDocsTurn = (...args: Parameters<typeof import("./services/runDocsTurn").runDocsTurn>) =>
  import("./services/runDocsTurn").then((m) => m.runDocsTurn(...args));
const runChatStreamTurn = (...args: Parameters<typeof import("./services/runChatStreamTurn").runChatStreamTurn>) =>
  import("./services/runChatStreamTurn").then((m) => m.runChatStreamTurn(...args));
import {
  generateShortTitle as apiGenerateShortTitle,
  createOrUpdateConversation as apiCreateOrUpdateConversation,
  saveMessage as apiSaveMessage,
  fetchSlidesNarration as apiFetchSlidesNarration,
} from "./services/conversationApi";

// Composed view components owned by the chat page.
// PlusContent (~991 lines) + DraggablePlusSheet only render when the user
// opens the "+" menu — lazy-load them so their chunk is never in the initial
// chat bundle. Chunk is preloaded on hover of the "+" button (see below).
const PlusContent = lazy(() => import("./components/PlusContent"));
const DraggablePlusSheet = lazy(() =>
  import("./components/DraggablePlusSheet").then((m) => ({ default: m.DraggablePlusSheet })),
);
const preloadPlusMenu = () => {
  void import("./components/PlusContent");
  void import("./components/DraggablePlusSheet");
};
// Interaction-gated components — never in the initial /chat chunk. They only
// mount when the user opens a dialog, service panel, or intro; otherwise
// nothing is fetched. Idle preload is done once for the intro on the first
// paint of a fresh chat so it feels instant when it does open.
const MobileServicePanelRenderer = lazy(() =>
  import("./components/MobileServicePanelRenderer").then((m) => ({ default: m.MobileServicePanelRenderer })),
);
const ChatDialogs = lazy(() =>
  import("./components/ChatDialogs").then((m) => ({ default: m.ChatDialogs })),
);
// ChatHiddenFileInputs stays eager — its refs must be attached to the DOM
// on first paint so the "+" menu's file/camera/image buttons work instantly.
import { ChatHiddenFileInputs } from "./components/ChatHiddenFileInputs";
const MegsyOsIntro = lazy(() =>
  import("./components/MegsyOsIntro").then((m) => ({ default: m.MegsyOsIntro })),
);
const ChatGlobalModals = lazy(() =>
  import("./components/ChatGlobalModals").then((m) => ({ default: m.ChatGlobalModals })),
);

import { MobileChatHeaderMount } from "./components/MobileChatHeaderMount";
import { DesktopChatHeader } from "./components/DesktopChatHeader";
import { ChatMessagesArea } from "./components/ChatMessagesArea";
import { ChatComposerSection } from "./components/ChatComposerSection";
const InlineCoderRun = lazy(() => import("@/components/coder/InlineCoderRun"));
// Decorative aurora background + empty-state greeting are not needed for
// first paint — the greeting only renders when there's no conversation on
// desktop, and the aurora is a pure visual. Lazy-load both so they never
// block the chat surface from becoming interactive.
const ChatAurora = lazy(() => import("@/components/chat/ChatAurora"));
const DesktopGreeting = lazy(() =>
  import("./components/DesktopGreeting").then((m) => ({ default: m.DesktopGreeting })),
);
import { usePromoBanner } from "@/components/promo/usePromoBanner";
// Desktop chat background video is loaded directly from CDN below
import { getAgentById } from "@/lib/agentRegistry";
import { pathForZone } from "@/lib/zoneRouting";

import { type Message, type ChatMode } from "./chatConstants";
import { DOCS_STATUS_FALLBACKS } from "./chatUtils";

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Warm the Pricing route immediately after the chat surface mounts. The
  // pricing star is a top-level chat action, so waiting for requestIdleCallback
  // can still leave fast mobile taps fetching the PricingPage chunk on click.
  // Keep heavier secondary chunks (+ menu, Settings) on idle.
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Warm hot edge functions on chat mount to cut cold-start TTFT on first msg.
    warmEdgeFunctions();
    const pricingTimer = window.setTimeout(() => {
      void import("@/pages/marketing/PricingPage").catch(() => {});
    }, 0);
    const ric = (window as any).requestIdleCallback as
      | ((cb: () => void, opts?: { timeout?: number }) => number)
      | undefined;
    const run = () => {
      preloadPlusMenu();
      void import("@/pages/settings/SettingsPage").catch(() => {});
    };
    const id = ric ? ric(run, { timeout: 3000 }) : window.setTimeout(run, 1500);
    return () => {
      window.clearTimeout(pricingTimer);
      if (ric && (window as any).cancelIdleCallback) (window as any).cancelIdleCallback(id);
      else clearTimeout(id as number);
    };
  }, []);

  // Never lock html/body here; stale global scroll locks were freezing
  // navigation targets such as settings, apps, and pricing on mobile.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    const body = document.body;
    html.style.overflow = "";
    body.style.overflow = "";
    html.style.height = "";
    body.style.height = "";
    body.style.overscrollBehavior = "";
    body.removeAttribute("data-scroll-locked");
  }, []);

  const zoneNavigate = useCallback(
    (to: To | number, options?: NavigateOptions): void => {
      if (typeof to === "number") {
        navigate(to);
        return;
      }
      if (typeof to === "string") {
        navigate(pathForZone(to, location.pathname), options);
        return;
      }
      navigate(to, options);
    },
    [location.pathname, navigate],
  );
  const {
    input,
    setInput,
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    isThinking,
    setIsThinking,
    messagesEndRef,
    messagesContainerRef,
    abortControllerRef,
  } = useChatMessages();
  const {
    sidebarOpen,
    setSidebarOpen,
    showScrollBtn,
    setShowScrollBtn,
    connectorsOpen,
    setConnectorsOpen,
    directoryOpen,
    setDirectoryOpen,
    chatMenuView,
    setChatMenuView,
    megsyOsIntroOpen,
    setMegsyOsIntroOpen,
  } = useChatHeaderUi();
  const sidebarOpenRef = useRef(sidebarOpen);
  useEffect(() => {
    sidebarOpenRef.current = sidebarOpen;
  }, [sidebarOpen]);
  const [sidebarCollapsed] = useSidebarCollapsed();

  const [coderRuns, setCoderRuns] = useState<{
    id: string;
    prompt: string;
    conversationPromise: Promise<string | null>;
  }[]>([]);
  const savedCoderRunIdsRef = useRef<Set<string>>(new Set());
  const isSidebarExpanded = !sidebarCollapsed;
  const desktopSidebarWidth = isSidebarExpanded ? 320 : 60;
  const { plusMenuOpen, setPlusMenuOpen, plusView, setPlusView } =
    usePlusMenu();
  const isMobileViewport = useIsMobile();
  const userLang = useUserLang();
  // Sidebar reveal width for the Claude-style push (mobile). The chat surface
  // translates by this many pixels when the sidebar is opened.
  const [sidebarRevealX, setSidebarRevealX] = useState(0);
  const isRtlUi = RTL_UI_LANGS.has(userLang);
  const sidebarPushX = isRtlUi ? -sidebarRevealX : sidebarRevealX;
  const sidebarX = useMotionValue(0);
  const sidebarProgress = useTransform(sidebarX, (latest) =>
    sidebarRevealX > 0 ? clamp(Math.abs(latest) / sidebarRevealX, 0, 1) : 0,
  );
  const sidebarScale = useTransform(sidebarProgress, [0, 1], [1, 0.94]);
  const sidebarRadius = useTransform(sidebarProgress, [0, 1], [0, 32]);
  const sidebarShadow = useTransform(sidebarProgress, (progress) =>
    progress > 0.02
      ? `0 30px 90px -20px rgba(0,0,0,${0.36 + progress * 0.34}), 0 0 0 1px rgba(255,255,255,${progress * 0.06})`
      : "0 0 0 rgba(0,0,0,0)",
  );
  const sidebarAnimationRef = useRef<{ stop: () => void } | null>(null);
  const edgeDraggingSidebarRef = useRef(false);
  const edgePointerRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    lastX: number;
    started: boolean;
  } | null>(null);
  const animateSidebarTo = useCallback(
    (open: boolean) => {
      sidebarAnimationRef.current?.stop();
      sidebarAnimationRef.current = animate(
        sidebarX,
        isMobileViewport && open ? sidebarPushX : 0,
        open ? SIDEBAR_PUSH_SPRING : { type: "spring", stiffness: 360, damping: 42, mass: 0.9 },
      );
    },
    [isMobileViewport, sidebarPushX, sidebarX],
  );

  useEffect(() => {
    if (edgeDraggingSidebarRef.current) return;
    animateSidebarTo(sidebarOpen);
    return () => sidebarAnimationRef.current?.stop();
  }, [animateSidebarTo, sidebarOpen]);

  const beginSidebarEdgeDrag = useCallback((pointerId: number, x: number, y: number) => {
    if (!isMobileViewport || sidebarOpenRef.current) return;
    edgePointerRef.current = { pointerId, startX: x, startY: y, lastX: x, started: false };
  }, [isMobileViewport]);

  const updateSidebarEdgeDrag = useCallback((pointerId: number, x: number, y: number) => {
    const drag = edgePointerRef.current;
    if (!drag || drag.pointerId !== pointerId) return false;
    const dx = x - drag.startX;
    const dy = Math.abs(y - drag.startY);
    const directionalDistance = isRtlUi ? -dx : dx;
    drag.lastX = x;

    if (dy > 42 || directionalDistance < -10) {
      edgePointerRef.current = null;
      edgeDraggingSidebarRef.current = false;
      animateSidebarTo(false);
      return false;
    }

    if (!drag.started && directionalDistance > 10 && dy < 22) {
      drag.started = true;
      edgeDraggingSidebarRef.current = true;
      sidebarAnimationRef.current?.stop();
      setSidebarOpen(true);
    }

    if (drag.started) {
      const nextDistance = clamp(directionalDistance, 0, sidebarRevealX);
      sidebarX.set(isRtlUi ? -nextDistance : nextDistance);
      return true;
    }

    return false;
  }, [animateSidebarTo, isRtlUi, setSidebarOpen, sidebarRevealX, sidebarX]);

  const endSidebarEdgeDrag = useCallback((pointerId: number) => {
    const drag = edgePointerRef.current;
    if (!drag || drag.pointerId !== pointerId) return;
    if (drag.started) {
      const dx = drag.lastX - drag.startX;
      const directionalDistance = isRtlUi ? -dx : dx;
      const shouldOpen = directionalDistance >= sidebarRevealX * SIDEBAR_OPEN_SNAP;
      edgeDraggingSidebarRef.current = false;
      setSidebarOpen(shouldOpen);
      animateSidebarTo(shouldOpen);
    }
    edgePointerRef.current = null;
  }, [animateSidebarTo, isRtlUi, setSidebarOpen, sidebarRevealX]);
  useEffect(() => {
    const compute = () =>
      setSidebarRevealX(Math.min(Math.round(window.innerWidth * 0.82), 320));
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  // Edge-swipe from the physical sidebar edge. Mirrors native drawer UX:
  // LTR starts from the left edge and drags right; RTL starts from the right
  // edge and drags left. Gesture only arms at the edge so chat scrolling stays natural.
  useEffect(() => {
    if (!isMobileViewport) return;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let openStarted = false;
    let tracking = false;
    const onStart = (e: TouchEvent) => {
      if (sidebarOpenRef.current) return;
      const t = e.touches[0];
      if (!t) return;
      // Ignore touches that start inside a horizontally scrollable region
      // (mode chips, carousels, etc.) so we don't hijack their gestures.
      const target = e.target as Element | null;
      if (target && target.closest?.("[data-no-swipe-open]")) return;
      const width = window.innerWidth;
      const fromSidebarEdge = isRtlUi
        ? t.clientX >= width - SIDEBAR_EDGE_SWIPE_ZONE
        : t.clientX <= SIDEBAR_EDGE_SWIPE_ZONE;
      if (!fromSidebarEdge) return;
      startX = t.clientX;
      startY = t.clientY;
      lastX = t.clientX;
      openStarted = false;
      tracking = true;
    };
    const onMove = (e: TouchEvent) => {
      if (!tracking) return;
      const t = e.touches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = Math.abs(t.clientY - startY);
      const directionalDistance = isRtlUi ? -dx : dx;
      lastX = t.clientX;

      if (dy > 42 || directionalDistance < -10) {
        tracking = false;
        openStarted = false;
        edgeDraggingSidebarRef.current = false;
        animateSidebarTo(false);
        return;
      }

      if (!openStarted && directionalDistance > 18 && dy < 18) {
        openStarted = true;
        edgeDraggingSidebarRef.current = true;
        sidebarAnimationRef.current?.stop();
        setSidebarOpen(true);
      }

      if (openStarted) {
        e.preventDefault();
        const nextDistance = clamp(directionalDistance, 0, sidebarRevealX);
        sidebarX.set(isRtlUi ? -nextDistance : nextDistance);
      }
    };
    const onEnd = () => {
      if (tracking && openStarted) {
        const dx = lastX - startX;
        const directionalDistance = isRtlUi ? -dx : dx;
        const shouldOpen = directionalDistance >= sidebarRevealX * SIDEBAR_OPEN_SNAP;
        edgeDraggingSidebarRef.current = false;
        setSidebarOpen(shouldOpen);
        animateSidebarTo(shouldOpen);
      }
      tracking = false;
      openStarted = false;
    };
    window.addEventListener("touchstart", onStart, { passive: true, capture: true });
    window.addEventListener("touchmove", onMove, { passive: false, capture: true });
    window.addEventListener("touchend", onEnd, { passive: true, capture: true });
    return () => {
      window.removeEventListener("touchstart", onStart, { capture: true });
      window.removeEventListener("touchmove", onMove, { capture: true });
      window.removeEventListener("touchend", onEnd, { capture: true });
    };
  }, [animateSidebarTo, isMobileViewport, isRtlUi, setSidebarOpen, sidebarRevealX, sidebarX]);

  useEffect(() => {
    if (!isMobileViewport) return;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let pointerId: number | null = null;
    let openStarted = false;
    let tracking = false;

    const onPointerDown = (e: PointerEvent) => {
      if (sidebarOpenRef.current) return;
      if (e.pointerType === "mouse" && e.buttons !== 1) return;
      const target = e.target as Element | null;
      if (target && target.closest?.("[data-no-swipe-open]")) return;
      const fromSidebarEdge = isRtlUi
        ? e.clientX >= window.innerWidth - SIDEBAR_EDGE_SWIPE_ZONE
        : e.clientX <= SIDEBAR_EDGE_SWIPE_ZONE;
      if (!fromSidebarEdge) return;
      startX = e.clientX;
      startY = e.clientY;
      lastX = e.clientX;
      pointerId = e.pointerId;
      openStarted = false;
      tracking = true;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!tracking || (pointerId !== null && e.pointerId !== pointerId)) return;
      const dx = e.clientX - startX;
      const dy = Math.abs(e.clientY - startY);
      const directionalDistance = isRtlUi ? -dx : dx;
      lastX = e.clientX;

      if (dy > 42 || directionalDistance < -10) {
        tracking = false;
        openStarted = false;
        edgeDraggingSidebarRef.current = false;
        animateSidebarTo(false);
        return;
      }

      if (!openStarted && directionalDistance > 18 && dy < 18) {
        openStarted = true;
        edgeDraggingSidebarRef.current = true;
        sidebarAnimationRef.current?.stop();
        setSidebarOpen(true);
      }

      if (openStarted) {
        e.preventDefault();
        const nextDistance = clamp(directionalDistance, 0, sidebarRevealX);
        sidebarX.set(isRtlUi ? -nextDistance : nextDistance);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!tracking || (pointerId !== null && e.pointerId !== pointerId)) return;
      if (openStarted) {
        const dx = lastX - startX;
        const directionalDistance = isRtlUi ? -dx : dx;
        const shouldOpen = directionalDistance >= sidebarRevealX * SIDEBAR_OPEN_SNAP;
        edgeDraggingSidebarRef.current = false;
        setSidebarOpen(shouldOpen);
        animateSidebarTo(shouldOpen);
      }
      tracking = false;
      openStarted = false;
      pointerId = null;
    };

    window.addEventListener("pointerdown", onPointerDown, { passive: true, capture: true });
    window.addEventListener("pointermove", onPointerMove, { passive: false, capture: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true, capture: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true, capture: true });
    return () => {
      window.removeEventListener("pointerdown", onPointerDown, { capture: true });
      window.removeEventListener("pointermove", onPointerMove, { capture: true });
      window.removeEventListener("pointerup", onPointerUp, { capture: true });
      window.removeEventListener("pointercancel", onPointerUp, { capture: true });
    };
  }, [animateSidebarTo, isMobileViewport, isRtlUi, setSidebarOpen, sidebarRevealX, sidebarX]);
  // Mobile mode bar visibility. Visible by default on a fresh chat; auto-hides
  // the moment the first user message is sent so the transcript has room.
  // The chevron toggle in the composer lets the user bring it back manually.

  // Dynamic trending suggestions per selected agent. Re-rolled on each agent change.
  const { trendingItems, setTrendingItems, trendingAgentId, setTrendingAgentId } =
    useTrendingSuggestions();
  // Stable greeting per chat-page mount (random index + random accent color)
  const { mobileGreeting, mobileGreetingColor, returningGreetingIdx } = useMobileGreeting();
  // First visit = show original English playful greetings. Subsequent visits = Arabic time-of-day rotation.
  // Source of truth is profiles.chat_greeted (DB). We default to "returning" to avoid flashing
  // the first-time greeting on subsequent visits while the DB lookup is in flight.
  const {
    conversationId,
    setConversationId,
    conversationTitle,
    setConversationTitle,
    isFirstVisit,
    setIsFirstVisit,
    loadingMessages,
    setLoadingMessages,
  } = useConversationMeta();
  // Web search is always enabled. UI toggle removed; setter is a no-op so
  // legacy call sites don't break.
  const searchEnabled = true;
  const setSearchEnabled = (_v: boolean) => {};
  const { mySkills, librarySkills, enabledSkills, toggleEnabled } = useSkills();
  const {
    megsyTier,
    setMegsyTier,
    userPlan,
    setUserPlan,
    selectedModel,
    setSelectedModel,
    tierMenuOpen,
    setTierMenuOpen,
    researchDepth,
    setResearchDepth,
    researchDepthOpen,
    setResearchDepthOpen,
    selectedAgent,
    setSelectedAgent,
  } = useChatTier();
  const {
    chatMode,
    setChatMode,
    operatorRunId,
    setOperatorRunId,
    slidesTemplate,
    setSlidesTemplate,
    slidesPickerOpen,
    setSlidesPickerOpen,
    mediaModel,
    setMediaModel,
    computerUseEnabled,
    setComputerUseEnabled,
  } = useChatModeState();

  // Consume a launch request coming from the /apps page. Reads a one-shot
  // sessionStorage payload set by AppsPage.launch() and applies it as an
  // active chat mode or agent selection.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem("megsy_launch_app");
      if (!raw) return;
      sessionStorage.removeItem("megsy_launch_app");
      const parsed = JSON.parse(raw) as
        | { kind: "mode"; mode: string }
        | { kind: "agent"; agent: string };
      if (parsed?.kind === "mode" && typeof parsed.mode === "string") {
        setSelectedAgent(null);
        setChatMode(parsed.mode as any);
      } else if (parsed?.kind === "agent" && typeof parsed.agent === "string") {
        const agent = getAgentById(parsed.agent);
        if (agent) {
          setChatMode("normal");
          setSelectedAgent(agent);
        }
      }
    } catch {
      /* ignore malformed launch payload */
    }
    // Only run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    videoStartEndMode,
    setVideoStartEndMode,
    videoDurationSec,
    setVideoDurationSec,
    startFrameUrl,
    setStartFrameUrl,
    endFrameUrl,
    setEndFrameUrl,
    frameUploading,
    setFrameUploading,
  } = useVideoFrames();
  const { upload: uploadFrame } = useMediaUpload();
  const { attachedFiles, setAttachedFiles, fileInputRef, cameraInputRef, imageInputRef } =
    useAttachments();
  const {
    searchStatus,
    setSearchStatus,
    toolActivity,
    setToolActivity,
    parallelTasks,
    setParallelTasks,
    narrations,
    setNarrations,
    clarifyQs,
    setClarifyQs,
  } = useToolActivity();
  const docsStatusTimerRef = useRef<number | null>(null);
  const {
    shareDialogOpen,
    setShareDialogOpen,
    shareMode,
    setShareMode,
    isShared,
    setIsShared,
    shareId,
    setShareId,
    generatedShareUrl,
    setGeneratedShareUrl,
  } = useShareDialog();
  const {
    isRenaming,
    setIsRenaming,
    renameValue,
    setRenameValue,
    isPinned,
    setIsPinned,
    isDeleting,
    setIsDeleting,
  } = useChatRename();
  const {
    pendingQuestions,
    setPendingQuestions,
    activeResearchJobId,
    setActiveResearchJobId,
    handleResearchRunningChange,
  } = usePendingQuestions();
  // Auto-clear the active research-job tracker when the job reaches a terminal state.
  useResearchJobSubscription({ activeResearchJobId, setActiveResearchJobId });
  const {
    inviteDialogOpen,
    setInviteDialogOpen,
    inviteEmail,
    setInviteEmail,
    inviteLoading,
    setInviteLoading,
    inviteLink,
    setInviteLink,
    members,
    setMembers,
  } = useInviteDialog();
  const {
    conversationOwnerId,
    setConversationOwnerId,
    chatUserId,
    setChatUserId,
    userName,
    setUserName,
  } = useChatIdentity();
  const {
    typingUsers,
    setTypingUsers,
    remoteAiBusy,
    setRemoteAiBusy,
    onlineUsers,
    setOnlineUsers,
    systemEvents,
    setSystemEvents,
    unreadCount,
    setUnreadCount,
    newMessagesCount,
    setNewMessagesCount,
    originalTitleRef,
    presenceChannelRef,
    markedReadRef,
  } = useChatPresence();

  const {
    messageReads,
    setMessageReads,
    messageReactions,
    setMessageReactions,
    reactionPickerFor,
    setReactionPickerFor,
  } = useChatReactions();
  // Mentions handled by useMentionDetection (declared after members are ready below).

  const {
    studyMusic,
    setStudyMusic,
    readAloud,
    setReadAloud,
    studyTimers,
    setStudyTimers,
    timerInputMin,
    setTimerInputMin,
    studyAudioRef,
    musicFileInputRef,
  } = useStudyMode();
  const {
    userTracks,
    uploadingMusic,
    loadUserTracks,
    playUserTrack,
    handleMusicUpload,
    deleteUserTrack,
  } = useUserMusic({
    studyAudioRef,
    studyMusicKind: studyMusic.kind,
    setStudyMusic,
  });
  const {
    userIntegrations,
    setUserIntegrations,
    refreshIntegrations,
    connectingApp,
    setConnectingApp,
    integrationsQuery,
    setIntegrationsQuery,
    integrationsCategory,
    setIntegrationsCategory,
    brokenLogos,
    setBrokenLogos,
  } = useIntegrationsUi();

  // Megsy OS is restricted to Pro plans and above.
  const isProPlusPlan = useCallback(
    () => isPaidUser(userPlan),
    [userPlan],
  );

  const tryActivateMegsyOs = useCallback(() => {
    if (!isProPlusPlan()) {
      toast.info("Megsy OS is available on Pro plans and above");
      setPlusMenuOpen(false);
      setMegsyOsIntroOpen(true);
      return false;
    }
    const seen =
      typeof window !== "undefined" && localStorage.getItem("megsy_os_intro_seen") === "1";
    if (!seen) {
      setPlusMenuOpen(false);
      setMegsyOsIntroOpen(true);
      return false;
    }
    handleModeChange("operator");
    setPlusMenuOpen(false);
    return true;
  }, [isProPlusPlan, navigate]);

  const resetToolUi = useCallback(() => {
    setSearchStatus("");
    setToolActivity(null);
    setParallelTasks([]);
  }, []);

  const stopDocsStatusFallback = useCallback(() => {
    if (docsStatusTimerRef.current !== null) {
      window.clearInterval(docsStatusTimerRef.current);
      docsStatusTimerRef.current = null;
    }
  }, []);

  const slidesTimeoutsRef = useRef<Record<string, number>>({});
  const slidesGenerationTokenRef = useRef(0);
  const clearSlidesTimeout = useCallback((jobId: string) => {
    const timer = slidesTimeoutsRef.current[jobId];
    if (timer) window.clearTimeout(timer);
    delete slidesTimeoutsRef.current[jobId];
  }, []);

  const startDocsStatusFallback = useCallback(() => {
    stopDocsStatusFallback();
    let index = 0;
    setSearchStatus(DOCS_STATUS_FALLBACKS[index]);
    docsStatusTimerRef.current = window.setInterval(() => {
      index = Math.min(index + 1, DOCS_STATUS_FALLBACKS.length - 1);
      setSearchStatus(DOCS_STATUS_FALLBACKS[index]);
    }, 4500);
  }, [stopDocsStatusFallback]);

  useEffect(
    () => () => {
      stopDocsStatusFallback();
      Object.values(slidesTimeoutsRef.current).forEach((timer) => window.clearTimeout(timer));
      slidesTimeoutsRef.current = {};
    },
    [stopDocsStatusFallback],
  );

  const pushNarration = useCallback((text: string) => {
    const t = String(text || "").trim();
    if (!t) return;
    setNarrations((prev) => (prev[prev.length - 1] === t ? prev : [...prev, t]));
  }, []);

  const buildInitialResearchNarration = useCallback((text: string) => {
    const topic = (text || "Deep Research").trim().replace(/\s+/g, " ").slice(0, 90);
    return `On it — digging into "${topic}" now. I'll pull real sources and walk you through what I find.`;
  }, []);

  const buildFinalResearchNarration = useCallback((_text: string) => {
    return "Done — sources gathered, cross-checked, and written up. Open the preview to read it.";
  }, []);

  // Fetch user info for memory + welcome message
  useAuthHydration({
    setChatUserId,
    setUserName,
    setUserPlan,
    setIsFirstVisit,
    setMegsyTier,
  });

  // Reset plus menu sub-view whenever it closes
  useEffect(() => {
    if (!plusMenuOpen) {
      setPlusView("main");
    }
  }, [plusMenuOpen]);

  // One-time semantic backfill for legacy data (no-op after the first run).
  useEmbedBackfill();

  // Close the plus-menu on any outside click (desktop popover + mobile sheet).
  useOutsideClickToClose({
    open: plusMenuOpen,
    onClose: () => setPlusMenuOpen(false),
    keepOpenSelectors: ["[data-plus-menu]", "[data-plus-trigger]", "[data-vaul-drawer]"],
    modes: ["immediate", "click"],
  });

  // Close the tier menu on any outside click.
  useOutsideClickToClose({
    open: tierMenuOpen,
    onClose: () => setTierMenuOpen(false),
    keepOpenSelectors: ["[data-tier-menu]", "[data-tier-trigger]"],
    modes: ["click"],
  });

  const { setHidden: setPromoBannerHidden } = usePromoBanner();

  // Hide the promo banner inside any active conversation (existing or newly
  // started) and restore it when the user leaves an empty chat so it remains
  // visible on other routes.
  useEffect(() => {
    setPromoBannerHidden(Boolean(conversationId) || messages.length > 0);
    return () => setPromoBannerHidden(false);
  }, [conversationId, messages.length, setPromoBannerHidden]);

  // Reactive aurora: map chat activity onto a body[data-chat-state] so the
  // background colors visibly respond when the user sends a message, the
  // assistant is thinking, or media is being generated.
  useEffect(() => {
    const body = document.body;
    let state: "idle" | "sending" | "thinking" | "generating" = "idle";
    if (isThinking) state = "thinking";
    else if (isLoading) {
      const m = chatMode;
      state = m === "images" || m === "video" || m === "slides" || m === "slides-images"
        ? "generating"
        : "sending";
    }
    if (state === "idle") body.removeAttribute("data-chat-state");
    else body.setAttribute("data-chat-state", state);
    body.setAttribute("data-chat-mode", chatMode || "normal");
    return () => {
      body.removeAttribute("data-chat-state");
      body.removeAttribute("data-chat-mode");
    };
  }, [isLoading, isThinking, chatMode]);

  const { handleScroll, scrollToBottom } = useChatScroll({
    messages,
    isLoading,
    messagesContainerRef,
    messagesEndRef,
    setShowScrollBtn,
    setNewMessagesCount,
  });

  // Universal markdown-table label injection (mobile stacked cards) and
  // scroll-position persistence across viewport / orientation changes so
  // switching mobile ↔ desktop keeps the user on the same message.
  useChatTableLabels(messagesContainerRef);
  useViewportPersistence(messagesContainerRef);

  // Thin wrappers around services/conversationApi.ts so call sites stay terse
  // and the page is not littered with supabase plumbing.
  const generateShortTitle = useCallback(
    (firstMessage: string, convId: string) =>
      apiGenerateShortTitle(firstMessage, convId, setConversationTitle),
    [setConversationTitle],
  );

  const createOrUpdateConversation = useCallback(
    (firstMessage: string) =>
      apiCreateOrUpdateConversation(firstMessage, {
        conversationId,
        chatMode,
        setConversationId,
        setConversationTitle,
      }),
    [conversationId, chatMode, setConversationId, setConversationTitle],
  );

  const saveMessage = useCallback(apiSaveMessage, []);
  const fetchSlidesNarration = useCallback(apiFetchSlidesNarration, []);

  /**
   * Inserts a freeform assistant narration into the transcript (slides plan/summary).
   * Persists to DB and updates local state, optionally before a placeholder bubble
   * so chronological order (user → plan → placeholder) is preserved.
   */
  const insertAssistantNarration = useCallback(
    async (convId: string | null, content: string, beforeClientId?: string) => {
      if (!content?.trim()) return;
      const text = content.trim();
      let id: string | undefined;
      if (convId) {
        id = await saveMessage(convId, "assistant", text);
        if (id) ownInsertedIdsRef.current.add(id);
      }
      const newMsg = {
        id: id || `narration-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        role: "assistant",
        content: text,
      } as Message;
      setMessages((prev) => {
        if (!beforeClientId) return [...prev, newMsg];
        const idx = prev.findIndex((m) => m.clientId === beforeClientId);
        if (idx < 0) return [...prev, newMsg];
        return [...prev.slice(0, idx), newMsg, ...prev.slice(idx)];
      });
    },
    [saveMessage, setMessages],
  );

  // Stable per-user color palette resolver (hash → palette).
  const colorForUser = useMemberColors();

  const handleLikeMessage = useCallback((index: number, liked: boolean | null) => {
    setMessages((prev) => prev.map((m, i) => (i === index ? { ...m, liked } : m)));
  }, []);

  const loadConversation = async (id: string) => {
    setConversationId(id);
    resetToolUi();
    setPendingQuestions([]);
    setNarrations([]);
    setClarifyQs(null);
    setLoadingMessages(true);
    setMessages([]);
    setSystemEvents([]);
    const { data: conv } = await supabase
      .from("conversations")
      .select("title, is_shared, share_id, is_pinned, mode, user_id")
      .eq("id", id)
      .single();
    if (conv) {
      setConversationTitle(conv.title || "Untitled");
      setIsShared(conv.is_shared || false);
      setShareId(conv.share_id || null);
      setShareMode(conv.is_shared ? "public" : "private");
      setIsPinned(!!conv.is_pinned);
      setConversationOwnerId((conv as any).user_id || null);
      const m = (conv as any).mode as string | undefined;
      if (m === "research") setChatMode("deep-research");
      else if (m === "learning") setChatMode("learning");
      else if (m === "shopping") setChatMode("shopping");
      else if (m === "slides") setChatMode("slides");
      else setChatMode("normal");
    }
    // Bump conversation to top of recent list (works for owner and members via RPC)
    supabase.rpc("bump_conversation" as any, { p_conversation_id: id }).then(() => {});
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });
    if (msgs) {
      const senderIds = Array.from(new Set(msgs.map((m: any) => m.user_id).filter(Boolean)));
      const senderMap: Record<string, { name: string | null; avatar: string | null }> = {};
      if (senderIds.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", senderIds as string[]);
        (profs || []).forEach((p: any) => {
          senderMap[p.id] = { name: p.display_name, avatar: p.avatar_url };
        });
      }
      setMessages(
        msgs
          .map((m: any) => rowToMessage(m, senderMap, (conv as any)?.mode))
          .filter(Boolean) as Message[],
      );
      setTimeout(() => scrollToBottom(), 150);

      // Re-attach to any in-flight background jobs (docs / slides / chat).
      void resumeDocsJobs({ msgs, setMessages });
      void resumeSlidesJobs({
        msgs,
        setMessages,
        slidesTimeoutsRef,
        clearSlidesTimeout,
      });
      void resumeChatJobs({
        conversationId: id,
        msgs,
        setMessages,
        ownInsertedIdsRef,
        saveMessage,
      });
    }
    // Load members so sender names/avatars render correctly.
    setMembers(await loadConversationMembers(id));
    setLoadingMessages(false);
  };

  // Cross-component "open this conversation" bridge (used by Continue-last-chat
  // card, share/remix flows). Keeps ContinueLastChatCard decoupled from ChatPage.
  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent).detail?.id as string | undefined;
      if (id) void loadConversation(id);
    };
    window.addEventListener("megsy:open-conversation", handler as EventListener);
    return () => window.removeEventListener("megsy:open-conversation", handler as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Remix handoff from SharedChatPage: read the shared prompt from
  // sessionStorage on mount when the URL carries `?remix=1`, pre-fill the
  // composer, then clean up so a page reload doesn't repopulate.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("remix") !== "1") return;
    try {
      const prompt = sessionStorage.getItem("megsy:remix-prompt");
      if (prompt) {
        setInput(prompt);
        sessionStorage.removeItem("megsy:remix-prompt");
        // Strip the query param without navigating.
        params.delete("remix");
        const next = window.location.pathname + (params.toString() ? `?${params}` : "");
        window.history.replaceState({}, "", next);
      }
    } catch { /* storage disabled */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);





  const handleCancel = useChatCancel({
    abortControllerRef,
    activeResearchJobId,
    setActiveResearchJobId,
    chatMode,
    setChatMode,
    setSearchEnabled,
    messages,
    setMessages,
    slidesGenerationTokenRef,
    clearSlidesTimeout,
    failStaleJob,
    conversationId,
    setIsLoading,
    setIsThinking,
    resetToolUi,
    saveMessage,
  });

  const { handleModeChange, handleSearchToggle } = useChatModeActions({
    chatMode,
    setChatMode,
    setStudyTimers,
    setStudyMusic,
    setSearchEnabled,
    searchEnabled,
    mediaModel,
    setMediaModel,
    setTierMenuOpen,
    setPlusMenuOpen,
  });

  // Sync chatMode with `?mode=` deep links — extracted to ./hooks/useUrlMode.
  useUrlMode({ chatMode, setChatMode, setSearchEnabled });

  const handleStructuredAction = useCallback((text: string) => {
    if (text.startsWith("Connect:")) {
      setConnectorsOpen(true);
      return;
    }
    if (text.trim().startsWith("[LEARN_ANSWER]")) {
      void sendWithTextRef.current?.(text);
      return;
    }
    setInput(text);
    setTimeout(() => {
      setInput(text);
      void sendWithTextRef.current?.(text);
    }, 50);
  }, []);

  // Parse JSON "questions" blocks from the latest assistant message.
  useSmartQuestionsParser({ messages, isLoading, setPendingQuestions });

  const handleQuestionAnswer = (answer: string) => {
    setPendingQuestions([]);
    handleSendWithText(answer);
  };

  const handleQuestionSkip = () => {
    setPendingQuestions([]);
  };

  const isSubmittingRef = useRef(false);
  const sendWithTextRef = useRef<((overrideText?: string) => Promise<void>) | undefined>(undefined);

  const ownInsertedIdsRef = useRef<Set<string>>(new Set());

  const handleSendWithText = async (overrideText?: string) => {
    const text = overrideText || input;
    const isLearningAnswer =
      chatMode === "learning" &&
      (text.trim().startsWith("[LEARN_ANSWER]") || text.trim().startsWith("[LEARN_CHOICE]"));
    const hasFrames = chatMode === "video" && videoStartEndMode && !!startFrameUrl && !!endFrameUrl;
    if (!text.trim() && attachedFiles.length === 0 && !hasFrames) return;
    if (isLoading || isSubmittingRef.current) return;
    // Fire-and-forget streak bump — pure client, no network. Milestones emit
    // a global event so any listener (badge, confetti) can react.
    try {
      const [{ bumpStreak }, { track }] = await Promise.all([
        import("@/lib/streaks"),
        import("@/lib/achievements"),
      ]);
      // Track every send for achievement counters (first_chat, chatty_N, time-of-day, polyglot).
      try {
        const lang = (typeof navigator !== "undefined" && navigator.language) || "en";
        track("message_sent", { lang: lang.split("-")[0] });
      } catch {}
      // Feature-specific unlocks based on the current chat mode.
      try {
        if (chatMode === "images") track("image_generated");
        else if (chatMode === "deep-research") track("research_started");
        else if (chatMode === "code") track("code_ran");
        else if (chatMode === "slides" || chatMode === "slides-images") track("slides_created");
      } catch {}
      bumpStreak();
    } catch { /* non-fatal */ }
    // Guard: oversized prompts are almost always a paste accident — refuse
    // early with a clear message instead of letting the request fail server-side.
    if (text.length > MAX_CHAT_MESSAGE_CHARS) {
      toast.error(
        `Message is too long (${text.length.toLocaleString()} chars). Max is ${MAX_CHAT_MESSAGE_CHARS.toLocaleString()}.`,
      );
      return;
    }





    // Premium modes require an authenticated user. Normal/learning/shopping
    // chat stays fully public so anyone can try the product without sign-up.
    const PROTECTED_MODES: ChatMode[] = [
      "deep-research",
      "slides",
      "slides-images",
      "operator",
      "images",
      "video",
    ];
    if (PROTECTED_MODES.includes(chatMode) && !chatUserId) {
      toast.error("Please sign in to use this feature.");
      zoneNavigate(
        `/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`,
      );
      return;
    }

    // Code mode → run the inline Megsy Coder agent (Replit/Lovable style) inside the chat feed.
    if (chatMode === "code" && text.trim()) {
      // Subscribers-only gate for the Coder builder — uses the single source
      // of truth for paid-plan membership (`intentActions.isPaidPlan`) so
      // gates never drift out of sync across the chat surface.
      const { isPaidPlan: isPaidPlanHelper } = await import("@/lib/intentActions");
      if (!isPaidPlanHelper(userPlan)) {

        if (!chatUserId) {
          toast.error("Sign in and subscribe to use Coder mode.");
          zoneNavigate(
            `/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`,
          );
          return;
        }
        setMessages((prev) => [
          ...prev,
          {
            role: "user",
            clientId: `user-code-paywall-${Date.now()}`,
            content: text,
            mode: "code",
          } as Message,
          {
            role: "assistant",
            clientId: `assist-code-paywall-${Date.now()}`,
            content:
              "🔒 Coder mode is available to subscribers only. Upgrade your plan to start building full sites and apps inside chat.",
            mode: "code",
            paywall: { feature: "code" },
          } as Message,
        ]);
        setInput("");
        zoneNavigate("/pricing");
        return;
      }

      const promptText = text.trim();
      const runId = `coder-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const userClientId = `user-coder-${Date.now()}`;
      const conversationPromise = createOrUpdateConversation(promptText).catch(() => null);
      const userMsg: Message = {
        role: "user",
        clientId: userClientId,
        content: promptText,
        mode: "code",
      } as Message;
      setMessages((prev) => [...prev, userMsg]);
      setCoderRuns((prev) => [
        ...prev,
        { id: runId, prompt: promptText, conversationPromise },
      ]);
      setInput("");
      void (async () => {
        const resolvedConversationId = await conversationPromise;
        if (!resolvedConversationId) return;
        const insertedId = await saveMessage(resolvedConversationId, "user", promptText).catch(() => undefined);
        if (insertedId) {
          ownInsertedIdsRef.current.add(insertedId);
          window.dispatchEvent(new CustomEvent("megsy:conversations-changed"));
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.clientId === userClientId);
            if (idx < 0) return prev;
            const next = [...prev];
            next[idx] = { ...next[idx], id: insertedId, user_id: chatUserId || undefined };
            return next;
          });
        }
      })();
      return;
    }


    // Subscribers-only gate for media generation (images / video). Uses the
    // shared `isPaidPlan` helper so this list stays in one place.
    const SUBSCRIBER_MODES: ChatMode[] = ["video", "music"];
    const { isPaidPlan: isPaidPlanHelper2 } = await import("@/lib/intentActions");
    const isPaidPlan = isPaidPlanHelper2(userPlan);


    // ── Smart intent auto-routing (normal mode only) ─────────────────
    // When the user types free text without picking a service chip, we detect
    // their intent (image / video / research / learning / docs / slides /
    // code / website / voice / music) and auto-switch to that mode exactly
    // as if they tapped the chip. Free users hitting a paid feature see the
    // existing paywall assistant message so they can upgrade. This block is
    // the single source of truth for auto-routing — the older ad-hoc
    // `websiteIntent` regex was removed to prevent double-gating.
    if (chatMode === "normal" && text.trim() && !selectedAgent) {
      try {
        const [
          { detectIntent, acceptIntent, rejectIntent, INTENT_AUTO_APPLY_THRESHOLD },
          { INTENT_ACTIONS, nudgeText, isPaidPlan: isPaid },
          { track },
        ] = await Promise.all([
          import("@/lib/intentDetector"),
          import("@/lib/intentActions"),
          import("@/lib/achievements"),
        ]);
        const result = detectIntent(text);
        if (result.intent !== "normal" && result.confidence >= INTENT_AUTO_APPLY_THRESHOLD) {
          const action = INTENT_ACTIONS[result.intent];
          const userIsPaid = isPaid(userPlan);
          // Paid gate for free users.
          if (action.paid && !userIsPaid) {
            const feature: "images" | "video" | "code" | "music" =
              result.intent === "video"
                ? "video"
                : result.intent === "image"
                ? "images"
                : result.intent === "music"
                ? "music"
                : "code";
            setMessages((prev) => [
              ...prev,
              {
                role: "user",
                clientId: `user-intent-paywall-${Date.now()}`,
                content: text,
                mode: chatMode,
              } as Message,
              {
                role: "assistant",
                clientId: `assist-intent-paywall-${Date.now()}`,
                content: "",
                mode: chatMode,
                paywall: { feature },
              } as Message,
            ]);
            setInput("");
            isSubmittingRef.current = false;
            return;
          }
          // Apply the mode / agent switch — exactly like the user tapped the
          // chip. We KEEP the user's text and let them press Send again so
          // they can review model/settings first. This mirrors real chip
          // behavior and avoids sending under stale state (setChatMode is async).
          if (action.chatMode) setChatMode(action.chatMode as ChatMode);
          if (action.agentId) {
            const ag = getAgentById(action.agentId);
            if (ag) setSelectedAgent(ag);
          }
          acceptIntent(result.intent);
          try {
            track("intent_auto_routed", { intent: result.intent });
          } catch {}
          // Give the user a one-tap escape hatch. Three rejections in a row
          // silence that intent for 24h so we never nag.
          // Prefer the message's script over the UI locale so a French/Spanish
          // prompt gets a French/Spanish toast even when the UI is Arabic.
          const msgLang = /[\u0600-\u06FF]/.test(text)
            ? "ar"
            : /[\u4E00-\u9FFF]/.test(text)
              ? "zh"
              : /[\u3040-\u30FF]/.test(text)
                ? "ja"
                : /[\uAC00-\uD7AF]/.test(text)
                  ? "ko"
                  : /[\u0900-\u097F]/.test(text)
                    ? "hi"
                    : /[\u0400-\u04FF]/.test(text)
                      ? "ru"
            : /[àâçéèêëîïôûùüÿœ]/i.test(text)
              ? "fr"
              : /[ñáéíóúü¿¡]/i.test(text)
                ? "es"
                : /[ãõç]/i.test(text)
                  ? "pt"
                  : /[ğışİöçü]/i.test(text)
                    ? "tr"
                    : /[äöüß]/i.test(text)
                  ? "de"
                  : /^[\x00-\x7F\s]+$/.test(text)
                    ? "en"
                    : userLang;
          toast.info(`${action.emoji} ${nudgeText(action, msgLang)}`, {

            duration: 5000,
            action: {
              label: userLang?.startsWith("ar") ? "ليس هذا" : "Not this",
              onClick: () => {
                rejectIntent(result.intent);
                setChatMode("normal");
                setSelectedAgent(null);
              },
            },
          });
          isSubmittingRef.current = false;
          return;
        }
      } catch {
        /* detector is best-effort; never block the send on failure */
      }
    }

    if (SUBSCRIBER_MODES.includes(chatMode) && !isPaidPlan) {
      const feature: "images" | "video" | "code" | "music" =

        chatMode === "video" ? "video" : chatMode === "images" ? "images" : chatMode === "music" ? "music" : "code";
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          clientId: `user-paywall-${Date.now()}`,
          content: text,
          mode: chatMode,
        } as Message,
        {
          role: "assistant",
          clientId: `assist-paywall-${Date.now()}`,
          content: "",
          mode: chatMode,
          paywall: { feature },
        } as Message,
      ]);
      setInput("");
      isSubmittingRef.current = false;
      return;
    }

    if (selectedAgent?.id === "music" && !isPaidPlan) {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          clientId: `user-music-agent-paywall-${Date.now()}`,
          content: text,
          mode: chatMode,
        } as Message,
        {
          role: "assistant",
          clientId: `assist-music-agent-paywall-${Date.now()}`,
          content: "",
          mode: chatMode,
          paywall: { feature: "music" },
        } as Message,
      ]);
      setInput("");
      isSubmittingRef.current = false;
      return;
    }

    if (chatMode === "images" && (mediaModel as any)?.isPremium && !isPaidPlan) {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          clientId: `user-image-premium-paywall-${Date.now()}`,
          content: text,
          mode: chatMode,
        } as Message,
        {
          role: "assistant",
          clientId: `assist-image-premium-paywall-${Date.now()}`,
          content: "",
          mode: chatMode,
          paywall: { feature: "images" },
        } as Message,
      ]);
      setInput("");
      isSubmittingRef.current = false;
      return;
    }

    isSubmittingRef.current = true;

    const pendingAttachments = attachedFiles.filter(
      (f) => f.data.startsWith("__parsing_") || f.data.startsWith("__uploading_"),
    );
    if (pendingAttachments.length > 0) {
      toast.info("Please wait until attachments finish processing");
      isSubmittingRef.current = false;
      return;
    }

    const imageAttachments = attachedFiles.filter((f) => f.type === "image");
    const videoAttachments = attachedFiles.filter(
      (f) => f.type === "video" && !f.data.startsWith("__uploading_"),
    );
    const fileAttachments = attachedFiles.filter((f) => f.type === "file");
    const localTurnId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    const userMsg: Message = {
      role: "user",
      clientId: `user-${localTurnId}`,
      content:
        text || (attachedFiles.length > 0 ? `[${attachedFiles.length} file(s) attached]` : ""),
      attachedImages: imageAttachments.map((f) => f.data),
      attachedVideos: videoAttachments.map((f) => f.data),
      attachedFiles: fileAttachments.map((f) => ({ name: f.name, type: f.type })),
      mode: chatMode,
      hiddenFromTranscript: isLearningAnswer,
    };

    // ── Operator mode: keep the normal chat flow; render operator output as the assistant reply ──
    if (chatMode === "operator") {
      try {
        await runOperatorTurn({
          text,
          userMsg,
          localTurnId,
          setMessages,
          setInput,
          setAttachedFiles,
          setPendingQuestions,
          setNarrations,
          setClarifyQs,
          setOperatorRunId,
          createOrUpdateConversation,
          saveMessage,
          ownInsertedIdsRef,
        });
      } finally {
        isSubmittingRef.current = false;
      }
      return;
    }

    // ── Images / Video / Music mode: plan first, then generation ──
    if (chatMode === "images" || chatMode === "video" || chatMode === "music") {
      if (chatMode !== "music") {
        const expectedMediaType = chatMode === "video" ? "video" : "image";
        if (!mediaModel || mediaModel.type !== expectedMediaType) {
          toast.error(
            chatMode === "video" ? "Choose a video model first" : "Choose an image model first",
          );
          isSubmittingRef.current = false;
          return;
        }
      }
      const isStartEnd = chatMode === "video" && videoStartEndMode;
      if (isStartEnd && (!startFrameUrl || !endFrameUrl)) {
        toast.error("Upload both the first and last frame first");
        isSubmittingRef.current = false;
        return;
      }
      try {
        await runMediaTurn({
          text,
          userMsg,
          localTurnId,
          chatMode,
          mediaModel,
          videoStartEndMode,
          startFrameUrl,
          endFrameUrl,
          videoDurationSec,
          setMessages,
          setInput,
          setAttachedFiles,
          setPendingQuestions,
          setIsLoading,
          setIsThinking,
          createOrUpdateConversation,
          saveMessage,
          ownInsertedIdsRef,
        });
      } finally {
        isSubmittingRef.current = false;
      }
      return;
    }

    const assistantMessageIndex = editingIndex !== null ? editingIndex + 1 : messages.length + 1;
    setMessages((prev) => {
      let base = prev;
      if (editingIndex !== null && prev[editingIndex]?.role === "user") {
        base = [...prev];
        base.splice(editingIndex, base[editingIndex + 1]?.role === "assistant" ? 2 : 1);
      }
      return [
        ...base,
        userMsg,
        { role: "assistant", content: "", clientId: `assistant-${localTurnId}`, mode: chatMode },
      ];
    });
    if (editingIndex !== null) {
      setEditingIndex(null);
      setEditingOriginal("");
    }
    const userInput = text;
    setInput("");
    const currentFiles = [...attachedFiles];
    setAttachedFiles([]);
    setIsLoading(true);
    setIsThinking(true);
    setPendingQuestions([]);
    resetToolUi();
    setNarrations([]);
    setClarifyQs(null);
    if (chatMode === "deep-research") {
      setNarrations([]);
    }

    // Slides + Images mode is now routed through the internal premium deck
    // pipeline (chat-slides-stream) further below. The previous external
    // 2slides.com fallback was removed — it depended on a separate paid pool
    // and was unreliable.

    // ── Auto-route to Slides only for explicit creation requests.
    // Mentioning/cancelling slides should remain a normal chat message.
    const SLIDES_KEYWORD_RE =
      /(\b(slides?|presentation|pr[ée]sentation|presentaci[óo]n|pr[äa]sentation|deck|pitch\s*deck|powerpoint|pptx?|keynote|diapositiv[aoe]s?|folien)\b|عرض\s*تقديمي|بريزنتيش?ن|برزنتيش?ن|شرائح|شريحة|سلايد(?:ز|س|ات)?|بوربوينت|كانفا|عرض\s*شرائح)/i;
    const SLIDES_CREATE_RE =
      /(\b(create|generate|make|build|design|prepare|draft|need|want|give\s*me)\b|اعمل|إعمل|اعملي|إعملي|اعملى|انشئ|أنشئ|اصنع|صمم|جهز|حضّر|حضر|عايز|عاوز|عايزة|عاوزة|محتاج|محتاجة|اريد|أريد|ابغى|سوي|سوّي|هات|هاتلي|ابعت|ابعتلي|طلب|اطلب)/i;
    const SLIDES_NEGATION_RE =
      /(\b(cancel(?:led)?|stop|don't|do not|not|without)\b|لغيت|الغيت|إلغ|الغاء|إلغاء|وقف|اوقف|مش\s*عايز|مش\s*عاوز|لا\s*تعمل|متعملش|بلاش)/i;
    // Auto-route to slides whenever a slides keyword appears with clear
    // creation intent OR when the message is longer than a short mention
    // (so bare "اعمل سلايدس عن ..." or "make slides about ..." always fires
    //  the slides tool instead of the model narrating slides in prose).
    const _hasSlidesKeyword = SLIDES_KEYWORD_RE.test(userInput);
    const _hasCreateIntent = SLIDES_CREATE_RE.test(userInput);
    const _isNegated = SLIDES_NEGATION_RE.test(userInput);
    const _looksLikeSlidesAsk =
      _hasSlidesKeyword && (_hasCreateIntent || userInput.trim().length >= 12);
    const shouldAutoStartSlides =
      chatMode === "normal" && _looksLikeSlidesAsk && !_isNegated;
    if (shouldAutoStartSlides) {
      setChatMode("slides");
    }

    // ── Slides mode: stream from chat-slides-stream and attach a SlideDeck ─
    if (chatMode === "slides" || chatMode === "slides-images" || shouldAutoStartSlides) {
      try {
        await runSlidesTurn({
          userInput,
          localTurnId,
          chatUserId,
          slidesTemplate,
          setChatMode,
          setSearchEnabled,
          setIsLoading,
          setIsThinking,
          resetToolUi,
          setMessages,
          setSearchStatus,
          createOrUpdateConversation,
          saveMessage,
          ownInsertedIdsRef,
          fetchSlidesNarration,
          insertAssistantNarration,
          clearSlidesTimeout,
          slidesTimeoutsRef,
          slidesGenerationTokenRef,
        });
      } finally {
        isSubmittingRef.current = false;
      }
      return;
    }

    // ── @docs agent: server-backed background job; survives tab close ───
    if (selectedAgent?.id === "docs") {
      const handled = await runDocsTurn({
        userInput,
        localTurnId,
        chatUserId,
        navigate: zoneNavigate,
        messages,
        setMessages,
        setSearchStatus,
        setIsLoading,
        setIsThinking,
        resetToolUi,
        startDocsStatusFallback,
        stopDocsStatusFallback,
        createOrUpdateConversation,
        saveMessage,
        ownInsertedIdsRef,
      });
      isSubmittingRef.current = false;
      if (handled) return;
      return;
    }

    const conversationPromise = createOrUpdateConversation(
      userInput || (currentFiles.length > 0 ? `[${currentFiles.length} file(s)]` : "New chat"),
    ).catch(() => null);

    void conversationPromise.then(async (resolvedConversationId) => {
      if (!resolvedConversationId) return;
      const insertedId = await saveMessage(
        resolvedConversationId,
        "user",
        userInput || `[${currentFiles.length} file(s) attached]`,
        undefined,
        isLearningAnswer ? { kind: "learnAnswer", hiddenFromTranscript: true } : undefined,
      );
      if (insertedId) {
        ownInsertedIdsRef.current.add(insertedId);
        window.dispatchEvent(new CustomEvent("megsy:conversations-changed"));
        // Attach id to last user message locally so dedup by id works for echo
        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.clientId === `user-${localTurnId}`);
          if (idx < 0) return prev;
          const next = [...prev];
          next[idx] = { ...next[idx], id: insertedId, user_id: chatUserId || undefined };
          return next;
        });
      }
      // Notify mentioned members
      if (members.length > 0 && userInput) {
        const mentions = Array.from(
          new Set(
            (userInput.match(/@([A-Za-z0-9_]+)/g) || []).map((m) => m.slice(1).toLowerCase()),
          ),
        );
        if (mentions.length > 0) {
          for (const mb of members) {
            if (!mb.name || mb.id === chatUserId) continue;
            const safe = mb.name.replace(/\s+/g, "_").toLowerCase();
            if (mentions.includes(safe)) {
              await supabase.rpc("create_notification" as any, {
                p_user_id: mb.id,
                p_type: "mention",
                p_title: `${userName || "Someone"} mentioned you`,
                p_message: userInput.slice(0, 140),
                p_metadata: { conversation_id: resolvedConversationId },
              });
            }
          }
        }
      }
    });

    await runChatStreamTurn({
      messages,
      userMsg,
      currentFiles,
      userInput,
      localTurnId,
      assistantMessageIndex,
      conversationId,
      conversationPromise,
      chatMode,
      searchEnabled,
      megsyTier,
      chatUserId,
      userName,
      computerUseEnabled,
      selectedAgent,
      selectedModel,
      enabledSkills,
      librarySkills,
      researchDepth,
      setMessages,
      setIsLoading,
      setIsThinking,
      setSearchStatus,
      setActiveResearchJobId,
      setNarrations,
      setClarifyQs,
      setToolActivity,
      setParallelTasks,
      abortControllerRef,
      presenceChannelRef,
      ownInsertedIdsRef,
      isSubmittingRef,
      resetToolUi,
      pushNarration,
      saveMessage,
    });
  };

  useEffect(() => {
    sendWithTextRef.current = handleSendWithText;
  });

  const handleSend = () => handleSendWithText();

  // After signup, auto-send the prompt the user typed on the landing page.
  usePostSignupPrompt(handleSendWithText);

  const handleNewChat = useChatNewChat({
    slidesGenerationTokenRef,
    slidesTimeoutsRef,
    studyAudioRef,
    setStudyTimers,
    setStudyMusic,
    setMessages,
    setConversationId,
    setConversationTitle,
    setIsLoading,
    setIsThinking,
    setAttachedFiles,
    resetToolUi,
    setChatMode,
    setSearchEnabled,
    setComputerUseEnabled,
    setIsShared,
    setShareId,
    setShareMode,
    setIsPinned,
    setPendingQuestions,
    setSelectedModel,
    setSelectedAgent,
    isSubmittingRef,
  });

  useEffect(() => {
    if (chatMode === "learning") return;
    if (studyAudioRef.current) {
      studyAudioRef.current.pause();
      studyAudioRef.current.src = "";
    }
    setStudyMusic({ kind: null });
    setStudyTimers([]);
  }, [chatMode]);

  const { handleFileUpload, handleImageUpload, handleCameraCapture } = useComposerUploads({
    attachedFiles,
    setAttachedFiles,
    conversationId,
    createOrUpdateConversation,
  });

  const {
    handleShare,
    handleCreateShareLink,
    handleCopyShareLink,
    handleRename,
    handleTogglePin,
    performTogglePin,
    handleInvite,
    handleSendInviteEmail,
    handleGenerateInviteLink,
    handleCopyInviteLink,
  } = useChatSocialActions({
    conversationId,
    shareMode,
    shareId,
    isShared,
    generatedShareUrl,
    setShareDialogOpen,
    setIsShared,
    setShareId,
    setGeneratedShareUrl,
    renameValue,
    setConversationTitle,
    setIsRenaming,
    isPinned,
    setIsPinned,
    inviteEmail,
    inviteLink,
    setInviteDialogOpen,
    setInviteLink,
    setInviteEmail,
    setInviteLoading,
    setMembers,
  });

  const composerModeBarChange = useMobileModeBarChange({
    selectedAgent,
    setSelectedAgent,
    setSelectedModel,
    setChatMode,
    handleModeChange,
    tryActivateMegsyOs,
  });

  const openInviteFlow = useCallback(async () => {
    if (!conversationId) {
      toast.error("Start a conversation first");
      return;
    }
    setInviteLink(null);
    setInviteEmail("");
    const user = await getCachedUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("conversation_invites")
      .insert({ conversation_id: conversationId, invited_by: user.id } as any)
      .select("invite_token")
      .single();
    if (!error && data) {
      setInviteLink(`${window.location.origin}/invite/${(data as any).invite_token}`);
    }
  }, [conversationId, setInviteLink, setInviteEmail]);

  useChatEntryEffects({
    conversationId,
    location,
    navigate: zoneNavigate,
    loadConversation,
    setConversationId,
    setConversationTitle,
    setMessages,
  });

  useRealtimeMembers({
    conversationId,
    chatUserId,
    setMembers,
    setSystemEvents,
    onSelfRemoved: handleNewChat,
  });

  // playNotificationSound extracted into ./utils/notificationSound

  useRealtimeChat({
    conversationId,
    chatUserId,
    messagesContainerRef,
    ownInsertedIdsRef,
    presenceChannelRef,
    scrollToBottom,
    playNotificationSound,
    setMessages,
    setNewMessagesCount,
    setUnreadCount,
    setTypingUsers,
    setRemoteAiBusy,
    setOnlineUsers,
  });

  // Throttled typing broadcast (extracted into hook).
  useTypingPresence({ input, chatUserId, userName, presenceChannelRef });

  const handleKickMember = useKickMember({ conversationId, members, setMembers });

  const {
    memberMap,
    readersByMessageId,
    lastMessageIdx,
    lastAssistantIdx,
    showReadersIdx,
    hasMembers,
  } = useMessageDerivations({
    members,
    chatUserId,
    userName,
    messages,
    messageReads,
  });
  const dismissOperatorRun = useCallback(() => setOperatorRunId(null), [setOperatorRunId]);

  // Load reactions + reads for current conversation, subscribe to realtime
  useReadsAndReactions({
    conversationId,
    chatUserId,
    messages,
    markedReadRef,
    setMessageReads,
    setMessageReactions,
  });

  // Mirror unread count into the document title while the tab is hidden.
  useUnreadDocumentTitle({ unreadCount, originalTitleRef, setUnreadCount });

  const toggleReaction = useMessageReactionToggle({
    conversationId,
    chatUserId,
    messageReactions,
    setMessageReactions,
    setReactionPickerFor,
  });

  // Mention detection + insertion (extracted into hook).
  const { mentionQuery, insertMention } = useMentionDetection({
    input,
    setInput,
    membersCount: members.length,
  });

  const confirmDelete = useDeleteConversation({
    conversationId,
    setIsDeleting,
    onDeleted: () => handleNewChat(),
  });

  const {
    editingIndex,
    setEditingIndex,
    editingOriginal,
    setEditingOriginal,
    handleEditUserMessageAt,
    cancelEdit,
  } = useMessageEdit({ setInput });

  const hasConversation = messages.length > 0;
  const showDesktopEmptyVideo = messages.length === 0 && !loadingMessages;

  const { integrationCategories, filteredIntegrations } = useIntegrationsFilter(
    integrationsQuery,
    integrationsCategory,
  );
  // integrationGradient extracted into ./utils/integrationGradient
  const connectIntegration = useConnectIntegration({
    connectingApp,
    setConnectingApp,
    setPlusMenuOpen,
    navigate,
    setUserIntegrations: setUserIntegrations as any,
    refreshIntegrations,
  });

  const renderPlusContent = () => (
    <Suspense fallback={null}>
    <PlusContent
      plusView={plusView as any}
      setPlusView={setPlusView as any}
      setPlusMenuOpen={setPlusMenuOpen}
      chatMode={chatMode}
      cameraInputRef={cameraInputRef}
      imageInputRef={imageInputRef}
      fileInputRef={fileInputRef}
      musicFileInputRef={musicFileInputRef}
      studyAudioRef={studyAudioRef}
      searchEnabled={searchEnabled}
      handleSearchToggle={handleSearchToggle}
      studyMusic={studyMusic}
      setStudyMusic={setStudyMusic}
      userTracks={userTracks}
      uploadingMusic={uploadingMusic}
      playUserTrack={playUserTrack}
      deleteUserTrack={deleteUserTrack}
      handleMusicUpload={handleMusicUpload}
      timerInputMin={timerInputMin}
      setTimerInputMin={setTimerInputMin}
      setStudyTimers={setStudyTimers}
      scrollToBottom={scrollToBottom}
      megsyTier={megsyTier as any}
      setMegsyTier={setMegsyTier as any}
      userPlan={userPlan}
      chatUserId={chatUserId}
      mySkills={mySkills}
      librarySkills={librarySkills}
      toggleEnabled={toggleEnabled}
      navigate={zoneNavigate}
      integrationCategories={integrationCategories}
      integrationsCategory={integrationsCategory}
      setIntegrationsCategory={setIntegrationsCategory}
      integrationsQuery={integrationsQuery}
      filteredIntegrations={filteredIntegrations}
      userIntegrations={userIntegrations as any}
      connectingApp={connectingApp}
      brokenLogos={brokenLogos}
      setBrokenLogos={setBrokenLogos}
      connectIntegration={connectIntegration}
      onModeChange={(m) => handleModeChange(m as any)}
      onAgentSelect={(agentId) => {
        const agent = getAgentById(agentId);
        setChatMode("normal");
        setSelectedAgent(agent || null);
        setSelectedModel(null);
      }}
      onWebsiteStart={() => {
        setChatMode("normal");
        setSelectedAgent(null);
        setSelectedModel(null);
        setInput("Build a complete website for: ");
      }}
    />
    </Suspense>
  );

  // Desktop popover + mobile anchored popover. Mobile opens from the + button
  // itself instead of a full draggable sheet to avoid the old snap/blur lag.
  const composerRef = useRef<HTMLDivElement>(null);
  const renderPlusMenu = () => {
    const openUp = hasConversation || messages.length > 0;
    const r = composerRef.current?.getBoundingClientRect();
    if (isMobileViewport) {
      const vh = window.innerHeight;
      const composerTop = r?.top ?? vh - 96;
      const isBigView = plusView === "skills" || plusView === "tools";
      // Skills / Integrations need almost the full viewport on mobile — the
      // 55vh cap was cropping the sheet to a thin strip and hiding rows.
      const expandedCap = isBigView ? vh * 0.88 : vh * 0.55;
      const collapsedH = Math.max(220, Math.min(vh * 0.34, composerTop - 24));
      const expandedH = Math.max(
        collapsedH,
        Math.min(expandedCap, composerTop - 8),
      );
      const collapsedY = expandedH - collapsedH;

      return createPortal(
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="md:hidden fixed inset-0 z-[55] bg-transparent"
            onClick={() => setPlusMenuOpen(false)}
          />
          <Suspense fallback={null}>
            <DraggablePlusSheet
              height={expandedH}
              collapsedY={collapsedY}
              onClose={() => setPlusMenuOpen(false)}
              initialExpanded={plusView === "skills" || plusView === "tools"}
              view={plusView}
            >
              {renderPlusContent()}
            </DraggablePlusSheet>
          </Suspense>
        </>,
        document.body,
      );

    }



    const menuWidth = plusView === "skills" ? Math.min(420, window.innerWidth - 24) : 300;
    const left = r ? Math.max(12, Math.min(window.innerWidth - menuWidth - 12, r.left + 8)) : 24;
    const bottom = r ? window.innerHeight - r.top + 8 : 96;
    const availableAbove = r ? Math.max(260, r.top - 16) : 600;
    const maxMenuHeight = Math.min(600, availableAbove);
    return createPortal(
      <>
        {/* Desktop: backdrop to close on outside click */}
        <div
          className="hidden md:block fixed inset-0 z-[55]"
          onClick={() => setPlusMenuOpen(false)}
        />
        {/* Desktop: anchored popover below input — fixed so it never shifts the composer */}
        <motion.div
          initial={{ opacity: 0, y: openUp ? 6 : -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: openUp ? 6 : -6, scale: 0.98 }}
          transition={{ duration: 0.16, ease: [0.22, 0.9, 0.3, 1] }}
          data-plus-menu
          onClick={(e) => e.stopPropagation()}
          className={`hidden md:flex origin-bottom-left z-overlay rounded-2xl border border-white/15 overflow-y-auto overscroll-contain p-2 flex-col unified-menu-surface`}
          style={{
            position: "fixed",
            left,
            bottom,
            width: menuWidth,
            maxHeight: maxMenuHeight,
            color: "hsl(var(--brand-parchment))",
            backdropFilter: "blur(22px) saturate(160%)",
            background: "rgba(0, 0, 0, 0.32)",
            borderTop: "1px solid rgba(255,255,255,0.22)",
            borderRight: 0,
            borderBottom: 0,
            borderLeft: 0,
            boxShadow:
              "inset 0 1px 0 var(--overlay-white-18), 0 22px 60px -18px rgba(0,0,0,0.7)",
          }}
        >
          {renderPlusContent()}
        </motion.div>
      </>,
      document.body,
    );
  };

  const removeAttachment = useCallback(
    (index: number) => setAttachedFiles((prev) => prev.filter((_, idx) => idx !== index)),
    [setAttachedFiles],
  );

  const seoMeta = getSeoMeta(chatMode);

  const renderMobileServicePanel = () => (
    <Suspense fallback={null}>
      <MobileServicePanelRenderer
        selectedAgent={selectedAgent}
        chatMode={chatMode}
        setChatMode={setChatMode}
        setSelectedAgent={setSelectedAgent}
        setSelectedModel={setSelectedModel}
        slidesTemplate={slidesTemplate}
        setSlidesPickerOpen={setSlidesPickerOpen}
        videoStartEndMode={videoStartEndMode}
        setVideoStartEndMode={setVideoStartEndMode}
        startFrameUrl={startFrameUrl}
        endFrameUrl={endFrameUrl}
        setStartFrameUrl={setStartFrameUrl}
        setEndFrameUrl={setEndFrameUrl}
        frameUploading={frameUploading}
        setFrameUploading={setFrameUploading}
        uploadFrame={uploadFrame}
        setVideoDurationSec={setVideoDurationSec}
        tierMenuOpen={tierMenuOpen}
        setTierMenuOpen={setTierMenuOpen}
        selectedModel={selectedModel}
        megsyTier={megsyTier}
        setMegsyTier={setMegsyTier}
        userPlan={userPlan}
        mediaModel={mediaModel}
        setMediaModel={setMediaModel}
        researchDepth={researchDepth}
        setResearchDepth={setResearchDepth}
      />
    </Suspense>
  );

  // All previously-full-panel modes (images, video, slides, deep-research,
  // learning, docs) now render only the single ActiveServicePill strip inside
  // the composer, so the mobile landing should keep showing the normal
  // MobileModeBar chip strip. `renderMobileServicePanel` returns null for
  // every one of them — treating `hasMobileServicePanel` as always false here
  // prevents the landing from swapping the chip strip for an empty slot.
  const hasMobileServicePanel = false;

  return (
    <>
      <SEOHead title={seoMeta.title} description={seoMeta.description} path={seoMeta.path} />

      {/* Megsy Operator now renders as a tiny inline pill above the input — see below. */}
      <div
        data-shell="manus"
        data-skin="claude"
        data-chat-empty={showDesktopEmptyVideo ? "true" : "false"}
        className="flex bg-transparent overflow-hidden relative"
        style={{ height: "calc(100dvh - var(--promo-banner-h, 0px))" }}
      >
        {/* Desktop chat landing background video (hidden on mobile). */}
        <video
          src="/videos/chat-landing-bg.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover hidden md:block"
        />
        <Suspense fallback={null}><ChatAurora /></Suspense>
        {/* Desktop persistent sidebar */}
        <aside
          data-chat-sidebar="true"
          style={{
            width: desktopSidebarWidth,
            minWidth: desktopSidebarWidth,
            flexBasis: desktopSidebarWidth,
            backgroundColor: "transparent",
            borderRightColor: "transparent",
          }}
          className="theme-fixed relative z-40 hidden md:flex shrink-0 overflow-hidden border-e transition-[width,min-width,flex-basis] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        >
          <AppSidebar
            inline
            open
            forceExpanded={isSidebarExpanded}
            onClose={() => {}}
            onNewChat={handleNewChat}
            onSelectConversation={loadConversation}
            activeConversationId={conversationId}
            currentMode={
              chatMode === "learning"
                ? "learning"
                : chatMode === "deep-research"
                  ? "research"
                  : chatMode === "shopping"
                    ? "shopping"
                    : chatMode === "slides" || chatMode === "slides-images"
                      ? "slides"
                      : chatMode === "images"
                        ? "images"
                        : chatMode === "video"
                          ? "videos"
                          : (chatMode as string) === "website" ||
                              (chatMode as string) === "coding" ||
                              (chatMode as string) === "code"
                            ? "code"
                            : "chat"
            }
          />
        </aside>

        {/* Mobile Claude-style underlay sidebar — sits beneath the chat surface. */}
        <div className="md:hidden">
          <AppSidebar
            underlay
            mobileSide={isRtlUi ? "right" : "left"}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onNewChat={handleNewChat}
            onSelectConversation={loadConversation}
            activeConversationId={conversationId}
            currentMode={
              chatMode === "learning"
                ? "learning"
                : chatMode === "deep-research"
                  ? "research"
                  : chatMode === "shopping"
                    ? "shopping"
                    : chatMode === "slides" || chatMode === "slides-images"
                      ? "slides"
                      : chatMode === "images"
                        ? "images"
                        : chatMode === "video"
                          ? "videos"
                          : (chatMode as string) === "website" ||
                              (chatMode as string) === "coding" ||
                              (chatMode as string) === "code"
                            ? "code"
                            : "chat"
            }
          />
        </div>

        <div
          aria-hidden="true"
          data-sidebar-edge-gesture="true"
          className={`md:hidden fixed top-0 bottom-0 z-[80] w-8 touch-none ${
            sidebarOpen ? "pointer-events-none" : "pointer-events-auto"
          } ${isRtlUi ? "right-0" : "left-0"}`}
          onPointerDown={(event) => {
            beginSidebarEdgeDrag(event.pointerId, event.clientX, event.clientY);
            event.currentTarget.setPointerCapture?.(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (updateSidebarEdgeDrag(event.pointerId, event.clientX, event.clientY)) {
              event.preventDefault();
            }
          }}
          onPointerUp={(event) => endSidebarEdgeDrag(event.pointerId)}
          onPointerCancel={(event) => endSidebarEdgeDrag(event.pointerId)}
        />

        <motion.div
          data-chat-main="true"
          data-chat-empty={messages.length === 0 && !loadingMessages ? "true" : "false"}
          data-sidebar-open={sidebarOpen ? "true" : "false"}
          style={{
            x: sidebarX,
            scale: sidebarScale,
            borderRadius: sidebarRadius,
            boxShadow: sidebarShadow,
            transformOrigin: isRtlUi ? "right center" : "left center",
            touchAction: "pan-y",
          }}
          drag={isMobileViewport && sidebarOpen ? "x" : false}
          dragDirectionLock
          dragConstraints={
            isRtlUi ? { left: -sidebarRevealX, right: 0 } : { left: 0, right: sidebarRevealX }
          }
          dragElastic={isRtlUi ? { left: 0.03, right: 0.14 } : { left: 0.14, right: 0.03 }}
          dragMomentum={false}
          onDragEnd={(_, info) => {
            if (!sidebarOpen) return;
            const shouldClose = isRtlUi
              ? info.offset.x > Math.max(72, sidebarRevealX * (1 - SIDEBAR_CLOSE_SNAP)) ||
                info.velocity.x > SIDEBAR_FLING_VELOCITY
              : info.offset.x < -Math.max(72, sidebarRevealX * (1 - SIDEBAR_CLOSE_SNAP)) ||
                info.velocity.x < -SIDEBAR_FLING_VELOCITY;
            setSidebarOpen(!shouldClose);
            animateSidebarTo(!shouldClose);
          }}
          className="theme-fixed chat-surface-dark flex-1 flex flex-col min-w-0 relative overflow-hidden bg-black text-foreground max-md:z-[2]"
        >




          {/* Tap-to-close overlay while the underlay sidebar is revealed. */}
          <motion.div
            className={`md:hidden absolute inset-0 z-[60] ${
              sidebarOpen
                ? "pointer-events-auto"
                : "pointer-events-none"
            }`}
            style={{ background: "rgba(0,0,0,0.42)", opacity: sidebarProgress }}
            onClick={() => setSidebarOpen(false)}
            aria-hidden={!sidebarOpen}
          />


          {/* Mobile-only header — Luma Neutral */}
          <MobileChatHeaderMount
            conversationTitle={conversationTitle}
            conversationId={conversationId}
            hasConversation={hasConversation}
            isPinned={isPinned}
            isDeleting={isDeleting}
            setSidebarOpen={setSidebarOpen}
            handleNewChat={handleNewChat}
            handleShare={handleShare}
            handleInvite={handleInvite}
            setRenameValue={setRenameValue}
            performTogglePin={performTogglePin}
            confirmDelete={confirmDelete}
            chatMode={chatMode}
            tierMenuOpen={tierMenuOpen}
            setTierMenuOpen={setTierMenuOpen}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            megsyTier={megsyTier}
            setMegsyTier={setMegsyTier}
            userPlan={userPlan}
            mediaModel={mediaModel}
            setMediaModel={setMediaModel}
            chatUserId={chatUserId}
            renameValue={renameValue}
            handleRename={handleRename}
            inviteEmail={inviteEmail}
            setInviteEmail={setInviteEmail}
            inviteLink={inviteLink}
            setInviteLink={setInviteLink}
            inviteLoading={inviteLoading}
            handleSendInviteEmail={handleSendInviteEmail}
            handleCopyInviteLink={handleCopyInviteLink}
            shareMode={shareMode}
            setShareMode={setShareMode}
            generatedShareUrl={generatedShareUrl}
            setGeneratedShareUrl={setGeneratedShareUrl}
            handleCreateShareLink={handleCreateShareLink}
            handleCopyShareLink={handleCopyShareLink}
            setChatMode={setChatMode}
            setVideoDurationSec={setVideoDurationSec}
          />

          {/* Desktop/mobile combined header: title dropdown, Unlock Pro, options */}
          <DesktopChatHeader
            chatMode={chatMode}
            hasConversation={hasConversation}
            userPlan={userPlan}
            navigate={zoneNavigate}
            setSidebarOpen={setSidebarOpen}
            conversationId={conversationId}
            conversationTitle={conversationTitle}
            isPinned={isPinned}
            isDeleting={isDeleting}
            renameValue={renameValue}
            setRenameValue={setRenameValue}
            inviteEmail={inviteEmail}
            setInviteEmail={setInviteEmail}
            inviteLink={inviteLink}
            inviteLoading={inviteLoading}
            shareMode={shareMode}
            setShareMode={setShareMode}
            generatedShareUrl={generatedShareUrl}
            setGeneratedShareUrl={setGeneratedShareUrl}
            chatMenuView={chatMenuView}
            setChatMenuView={setChatMenuView}
            onNewChat={handleNewChat}
            onTogglePin={performTogglePin}
            onRename={handleRename}
            onSendInvite={handleSendInviteEmail}
            onCopyInviteLink={handleCopyInviteLink}
            onCopyShareLink={handleCopyShareLink}
            onCreateShareLink={handleCreateShareLink}
            onOpenInvite={openInviteFlow}
            onConfirmDelete={confirmDelete}
            tierMenuOpen={tierMenuOpen}
            setTierMenuOpen={setTierMenuOpen}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            megsyTier={megsyTier}
            setMegsyTier={setMegsyTier}
            mediaModel={mediaModel}
            setMediaModel={setMediaModel}
            chatUserId={chatUserId}
            setChatMode={setChatMode}
            setVideoDurationSec={setVideoDurationSec}
          />

          {/* Scrollable messages area (welcome → loading → transcript) */}
          <ChatMessagesArea
            ref={messagesEndRef}
            loadingMessages={loadingMessages}
            messages={messages}
            messagesContainerRef={messagesContainerRef}
            handleScroll={handleScroll}
            showScrollBtn={showScrollBtn}
            newMessagesCount={newMessagesCount}
            scrollToBottom={scrollToBottom}
            userName={userName}
            isFirstVisit={isFirstVisit}
            returningGreetingIdx={returningGreetingIdx}
            plusMenuOpen={plusMenuOpen}
            renderPlusMenu={renderPlusMenu}
            mobileLandingProps={{
              input,
              setInput,
              handleSend,
              isLoading,
              activeResearchJobId,
              selectedModel,
              setSelectedModel,
              megsyTier,
              userPlan,
              userName,
              plusMenuOpen,
              setPlusMenuOpen,
              setPlusView,
              hasMobileServicePanel,
              renderMobileServicePanel,
              chatMode,
              selectedAgent,
              setSelectedAgent,
              setChatMode,
              handleModeChange,
              tryActivateMegsyOs,
              setSlidesPickerOpen,
            }}
            messagesListProps={{
              messages,
              editingIndex,
              chatMode,
              studyTimers,
              setStudyTimers,
              systemEvents,
              typingUsers,
              colorForUser,
              chatUserId,
              conversationId,
              conversationTitle,
              isLoading,
              isThinking,
              searchStatus,
              toolActivity,
              parallelTasks,
              narrations,
              hasMembers,
              messageReactions,
              readersByMessageId,
              showReadersIdx,
              lastMessageIdx,
              handleLikeMessage,
              handleStructuredAction,
              handleEditUserMessageAt,
              handleResearchRunningChange,
              dismissOperatorRun,
              toggleReaction,
              setMessages,
              setInput,
              setIsLoading,
              setIsThinking,
              setSearchStatus,
              setChatMode,
              resetToolUi,
              startDocsStatusFallback,
              stopDocsStatusFallback,
              saveMessage,
              handleSendWithText,
            }}
            slotAfterMessages={
              coderRuns.length > 0 ? (
                <Suspense fallback={null}>
                  <div className="space-y-3">
                    {coderRuns.map((run) => (
                      <InlineCoderRun
                        key={run.id}
                        runId={run.id}
                        prompt={run.prompt}
                        onClose={() => setCoderRuns((prev) => prev.filter((r) => r.id !== run.id))}
                        onFinish={(files, summary) => {
                          if (savedCoderRunIdsRef.current.has(run.id)) return;
                          savedCoderRunIdsRef.current.add(run.id);
                          const projectText = files
                            .map((file) => {
                              const ext = (file.path.split(".").pop() || "txt").toLowerCase();
                              return `\`\`\`${ext} ${file.path}\n${file.content}\n\`\`\``;
                            })
                            .join("\n\n");
                          const content = [
                            "Megsy Coder finished the build.",
                            summary?.trim() ? summary.trim() : "",
                            projectText,
                          ]
                            .filter(Boolean)
                            .join("\n\n");
                          void (async () => {
                            const resolvedConversationId = await run.conversationPromise;
                            if (!resolvedConversationId) return;
                            const insertedId = await saveMessage(resolvedConversationId, "assistant", content).catch(() => undefined);
                            if (insertedId) {
                              ownInsertedIdsRef.current.add(insertedId);
                              window.dispatchEvent(new CustomEvent("megsy:conversations-changed"));
                            }
                          })();
                        }}
                      />
                    ))}
                  </div>
                </Suspense>
              ) : null
            }
          />


          {/* Floating bottom composer dock with attachments + mode bar + chips */}
          <ChatComposerSection
            composerRef={composerRef}
            sidebarCollapsed={!isSidebarExpanded}
            sidebarOffset={desktopSidebarWidth}
            loadingMessages={loadingMessages}
            messagesLength={messages.length}
            attachedFiles={attachedFiles}
            removeAttachment={removeAttachment}
            remoteAiBusy={remoteAiBusy}
            plusMenuOpen={plusMenuOpen}
            renderPlusMenu={renderPlusMenu}
            mentionQuery={mentionQuery}
            members={members}
            onlineUsers={onlineUsers}
            colorForUser={colorForUser}
            insertMention={insertMention}
            navigate={zoneNavigate}
            desktopGreeting={
              <Suspense fallback={null}>
                <DesktopGreeting
                  userName={userName}
                  isFirstVisit={isFirstVisit}
                  returningGreetingIdx={returningGreetingIdx}
                />
              </Suspense>
            }
            composerMobileModeBarProps={{
              selectedAgent,
              chatMode,
              editingIndex,
              hasMobileServicePanel,
              renderMobileServicePanel,
              composerModeBarChange,
            }}
            composerAnimatedInputProps={{
              input,
              setInput,
              handleSend,
              handleCancel,
              plusMenuOpen,
              setPlusMenuOpen,
              setPlusView,
              isLoading,
              remoteAiBusy,
              activeResearchJobId,
              pendingQuestions,
              handleQuestionAnswer,
              handleQuestionSkip,
              chatMode,
              setChatMode,
              selectedAgent,
              setSelectedAgent,
              selectedModel,
              setSelectedModel,
              setSearchEnabled,
              handleModeChange,
              tryActivateMegsyOs,
              editingIndex,
              cancelEdit,
              isMobileViewport,
              tierMenuOpen,
              setTierMenuOpen,
              megsyTier,
              setMegsyTier,
              userPlan,
              mediaModel,
              setMediaModel,
              chatUserId,
              slidesTemplate,
              setSlidesPickerOpen,
              researchDepth,
              setResearchDepth,
              researchDepthOpen,
              setResearchDepthOpen,
              setVideoDurationSec,
            }}
            desktopModeChipsProps={{
              chatMode,
              selectedAgent,
              handleModeChange,
              setChatMode,
              setSelectedAgent,
              tryActivateMegsyOs,
              setInput,
              onAgentSelect: (agentId: string) => {
                const agent = getAgentById(agentId);
                setChatMode("normal");
                setSelectedAgent(agent || null);
                setSelectedModel(null);
              },
            }}
          />

          <ChatHiddenFileInputs
            fileInputRef={fileInputRef}
            cameraInputRef={cameraInputRef}
            imageInputRef={imageInputRef}
            handleFileUpload={handleFileUpload}
            handleCameraCapture={handleCameraCapture}
            handleImageUpload={handleImageUpload}
          />

          {(connectorsOpen || directoryOpen || slidesPickerOpen) && (
            <Suspense fallback={null}>
              <ChatGlobalModals
                connectorsOpen={connectorsOpen}
                setConnectorsOpen={setConnectorsOpen}
                directoryOpen={directoryOpen}
                setDirectoryOpen={setDirectoryOpen}
                slidesPickerOpen={slidesPickerOpen}
                setSlidesPickerOpen={setSlidesPickerOpen}
                slidesTemplate={slidesTemplate}
                setSlidesTemplate={setSlidesTemplate}
                navigate={navigate}
              />
            </Suspense>
          )}

          {(shareDialogOpen || isRenaming || inviteDialogOpen) && (
            <Suspense fallback={null}>
              <ChatDialogs
                shareDialogOpen={shareDialogOpen}
                setShareDialogOpen={setShareDialogOpen}
                shareMode={shareMode}
                setShareMode={setShareMode}
                generatedShareUrl={generatedShareUrl}
                setGeneratedShareUrl={setGeneratedShareUrl}
                handleCreateShareLink={handleCreateShareLink}
                handleCopyShareLink={handleCopyShareLink}
                isRenaming={isRenaming}
                setIsRenaming={setIsRenaming}
                renameValue={renameValue}
                setRenameValue={setRenameValue}
                handleRename={handleRename}
                inviteDialogOpen={inviteDialogOpen}
                setInviteDialogOpen={setInviteDialogOpen}
                inviteEmail={inviteEmail}
                setInviteEmail={setInviteEmail}
                inviteLink={inviteLink}
                setInviteLink={setInviteLink}
                inviteLoading={inviteLoading}
                handleSendInviteEmail={handleSendInviteEmail}
                handleCopyInviteLink={handleCopyInviteLink}
                members={members}
                chatUserId={chatUserId}
                conversationOwnerId={conversationOwnerId}
                onlineUsers={onlineUsers}
                colorForUser={colorForUser}
                handleKickMember={handleKickMember}
              />
            </Suspense>
          )}
        </motion.div>
      </div>
      {megsyOsIntroOpen && (
        <Suspense fallback={null}>
          <MegsyOsIntro
            open={megsyOsIntroOpen}
            onClose={() => setMegsyOsIntroOpen(false)}
            isProPlusPlan={isProPlusPlan}
            navigate={zoneNavigate}
            handleModeChange={handleModeChange}
          />
        </Suspense>
      )}
    </>
  );
};

export default ChatPage;
