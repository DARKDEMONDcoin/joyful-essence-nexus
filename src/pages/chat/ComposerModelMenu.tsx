import { useEffect, useMemo, useRef, useState, useLayoutEffect, type ReactNode } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  Lock,
  Sliders,
  Video as VideoIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { AgentModel } from "@/lib/agentRegistry";
import { useDynamicModels } from "@/hooks/useModels";
import { isPaidUser } from "@/lib/subscriptionGating";
import type { MediaModelChoice } from "@/components/chat/media/MediaModelPickerSheet";
import type { ChatMode } from "./chatConstants";
import { CHAT_COMPOSER_MODEL_OPTIONS, ComposerModelIcon, getChatModelDisplayLabel } from "./chatConstants";
import { useBrandLogo } from "@/hooks/useBrandLogo";
import { BrandIcon, hasBrandIcon } from "@/components/chat/media/BrandIcon";
import { useIsMobile } from "@/hooks/use-mobile";
import { DraggablePlusSheet } from "./components/DraggablePlusSheet";
import {
  glassModelMenu,
  glassModelMenuStyle,
  glassModelMenuTriggerStyle,
} from "@/components/model-picker/glassModelMenuStyles";

const menuContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.012, delayChildren: 0.02 } },
};

const menuItemVariants = {
  hidden: { opacity: 0, y: 4 },
  show: { opacity: 1, y: 0, transition: { duration: 0.16, ease: "easeOut" as const } },
};

interface Props {
  mode: ChatMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  selectedModel: AgentModel | null;
  megsyTier: "lite" | "pro" | "max";
  userPlan: string;
  mediaModel: MediaModelChoice | null;
  onTierSelect: (tier: "lite" | "pro" | "max") => void;
  onChatModelSelect: (model: { id: string; label: string }) => void;
  onMediaModelSelect: (model: MediaModelChoice) => void;
  onModeChange?: (mode: ChatMode) => void;
  noIcon?: boolean;
  variant?: "pill" | "segment";
  centerOnMobile?: boolean;
  /** Optional settings panel shown in-place when the pinned "Settings" toggle is tapped. */
  settingsPanel?: ReactNode;
  /** Label for the settings view header (defaults to "Settings"). */
  settingsLabel?: string;
  /** Desktop header instances must not create a mobile portal while hidden by CSS. */
  renderMobileSheet?: boolean;
}

const asMediaChoice = (model: any, mode: "images" | "video"): MediaModelChoice => ({
  slug: model.slug || model.id,
  name: model.name,
  provider: model.provider,
  credits: Number(model.credits) || 0,
  thumbnail: model.thumbnailUrl || model.iconUrl,
  type: mode === "video" ? "video" : "image",
  isPremium: !!model.isPremium,
});

