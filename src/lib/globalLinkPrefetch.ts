/**
 * @doc Global route prefetcher. Attach once from main.tsx to hover/focus/touch
 * every internal `<a href="/...">` in the whole app — the route chunk starts
 * downloading before the user clicks, so navigation feels instant.
 *
 * Also warms visible internal links via IntersectionObserver during idle time.
 * Safe to run alongside usePrefetchRoute (they share the same cache).
 */
import { prefetchRoute } from "@/hooks/usePrefetchRoute";

const seen = new Set<string>();

const norm = (href: string | null | undefined): string | null => {
  if (!href) return null;
  if (href.startsWith("//") || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return null;
  if (href.startsWith("#")) return null;
  if (!href.startsWith("/")) return null;
  return href;
};

const trigger = (a: HTMLAnchorElement | null) => {
  if (!a) return;
  const href = norm(a.getAttribute("href"));
  if (!href) return;
  if (seen.has(href)) return;
  seen.add(href);
  void prefetchRoute(href);
};

const findAnchor = (t: EventTarget | null): HTMLAnchorElement | null => {
  const el = t as HTMLElement | null;
  if (!el || typeof el.closest !== "function") return null;
  return el.closest("a[href]") as HTMLAnchorElement | null;
};

let installed = false;
export function installGlobalLinkPrefetch() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const onIntent = (e: Event) => trigger(findAnchor(e.target));

  // Hover / focus / touch — the "user intends to click" signals.
  window.addEventListener("mouseover", onIntent, { passive: true, capture: true });
  window.addEventListener("focusin", onIntent, { capture: true });
  window.addEventListener("touchstart", onIntent, { passive: true, capture: true });

  // Visible internal links: prefetch during idle time.
  const io =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) trigger(entry.target as HTMLAnchorElement);
            }
          },
          { rootMargin: "200px" }
        )
      : null;

  const scan = () => {
    if (!io) return;
    const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]');
    links.forEach((a) => io.observe(a));
  };
  const idle: (cb: () => void) => number =
    (window as any).requestIdleCallback?.bind(window) ??
    ((cb: () => void) => window.setTimeout(cb, 800));
  idle(scan);

  // Rescan on route changes / DOM updates.
  const mo = new MutationObserver(() => idle(scan));
  mo.observe(document.body, { childList: true, subtree: true });
}
