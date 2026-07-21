/** @doc Mobile /pricing — Screen 2 showcase.
 *  Header (hamburger) → Hero video → Feature hero list →
 *  Monthly/Yearly segmented toggle → Swipeable plan cards (Pro / Elite / Business) →
 *  Subscribe button for the visible plan.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import MegsyStar from "@/components/branding/MegsyStar";
import { Check } from "lucide-react";
import { MobileSidebarButton } from "@/components/shared/MobileSidebarButton";
import { useUserLang } from "@/lib/authI18n";
import { PLANS, type PlanTier } from "@/data/pricingData";

const PRICING_HERO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_055001_8e16d972-3b2b-441c-86ad-2901a54682f9.mp4";

interface Props {
  isYearly: boolean;
  onToggleYearly: (yearly: boolean) => void;
  onSubscribe: (tier: PlanTier) => void;
  loadingTier?: PlanTier | null;
  onMenuClick?: () => void;
}

export default function MobilePricingScreen({
  isYearly,
  onToggleYearly,
  onSubscribe,
  loadingTier,
  onMenuClick,
}: Props) {
  const lang = useUserLang();
  const isAr = lang === "ar";
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 5000);
    const v = videoRef.current;
    if (!v) return () => clearTimeout(t);
    const on = () => setReady(true);
    v.addEventListener("loadeddata", on);
    v.src = PRICING_HERO_URL;
    return () => {
      v.removeEventListener("loadeddata", on);
      clearTimeout(t);
    };
  }, []);

  // Detect which card sits closest to the horizontal center of the track.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const rect = track.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const cards = Array.from(track.querySelectorAll<HTMLElement>("[data-plan-card]"));
      let best = 0;
      let bestDist = Infinity;
      cards.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const c = r.left + r.width / 2;
        const d = Math.abs(c - center);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setActiveIdx(best);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  const t = useMemo(
    () =>
      isAr
        ? {
            monthly: "شهري",
            yearly: "سنوي",
            perMonth: "/شهر",
            perYear: "/سنة",
            perFirstMonth: "/أول شهر",
            then: (p: number) => `بعدين $${p}/شهري`,
            subscribe: "اشترك في",
            firstMonth: "الشهر الأول",
            seventySevenOff: "77% خصم",
          }
        : {
            monthly: "Monthly",
            yearly: "Yearly",
            perMonth: "/mo",
            perYear: "/yr",
            perFirstMonth: "/1st mo",
            then: (p: number) => `then $${p}/month`,
            subscribe: "Subscribe to",
            firstMonth: "First month",
            seventySevenOff: "77% Off",
          },
    [isAr],
  );

  const activeTier = PLANS[activeIdx]?.tier ?? "pro";
  const isLoading = loadingTier === activeTier;

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="relative min-h-[100dvh] w-full overflow-x-hidden bg-[#0f1016] text-white"
      style={{ fontFamily: 'Inter, -apple-system, "SF Pro Text", system-ui, sans-serif' }}
    >
      {/* Video background — fills the entire screen */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          zIndex: 0,
          opacity: ready ? 1 : 0,
          transition: "opacity 1.4s ease-out",
        }}
      />

      {/* Background fade — subtle overlay so content stays readable across the full page */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(to bottom, rgba(15,16,22,0.25) 0%, rgba(15,16,22,0.35) 45%, rgba(15,16,22,0.75) 80%, rgba(15,16,22,0.9) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        {/* Header */}
        <header
          className="flex items-center justify-end px-5"
          style={{
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 14px)",
            paddingBottom: 10,
          }}
        >
          <MobileSidebarButton
            onClick={() => onMenuClick?.()}
            ariaLabel={isAr ? "القائمة" : "Menu"}
            className="text-white"
          />
        </header>

        <div className="flex-1" />

        <div className="px-6 pb-7">
          {/* Feature list — for the currently active plan */}
          {(() => {
            const active = PLANS[activeIdx];
            const list =
              (isYearly ? active?.yearlyFeatures : active?.monthlyFeatures) ??
              active?.features ??
              [];
            return (
              <ul
                key={`f-${activeTier}-${isYearly ? "y" : "m"}`}
                className="mt-5 space-y-3 animate-fade-in"
              >
                {list.map((feat, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 animate-fade-in"
                    style={{ animationDelay: `${i * 45}ms` }}
                  >
                    <span
                      className="mt-[3px] shrink-0"
                      style={{ color: "#ffffff", filter: "drop-shadow(0 0 6px rgba(180,210,255,0.35))" }}
                    >
                      <MegsyStar className="h-3.5 w-3.5" />
                    </span>
                    <span
                      className="flex-1 text-[13px] font-light leading-[1.55] text-white"
                      style={{ letterSpacing: "0.1px" }}
                    >
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>
            );
          })()}

          {/* Billing toggle — sliding pill */}
          <div className="mx-auto mt-7 flex w-full max-w-[300px] flex-col items-center">
            <div
              className="relative flex w-full items-center rounded-full p-1"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              {/* Sliding indicator */}
              <div
                aria-hidden
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full"
                style={{
                  background: "linear-gradient(180deg, #ffffff 0%, #eef1f6 100%)",
                  boxShadow: "0 6px 18px -6px rgba(255,255,255,0.35), inset 0 1px 0 rgba(255,255,255,0.9)",
                  transform: isYearly
                    ? isAr
                      ? "translateX(-100%)"
                      : "translateX(100%)"
                    : "translateX(0%)",
                  insetInlineStart: 4,
                  transition: "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />
              <button
                type="button"
                onClick={() => onToggleYearly(false)}
                className="relative z-10 flex-1 rounded-full py-2 text-[13px] font-medium transition-colors duration-300"
                style={{ color: !isYearly ? "#0f1016" : "rgba(255,255,255,0.72)" }}
              >
                {t.monthly}
              </button>
              <button
                type="button"
                onClick={() => onToggleYearly(true)}
                className="relative z-10 flex-1 rounded-full py-2 text-[13px] font-medium transition-colors duration-300"
                style={{ color: isYearly ? "#0f1016" : "rgba(255,255,255,0.72)" }}
              >
                {t.yearly}
              </button>
            </div>

          </div>

          {/* Swipeable plan cards */}
          <div
            ref={trackRef}
            className="mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2"
            style={{
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
              scrollPaddingInline: "9%",
              paddingInline: "9%",
              marginInline: "-24px",
            }}
          >
            <style>{`.no-sb::-webkit-scrollbar{display:none}`}</style>
            {PLANS.map((plan, i) => {
              const isPro = plan.tier === "pro";
              const isProFirstMonth = isPro && !isYearly;
              // Monthly: Pro = $7 first month (strike $25); Elite/Business = full price w/ 77% off strike.
              // Yearly: full yearly price, no strike/discount.
              // 77%-off strike originals sourced from the desktop pricing design.
              const monthlyStrikeMap: Record<string, number> = {
                pro: 25,
                elite: 257,
                business: 648,
              };
              const displayPrice = isProFirstMonth
                ? plan.firstMonthPrice!
                : isYearly
                  ? plan.yearlyPrice
                  : plan.monthlyPrice;
              const originalPrice = isYearly
                ? null
                : isProFirstMonth
                  ? plan.monthlyPrice
                  : (monthlyStrikeMap[plan.tier] ?? null);
              const suffix = isProFirstMonth ? t.perFirstMonth : isYearly ? t.perYear : t.perMonth;
              const badge = isYearly
                ? null
                : isProFirstMonth
                  ? t.firstMonth
                  : t.seventySevenOff;
              const isActive = activeIdx === i;
              const priceKey = `${plan.tier}-${isYearly ? "y" : "m"}`;
              return (
                <button
                  key={plan.tier}
                  type="button"
                  data-plan-card
                  onClick={(e) => {
                    setActiveIdx(i);
                    const card = e.currentTarget;
                    card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                  }}
                  className="no-sb relative shrink-0 snap-center overflow-hidden rounded-[18px] p-4 text-start transition animate-fade-in"
                  style={{
                    width: "82%",
                    background: plan.bg,
                    color: plan.text,
                    boxShadow: isActive
                      ? "0 14px 36px -12px rgba(0,0,0,0.55)"
                      : "0 6px 18px -12px rgba(0,0,0,0.4)",
                    transform: isActive ? "scale(1)" : "scale(0.965)",
                    opacity: isActive ? 1 : 0.78,
                    transition: "transform 260ms ease, opacity 260ms ease",
                    animationDelay: `${i * 70}ms`,
                  }}
                >
                  {/* Top-right badge */}
                  {badge && (
                    <div className="absolute end-3 top-3 flex flex-col items-end gap-1">
                      <span
                        className="rounded-full px-2 py-[3px] text-[9.5px] font-semibold"
                        style={{
                          background: "rgba(255,255,255,0.16)",
                          color: "#ffffff",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {badge}
                      </span>
                    </div>
                  )}

                  <div className="text-[13px] font-medium opacity-90">{plan.name}</div>

                  <div key={priceKey} className="mt-1 flex flex-col gap-1 animate-fade-in">
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className="text-[30px] font-semibold tabular-nums leading-none"
                        style={{ letterSpacing: "0.2px" }}
                      >
                        ${displayPrice}
                      </span>
                      <span className="text-[12px] opacity-75">{suffix}</span>
                    </div>
                    {originalPrice != null && originalPrice !== displayPrice && (
                      <span
                        className="text-[12px] tabular-nums line-through"
                        style={{ color: plan.subText, opacity: 0.7 }}
                      >
                        ${originalPrice}
                      </span>
                    )}
                    {isProFirstMonth && (
                      <span className="text-[11px] opacity-80">{t.then(plan.monthlyPrice)}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dots */}
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {PLANS.map((_, i) => (
              <span
                key={i}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: activeIdx === i ? 18 : 6,
                  background: activeIdx === i ? "#ffffff" : "rgba(255,255,255,0.28)",
                }}
              />
            ))}
          </div>

          {/* Subscribe button */}
          <button
            key={activeTier}
            onClick={() => onSubscribe(activeTier)}
            disabled={isLoading}
            className="mt-5 flex w-full items-center justify-center rounded-full border border-white py-[15px] font-semibold transition active:scale-[0.98] disabled:opacity-60 animate-fade-in"
            style={{ backgroundColor: "#ffffff", color: "#000000", fontSize: 16, boxShadow: "0 10px 28px -8px rgba(255,255,255,0.22)" }}
          >
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/40 border-t-black" />
            ) : (
              <span>
                {t.subscribe} {PLANS[activeIdx]?.name}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
