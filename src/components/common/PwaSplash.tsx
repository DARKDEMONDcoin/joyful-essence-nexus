import { useEffect, useState } from "react";


/**
 * @doc PwaSplash — full-screen splash shown ONLY when the app is launched as an
 * installed PWA (iOS/Android home-screen). Never shows in the browser.
 * Layout mirrors app splashes (Claude, ChatGPT): centered logo + wordmark,
 * "BY MEGSY LLC" pinned near the bottom safe-area.
 */
export default function PwaSplash() {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    // Mobile only — never show on desktop/laptop (even installed PWA).
    const isMobile =
      window.matchMedia?.("(max-width: 820px), (pointer: coarse)").matches ?? false;
    return standalone && isMobile;
  });
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!show) return;
    const fadeT = window.setTimeout(() => setFading(true), 450);
    const hideT = window.setTimeout(() => setShow(false), 900);
    return () => {
      window.clearTimeout(fadeT);
      window.clearTimeout(hideT);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fading ? 0 : 1,
        transition: "opacity 420ms ease-out",
        pointerEvents: fading ? "none" : "auto",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="megsy-pwa-loader" aria-hidden="true" />
      </div>


      <div
        style={{
          paddingBottom: 28,
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.18em",
          color: "rgba(255,255,255,0.42)",
        }}
      >
        BY MEGSY LLC
      </div>

      <style>{`
        .megsy-pwa-loader {
          display: block;
          width: 84px;
          height: 84px;
          position: relative;
        }
        .megsy-pwa-loader::before,
        .megsy-pwa-loader::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: 0;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #FFF;
          transform: translate(-50%, -100%) scale(0);
          animation: megsy-pwa-push 2s infinite linear;
        }
        .megsy-pwa-loader::after {
          animation-delay: 1s;
        }
        @keyframes megsy-pwa-push {
          0%, 50%  { transform: translate(-50%, 0%) scale(1); }
          100%     { transform: translate(-50%, -100%) scale(0); }
        }
      `}</style>

    </div>
  );
}
