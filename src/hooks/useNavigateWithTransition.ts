/**
 * @doc useNavigateWithTransition — drop-in replacement for react-router's
 * useNavigate() that wraps the navigation in document.startViewTransition()
 * when the browser supports it. Falls back to a plain navigate() call
 * everywhere else, so it's always safe to use.
 *
 * Usage:
 *   const nav = useNavigateWithTransition();
 *   nav("/settings");
 */
import { useCallback } from "react";
import { useNavigate, type NavigateOptions, type To } from "react-router-dom";

type StartViewTransition = (cb: () => void) => { finished: Promise<void> };

export function useNavigateWithTransition() {
  const navigate = useNavigate();

  return useCallback(
    (to: To | number, options?: NavigateOptions) => {
      const doNav = () => {
        if (typeof to === "number") navigate(to);
        else navigate(to, options);
      };
      const startVT = (document as unknown as { startViewTransition?: StartViewTransition })
        .startViewTransition;
      // Skip VT if the user prefers reduced motion — matches CSS behavior.
      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (!startVT || prefersReduced) {
        doNav();
        return;
      }
      try {
        startVT.call(document, doNav);
      } catch {
        doNav();
      }
    },
    [navigate],
  );
}

export default useNavigateWithTransition;
