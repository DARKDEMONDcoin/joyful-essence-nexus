import { ReactNode, useEffect, useRef } from "react";
import { m as motion, useMotionValue, animate, type PanInfo } from "framer-motion";

interface DraggablePlusSheetProps {
  height: number;
  collapsedY: number;
  onClose: () => void;
  children: ReactNode;
  initialExpanded?: boolean;
  dragEnabled?: boolean;
  view?: string;
}

/**
 * Bottom sheet with two snap points: collapsed (partial) and expanded (full).
 * The user can drag up to expand, drag down to collapse or dismiss.
 */
export const DraggablePlusSheet = ({
  height,
  collapsedY,
  onClose,
  children,
  initialExpanded = false,
  dragEnabled = true,
  view,
}: DraggablePlusSheetProps) => {
  const y = useMotionValue(height); // start off-screen
  const scrollRef = useRef<HTMLDivElement>(null);
  const startedFromScrollTopRef = useRef(true);
  const previousViewRef = useRef<string | undefined>(view);

  // Enter animation: slide from off-screen to collapsed or expanded snap
  useEffect(() => {
    const target = initialExpanded ? 0 : collapsedY;
    const controls = animate(y, target, {
      type: "spring",
      damping: 34,
      stiffness: 340,
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-expand when user navigates to skills or tools inside the already-open sheet
  useEffect(() => {
    if (view === "skills" || view === "tools") {
      const controls = animate(y, 0, {
        type: "spring",
        damping: 34,
        stiffness: 340,
      });
      return () => controls.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // Auto-collapse (shrink) when user exits skills or tools back to main
  useEffect(() => {
    const wasExpanded =
      previousViewRef.current === "skills" || previousViewRef.current === "tools";
    const isCollapsed = view !== "skills" && view !== "tools";
    if (wasExpanded && isCollapsed) {
      const controls = animate(y, collapsedY, {
        type: "spring",
        damping: 34,
        stiffness: 340,
      });
      return () => controls.stop();
    }
    previousViewRef.current = view;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const handleDragStart = () => {
    if (!dragEnabled) return;
    startedFromScrollTopRef.current = (scrollRef.current?.scrollTop ?? 0) <= 0;
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (!dragEnabled) return;
    const current = y.get();
    const v = info.velocity.y;

    // Fast downward flick from collapsed -> close
    if (v > 800 && current >= collapsedY - 20) {
      animate(y, height, {
        type: "spring",
        damping: 34,
        stiffness: 340,
        onComplete: onClose,
      });
      return;
    }

    // Dragged past halfway below collapsed -> close
    if (current > collapsedY + (height - collapsedY) * 0.4) {
      animate(y, height, {
        type: "spring",
        damping: 34,
        stiffness: 340,
        onComplete: onClose,
      });
      return;
    }

    // Decide between expanded (0) and collapsed (collapsedY)
    let target = collapsedY;
    if (v < -400) target = 0;
    else if (v > 400) target = collapsedY;
    else target = current < collapsedY / 2 ? 0 : collapsedY;

    animate(y, target, { type: "spring", damping: 34, stiffness: 340 });
  };

  return (
    <motion.div
      style={{
        y,
        transformOrigin: "bottom center",
      }}
      initial={{ height }}
      animate={{ height }}
      transition={{ type: "spring", damping: 34, stiffness: 340 }}
      data-plus-menu
      onClick={(e) => e.stopPropagation()}
      drag={dragEnabled ? "y" : false}
      dragConstraints={{ top: 0, bottom: height }}
      dragElastic={{ top: 0.02, bottom: 0.2 }}
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="mobile-plus-glass-menu md:hidden fixed left-0 right-0 bottom-0 z-overlay flex flex-col overflow-hidden rounded-t-[28px] px-3 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]"
    >
      {/* Drag handle */}
      <div className="pt-2.5 pb-2 flex items-center justify-center cursor-grab active:cursor-grabbing shrink-0">
        <div className="h-1.5 w-10 rounded-full bg-foreground/30" />
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{ touchAction: "pan-y" }}
      >
        {children}
      </div>
    </motion.div>
  );
};
