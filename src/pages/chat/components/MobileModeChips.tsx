import {
  Image as ImageIcon,
  Video as VideoIcon,
  Microscope,
  GraduationCap,
  Code2,
  FileText,
  Presentation,
  Music as MusicIcon,
  
  type LucideIcon,
} from "lucide-react";
import { m as motion, LayoutGroup } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import type { AgentDef } from "@/lib/agentRegistry";

type ChipId =
  | "code"
  | "images"
  | "video"
  | "music"
  | "deep-research"
  | "operator"
  | "slides"
  | "docs"
  | "learning";

interface MobileModeChipsProps {
  chatMode: string;
  selectedAgent: AgentDef | null;
  handleModeChange: (mode: any) => void;
  setChatMode: (mode: any) => void;
  setSelectedAgent: (agent: AgentDef | null) => void;
  onAgentSelect?: (agentId: string) => void;
  /** Layout variant. `mobile` = default strip above composer. `desktop-chat` = desktop horizontal-scroll row. */
  variant?: "mobile" | "desktop-chat";
}

const CHIPS: { id: ChipId; label: string; Icon: LucideIcon }[] = [
  { id: "images", label: "Images", Icon: ImageIcon },
  { id: "video", label: "Videos", Icon: VideoIcon },

  { id: "deep-research", label: "Deep Research", Icon: Microscope },
  { id: "learning", label: "Learning", Icon: GraduationCap },
  { id: "code", label: "Coder", Icon: Code2 },
  { id: "docs", label: "Docs", Icon: FileText },
  { id: "slides", label: "Slides", Icon: Presentation },
];

const LONG_PRESS_MS = 450;

/**
 * Horizontally scrollable chip strip shown above the mobile composer. Replaces
 * the modes list that used to live inside the "+" sheet.
 */
export function MobileModeChips({
  chatMode,
  selectedAgent,
  handleModeChange,
  setChatMode,
  setSelectedAgent,
  onAgentSelect,
  variant = "mobile",
}: MobileModeChipsProps) {
  const isDesktopChat = variant === "desktop-chat";
  const activeId: ChipId | null = (() => {
    if (chatMode && chatMode !== "normal") return chatMode as ChipId;
    if (selectedAgent?.id === "docs") return "docs";
    return null;
  })();

  const [pressingId, setPressingId] = useState<ChipId | null>(null);
  const [longFiredId, setLongFiredId] = useState<ChipId | null>(null);
  const timerRef = useRef<number | null>(null);

  const clearPressTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startPress = (id: ChipId) => {
    setPressingId(id);
    clearPressTimer();
    timerRef.current = window.setTimeout(() => {
      setLongFiredId(id);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try { navigator.vibrate?.(18); } catch { /* ignore */ }
      }
      // clear the long-press pulse flag shortly after firing
      window.setTimeout(() => setLongFiredId(null), 380);
    }, LONG_PRESS_MS);
  };

  const endPress = () => {
    clearPressTimer();
    setPressingId(null);
  };

  const handleClick = (id: ChipId) => {
    if (id === "docs") {
      setChatMode("normal");
      onAgentSelect?.(id);
      return;
    }
    setSelectedAgent(null);
    if (activeId === id) {
      handleModeChange("normal");
    } else {
      handleModeChange(id as any);
    }
  };

  return (
    <motion.div
      className={isDesktopChat ? "mx-auto w-full max-w-full" : "mb-1 w-full"}
      data-chips-row
      data-visible-mode-chips={isDesktopChat ? "desktop" : "mobile"}
      initial={false}
      animate={false}
      exit={isDesktopChat ? { opacity: 0, y: -6, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } } : { opacity: 0, y: -6, height: 0, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
      style={{ overflow: isDesktopChat ? "visible" : "hidden" }}
    >
      <LayoutGroup id="mobile-mode-chips">
        <motion.div
          data-no-swipe-open
          className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 ${
            isDesktopChat
              ? "w-full gap-2 px-1 md:overflow-x-auto md:flex-nowrap md:justify-start"
              : "w-full px-1 justify-start flex-nowrap"
          }`}
          style={{ scrollbarWidth: "none" }}
        >
          {CHIPS.map(({ id, label, Icon }, index) => {
            const active = activeId === id;
            const pressing = pressingId === id;
            const longFired = longFiredId === id;
            return (
              <motion.button
                key={id}
                type="button"
                aria-pressed={active}
                layout
                initial={false}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: longFired ? 1.06 : pressing ? 0.92 : 1,
                }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.18 } }}
                transition={{
                  layout: { type: "spring", stiffness: 500, damping: 38, mass: 0.7 },
                  scale: pressing
                    ? { duration: LONG_PRESS_MS / 1000, ease: [0.22, 1, 0.36, 1] }
                    : { type: "spring", stiffness: 500, damping: 22 },
                }}
                whileHover={{ y: -1 }}
                onClick={() => handleClick(id)}
                onPointerDown={() => startPress(id)}
                onPointerUp={endPress}
                onPointerLeave={endPress}
                onPointerCancel={endPress}
                onContextMenu={(e) => e.preventDefault()}
                className={
                  isDesktopChat
                    ? `relative shrink-0 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-semibold overflow-hidden select-none border backdrop-blur-2xl saturate-150 transition-colors mode-chip-btn ${
                        active
                          ? "text-foreground border-border bg-transparent shadow-[0_6px_20px_var(--overlay-white-12)]"
                          : "text-foreground border-border bg-transparent shadow-[inset_0_1px_0_var(--overlay-white-08),0_6px_18px_var(--overlay-black-35)]"
                      }`
                    : `relative shrink-0 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-semibold border overflow-hidden select-none transition-colors mode-chip-btn ${
                        active
                          ? "text-foreground border-border bg-transparent shadow-[0_4px_14px_rgba(0,0,0,0.45)]"
                          : "text-foreground border-border bg-transparent shadow-[0_4px_14px_rgba(0,0,0,0.45)]"
                      }`
                }
                style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
              >
                {/* Long-press progress ring / fill */}
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-full pointer-events-none"
                  initial={false}
                  animate={{
                    backgroundColor: pressing
                      ? active
                        ? "var(--overlay-white-18)"
                        : "rgba(127,127,127,0.22)"
                      : "rgba(127,127,127,0)",
                    boxShadow: longFired
                      ? "0 0 0 3px rgba(127,127,127,0.25)"
                      : "0 0 0 0 rgba(127,127,127,0)",
                  }}
                  transition={{ duration: longFired ? 0.35 : 0.2, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.span
                  className="relative z-10 inline-flex items-center justify-center"
                  animate={{
                    rotate: longFired ? [0, -18, 12, 0] : active ? [0, -12, 0] : 0,
                    scale: longFired ? [1, 1.25, 1] : active ? [1, 1.15, 1] : 1,
                  }}
                  transition={{ duration: longFired ? 0.5 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Icon className="w-[15px] h-[15px]" strokeWidth={2} />
                </motion.span>
                <motion.span layout="position" className="relative z-10 whitespace-nowrap">
                  {label}
                </motion.span>
              </motion.button>
            );
          })}
        </motion.div>
      </LayoutGroup>
    </motion.div>
  );
}
