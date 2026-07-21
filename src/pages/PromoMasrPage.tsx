/** @doc Arabic promo landing — احتفالاً بفوز مصر على أستراليا وتأهلها لدور الـ16: خصم 50% + كريدت أعلى وطرق دفع محلية. */
import { useEffect, useMemo, useState } from "react";
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import { grantPromoUnlock, type PromoUnlock } from "@/lib/promoUnlock";
import MegsyStar from "@/components/files/MegsyStar";

const PROMO_CODE = "megsy50";

const BENEFITS = [
  "كل الموديلات الرائدة متاحة",
  "صور وفيديو بجودة عالية عبر كريدت الـ MC",
  "خصم 50% لو رفعت الاشتراك دلوقتي",
  "أولوية في السرعة وأحدث الموديلات",
];

const PAYMENT_METHODS = [
  { name: "فودافون كاش", sub: "محفظة فودافون كاش" },
  { name: "اتصالات كاش", sub: "محفظة اتصالات كاش" },
  { name: "أورنچ كاش", sub: "محفظة أورنچ كاش" },
  { name: "وي باي", sub: "محفظة وي باي" },
  { name: "إنستا باي", sub: "تحويل بنكي فوري" },
  { name: "فوري", sub: "دفع من أي محل فوري" },
  { name: "ميزة", sub: "بطاقة ميزة" },
  { name: "فيزا / ماستركارد", sub: "بطاقات دولية" },
];

function useCountdown(target: number | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  if (!target) return null;
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return { d, h, m, s };
}

const pad = (n: number) => n.toString().padStart(2, "0");

