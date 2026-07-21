import { ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { m as motion, useMotionValue, animate, type PanInfo } from "framer-motion";

interface MobileBottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  initialExpanded?: boolean;
}

/**
 * Generic mobile bottom sheet with drag-to-dismiss and snap points.
 * Styled to match the liquid-glass + menu aesthetic.
 */
export function MobileBottomSheet({
  open,
  onClose,
  children,
  className = "",
  initialExpanded = false,
}: MobileBottomSheetProps) {
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const height = vh * 0.38;
  const collapsedY = height * 0.22;
  const y = useMotionValue(height);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startedFromScrollTopRef = useRef(true);

  useEffect(() => {
    if (open) {
      const target = initialExpanded ? 0 : collapsedY;
      const controls = animate(y, target, {
        type: "spring",
        damping: 34,
        stiffness: 340,
      });
      return () => controls.stop();
    } else {
      const controls = animate(y, height, {
        type: "spring",
        damping: 34,
        stiffness: 340,
      });
      return () => controls.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleDragStart = () => {
    startedFromScrollTopRef.current = (scrollRef.current?.scrollTop ?? 0) <= 0;
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const current = y.get();
    const v = info.velocity.y;

    if (v > 800 && current >= collapsedY - 20) {
      animate(y, height, {
        type: "spring",
        damping: 34,
        stiffness: 340,
        onComplete: onClose,
      });
      return;
    }

    if (current > collapsedY + (height - collapsedY) * 0.4) {
      animate(y, height, {
        type: "spring",
        damping: 34,
        stiffness: 340,
        onComplete: onClose,
      });
      return;
    }

    let target = collapsedY;
    if (v < -400) target = 0;
    else if (v > 400) target = collapsedY;
    else target = current < collapsedY / 2 ? 0 : collapsedY;

    animate(y, target, { type: "spring", damping: 34, stiffness: 340 });
  };

  if (!open) return null;

  return createPortal(
    <>
      {/* Backdrop - transparent, click to close */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-overlay bg-transparent"
      />
      <motion.div
        style={{
          y,
          height,
          transformOrigin: "bottom center",
        }}
        onClick={(e) => e.stopPropagation()}
        drag="y"
        dragConstraints={{ top: 0, bottom: height }}
        dragElastic={{ top: 0.02, bottom: 0.2 }}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`mobile-plus-glass-menu md:hidden fixed left-0 right-0 bottom-0 z-overlay flex flex-col overflow-hidden rounded-t-[28px] px-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] ${className}`}
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
    </>,
    document.body
  );
}
