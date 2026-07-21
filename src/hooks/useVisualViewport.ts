import { useEffect, useState } from "react";

/**
 * @doc useVisualViewport — tracks the browser's VisualViewport API to expose
 * accurate viewport height and on-screen keyboard offset. More precise than
 * `interactive-widget=resizes-content` because it reports the *actual* keyboard
 * inset in real time (needed for iOS Safari, where the meta tag is ignored).
 *
 * Returns:
 * - `height` — visible viewport height in CSS px (excludes on-screen keyboard).
 * - `keyboardInset` — px the keyboard covers at the bottom of the layout viewport.
 * - `isKeyboardOpen` — heuristic: keyboardInset > 120px.
 *
 * Also mirrors values to CSS custom properties on <html>:
 *   --viewport-height, --keyboard-inset
 * so plain CSS can consume them: `height: var(--viewport-height, 100dvh);`
 * or `padding-bottom: calc(var(--keyboard-inset, 0px) + env(safe-area-inset-bottom));`.
 */
export function useVisualViewport() {
  const [state, setState] = useState(() => ({
    height: typeof window === "undefined" ? 0 : window.innerHeight,
    keyboardInset: 0,
    isKeyboardOpen: false,
  }));

  useEffect(() => {
    if (typeof window === "undefined") return;
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const layoutH = window.innerHeight;
      const visualH = vv.height;
      const inset = Math.max(0, layoutH - visualH - vv.offsetTop);
      const next = {
        height: visualH,
        keyboardInset: inset,
        isKeyboardOpen: inset > 120,
      };
      setState(next);
      const root = document.documentElement;
      root.style.setProperty("--viewport-height", `${visualH}px`);
      root.style.setProperty("--keyboard-inset", `${inset}px`);
      root.dataset.keyboard = next.isKeyboardOpen ? "open" : "closed";
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return state;
}

export default useVisualViewport;