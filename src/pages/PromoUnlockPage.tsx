/** @doc Promo unlock landing — minimal dark-psychology design granting 50% off + higher access for the month. */
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import { ArrowUpRight } from "lucide-react";
import { grantPromoUnlock, type PromoUnlock } from "@/lib/promoUnlock";
import MegsyStar from "@/components/files/MegsyStar";


const VALID_CODES = new Set(["megsy50", "vip", "friends", "launch"]);

const BENEFITS = [
  "All flagship chat models included",
  "High-quality images and videos via your MC credits",
  "50% off if you upgrade this month",
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

const FlipDigit = ({ char }: { char: string }) => {
  const [display, setDisplay] = useState(char);
  const [flipping, setFlipping] = useState(false);
  useEffect(() => {
    if (char === display) return;
    setFlipping(true);
    const t = setTimeout(() => {
      setDisplay(char);
      setFlipping(false);
    }, 220);
    return () => clearTimeout(t);
  }, [char, display]);
  return (
    <span
      className="inline-block w-[0.6em] text-center"
      style={{
        transform: flipping ? "translateY(-8px)" : "translateY(0)",
        opacity: flipping ? 0 : 1,
        transition: "transform 220ms cubic-bezier(0.22,0.61,0.36,1), opacity 220ms ease",
      }}
    >
      {display}
    </span>
  );
};

const PromoUnlockPage = () => {
  const { code = "" } = useParams();
  const normalized = code.trim().toLowerCase();
  const valid = VALID_CODES.has(normalized);
  const [unlock, setUnlock] = useState<PromoUnlock | null>(null);

  useEffect(() => {
    if (valid) setUnlock(grantPromoUnlock(normalized));
  }, [valid, normalized]);

  const expiresAt = unlock?.expiresAt ?? null;
  const countdown = useCountdown(expiresAt);

  const expiresLabel = useMemo(() => {
    if (!expiresAt) return "";
    return new Date(expiresAt).toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
    });
  }, [expiresAt]);

  useEffect(() => {
    const prev = document.title;
    document.title = valid ? "You unlocked 50% off — MegsyAI" : "Invalid promo — MegsyAI";
    return () => {
      document.title = prev;
    };
  }, [valid]);

  if (!valid) {
    return (
      <main
        className="min-h-dvh flex items-center justify-center px-6 antialiased"
        style={{ backgroundColor: "#0a0a0a", color: "#fff", fontFamily: "Inter, system-ui, sans-serif" }}
      >
        <div className="max-w-sm text-center space-y-5">
          <div className="text-[11px] uppercase tracking-[0.3em] text-white">Invalid link</div>
          <h1 className="text-3xl font-normal tracking-tight">This invite has expired.</h1>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition"
          >
            Return home <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-dvh w-full flex items-center justify-center antialiased px-5 py-10 relative overflow-hidden"
      style={{ backgroundColor: "#0a0a0a", color: "#fff", fontFamily: "Inter, system-ui, sans-serif" }}
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
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260520_133010_cb9c806d-bc9d-47f1-ac4c-b1759134ec8b.mp4"
          type="video/mp4"
        />
      </video>
      {/* dark overlay for readability */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,10,10,0.75) 0%, rgba(10,10,10,0.6) 40%, rgba(10,10,10,0.85) 100%)",
        }}
      />
      {/* subtle spotlight */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, var(--overlay-white-08), transparent 70%)",
        }}
      />
      {/* grain */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />


      <div className="relative w-full max-w-md">
        {/* eyebrow */}
        <div className="flex items-center justify-center mb-8">
          <span
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md px-3.5 py-1.5 text-[10px] uppercase tracking-[0.28em] text-white/90"
            style={{ animation: "fade-in 600ms ease-out both" }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-white/60 opacity-75 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            Private invite · Applied
          </span>
        </div>


        {/* hero number */}
        <div className="text-center relative">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 blur-3xl opacity-40 pointer-events-none"
            style={{
              background:
                "radial-gradient(45% 55% at 50% 55%, rgba(255,255,255,0.35), transparent 70%)",
            }}
          />
          <div
            className="relative font-light tracking-tighter leading-none bg-clip-text text-transparent"
            style={{
              fontSize: "clamp(112px, 30vw, 200px)",
              backgroundImage:
                "linear-gradient(180deg, #ffffff 0%, #ffffff 40%, rgba(255,255,255,0.55) 100%)",
              animation: "fade-in 700ms ease-out both, scale-in 700ms cubic-bezier(0.22,0.61,0.36,1) both",
            }}
          >
            50<span style={{ fontSize: "0.5em", verticalAlign: "super", marginLeft: "0.02em" }}>%</span>
          </div>
          <div
            className="mt-3 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.42em] text-white/70"
            style={{ animation: "fade-in 900ms ease-out 120ms both" }}
          >
            <span className="h-px w-6 bg-white/30" />
            Off · More credits this month
            <span className="h-px w-6 bg-white/30" />
          </div>
        </div>


        {/* countdown */}
        {countdown && (
          <div className="mt-10 flex items-start justify-center gap-3 text-center">
            {[
              ["Days", countdown.d],
              ["Hrs", countdown.h],
              ["Min", countdown.m],
              ["Sec", countdown.s],
            ].map(([label, val], i) => {
              const str = pad(val as number);
              return (
                <div key={label as string} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex font-light tabular-nums text-[40px] leading-none tracking-tight text-white">
                      {str.split("").map((ch, idx) => (
                        <FlipDigit key={`${label}-${idx}`} char={ch} />
                      ))}
                    </div>
                    <div className="mt-2 text-[10px] uppercase tracking-[0.3em] text-white/60">
                      {label}
                    </div>
                  </div>
                  {i < 3 && (
                    <span className="text-[32px] font-light text-white/20 leading-none mt-1">
                      :
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}



        {/* benefits */}
        <ul className="mt-10 space-y-3">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-center gap-3 text-[14px] text-white">
              <span className="inline-flex h-5 w-5 items-center justify-center shrink-0">
                <MegsyStar size={16} static className="text-white" />
              </span>
              {b}
            </li>
          ))}

        </ul>

        {/* CTA */}
        <div className="mt-10 space-y-3">
          <Link
            to="/chat"
            style={{ backgroundColor: "#ffffff", color: "#000000" }}
            className="flex items-center justify-center w-full rounded-full text-sm font-semibold py-4 transition hover:opacity-90"
          >
            Claim & start chatting
          </Link>


          <Link
            to="/pricing"
            className="block text-center text-[12px] text-white hover:text-white/80 transition"
          >
            View pricing →
          </Link>
        </div>

      </div>
    </main>
  );
};

export default PromoUnlockPage;
