import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { animate, m as motion, type PanInfo, useMotionValue, useTransform } from "framer-motion";
import AppSidebar from "@/components/layout/AppSidebar";
import { useUserLang } from "@/lib/authI18n";

const RTL_UI_LANGS = new Set(["ar", "ar-eg", "he", "fa"]);
const EDGE_SWIPE_ZONE = 36;
const OPEN_SNAP = 0.22;
const CLOSE_SNAP = 0.64;
const FLING_VELOCITY = 520;
const PUSH_SPRING = { type: "spring" as const, stiffness: 240, damping: 34, mass: 1.05 };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewChat?: () => void;
  onSelectConversation?: (id: string) => void;
  activeConversationId?: string | null;
  currentMode?: string;
  children: ReactNode;
}

/**
 * Claude-style "push" sidebar shell for mobile.
 * Renders the AppSidebar as a fixed underlay beneath the page content and
 * pushes the page to the right with rounded corners, dim overlay and drag
 * gestures (edge-swipe to open, drag-left to close).
 *
 * Desktop is untouched — children render normally and the sidebar underlay
 * is hidden.
 */
export default function MobilePushShell({
  open,
  onOpenChange,
  onNewChat,
  onSelectConversation,
  activeConversationId,
  currentMode = "chat",
  children,
}: Props) {
  const [revealX, setRevealX] = useState(0);
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);
  const lang = useUserLang();
  const isRtlUi = RTL_UI_LANGS.has(lang);
  const pushX = isRtlUi ? -revealX : revealX;
  const shellX = useMotionValue(0);
  const progress = useTransform(shellX, (latest) =>
    revealX > 0 ? clamp(Math.abs(latest) / revealX, 0, 1) : 0,
  );
  const shellScale = useTransform(progress, [0, 1], [1, 0.94]);
  const shellRadius = useTransform(progress, [0, 1], [0, 32]);
  const shellShadow = useTransform(progress, (p) =>
    p > 0.02
      ? `0 30px 90px -20px rgba(0,0,0,${0.36 + p * 0.34}), 0 0 0 1px rgba(255,255,255,${p * 0.06})`
      : "0 0 0 rgba(0,0,0,0)",
  );
  const animationRef = useRef<{ stop: () => void } | null>(null);
  const edgeDraggingRef = useRef(false);
  const animateShellTo = useCallback(
    (nextOpen: boolean) => {
      animationRef.current?.stop();
      animationRef.current = animate(
        shellX,
        nextOpen ? pushX : 0,
        nextOpen ? PUSH_SPRING : { type: "spring", stiffness: 360, damping: 42, mass: 0.9 },
      );
    },
    [pushX, shellX],
  );

  useEffect(() => {
    if (edgeDraggingRef.current) return;
    animateShellTo(open);
    return () => animationRef.current?.stop();
  }, [animateShellTo, open]);

  useEffect(() => {
    const compute = () =>
      setRevealX(Math.min(Math.round(window.innerWidth * 0.82), 320));
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // Native-style edge swipe: LTR opens from left edge, RTL from right edge.
  // It only arms at the edge so regular horizontal/vertical chat scrolling is untouched.
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let openStarted = false;
    let tracking = false;
    const onStart = (e: TouchEvent) => {
      if (openRef.current) return;
      const t = e.touches[0];
      if (!t) return;
      const target = e.target as Element | null;
      if (target && target.closest?.("[data-no-swipe-open]")) return;
      const width = window.innerWidth;
      const fromSidebarEdge = isRtlUi
        ? t.clientX >= width - EDGE_SWIPE_ZONE
        : t.clientX <= EDGE_SWIPE_ZONE;
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
        edgeDraggingRef.current = false;
        animateShellTo(false);
        return;
      }

      if (!openStarted && directionalDistance > 18 && dy < 18) {
        openStarted = true;
        edgeDraggingRef.current = true;
        animationRef.current?.stop();
        onOpenChange(true);
      }

      if (openStarted) {
        e.preventDefault();
        const nextDistance = clamp(directionalDistance, 0, revealX);
        shellX.set(isRtlUi ? -nextDistance : nextDistance);
      }
    };
    const onEnd = () => {
      if (tracking && openStarted) {
        const dx = lastX - startX;
        const directionalDistance = isRtlUi ? -dx : dx;
        const shouldOpen = directionalDistance >= revealX * OPEN_SNAP;
        edgeDraggingRef.current = false;
        onOpenChange(shouldOpen);
        animateShellTo(shouldOpen);
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
  }, [animateShellTo, isRtlUi, onOpenChange, revealX, shellX]);

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let pointerId: number | null = null;
    let openStarted = false;
    let tracking = false;

    const onPointerDown = (e: PointerEvent) => {
      if (openRef.current) return;
      if (e.pointerType === "mouse" && e.buttons !== 1) return;
      const target = e.target as Element | null;
      if (target && target.closest?.("[data-no-swipe-open]")) return;
      const fromSidebarEdge = isRtlUi
        ? e.clientX >= window.innerWidth - EDGE_SWIPE_ZONE
        : e.clientX <= EDGE_SWIPE_ZONE;
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
        edgeDraggingRef.current = false;
        animateShellTo(false);
        return;
      }

      if (!openStarted && directionalDistance > 18 && dy < 18) {
        openStarted = true;
        edgeDraggingRef.current = true;
        animationRef.current?.stop();
        onOpenChange(true);
      }

      if (openStarted) {
        e.preventDefault();
        const nextDistance = clamp(directionalDistance, 0, revealX);
        shellX.set(isRtlUi ? -nextDistance : nextDistance);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!tracking || (pointerId !== null && e.pointerId !== pointerId)) return;
      if (openStarted) {
        const dx = lastX - startX;
        const directionalDistance = isRtlUi ? -dx : dx;
        const shouldOpen = directionalDistance >= revealX * OPEN_SNAP;
        edgeDraggingRef.current = false;
        onOpenChange(shouldOpen);
        animateShellTo(shouldOpen);
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
  }, [animateShellTo, isRtlUi, onOpenChange, revealX, shellX]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (!open) return;
    const shouldClose = isRtlUi
      ? info.offset.x > Math.max(72, revealX * (1 - CLOSE_SNAP)) || info.velocity.x > FLING_VELOCITY
      : info.offset.x < -Math.max(72, revealX * (1 - CLOSE_SNAP)) || info.velocity.x < -FLING_VELOCITY;
    onOpenChange(!shouldClose);
    animateShellTo(!shouldClose);
  };

  return (
    <>
      {/* Mobile underlay sidebar */}
      <div className="md:hidden">
        <AppSidebar
          underlay
          mobileSide={isRtlUi ? "right" : "left"}
          open={open}
          onClose={() => onOpenChange(false)}
          onNewChat={onNewChat ?? (() => {})}
          onSelectConversation={onSelectConversation}
          activeConversationId={activeConversationId ?? null}
          currentMode={currentMode}
        />
      </div>

      {/* Pushed page surface — desktop passes through unchanged. */}
      <motion.div
        data-mobile-push-shell="true"
        style={{
          x: shellX,
          scale: shellScale,
          borderRadius: shellRadius,
          boxShadow: shellShadow,
          transformOrigin: isRtlUi ? "right center" : "left center",
          touchAction: "pan-y",
        }}
        drag={open ? "x" : false}
        dragDirectionLock
        dragConstraints={isRtlUi ? { left: -revealX, right: 0 } : { left: 0, right: revealX }}
        dragElastic={isRtlUi ? { left: 0.03, right: 0.14 } : { left: 0.14, right: 0.03 }}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        className="relative min-h-[100dvh] overflow-visible max-md:z-[2] max-md:bg-black md:!transform-none"
      >
        {children}

        {/* Tap-to-close overlay + dim, mobile only */}
        <motion.div
          className={`md:hidden absolute inset-0 z-[60] ${
            open
              ? "pointer-events-auto"
              : "pointer-events-none"
          }`}
          style={{ background: "rgba(0,0,0,0.42)", opacity: progress }}
          onClick={() => onOpenChange(false)}
          aria-hidden={!open}
        />
      </motion.div>
    </>
  );
}
