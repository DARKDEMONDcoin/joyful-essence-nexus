/**
 * @doc installViewTransitions — intercepts internal SPA link clicks and wraps
 * the subsequent React Router navigation inside document.startViewTransition()
 * so the DOM cross-fades with a native easing curve. Ignores modifier clicks
 * (cmd/ctrl/shift/alt), middle click, target=_blank, download links, hash-only
 * jumps, and reduced-motion users. Silently no-ops on browsers without the
 * View Transitions API (Firefox, older Safari).
 *
 * Why click-based instead of monkey-patching history.pushState: the
 * startViewTransition callback runs on the next rendering opportunity, so
 * wrapping pushState delayed the actual URL update by one frame and broke
 * navigation timing. Intercepting clicks lets us start the transition first
 * and let React Router push synchronously inside its callback.
 */
type StartViewTransition = (cb: () => void | Promise<void>) => { finished: Promise<void> };

let installed = false;

export function installViewTransitions() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const doc = document as unknown as { startViewTransition?: StartViewTransition };
  if (!doc.startViewTransition) return;

  const prefersReduced = () =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

  window.addEventListener(
    "click",
    (e) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const a = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      let url: URL;
      try {
        url = new URL(a.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      // Same path (query/hash only) — no transition needed.
      if (url.pathname === window.location.pathname) return;
      // Chat is a heavy live surface. Starting a native view transition while
      // leaving it can wait on a lazy route update and Chrome may abort with
      // "timeout in DOM update", making the tap feel stuck. Let these exits
      // navigate instantly instead.
      const fromPath = window.location.pathname;
      const fromChat =
        fromPath.startsWith("/chat") ||
        Boolean(document.querySelector('[data-chat-main="true"], [data-shell="manus"]'));
      const toChatExit = url.pathname.startsWith("/pricing") || url.pathname.startsWith("/settings");
      if (fromChat && toChatExit) return;
      if (prefersReduced()) return;

      // Let React Router handle the click normally, but capture the current
      // DOM snapshot right after this event so the next render animates in.
      // We schedule startViewTransition on the next microtask, giving Router
      // a chance to swap children before the "new" snapshot is taken.
      try {
        const transition = doc.startViewTransition!(
          () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
        );
        transition.finished.catch(() => {});
      } catch {
        /* ignore */
      }
    },
    { capture: true },
  );
}