const PromoMasrPage = () => {
  const [unlock, setUnlock] = useState<PromoUnlock | null>(null);

  useEffect(() => {
    setUnlock(grantPromoUnlock(PROMO_CODE));
  }, []);

  const expiresAt = unlock?.expiresAt ?? null;
  const countdown = useCountdown(expiresAt);

  const expiresLabel = useMemo(() => {
    if (!expiresAt) return "";
    return new Date(expiresAt).toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "long",
    });
  }, [expiresAt]);

  useEffect(() => {
    const prev = document.title;
    document.title = "مبروك يا مصر — خصم 50% + كريدت أعلى | MegsyAI";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <main
      dir="rtl"
      lang="ar"
      className="min-h-dvh w-full flex items-center justify-center antialiased px-5 py-10 relative overflow-hidden"
      style={{
        backgroundColor: "#0a0a0a",
        color: "#fff",
        fontFamily: "'Cairo', 'Tajawal', Inter, system-ui, sans-serif",
      }}
    >
      {/* background video */}
      <video
        aria-hidden
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260525_052706_d2e390fd-1846-4fe7-a4d8-8d2f1c875358.mp4"
          type="video/mp4"
        />
      </video>

      {/* Egyptian flag tint overlay */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(206,17,38,0.18) 0%, rgba(10,10,10,0.55) 30%, rgba(10,10,10,0.85) 100%)",
        }}
      />
      {/* dark base for readability */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.6) 50%, rgba(10,10,10,0.9) 100%)",
        }}
      />
      {/* subtle spotlight */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(255,255,255,0.08), transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* eyebrow — Egypt badge */}
        <div className="flex items-center justify-center mb-6">
          <span
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 backdrop-blur-md px-3.5 py-1.5 text-[10px] uppercase tracking-[0.24em] text-white/95"
            style={{ animation: "fade-in 600ms ease-out both" }}
          >
            <span aria-hidden className="text-base leading-none">🇪🇬</span>
            مصر × أستراليا · 1-1
            <span className="mx-1 h-1 w-1 rounded-full bg-white/40" />
            فوز بركلات الترجيح
            <span className="mx-1 h-1 w-1 rounded-full bg-white/40" />
            دور الـ16
          </span>
        </div>

        {/* hero — Arabic headline */}
        <div className="text-center relative">
          <h1
            className="font-extrabold tracking-tight leading-[1.02]"
            style={{
              fontSize: "clamp(38px, 9vw, 60px)",
              animation: "fade-in 700ms ease-out both",
              backgroundImage:
                "linear-gradient(180deg,#ffffff 0%,#ffffff 55%,#f5d6a0 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            مبروك يا مصر 🇪🇬
          </h1>
          <p
            className="mt-4 text-white/85 text-[15.5px] leading-[1.85] font-medium"
            style={{ animation: "fade-in 800ms ease-out 80ms both" }}
          >
            الفراعنة كسبوا بركلات الترجيح
            <br />
            وتأهّلوا لدور الـ16 — احتفالاً بالإنجاز،
            <br />
            هدية مننا لكل المصريين والعرب.
          </p>

          {/* Big 50% */}
          <div
            aria-hidden
            className="absolute inset-x-0 -z-10 blur-3xl opacity-40 pointer-events-none"
            style={{
              top: "40%",
              background:
                "radial-gradient(45% 55% at 50% 55%, rgba(255,255,255,0.35), transparent 70%)",
            }}
          />
          <div
            className="relative font-light tracking-tighter leading-none bg-clip-text text-transparent mt-6"
            style={{
              fontSize: "clamp(96px, 26vw, 168px)",
              backgroundImage:
                "linear-gradient(180deg, #ffffff 0%, #ffffff 40%, rgba(255,255,255,0.55) 100%)",
              animation: "fade-in 700ms ease-out both, scale-in 700ms cubic-bezier(0.22,0.61,0.36,1) both",
            }}
          >
            50<span style={{ fontSize: "0.5em", verticalAlign: "super", marginInlineStart: "0.02em" }}>%</span>
          </div>
          <div
            className="mt-2 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.35em] text-white/70"
            style={{ animation: "fade-in 900ms ease-out 120ms both" }}
          >
            <span className="h-px w-6 bg-white/30" />
            خصم 50% · كريدت أعلى للشهر الأول
            <span className="h-px w-6 bg-white/30" />
          </div>
        </div>

        {/* countdown */}
        {countdown && (
          <div dir="ltr" className="mt-8 flex items-start justify-center gap-3 text-center">
            {[
              ["يوم", countdown.d],
              ["ساعة", countdown.h],
              ["دقيقة", countdown.m],
              ["ثانية", countdown.s],
            ].map(([label, val], i) => {
              const str = pad(val as number);
              return (
                <div key={label as string} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="font-light tabular-nums text-[36px] leading-none tracking-tight text-white">
                      {str}
                    </div>
                    <div className="mt-2 text-[10px] uppercase tracking-[0.3em] text-white/60">
                      {label}
                    </div>
                  </div>
                  {i < 3 && (
                    <span className="text-[28px] font-light text-white/20 leading-none mt-1">:</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {expiresLabel && (
          <p className="mt-3 text-center text-[11px] text-white/50">
            العرض ساري حتى {expiresLabel}
          </p>
        )}

        {/* benefits */}
        <ul className="mt-8 space-y-3">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-center gap-3 text-[14px] text-white">
              <span className="inline-flex h-5 w-5 items-center justify-center shrink-0">
                <MegsyStar size={16} static className="text-white" />
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="mt-8 space-y-3">
          <Link
            to="/chat"
            style={{ backgroundColor: "#ffffff", color: "#000000" }}
            className="flex items-center justify-center w-full rounded-full text-sm font-semibold py-4 transition hover:opacity-90"
          >
            ابدأ الشات وفعّل العرض
          </Link>
          <Link
            to="/pricing"
            className="block text-center text-[12px] text-white/80 hover:text-white transition"
          >
            اعرف الأسعار ←
          </Link>
        </div>

        {/* Local payment methods */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[13px] font-semibold text-white">طرق الدفع المحلية</h2>
            <span className="text-[10px] uppercase tracking-[0.25em] text-white/50">
              متاح في مصر
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((p) => (
              <div
                key={p.name}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
              >
                <div className="text-[13px] text-white leading-tight">{p.name}</div>
                <div className="text-[10px] text-white/50 mt-0.5">{p.sub}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] text-white/60 leading-relaxed">
            الدفع بالجنيه المصري متاح — اختار الطريقة اللي تناسبك من صفحة الفوترة.
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] text-white/40">
          العرض لفترة محدودة · شكراً لكل المصريين والعرب 💚
        </p>
      </div>
    </main>
  );
};

export default PromoMasrPage;
