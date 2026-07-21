/** @doc Public referral landing — explains how the program works. */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles,
  Gift,
  ShieldCheck,
  Zap,
  Infinity as InfinityIcon,
  Check,
  ArrowRight,
  Star,
  Users,
  Crown,
} from "lucide-react";

interface RefInfo {
  displayName: string;
  avatarUrl: string | null;
}

const ReferralLandingPage = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [info, setInfo] = useState<RefInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;
    const clean = code.trim().toUpperCase().slice(0, 64);
    (async () => {
      try {
        const { data: codeRow } = await supabase
          .from("referral_codes")
          .select("user_id")
          .ilike("code", clean)
          .maybeSingle();
        if (codeRow?.user_id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("id", codeRow.user_id)
            .maybeSingle();
          setInfo({
            displayName: profile?.display_name || "A friend",
            avatarUrl: profile?.avatar_url || null,
          });
        } else {
          setInfo({ displayName: "A friend", avatarUrl: null });
        }
      } catch {
        setInfo({ displayName: "A friend", avatarUrl: null });
      } finally {
        setLoading(false);
      }
    })();
  }, [code]);

  const join = () => {
    if (code) navigate(`/ref/${code}`);
  };
  const initials = (info?.displayName || "A").charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-white/10 border-t-white/70 animate-spin" />
          <p className="text-xs uppercase tracking-[0.24em] text-white/40">Megsy AI</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="auto" className="relative min-h-[100dvh] overflow-hidden bg-black text-white">
      {/* Cinematic ambient — gold + violet on jet black */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 55% at 50% -5%, rgba(212,175,110,0.28), transparent 65%), radial-gradient(60% 45% at 90% 15%, rgba(139,92,246,0.20), transparent 70%), radial-gradient(55% 40% at 10% 40%, rgba(56,189,248,0.14), transparent 70%), radial-gradient(80% 55% at 50% 110%, rgba(212,175,110,0.14), transparent 65%)",
        }}
      />
      {/* Subtle grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />

      <main className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-5 pb-10 pt-[calc(env(safe-area-inset-top)+18px)]">
        {/* Brand row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex h-7 w-7 items-center justify-center rounded-xl"
              style={{
                background: "linear-gradient(135deg,#D4AF6E 0%,#8B5E22 100%)",
                boxShadow: "0 4px 18px -6px rgba(212,175,110,0.55)",
              }}
            >
              <Sparkles className="h-3.5 w-3.5 text-black" strokeWidth={2.6} />
            </span>
            <span className="text-[13px] font-semibold tracking-tight text-white/90">
              Megsy <span className="text-white/50">AI</span>
            </span>
          </div>
          <span
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.16em] text-white/70 backdrop-blur"
          >
            <Crown className="h-3 w-3" style={{ color: "#D4AF6E" }} />
            Private invite
          </span>
        </div>

        {/* Inviter card — feels human, real, personal */}
        <section className="relative mt-8">
          <div
            aria-hidden
            className="absolute -inset-6 rounded-[36px] blur-3xl opacity-70"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 30%, rgba(212,175,110,0.28), transparent 70%)",
            }}
          />
          <div
            className="relative overflow-hidden rounded-[28px] border border-white/10 p-6 text-center backdrop-blur-xl"
            style={{
              background:
                "linear-gradient(180deg, var(--overlay-white-06) 0%, rgba(255,255,255,0.02) 100%)",
              boxShadow:
                "inset 0 1px 0 var(--overlay-white-08), 0 20px 60px -20px rgba(0,0,0,0.6)",
            }}
          >
            {/* Avatar */}
            <div className="mx-auto mb-4 flex flex-col items-center">
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute -inset-1 rounded-full opacity-90"
                  style={{
                    background:
                      "conic-gradient(from 180deg,#D4AF6E,#F6E7B7,#8B5E22,#D4AF6E)",
                  }}
                />
                <div
                  className="relative flex h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-full bg-black text-2xl font-semibold text-white"
                  style={{ border: "2px solid #0a0a0a" }}
                >
                  {info?.avatarUrl ? (
                    <img
                      src={info.avatarUrl}
                      alt={info.displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span
                      style={{
                        background: "linear-gradient(180deg,#F6E7B7,#D4AF6E)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {initials}
                    </span>
                  )}
                </div>
                <span
                  className="absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full"
                  style={{
                    background: "linear-gradient(135deg,#D4AF6E,#8B5E22)",
                    border: "2px solid #000",
                  }}
                >
                  <Check className="h-3 w-3 text-black" strokeWidth={3} />
                </span>
              </div>
            </div>

            <p className="text-[12px] uppercase tracking-[0.22em] text-white/45">
              You've been invited by
            </p>
            <p className="mt-1 text-[18px] font-semibold tracking-tight text-white">
              {info?.displayName}
            </p>

            <h1
              className="mt-5 text-[32px] font-bold leading-[1.05] tracking-tight"
              style={{
                background:
                  "linear-gradient(180deg,#ffffff 0%,#F6E7B7 55%,#D4AF6E 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Your seat at the world's
              <br /> most complete AI suite.
            </h1>
            <p className="mx-auto mt-3 max-w-[300px] text-[13.5px] leading-relaxed text-white/65">
              Chat, image, video, deep research, slides, code and agents — all inside one calm,
              premium workspace.
            </p>

            {/* Gift chip */}
            <div
              className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5"
              style={{
                borderColor: "rgba(212,175,110,0.4)",
                background:
                  "linear-gradient(180deg, rgba(212,175,110,0.18), rgba(212,175,110,0.04))",
              }}
            >
              <Gift className="h-3.5 w-3.5" style={{ color: "#F6E7B7" }} />
              <span className="text-[12.5px] font-semibold text-white">
                +15 free credits inside
              </span>
              {code && (
                <span
                  dir="ltr"
                  className="ml-1 rounded-full bg-black/50 px-2 py-0.5 font-mono text-[10.5px] tracking-wider"
                  style={{ color: "#F6E7B7", border: "1px solid rgba(212,175,110,0.3)" }}
                >
                  {code}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Value bullets — real, honest, high-signal */}
        <ul className="mt-6 space-y-2.5">
          {[
            {
              icon: Zap,
              title: "Frontier models, one bill",
              body: "GPT, Claude, Gemini, Grok, image + video generators — no juggling subscriptions.",
            },
            {
              icon: InfinityIcon,
              title: "Deep research & agents",
              body: "Multi-step research, slides, code sandbox and automations built-in.",
            },
            {
              icon: ShieldCheck,
              title: "Private by default",
              body: "End-to-end encrypted chats. Your data is never sold or used to train models.",
            },
          ].map((f) => (
            <li
              key={f.title}
              className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3.5 backdrop-blur-sm"
            >
              <span
                className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(212,175,110,0.22), rgba(212,175,110,0.06))",
                  border: "1px solid rgba(212,175,110,0.28)",
                }}
              >
                <f.icon className="h-4 w-4" style={{ color: "#F6E7B7" }} />
              </span>
              <div className="min-w-0">
                <p className="text-[13.5px] font-semibold text-white">{f.title}</p>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-white/55">{f.body}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Trust row */}
        <div className="mt-6 grid grid-cols-3 gap-2 text-center">
          {[
            { icon: Users, label: "Global creators" },
            { icon: Star, label: "4.9 in-app rating" },
            { icon: ShieldCheck, label: "SOC-grade privacy" },
          ].map((t) => (
            <div
              key={t.label}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.025] px-2 py-3"
            >
              <t.icon className="mx-auto h-4 w-4" style={{ color: "#D4AF6E" }} />
              <p className="mt-1.5 text-[10.5px] font-medium leading-tight text-white/70">
                {t.label}
              </p>
            </div>
          ))}
        </div>

        {/* Sticky CTA */}
        <div className="mt-8 space-y-3">
          <button
            onClick={join}
            className="group relative w-full overflow-hidden rounded-2xl py-4 text-[15px] font-semibold text-black transition active:scale-[0.985]"
            style={{
              background:
                "linear-gradient(180deg,#F6E7B7 0%,#D4AF6E 55%,#B0894B 100%)",
              boxShadow:
                "0 20px 60px -18px rgba(212,175,110,0.65), inset 0 1px 0 rgba(255,255,255,0.55)",
            }}
          >
            <span className="relative inline-flex items-center justify-center gap-2">
              Accept invite & claim 15 credits
              <ArrowRight className="h-4 w-4" strokeWidth={2.6} />
            </span>
          </button>

          <p className="text-center text-[11px] leading-relaxed text-white/40">
            No credit card required · Cancel anytime · Takes 20 seconds
          </p>
        </div>
      </main>
    </div>
  );
};

export default ReferralLandingPage;
