/** @doc Lenis-based smooth scroll for desktop marketing pages. Skipped on touch & reduced-motion. */
import { useEffect } from "react";
import type Lenis from "lenis";

export function useSmoothScroll(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const isTouch =
      window.matchMedia("(hover: none) and (pointer: coarse)").matches || window.innerWidth < 1024;
    if (isTouch) return;

    let rafId = 0;
    let lenis: Lenis | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let cancelled = false;

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

      resizeObserver = new ResizeObserver(() => lenis?.resize());
      resizeObserver.observe(document.body);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      lenis?.stop();
      lenis?.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
      document.documentElement.removeAttribute("data-lenis-smooth");
    };
  }, [enabled]);
}
