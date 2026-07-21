import { startTransition, useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useLocation, type NavigateOptions } from "react-router-dom";
import { Plus, PanelLeft, LogIn, Cloud, Sparkles, Boxes, Settings, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getUserSafe } from "@/lib/authSafe";

import { AnimatePresence, m as motion } from "framer-motion";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";
import MegsyStar from "@/components/files/MegsyStar";
import { useBrandLogo } from "@/hooks/useBrandLogo";

import { MediaIcon, CornIcon, EarnIcon, HomeIcon } from "@/components/sidebar/SidebarIcons";
import { useActiveWorkspaceId, WORKSPACE_CHANGED_EVENT } from "@/lib/activeWorkspace";
import WorkspaceSwitcher from "@/components/workspace/WorkspaceSwitcher";
import { useActiveAccount } from "@/hooks/useActiveAccount";
import SidebarSubNav from "@/components/layout/SidebarSubNav";
import { pathForZone, stripZonePrefix } from "@/lib/zoneRouting";
import { prefetchRoute as sharedPrefetchRoute } from "@/hooks/usePrefetchRoute";
import { t as uiT, useUserLang } from "@/lib/authI18n";
import { useIsTelegramUser } from "@/hooks/useIsTelegramUser";

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
  mode: string;
  is_pinned?: boolean;
}

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectConversation?: (id: string) => void;
  activeConversationId?: string | null;
  currentMode?: string;
  inline?: boolean;
  forceExpanded?: boolean;
  /**
   * Render the mobile sidebar as an always-mounted "underlay" panel that sits
   * beneath the chat surface (Claude-style push reveal). The parent is
   * responsible for translating the chat surface to reveal it.
   */
  underlay?: boolean;
  mobileSide?: "left" | "right";
}

const wsTag = (ws: string | null) => ws ?? "personal";
const cacheKey = (mode: string, uid: string, ws: string | null) =>
  `sidebar:convos:${mode}:${uid}:${wsTag(ws)}`;