export default function ComposerModelMenu({
  mode,
  open,
  onOpenChange,
  side = "bottom",
  align = "end",
  selectedModel,
  megsyTier,
  userPlan,
  mediaModel,
  onTierSelect,
  onChatModelSelect,
  onMediaModelSelect,
  onModeChange,
  noIcon = false,
  variant = "pill",
  settingsPanel,
  settingsLabel = "Settings",
  renderMobileSheet = true,
}: Props) {
  const [view, setView] = useState<"models" | "more" | "settings">("models");
  useEffect(() => {
    if (!open) setView("models");
  }, [open]);
  const isMediaMode = mode === "images" || mode === "video";
  const paid = isPaidUser(userPlan);
  const megsyLogo = useBrandLogo();
  const isMobile = useIsMobile();
  const { models: dynamicModels, loading } = useDynamicModels();
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<
    { left: number; width: number; top?: number; bottom?: number; maxHeight: number } | null
  >(null);
  const MENU_W = typeof window !== "undefined" && window.innerWidth < 640 ? 260 : 300;

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const update = () => {
      const r = btnRef.current!.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isMobile = vw < 640;
      const menuW = isMobile ? Math.min(260, vw - 24) : Math.min(MENU_W, vw - 24);
      let left = r.left;
      if (align === "end") left = r.right - menuW;
      else if (align === "center") left = r.left + (r.width - menuW) / 2;
      left = Math.max(12, Math.min(vw - menuW - 12, left));
      const width = menuW;
      const cap = isMobile ? Math.min(vh * 0.55, 420) : Math.min(vh * 0.7, 560);
      if (side === "top") {
        const bottom = vh - r.top + 8;
        const maxHeight = Math.min(cap, Math.max(220, r.top - 24));
        setPos({ left, width, bottom, maxHeight });
      } else {
        const top = r.bottom + 8;
        const maxHeight = Math.min(cap, Math.max(220, vh - top - 24));
        setPos({ left, width, top, maxHeight });
      }
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, align, side]);

  const mediaOptions = useMemo(() => {
    if (!isMediaMode) return [];
    const target = mode === "video" ? ["video", "video-i2v"] : ["image"];
    return dynamicModels
      .filter((model) => target.includes(model.type as string))
      .sort(
        (a, b) =>
          Number(b.isFeatured) - Number(a.isFeatured) || (a.credits || 0) - (b.credits || 0),
      );
  }, [dynamicModels, isMediaMode, mode]);

  // Unified lists for the mobile sheet — always available regardless of current mode.
  const imageOptions = useMemo(
    () =>
      dynamicModels
        .filter((m) => (m.type as string) === "image")
        .sort(
          (a, b) =>
            Number(b.isFeatured) - Number(a.isFeatured) || (a.credits || 0) - (b.credits || 0),
        ),
    [dynamicModels],
  );
  const videoOptions = useMemo(
    () =>
      dynamicModels
        .filter((m) => ["video", "video-i2v"].includes(m.type as string))
        .sort(
          (a, b) =>
            Number(b.isFeatured) - Number(a.isFeatured) || (a.credits || 0) - (b.credits || 0),
        ),
    [dynamicModels],
  );

  const orderedChatOptions = useMemo(
    () => [...CHAT_COMPOSER_MODEL_OPTIONS].sort((a, b) => Number(a.premium) - Number(b.premium)),
    [],
  );
  const orderedImageOptions = useMemo(
    () => [...imageOptions].sort((a, b) => Number(!!a.isPremium) - Number(!!b.isPremium)),
    [imageOptions],
  );
  const orderedVideoOptions = useMemo(
    () => [...videoOptions].sort((a, b) => Number(!!a.isPremium) - Number(!!b.isPremium)),
    [videoOptions],
  );

  useEffect(() => {
    if (!isMediaMode || loading || mediaOptions.length === 0) return;
    if (mediaModel?.type === (mode === "video" ? "video" : "image")) return;
    const defaultModel = paid ? mediaOptions[0] : mediaOptions.find((m) => !(m as any).isPremium) || mediaOptions[0];
    onMediaModelSelect(asMediaChoice(defaultModel, mode));
  }, [isMediaMode, loading, mediaModel?.type, mediaOptions, mode, onMediaModelSelect, paid]);

  const activeChatOption = CHAT_COMPOSER_MODEL_OPTIONS.find((item) =>
    item.kind === "tier" ? !selectedModel && megsyTier === item.id : selectedModel?.id === item.id,
  );
  const triggerLabel = isMediaMode
    ? mediaModel?.name ||
      (loading ? "Loading models" : mode === "video" ? "Video model" : "Image model")
    : activeChatOption?.label || getChatModelDisplayLabel(selectedModel, megsyTier);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => onOpenChange(!open)}
        data-tier-trigger
        className={
          variant === "segment"
            ? `${glassModelMenu.triggerSegment} justify-center`
            : "group inline-flex h-9 max-w-[52vw] items-center justify-center gap-1.5 px-2 text-[12.5px] font-semibold text-foreground hover:text-foreground active:opacity-70 transition-opacity outline-none"
        }
        style={
          variant === "segment"
            ? glassModelMenuTriggerStyle
            : { background: "transparent", border: 0, boxShadow: "none" }
        }
        aria-label="Choose model"
        aria-expanded={open}
      >
        {!noIcon && !(variant === "pill" && isMediaMode) && (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-transparent border-0">
            {isMediaMode ? (
              hasBrandIcon(mediaModel?.name, mediaModel?.provider) ? (
                <BrandIcon name={mediaModel?.name} provider={mediaModel?.provider} size={24} />
              ) : mediaModel?.thumbnail ? (
                <img src={mediaModel.thumbnail} alt="" className="h-full w-full object-cover" />
              ) : mode === "video" ? (
                <VideoIcon className="h-3.5 w-3.5 text-foreground/85" />
              ) : (
                <ImageIcon className="h-3.5 w-3.5 text-foreground/85" />
              )
            ) : activeChatOption ? (
              <ComposerModelIcon brand={activeChatOption.brand} />
            ) : (
              <img
                src={megsyLogo}
                alt=""
                className="h-[68%] w-[68%] object-contain"
              />
            )}
          </span>
        )}
        <span className="truncate tracking-tight text-foreground">{triggerLabel}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-foreground/60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />

      </button>



      {/* MOBILE — unified bottom-sheet (Chat + Images + Videos) */}
      {renderMobileSheet && isMobile && typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="md:hidden fixed inset-0 z-[55] bg-transparent"
                  onClick={() => onOpenChange(false)}
                />
                <DraggablePlusSheet
                   height={(() => {
                     const allRows = mode === "images" ? orderedImageOptions.length : mode === "video" ? orderedVideoOptions.length : orderedChatOptions.length;
                     const rows = view === "settings" ? (mode === "images" || mode === "video" ? 5 : 6) : view === "more" ? allRows : Math.min(allRows, 4);
                     const estimated = view === "settings" ? 570 : 150 + rows * 66 + (view === "models" ? 112 : 0);
                    const maxH =
                       typeof window !== "undefined" ? window.innerHeight * 0.88 : 650;
                     return Math.min(estimated, maxH, 720);
                  })()}
                  collapsedY={0}
                  onClose={() => onOpenChange(false)}
                  initialExpanded
                >

                  <div className="px-3 pt-1 pb-4 text-foreground">
                    <div className="sticky top-0 z-10 mb-3 flex h-11 items-center justify-between bg-transparent px-1">
                      <button type="button" onClick={() => view === "models" ? onOpenChange(false) : setView("models")} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_2px_10px_rgba(0,0,0,0.15)] hover:bg-white/15 transition-colors" aria-label={view === "models" ? "Close" : "Back"}>
                        {view === "models" ? <X className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
                      </button>
                      <p className="text-[16px] font-semibold">{view === "settings" && mode !== "images" && mode !== "video" ? "Effort" : view === "settings" ? settingsLabel : view === "more" ? "More models" : "Select model"}</p>
                      <span className="h-9 w-9" aria-hidden="true" />
                    </div>
                    <AnimatePresence mode="wait" initial={false}>
                      {view === "settings" && settingsPanel ? (
                        <motion.div
                          key="settings"
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -16 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                          {settingsPanel}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="models"
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 16 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        >

                    {/* Chat models — shown only when in chat mode */}
                    {mode !== "images" && mode !== "video" && (
                    <div className="mb-4">

                      <p className="px-2 pb-2 text-[11px] uppercase tracking-[0.12em] font-semibold text-foreground/50">
                        Chat models
                      </p>
                      <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
                        {(view === "more" ? orderedChatOptions : orderedChatOptions.slice(0, 4)).map((item) => {
                          const locked =
                            item.premium && (userPlan === "free" || userPlan === "trial");
                          const active =
                            item.kind === "tier"
                              ? !selectedModel && megsyTier === item.id
                              : selectedModel?.id === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                if (locked) {
                                  toast.info(
                                    `${item.label} is available on premium plans only`,
                                  );
                                  return;
                                }

                                if (item.kind === "tier")
                                  onTierSelect(item.id as "lite" | "pro" | "max");
                                else
                                  onChatModelSelect({ id: item.id, label: item.label });
                                onOpenChange(false);
                              }}
                              className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-white/[0.06] last:border-b-0 ${active ? "bg-white/[0.04]" : "hover:bg-white/[0.03]"}`}
                            >
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-foreground/[0.05]">
                                <ComposerModelIcon brand={item.brand} />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-[14.5px] font-semibold leading-tight truncate tracking-tight">
                                  {item.label}
                                </span>
                                <span className="mt-0.5 block text-[11.5px] text-foreground/55 truncate">
                                  {item.desc}
                                </span>
                              </span>
                              <span className="shrink-0 w-5 flex items-center justify-end">
                                {locked ? (
                                  <Lock className="h-4 w-4 text-foreground/45" />
                                ) : active ? (
                                  <Check className="h-5 w-5" strokeWidth={2.75} style={{ color: "var(--megsy-blue)" }} />
                                ) : null}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    )}

                    {/* Image models — shown only when in images mode */}
                    {mode === "images" && (
                    <div className="mb-4">

                      <p className="px-2 pb-2 text-[11px] uppercase tracking-[0.12em] font-semibold text-foreground/50">
                        Image models
                      </p>
                      <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
                        {orderedImageOptions.length === 0 && (
                          <p className="px-3 py-2 text-[12.5px] text-foreground/50">
                            {loading ? "Loading models…" : "No models available."}
                          </p>
                        )}
                        {(view === "more" ? orderedImageOptions : orderedImageOptions.slice(0, 4)).map((model) => {
                          const choice = asMediaChoice(model, "images");
                          const active =
                            mode === "images" && mediaModel?.slug === choice.slug;
                          const locked = !!(model as any).isPremium && !paid;
                          return (
                            <button
                              key={choice.slug}
                              onClick={() => {
                                if (locked) {
                                  toast.info(
                                    `${choice.name} is available on premium plans only`,
                                  );
                                  return;
                                }
                                if (mode !== "images") onModeChange?.("images");
                                onMediaModelSelect(choice);
                                onOpenChange(false);
                              }}
                              className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-white/[0.06] last:border-b-0 ${active ? "bg-white/[0.04]" : "hover:bg-white/[0.03]"}`}
                            >
                              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-foreground/[0.05]">
                                {hasBrandIcon(choice.name, choice.provider) ? (
                                  <BrandIcon
                                    name={choice.name}
                                    provider={choice.provider}
                                    size={30}
                                  />
                                ) : choice.thumbnail ? (
                                  <img
                                    src={choice.thumbnail}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <ImageIcon className="h-4 w-4 text-foreground/60" />
                                )}
                              </span>
                              <span className="min-w-0 flex-1 truncate text-[14.5px] font-semibold leading-tight tracking-tight">
                                {choice.name}
                              </span>
                              <span className="shrink-0 w-5 flex items-center justify-end">
                                {locked ? (
                                  <Lock className="h-4 w-4 text-foreground/45" />
                                ) : active ? (
                                  <Check className="h-5 w-5" strokeWidth={2.75} style={{ color: "var(--megsy-blue)" }} />
                                ) : null}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    )}

                    {/* Video models — shown only when in video mode */}
                    {mode === "video" && (
                    <div className="mb-2">

                      <p className="px-2 pb-2 text-[11px] uppercase tracking-[0.12em] font-semibold text-foreground/50">
                        Video models
                      </p>
                      <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
                        {orderedVideoOptions.length === 0 && (
                          <p className="px-3 py-2 text-[12.5px] text-foreground/50">
                            {loading ? "Loading models…" : "No models available."}
                          </p>
                        )}
                        {(view === "more" ? orderedVideoOptions : orderedVideoOptions.slice(0, 4)).map((model) => {
                          const choice = asMediaChoice(model, "video");
                          const active =
                            mode === "video" && mediaModel?.slug === choice.slug;
                          const locked = !!(model as any).isPremium && !paid;
                          return (
                            <button
                              key={choice.slug}
                              onClick={() => {
                                if (locked) {
                                  toast.info(
                                    `${choice.name} is available on premium plans only`,
                                  );
                                  return;
                                }
                                if (mode !== "video") onModeChange?.("video");
                                onMediaModelSelect(choice);
                                onOpenChange(false);
                              }}
                              className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-white/[0.06] last:border-b-0 ${active ? "bg-white/[0.04]" : "hover:bg-white/[0.03]"}`}
                            >
                              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-foreground/[0.05]">
                                {hasBrandIcon(choice.name, choice.provider) ? (
                                  <BrandIcon
                                    name={choice.name}
                                    provider={choice.provider}
                                    size={30}
                                  />
                                ) : choice.thumbnail ? (
                                  <img
                                    src={choice.thumbnail}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <VideoIcon className="h-4 w-4 text-foreground/60" />
                                )}
                              </span>
                              <span className="min-w-0 flex-1 truncate text-[14.5px] font-semibold leading-tight tracking-tight">
                                {choice.name}
                              </span>
                              <span className="shrink-0 w-5 flex items-center justify-end">
                                {locked ? (
                                  <Lock className="h-4 w-4 text-foreground/45" />
                                ) : active ? (
                                  <Check className="h-5 w-5" strokeWidth={2.75} style={{ color: "var(--megsy-blue)" }} />
                                ) : null}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    )}
                    {view === "models" && (
                      <div className="mt-2 space-y-2">
                        {settingsPanel ? (
                          <button type="button" onClick={() => setView("settings")} className="flex w-full items-center gap-3 rounded-2xl bg-foreground/[0.045] px-4 py-3 text-start">
                            <Sliders className="h-4 w-4 text-foreground/65" />
                            <span className="flex-1 text-[14px] font-semibold">{settingsLabel}</span>
                            <ChevronRight className="h-4 w-4 text-foreground/40" />
                          </button>
                        ) : null}
                        {(mode === "images" ? orderedImageOptions.length : mode === "video" ? orderedVideoOptions.length : orderedChatOptions.length) > 4 ? (
                          <button type="button" onClick={() => setView("more")} className="flex w-full items-center gap-3 rounded-2xl bg-foreground/[0.045] px-4 py-3 text-start">
                            <span className="flex-1 text-[14px] font-semibold">More models</span>
                            <ChevronRight className="h-4 w-4 text-foreground/40" />
                          </button>
                        ) : null}
                      </div>
                    )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>


                </DraggablePlusSheet>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}

      {/* DESKTOP — floating dropdown */}
      {!isMobile && typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && pos && (
              <>
                <div
                  className="fixed inset-0 z-[9998]"
                  onClick={() => onOpenChange(false)}
                />
                <motion.div
                  data-tier-menu
                  initial={{ opacity: 0, y: side === "top" ? 8 : -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: side === "top" ? 8 : -8, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.6 }}
                  style={{
                    position: "fixed",
                    left: pos.left,
                    width: pos.width,
                    ...(pos.top !== undefined ? { top: pos.top } : {}),
                    ...(pos.bottom !== undefined ? { bottom: pos.bottom } : {}),
                    maxHeight: pos.maxHeight,
                    scrollBehavior: "smooth",
                    ...glassModelMenuStyle,
                  }}
                  className="z-[9999] rounded-2xl p-2 text-white overflow-y-auto overscroll-contain unified-menu-surface scrollbar-thin"
                >

                  {settingsPanel && (
                    <div className="flex items-center justify-between gap-2 px-1.5 pt-0.5 pb-2 sticky top-0 z-10">
                      <button
                        type="button"
                        onClick={() => setView(view === "settings" ? "models" : "settings")}
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold text-white/90 bg-white/10 border border-white/15 hover:bg-white/15 transition-colors"
                        aria-label={view === "settings" ? "Back to models" : "Open model settings"}
                      >
                        {view === "settings" ? (
                          <>
                            <ArrowLeft className="h-3 w-3" strokeWidth={2.4} />
                            <span>Models</span>
                          </>
                        ) : (
                          <>
                            <Sliders className="h-3 w-3" strokeWidth={2.4} />
                            <span>{settingsLabel}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  <AnimatePresence mode="wait" initial={false}>
                  {view === "settings" && settingsPanel ? (
                    <motion.div
                      key="settings-desktop"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="p-1"
                    >
                      {settingsPanel}
                    </motion.div>
                  ) : (
                  <motion.div
                    key="models-desktop"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                  {isMediaMode ? (

                    mediaOptions.length === 0 ? (
                      <div className={glassModelMenu.empty}>
                        {loading ? "Loading models…" : "No models available."}
                      </div>
                    ) : (
                      <>
                        <div className="px-2.5 pt-1.5 pb-1.5 flex items-center gap-3 whitespace-nowrap">
                          <span className={glassModelMenu.sectionLabel}>
                            {mode === "video" ? "Video models" : "Image models"}
                          </span>
                        </div>
                        <motion.div
                          variants={menuContainerVariants}
                          initial="hidden"
                          animate="show"
                          className="flex flex-col gap-1"
                        >
                          {mediaOptions.map((model) => {
                            const choice = asMediaChoice(model, mode);
                            const active = mediaModel?.slug === choice.slug;
                            const locked = !!model.isPremium && !paid;
                            return (
                              <motion.button
                                key={choice.slug}
                                variants={menuItemVariants}
                                onClick={() => {
                                  if (locked) {
                                    toast.info(`${choice.name} is available on premium plans only`);
                                    return;
                                  }
                                  onMediaModelSelect(choice);
                                  onOpenChange(false);
                                }}
                                className="group relative flex w-full items-center gap-2.5 rounded-ios-md px-3 py-2.5 text-left transition-colors border border-transparent bg-transparent text-white/90 hover:bg-transparent hover:text-white"
                              >
                                <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-transparent">
                                  <BrandIcon name={choice.name} provider={choice.provider} size={28} />
                                  {!hasBrandIcon(choice.name, choice.provider) &&
                                    (choice.thumbnail ? (
                                      <img
                                        src={choice.thumbnail}
                                        alt=""
                                        className="h-full w-full object-cover"
                                      />
                                    ) : mode === "video" ? (
                                      <VideoIcon className="h-4 w-4 text-white/80" />
                                    ) : (
                                      <ImageIcon className="h-4 w-4 text-white/80" />
                                    ))}
                                </span>
                                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold leading-tight tracking-tight text-white">
                                  {choice.name}
                                </span>
                                {locked ? (
                                  <Lock className="h-3.5 w-3.5 shrink-0 text-white/55" />
                                ) : active ? (
                                  <span className={`${glassModelMenu.checkDot} h-4 w-4`}>
                                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                                  </span>
                                ) : null}
                              </motion.button>
                            );
                          })}
                        </motion.div>
                      </>
                    )
                  ) : (
                    <div className="flex flex-col gap-1">
                      {CHAT_COMPOSER_MODEL_OPTIONS.map((item) => {
                        const locked = item.premium && (userPlan === "free" || userPlan === "trial");
                        const active =
                          item.kind === "tier"
                            ? !selectedModel && megsyTier === item.id
                            : selectedModel?.id === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              if (locked) {
                                toast.info(`${item.label} is available on premium plans only`);
                                return;
                              }
                              if (item.kind === "tier") onTierSelect(item.id as "lite" | "pro" | "max");
                              else onChatModelSelect({ id: item.id, label: item.label });
                              onOpenChange(false);
                            }}
                            className="group relative flex w-full items-center gap-3 rounded-ios-md px-3 py-2.5 text-left transition-colors border border-transparent bg-transparent text-white/90 hover:bg-transparent hover:text-white"
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-transparent">
                              <ComposerModelIcon brand={item.brand} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[13px] font-semibold leading-tight truncate tracking-tight text-white">
                                {item.label}
                              </span>
                            </span>
                            <span className="shrink-0 w-5 flex items-center justify-end">
                              {locked ? (
                                <Lock className="h-4 w-4 text-white/55" />
                              ) : active ? (
                                <span className={`${glassModelMenu.checkDot} h-5 w-5`}>
                                  <Check className="h-3 w-3" strokeWidth={3} />
                                </span>
                              ) : null}
                            </span>
                          </button>
                        );
                      })}
                    </div>
          )}
                  </motion.div>
                  )}
                  </AnimatePresence>
        </motion.div>

      </>
    )}
  </AnimatePresence>,
  document.body,
)}
    </div>
  );
}

