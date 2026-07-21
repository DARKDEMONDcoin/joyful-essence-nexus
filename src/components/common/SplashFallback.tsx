/**
 * Suspense fallback that visually matches the pre-hydration splash defined
 * in index.html (Claude-style centered logo + subtle breathing pulse over
 * #0a0a0a). Rendered by React the moment a lazy route chunk starts
 * downloading, so the transition from static splash → React first commit
 * is visually seamless — no flash, no skeleton reflow.
 */
const SplashFallback = () => (
  <div
    aria-hidden="true"
    style={{
      position: "fixed",
      inset: 0,
      background:
        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%23ffffff' stop-opacity='.98'/><stop offset='1' stop-color='%23ffffff' stop-opacity='.6'/></linearGradient></defs><path fill='url(%23g)' d='M36 6c2.4 8.6 7.4 14 16.5 16.5C43.4 25 38 30.4 36 39c-2-8.6-7.4-14-16.5-16.5C28.6 20 34 14.6 36 6Zm22 30c1.4 5.2 4.4 8.4 9.5 9.9-5.1 1.5-8.1 4.7-9.5 9.9-1.4-5.2-4.4-8.4-9.5-9.9 5.1-1.5 8.1-4.7 9.5-9.9ZM18 46c1.4 5.2 4.4 8.4 9.5 9.9-5.1 1.5-8.1 4.7-9.5 9.9-1.4-5.2-4.4-8.4-9.5-9.9C13.6 54.4 16.6 51.2 18 46Z'/></svg>\") no-repeat center center / 72px 72px, radial-gradient(1200px 800px at 50% 40%, rgba(255,255,255,.04), transparent 60%), #0a0a0a",
      animation: "megsy-splash-pulse 1.6s ease-in-out infinite",
      zIndex: 0,
    }}
  />
);

export default SplashFallback;