const userCacheKey = (uid: string) => `sidebar:user:${uid}`;
const lastUserKey = "sidebar:last-user";
// Route prefetch is now centralized in usePrefetchRoute — the sidebar shares
// the same in-memory cache with the landing navbar so a hover in one place
// benefits the other. Zone-prefixed paths get normalized before lookup.
const prefetchRoute = (path: string) =>
  sharedPrefetchRoute(stripZonePrefix(path.split(/[?#]/)[0]));

const sectionAccentFor = (pathname: string, mode: string): { name: string; hsl: string } => {
  if (pathname.startsWith("/media") || pathname.startsWith("/images") || mode === "images")
    return { name: "images", hsl: "338 100% 71%" };
  if (pathname.startsWith("/videos") || pathname.startsWith("/cinema") || mode === "videos")
    return { name: "videos", hsl: "187 85% 53%" };
  if (
    pathname.startsWith("/megsy") ||
    pathname.startsWith("/agents") ||
    pathname.startsWith("/workspace") ||
    mode === "megsy-pr" ||
    mode === "build"
  )
    return { name: "os", hsl: "158 64% 52%" };
  return { name: "chat", hsl: "252 92% 67%" };
};

function groupByDate(items: Conversation[]) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const day = 24 * 60 * 60 * 1000;
  const startOfYesterday = startOfToday - day;
  const startOf7Days = startOfToday - 6 * day;
  const startOf30Days = startOfToday - 29 * day;
  const buckets: Record<string, Conversation[]> = {
    Pinned: [],
    Today: [],
    Yesterday: [],
    "Last 7 Days": [],
    "Last 30 Days": [],
    Older: [],
  };
  const byUpdated = (a: Conversation, b: Conversation) =>
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  const pinned: Conversation[] = [];
  const others: Conversation[] = [];
  for (const c of items) {
    if (c.is_pinned) pinned.push(c);
    else others.push(c);
  }
  pinned.sort(byUpdated);
  others.sort(byUpdated);
  buckets.Pinned = pinned;
  for (const c of others) {
    const t = new Date(c.updated_at).getTime();
    if (t >= startOfToday) buckets.Today.push(c);
    else if (t >= startOfYesterday) buckets.Yesterday.push(c);
    else if (t >= startOf7Days) buckets["Last 7 Days"].push(c);
    else if (t >= startOf30Days) buckets["Last 30 Days"].push(c);
    else buckets.Older.push(c);
  }
  return buckets;
}

const AppSidebar = ({
  open,
  onClose,
  onNewChat,
  onSelectConversation,
  activeConversationId,
  currentMode = "chat",
  inline = false,
  forceExpanded = false,
  underlay = false,
  mobileSide,
}: AppSidebarProps) => {
  useUserLang();
  const navigate = useNavigate();
  const location = useLocation();
  const activeWs = useActiveWorkspaceId();
  const megsyLogo = useBrandLogo();

  // Hydrate user from cache instantly so the bottom pill never flashes.
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [credits, setCredits] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const isBuildMode = currentMode === "build";
  const showRecent = ["chat", "learning", "shopping", "research", "slides", "videos", "images", "code"].includes(currentMode);
  const showsUnifiedChatHistory =
    currentMode === "chat" || currentMode === "research" || currentMode === "slides";
  // In the general (chat) sidebar, surface conversations from every service —
  // videos, images, code, learning, shopping — so users can find any past
  // session without switching workspaces.
  const showsAllServicesHistory = currentMode === "chat";

  // Hydrate from local cache (user info + conversations) before network.
  // SECURITY: never read credits / subscription / billing info from localStorage —
  // those are sensitive values that must always come from the server.
  useEffect(() => {
    let cancelled = false;

    const hydrateSafeCache = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const sessionUid = session?.user?.id;
        const lastUid = localStorage.getItem(lastUserKey);

        if (!sessionUid) {
          setConversations([]);
          setUserName("");
          setAvatarUrl(null);
          return;
        }

        if (lastUid && lastUid !== sessionUid) {
          localStorage.removeItem(userCacheKey(lastUid));
        }

        const raw = localStorage.getItem(userCacheKey(sessionUid));
        if (!cancelled && raw) {
          const u = JSON.parse(raw);
          if (u.userName) setUserName(u.userName);
          if (u.avatarUrl !== undefined) setAvatarUrl(u.avatarUrl);
        }

        const conv = localStorage.getItem(cacheKey(currentMode, sessionUid, activeWs));
        if (!cancelled && conv) {
          const arr = JSON.parse(conv);
          if (Array.isArray(arr)) setConversations(arr);
        }
      } catch {
        if (!cancelled) setConversations([]);
      }
    };

    void hydrateSafeCache();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!showRecent || !currentUserId) return;
    try {
      const raw = localStorage.getItem(cacheKey(currentMode, currentUserId, activeWs));
      if (raw) {
        const cached = JSON.parse(raw) as Conversation[];
        if (Array.isArray(cached)) setConversations(cached);
        else setConversations([]);
      } else {
        setConversations([]);
      }
    } catch {
      setConversations([]);
    }
  }, [currentUserId, currentMode, showRecent, activeWs]);

  useEffect(() => {
    loadUserInfo();
  }, []);

  useEffect(() => {
    if (showRecent) loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMode, currentUserId, activeWs]);

  useEffect(() => {
    const onFocus = () => {
      if (showRecent) loadConversations();
    };
    const onConversationsChanged = () => {
      if (showRecent) loadConversations();
    };
    const onWorkspaceChanged = () => {
      // Clear the visible list immediately so old workspace data does not flash.
      setConversations([]);
      if (showRecent) loadConversations();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("megsy:conversations-changed", onConversationsChanged);
    window.addEventListener(WORKSPACE_CHANGED_EVENT, onWorkspaceChanged);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("megsy:conversations-changed", onConversationsChanged);
      window.removeEventListener(WORKSPACE_CHANGED_EVENT, onWorkspaceChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMode, showRecent, currentUserId]);

  const loadUserInfo = async () => {
    const user = await getUserSafe();
    if (!user) {

      setCurrentUserId(null);
      setUserName("");
      setAvatarUrl(null);
      setCredits(0);
      setConversations([]);
      try {
        localStorage.removeItem(lastUserKey);
      } catch {}
      return;
    }
    setCurrentUserId(user.id);
    const emailPrefix = user.email?.split("@")[0] || "User";
    const fallbackName = user.user_metadata?.full_name || emailPrefix;
    setUserName(fallbackName);
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits, avatar_url, display_name")
      .eq("id", user.id)
      .single();
    const next = { userName: fallbackName, avatarUrl: user.user_metadata?.avatar_url || null };
    let nextCredits = 0;
    if (profile) {
      nextCredits = Number(profile.credits) || 0;
      next.avatarUrl = profile.avatar_url || next.avatarUrl;
      if (profile.display_name) next.userName = profile.display_name;
      setCredits(nextCredits);
      setAvatarUrl(next.avatarUrl);
      setUserName(next.userName);
    }
    try {
      localStorage.setItem(lastUserKey, user.id);
      // SECURITY: do NOT persist credits in localStorage.
      localStorage.setItem(userCacheKey(user.id), JSON.stringify(next));
    } catch {}
  };

  const loadConversations = async () => {
    const user = await getUserSafe();
    if (!user) return;

    const validModes = ["code", "images", "videos", "learning", "shopping", "research", "slides"];
    const modeFilter = validModes.includes(currentMode) ? currentMode : "chat";
    const modesToFetch = showsAllServicesHistory
      ? ["chat", "research", "slides", "videos", "images", "code", "learning", "shopping"]
      : showsUnifiedChatHistory
        ? ["chat", "research", "slides"]
        : [modeFilter];

    const { data: memberRows } = await supabase
      .from("conversation_members")
      .select("conversation_id")
      .eq("user_id", user.id);
    const memberConvIds = (memberRows || []).map((r: any) => r.conversation_id);

    let query = supabase
      .from("conversations")
      .select("id, title, updated_at, mode, is_pinned")
      .in("mode", modesToFetch);
    if (memberConvIds.length > 0) {
      query = query.or(`user_id.eq.${user.id},id.in.(${memberConvIds.join(",")})`);
    } else {
      query = query.eq("user_id", user.id);
    }
    // Filter by active workspace: a workspace shows only its conversations,
    // "personal" mode (no workspace) shows only conversations not tied to any workspace.
    if (activeWs) {
      query = query.eq("workspace_id", activeWs);
    } else {
      query = query.is("workspace_id", null);
    }
    const { data } = await query
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(50);
    if (data) {
      setConversations(data);
      try {
        localStorage.setItem(cacheKey(modeFilter, user.id, activeWs), JSON.stringify(data));
      } catch {}
    } else {
      setConversations([]);
    }
  };

  const account = useActiveAccount();
  const displayName = account.name || userName || "User";
  const displayAvatar = account.avatarUrl ?? avatarUrl;
  const initial = displayName.charAt(0).toUpperCase() || "U";
  const [collapsed, setCollapsed, toggleCollapsed] = useSidebarCollapsed();
  const isCollapsed = inline && collapsed && !forceExpanded;
  const groups = useMemo(() => groupByDate(conversations), [conversations]);
  const sectionAccent = useMemo(
    () => sectionAccentFor(stripZonePrefix(location.pathname), currentMode),
    [location.pathname, currentMode],
  );

  // Desktop inline: collapse the sidebar immediately after any selection.
  const closeInline = useCallback(() => {
    if (inline) setCollapsed(true);
  }, [inline, setCollapsed]);

  const navigateSmoothly = useCallback(
    (path: string, options?: NavigateOptions) => {
      const target = pathForZone(path, location.pathname);
      onClose();
      closeInline();
      void prefetchRoute(target);
      startTransition(() => navigate(target, options));
    },
    [closeInline, location.pathname, navigate, onClose],
  );

  const currentAppPath = stripZonePrefix(location.pathname);
  const resolvedMobileSide =
    mobileSide ??
    (typeof document !== "undefined" && document.documentElement.dir === "rtl" ? "right" : "left");
  const isMobileRightSide = resolvedMobileSide === "right";

  const navItems: Array<{
    label: string;
    Icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
    path: string;
    match: (p: string) => boolean;
  }> = [
    {
      label: uiT("sidebarHome"),
      Icon: HomeIcon,
      path: "/",
      match: (p: string) => p === "/" || p.startsWith("/chat"),
    },
    {
      label: uiT("sidebarLibrary"),
      Icon: MediaIcon,
      path: "/library",
      match: (p: string) => p.startsWith("/library"),
    },
    {
      label: "Apps",
      Icon: Boxes,
      path: "/apps",
      match: (p: string) => p.startsWith("/apps"),
    },
    // Showcase hidden by user request
    // Earn + Tasks entries are Telegram-only and appended below.
  ];

  const isTelegramUser = useIsTelegramUser();
  // Earn is visible for everyone (site + Telegram). Tasks stays Telegram-only.
  navItems.push({
    label: uiT("sidebarEarn"),
    Icon: EarnIcon,
    path: "/settings/referrals",
    match: (p: string) => p.startsWith("/settings/referrals") && !p.includes("tasks"),
  });
  if (isTelegramUser) {
    navItems.push({
      label: "Tasks",
      Icon: EarnIcon,
      path: "/settings/referrals/tasks",
      match: (p: string) => p.startsWith("/settings/referrals") && p.includes("tasks"),
    });
  }

  const handleNewChat = () => {
    if (isBuildMode) navigateSmoothly("/build");
    else {
      onNewChat();
      onClose();
      closeInline();
    }
  };

  // Cartoon palette (mirrors ReferralsPage)
  const PAGE_BG = "#000000";
  const SURFACE = "hsl(var(--surface-1))";
  const SURFACE_2 = "hsl(var(--surface-3))";
  const BORDER = "hsl(var(--surface-4))";
  const TEXT = "hsl(var(--brand-parchment))";
  const MUTED = "hsl(var(--brand-muted))";
  const INK = "hsl(var(--brand-ink))";
  const YELLOW = "hsl(var(--brand-action))";
  const MINT = "hsl(var(--brand-mint))";
  const cartoonFont = '"Space Grotesk", "Inter", system-ui, sans-serif';

  // Cartoon-style "sticker" surface for prominent buttons (new chat, etc.)
  const glassStyle: React.CSSProperties = {
    backgroundColor: SURFACE_2,
    border: `2px solid ${BORDER}`,
    color: TEXT,
    boxShadow: `3px 3px 0 ${BORDER}`,
  };

  // Sidebar shell — flat cartoon dark (mobile keeps this)
  const panelGlassStyle: React.CSSProperties = {
    ["--section-accent" as any]: sectionAccent.hsl,
    backgroundColor: PAGE_BG,
    color: TEXT,
    fontFamily: cartoonFont,
    boxShadow: `inset -2px 0 0 ${BORDER}`,
  };

  // Desktop — EXACT same glass recipe as the chat composer input (chat-composer-frame).
  const desktopGlassStyle: React.CSSProperties = {
    ["--section-accent" as any]: sectionAccent.hsl,
    backgroundColor: "rgba(0, 0, 0, 0.22)",
    backgroundImage: "none",
    backdropFilter: "blur(22px) saturate(1.5) brightness(1.1)",
    WebkitBackdropFilter: "blur(22px) saturate(1.5) brightness(1.1)" as any,
    color: TEXT,
    fontFamily: cartoonFont,
    border: "0",
    boxShadow:
      "inset 0 0 4px 0 rgba(250, 250, 250, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.22), 0 12px 40px -12px rgba(0, 0, 0, 0.55)",
  };

  // Active nav item — soft accent-tinted glass capsule
  const activeItemStyle: React.CSSProperties = {
    background:
      "linear-gradient(180deg, hsl(var(--section-accent) / 0.18), hsl(var(--section-accent) / 0.06))",
    color: "#ffffff",
    border: "1px solid hsl(var(--section-accent) / 0.28)",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 1px hsl(var(--section-accent) / 0.05), 0 6px 18px -10px hsl(var(--section-accent) / 0.55)",
    fontWeight: 600,
  };

  // Inactive nav item — dim glass hover
  const inactiveItemStyle: React.CSSProperties = {
    color: "rgba(255,255,255,0.62)",
    backgroundColor: "transparent",
    border: "1px solid transparent",
  };



  const innerContent = (
    <motion.div
      data-app-sidebar-panel="true"
      layout={inline ? true : false}
      transition={{ type: "spring", stiffness: 320, damping: 32, mass: 0.9 }}
      className="flex flex-col h-full w-full text-foreground relative overflow-hidden"
      style={desktopGlassStyle}
    >
      {/* HEADER — brand + collapse */}
      <div
        className={`relative shrink-0 h-14 px-3 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >

        {!isCollapsed && (
          <div className="flex items-center gap-2 min-w-0 pl-1">
            <img
              src={megsyLogo}
              alt=""
              width={22}
              height={22}
              className="h-[22px] w-[22px] object-contain shrink-0"
              loading="eager"
              decoding="async"
            />
            <span
              className="text-[18px] tracking-tight truncate"
              style={{ fontWeight: 900, letterSpacing: "-0.02em", color: TEXT }}
            >
              Megsy
            </span>
          </div>
        )}

        {inline && (
          <button
            onClick={toggleCollapsed}
            className="w-9 h-9 grid place-items-center rounded-full transition active:scale-90"
            style={{ color: TEXT, border: "none", backgroundColor: "transparent" }}
            aria-label="Toggle sidebar"
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            <PanelLeft className="w-[16px] h-[16px]" strokeWidth={2.4} />
          </button>
        )}
      </div>

      {/* NAV — clean iOS-style list */}
      <div
        className={`shrink-0 ${isCollapsed ? "px-2 py-3 flex flex-col items-center gap-1" : "px-3 pt-3 pb-3 flex flex-col gap-0.5"}`}
      >
        {navItems.map(({ label, Icon, path, match }) => {
          const active = match(currentAppPath);
          if (isCollapsed) {
            return (
              <button
                key={label}
                onClick={() => navigateSmoothly(path)}
                onMouseEnter={() => prefetchRoute(path)}
                onFocus={() => prefetchRoute(path)}
                title={label}
                aria-label={label}
                className="relative w-10 h-10 grid place-items-center rounded-xl transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)] active:scale-95"
                style={{
                  color: active ? "#ffffff" : "rgba(255,255,255,0.60)",
                  backgroundColor: active ? "rgba(255,255,255,0.10)" : "transparent",
                  boxShadow: active ? "inset 0 0 0 1px rgba(255,255,255,0.16)" : "none",
                }}
              >
                <Icon size={18} strokeWidth={2} />
              </button>
            );
          }
          return (
            <motion.button
              layout
              key={label}
              onClick={() => navigateSmoothly(path)}
              onMouseEnter={() => prefetchRoute(path)}
              onFocus={() => prefetchRoute(path)}
              initial={false}
              animate={{
                color: active ? "#ffffff" : "rgba(255,255,255,0.60)",
                backgroundColor: active ? "rgba(255,255,255,0.08)" : "transparent",
              }}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
              whileTap={{ scale: 0.985 }}
              className="group relative w-full h-10 pl-3 pr-3 flex items-center gap-3 rounded-xl transition-shadow"
              style={{
                boxShadow: active ? "inset 0 0 0 1px rgba(255,255,255,0.12)" : "none",
              }}
            >
              <span
                className="shrink-0 transition-colors duration-200 group-hover:text-white"
                style={{ color: active ? "#ffffff" : "rgba(255,255,255,0.70)" }}
              >
                <Icon size={17} strokeWidth={2} />
              </span>
              <motion.span
                layout
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="text-[13px] tracking-tight flex-1 text-left"
                style={{ fontWeight: active ? 600 : 500 }}
              >
                {label}
              </motion.span>
            </motion.button>
          );
        })}
      </div>




      {/* Media sub-nav — only on media routes */}
      {currentAppPath.startsWith("/media") && (
        <div
          className={`shrink-0 border-t border-foreground/10 ${
            isCollapsed ? "px-2 py-2 flex flex-col items-center gap-1" : "px-3 py-2 space-y-1"
          }`}
        >
          {(() => {
            const active = currentAppPath.startsWith("/gallery");
            if (isCollapsed) {
              return (
                <button
                  onClick={() => navigateSmoothly("/gallery")}
                  onMouseEnter={() => prefetchRoute("/gallery")}
                  title="Cloud"
                  aria-label="Cloud"
                  style={active ? activeItemStyle : undefined}
                  className={`relative w-10 h-10 grid place-items-center rounded-xl border border-transparent transition-all ${
                    active
                      ? "text-foreground"
                      : "text-foreground/75 hover:text-foreground hover:bg-foreground/[0.06]"
                  }`}
                >
                  <Cloud className="w-5 h-5" strokeWidth={2} />
                </button>
              );
            }
            return (
              <motion.button
                layout
                onClick={() => navigateSmoothly("/gallery")}
                onMouseEnter={() => prefetchRoute("/gallery")}
                style={active ? activeItemStyle : undefined}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                whileTap={{ scale: 0.985 }}
                className={`w-full h-10 px-3 flex items-center gap-3 rounded-xl border border-transparent transition-colors ${
                  active
                    ? "text-foreground"
                    : "text-foreground/80 hover:text-foreground"
                }`}
              >
                <Cloud className="w-5 h-5" strokeWidth={2} />
                <motion.span
                  layout
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[14px] font-medium"
                >
                  Cloud
                </motion.span>
              </motion.button>
            );
          })()}
        </div>
      )}

      {/* NEW CHAT — Liquid Glass capsule */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            key="new-chat-btn"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative shrink-0 px-3 pb-2"
          >
            <button
              onClick={handleNewChat}
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.14)",
                boxShadow:
                  "inset 0 1px 1px rgba(255,255,255,0.12), 0 8px 20px -8px rgba(0,0,0,0.5)",
                fontWeight: 600,
              }}
              className="w-full h-11 px-4 flex items-center justify-between rounded-2xl transition-all duration-300 hover:bg-[rgba(255,255,255,0.10)] active:scale-[0.98] text-[13.5px] tracking-tight"
              title={isBuildMode ? "New project" : "New chat"}
            >
              <span>{isBuildMode ? "New project" : "New chat"}</span>
              <Plus className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("megsy:open-palette"))}
              className="mt-2 w-full h-9 px-3 flex items-center justify-between rounded-xl text-[12.5px] text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
              title="Search (⌘K)"
            >
              <span className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Search</span>
              </span>
              <kbd className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-white/10 text-white/60">⌘K</kbd>
            </button>
          </motion.div>
        )}
      </AnimatePresence>


      {/* SCROLLABLE — conversations or sub-nav */}
      <AnimatePresence initial={false} mode="popLayout">
        {!isCollapsed ? (
          <motion.div
            key="scrollable"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex-1 min-h-0 overflow-y-auto px-2 pb-3 [scrollbar-width:thin]"
          >
            {showRecent ? (
              conversations.length === 0 ? (
                <div className="px-3 py-10 text-center">
                  <p className="text-[13px] text-muted-foreground/70">No conversations yet</p>
                </div>
              ) : (
                <ul className="space-y-1">
                  {Object.values(groups)
                    .flat()
                    .map((conv) => {
                      const onChatPage = currentAppPath === "/chat";
                      const isActive = activeConversationId === conv.id;
                      return (
                        <motion.li
                          key={conv.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.18, delay: 0.04 }}
                        >
                          <button
                            onClick={() => {
                              onClose();
                              closeInline();
                              if (onChatPage) onSelectConversation?.(conv.id);
                              else
                                navigateSmoothly("/chat", {
                                  state: { loadConversationId: conv.id },
                                });
                            }}
                            style={
                              isActive
                                ? {
                                    backgroundColor: "transparent",
                                    color: TEXT,
                                    border: "none",
                                    fontWeight: 800,
                                  }
                                : {
                                    backgroundColor: "transparent",
                                    color: TEXT,
                                    border: "none",
                                    fontWeight: 600,
                                  }
                            }
                            className="w-full text-left px-3 py-2 rounded-full text-[13px] truncate transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                          >
                            <span className="truncate">{conv.title || "Untitled"}</span>
                          </button>
                        </motion.li>
                      );
                    })}
                </ul>
              )
            ) : (
              <SidebarSubNav
                mode={currentMode}
                size="sm"
                onNavigate={() => {
                  onClose();
                  closeInline();
                }}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="scrollable-spacer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 min-h-0"
          />
        )}
      </AnimatePresence>

      {/* FOOTER — user pill (cartoon sticker) */}
      <div className="shrink-0 p-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {!currentUserId ? (
          <AnimatePresence mode="wait" initial={false}>
            {isCollapsed ? (
              <motion.div
                key="footer-login-collapsed"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center gap-1.5"
              >
                <button
                  onClick={() => navigateSmoothly("/auth")}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.14)",
                    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.10)",
                  }}
                  className="w-11 h-11 grid place-items-center rounded-2xl transition-all duration-300 hover:bg-[rgba(255,255,255,0.10)] active:scale-95"
                  title="Log in"
                  aria-label="Log in"
                >
                  <LogIn className="w-[16px] h-[16px]" strokeWidth={2} />
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="footer-login-expanded"
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => navigateSmoothly("/auth")}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  color: "#ffffff",
                  border: "1px solid rgba(255,255,255,0.14)",
                  boxShadow:
                    "inset 0 1px 1px rgba(255,255,255,0.12), 0 8px 20px -8px rgba(0,0,0,0.5)",
                  fontWeight: 600,
                }}
                className="w-full h-11 px-3 flex items-center justify-center gap-2 rounded-2xl text-[13.5px] tracking-tight transition-all duration-300 hover:bg-[rgba(255,255,255,0.10)] active:scale-[0.98]"
              >
                <LogIn className="w-4 h-4" strokeWidth={2} />
                <span>Log in</span>
              </motion.button>
            )}
          </AnimatePresence>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            {isCollapsed ? (
              <motion.div
                key="footer-user-collapsed"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center gap-1.5"
              >
                <button
                  onClick={() => navigateSmoothly("/settings")}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: TEXT,
                  }}
                  className="w-11 h-11 rounded-2xl grid place-items-center text-[12px] font-semibold overflow-hidden transition-all duration-300 hover:bg-[rgba(255,255,255,0.08)]"
                  title={displayName}
                >
                  {displayAvatar ? (
                    <img src={displayAvatar} alt="" className="w-11 h-11 rounded-2xl object-cover" />
                  ) : (
                    initial
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="user-footer"
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-1.5 p-1.5 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 6px 18px -12px rgba(0,0,0,0.55)",
                }}
              >
                <button
                  onClick={() => navigateSmoothly("/settings")}
                  className="group flex-1 min-w-0 flex items-center gap-3 px-2 py-1.5 rounded-xl text-left transition-colors hover:bg-[rgba(255,255,255,0.045)]"
                  title="Account settings"
                >
                  {displayAvatar ? (
                    <img
                      src={displayAvatar}
                      alt=""
                      className="w-9 h-9 rounded-xl object-cover shrink-0"
                      style={{ border: "1px solid rgba(255,255,255,0.10)" }}
                    />
                  ) : (
                    <div
                      className="w-9 h-9 rounded-xl grid place-items-center text-[13px] shrink-0"
                      style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05))",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.10)",
                        fontWeight: 700,
                      }}
                    >
                      {initial}
                    </div>
                  )}
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <span
                      className="text-[13.5px] truncate leading-none tracking-tight"
                      style={{ color: "rgba(255,255,255,0.95)", fontWeight: 600 }}
                    >
                      {displayName}
                    </span>
                    <span
                      className="text-[11px] truncate leading-none"
                      style={{ color: "rgba(255,255,255,0.40)", fontWeight: 500, letterSpacing: "0.01em" }}
                    >
                      Manage account
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => navigateSmoothly("/pricing")}
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(120, 231, 178, 0.90), rgba(74, 222, 128, 0.86))",
                    color: "#052e16",
                    border: "1px solid rgba(120, 231, 178, 0.55)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.45), 0 0 20px -4px rgba(120,231,178,0.45)",
                    fontWeight: 700,
                  }}
                  className="shrink-0 flex items-center gap-1.5 h-8 pl-2.5 pr-3.5 rounded-full text-[12px] whitespace-nowrap transition-all duration-200 hover:brightness-110 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_0_24px_-4px_rgba(120,231,178,0.55)] active:scale-95"
                  title="Upgrade plan"
                >
                  <span>Upgrade</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );

  // MOBILE — restore previous design (pre-redesign), unchanged for phones
  const mobileContent = (
    <div
      data-app-sidebar-panel="true"
      className="flex flex-col h-full text-foreground relative overflow-hidden"
      style={panelGlassStyle}
      data-section={sectionAccent.name}
    >
      <div
        className="relative shrink-0 px-4 pb-2 flex items-center gap-2"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + var(--pwa-extra-top, 0px) + 1rem)" }}
      >
        <img
          src={megsyLogo}
          alt=""
          width={22}
          height={22}
          className="h-[22px] w-[22px] object-contain shrink-0"
          loading="eager"
          decoding="async"
        />
        <span
          className="text-[19px] tracking-tight truncate"
          style={{ fontWeight: 900, letterSpacing: "-0.02em", color: TEXT }}
        >
          Megsy
        </span>
      </div>

      <div className="relative flex-1 overflow-y-auto px-3 pt-1 pb-32 min-h-0 [scrollbar-width:thin]">
        <div className="space-y-1 mb-3">
          {navItems.map(({ label, Icon, path, match }) => {
            const active = match(currentAppPath);
            return (
              <button
                key={label}
                onClick={() => navigateSmoothly(path)}
                onMouseEnter={() => prefetchRoute(path)}
                onFocus={() => prefetchRoute(path)}
                style={{ color: TEXT, backgroundColor: "transparent", border: "none", fontWeight: active ? 800 : 700 }}
                className="w-full h-11 px-2 flex items-center gap-3 rounded-none transition-all active:scale-95"
              >
                <Icon size={19} strokeWidth={2.2} />
                <span className="text-[14.5px]" style={{ fontWeight: active ? 800 : 700 }}>
                  {label}
                </span>
              </button>
            );
          })}
          {currentAppPath.startsWith("/media") && (
            <button
              onClick={() => navigateSmoothly("/gallery")}
              onMouseEnter={() => prefetchRoute("/gallery")}
              style={{ color: TEXT, backgroundColor: "transparent", border: "none" }}
              className="w-full h-11 px-2 flex items-center gap-3 rounded-none transition-all active:scale-95"
            >
              <Cloud className="w-5 h-5" strokeWidth={2.2} />
              <span className="text-[14.5px]" style={{ fontWeight: 700 }}>
                Cloud
              </span>
            </button>
          )}
        </div>

        {showRecent ? (
          conversations.length === 0 ? (
            <div className="px-3 py-10 text-center">
              <p className="text-[13px] text-muted-foreground/70">No conversations yet</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {Object.values(groups)
                .flat()
                .map((conv) => {
                  const onChatPage = stripZonePrefix(location.pathname) === "/chat";
                  const isActive = activeConversationId === conv.id;
                  return (
                    <li key={conv.id}>
                      <button
                        onClick={() => {
                          onClose();
                          if (onChatPage) onSelectConversation?.(conv.id);
                          else
                            navigateSmoothly("/chat", {
                              state: { loadConversationId: conv.id },
                            });
                        }}
                        style={{
                          borderColor: isActive ? "hsl(var(--primary) / 0.25)" : "transparent",
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-[14.5px] truncate transition-colors border ${
                          isActive
                            ? "bg-primary/10 text-foreground"
                            : "text-foreground/85 hover:bg-foreground/[0.05] hover:text-foreground"
                        }`}
                      >
                        <span className="truncate font-medium">{conv.title || "Untitled"}</span>
                      </button>
                    </li>
                  );
                })}
            </ul>
          )
        ) : (
          <SidebarSubNav mode={currentMode} size="md" onNavigate={onClose} />
        )}
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 px-3 pt-6 pointer-events-none z-10
                   bg-gradient-to-t from-black via-black/90 to-transparent"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.75rem)" }}
      >
        <div className="pointer-events-auto flex items-center gap-2">
          {!currentUserId ? (
            <button
              onClick={() => navigateSmoothly("/auth")}
              style={{
                backgroundColor: YELLOW,
                color: INK,
                border: `2.5px solid ${INK}`,
                boxShadow: `3px 3px 0 ${INK}`,
                fontWeight: 800,
              }}
              className="flex-1 h-11 flex items-center justify-center gap-2 rounded-full text-[14px] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              <LogIn className="w-4 h-4" strokeWidth={2.6} />
              <span>Log in</span>
            </button>
          ) : (
            <div
              className="flex-1 min-w-0 flex items-center gap-1.5 p-1 rounded-full backdrop-blur-md"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              <button
                onClick={() => navigateSmoothly("/settings")}
                className="flex-1 min-w-0 flex items-center gap-2 px-1 py-0.5 rounded-full text-left transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                title="Settings"
              >
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                    style={{ border: "1px solid rgba(255,255,255,0.12)" }}
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full grid place-items-center text-[12px] shrink-0"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.12)",
                      fontWeight: 700,
                    }}
                  >
                    {initial}
                  </div>
                )}
                <span
                  className="text-[13.5px] truncate tracking-tight"
                  style={{ color: "rgba(255,255,255,0.92)", fontWeight: 600 }}
                >
                  {displayName}
                </span>
              </button>

              <button
                onClick={() => navigateSmoothly("/pricing")}
                style={{
                  background: "linear-gradient(135deg, #7ce7b2 0%, #4fd1a5 100%)",
                  color: "#08140f",
                  border: "1px solid rgba(255, 255, 255, 0.35)",
                  fontWeight: 800,
                  boxShadow: "0 0 12px rgba(124, 231, 178, 0.35), inset 0 1px 0 rgba(255,255,255,0.35)",
                }}
                className="shrink-0 flex items-center gap-1.5 h-7 px-3 rounded-full text-[11.5px] transition hover:brightness-110 hover:scale-105 active:scale-95"
                title="Upgrade plan"
              >
                <Sparkles size={12} strokeWidth={2.4} />
                <span>Upgrade</span>
              </button>
            </div>
          )}

          <button
            onClick={handleNewChat}
            style={{
              background: "transparent",
              border: "none",
              boxShadow: "none",
              color: "hsl(var(--primary))",
            }}
            className="w-11 h-11 shrink-0 grid place-items-center transition hover:opacity-80 active:scale-95"
            title={isBuildMode ? "New project" : "New chat"}
            aria-label="New chat"
          >
            <Plus className="w-7 h-7" strokeWidth={2.6} />
          </button>
        </div>
      </div>
    </div>
  );

  if (inline) return innerContent;

  // Claude-style underlay: always mounted below the chat surface, no overlay,
  // no slide animation. Parent shifts the chat right to reveal it.
  if (underlay) {
    return (
      <aside
        aria-hidden={!open}
        data-chat-sidebar-underlay="true"
        style={{
          ["--section-accent" as any]: sectionAccent.hsl,
          backgroundColor: PAGE_BG,
          width: "min(86vw, 320px)",
          left: isMobileRightSide ? "auto" : 0,
          right: isMobileRightSide ? 0 : "auto",
        }}
        className="md:hidden fixed top-0 bottom-0 z-[1] flex flex-col overflow-hidden"
      >
        {mobileContent}
      </aside>
    );
  }


  const isTransparentSurface =
    typeof window !== "undefined" &&
    (stripZonePrefix(window.location.pathname).startsWith("/chat") ||
      stripZonePrefix(window.location.pathname).startsWith("/settings/referrals"));

  return (
    <AnimatePresence>
      {open && (
        <>
          {!isTransparentSurface && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12, ease: [0.32, 0.72, 0, 1] }}
              className="fixed inset-0 z-popover bg-black/55 cursor-pointer"
              onClick={onClose}
              onTouchStart={onClose}
            />
          )}
          {isTransparentSurface && (
            <div
              className="fixed inset-0 z-popover"
              onClick={onClose}
              onTouchStart={onClose}
              style={{ background: "transparent" }}
            />
          )}
          <motion.aside
            initial={{ x: isMobileRightSide ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: isMobileRightSide ? "100%" : "-100%" }}
            transition={{ duration: 0.16, ease: [0.32, 0.72, 0, 1] }}


            drag="x"
            dragDirectionLock
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.04, right: 0 }}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              const shouldClose = isMobileRightSide
                ? info.offset.x > 80 || info.velocity.x > 400
                : info.offset.x < -80 || info.velocity.x < -400;
              if (shouldClose) onClose();
            }}
            style={{
              ["--section-accent" as any]: sectionAccent.hsl,
              backgroundColor: PAGE_BG,
              willChange: "transform",
              touchAction: "pan-y",
              width: "288px",
              left: isMobileRightSide ? "auto" : 0,
              right: isMobileRightSide ? 0 : "auto",
            }}
            className={`fixed top-0 bottom-0 z-[91] flex flex-col overflow-hidden ${
              isMobileRightSide ? "border-l" : "border-r"
            } border-foreground/10 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.45)]`}
            onClick={(e) => e.stopPropagation()}
          >
            {mobileContent}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default AppSidebar;
