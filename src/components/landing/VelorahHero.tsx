/** @doc Velorah cinematic hero — fullscreen video background with glassmorphic nav. */
import { useNavigate } from "react-router-dom";
import MegsyStar from "@/components/branding/MegsyStar";

const VIDEO_SRC = "/videos/landing-top.mp4";

export default function VelorahHero() {
  const navigate = useNavigate();
  const go = (path: string) => navigate(path);

  return (
    <div
      className="velorah-hero relative w-full min-h-dvh overflow-hidden"
      style={{
        background: "hsl(201 100% 13%)",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{`
        .velorah-hero .v-glass {
          background: rgba(255, 255, 255, 0.01);
          background-blend-mode: luminosity;
          backdrop-filter: blur(4px);
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease;
        }
        .velorah-hero .v-glass:hover { transform: scale(1.03); }
        .velorah-hero .v-glass::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1.4px;
          background: linear-gradient(180deg,
            rgba(255,255,255,0.45) 0%,
            rgba(255,255,255,0.15) 20%,
            rgba(255,255,255,0) 40%,
            rgba(255,255,255,0) 60%,
            rgba(255,255,255,0.15) 80%,
            rgba(255,255,255,0.45) 100%);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          pointer-events: none;
        }
        @keyframes velorah-fade-rise {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .velorah-hero .v-rise { animation: velorah-fade-rise 0.8s ease-out both; }
        .velorah-hero .v-rise-1 { animation: velorah-fade-rise 0.8s ease-out 0.2s both; }
        .velorah-hero .v-rise-2 { animation: velorah-fade-rise 0.8s ease-out 0.4s both; }
        .velorah-hero .v-serif { font-family: 'Instrument Serif', serif; }
      `}</style>

      {/* Background video */}
      <video
        key={VIDEO_SRC}
        src={VIDEO_SRC}
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden
      />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/30 via-black/10 to-[hsl(201_100%_13%)]/80" aria-hidden />

      {/* Nav */}
      <nav className="relative z-10 flex flex-row items-center justify-between px-6 md:px-8 py-6 max-w-7xl mx-auto">
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); go("/"); }}
          className="v-serif text-2xl md:text-3xl tracking-tight text-white"
          style={{ letterSpacing: "-0.02em" }}
        >
          Megsy<sup className="text-xs">®</sup>
        </a>

        <ul className="hidden md:flex items-center gap-8 text-sm">
          <li><a href="/" className="text-white hover:text-white transition-colors">الرئيسية</a></li>
          <li><a href="/chat" className="text-white/60 hover:text-white transition-colors">جرّب الآن</a></li>
          <li><a href="#pricing" className="text-white/60 hover:text-white transition-colors">الأسعار</a></li>
          <li><a href="#faq" className="text-white/60 hover:text-white transition-colors">أسئلة</a></li>
        </ul>

        <button
          type="button"
          onClick={() => go("/auth")}
          className="v-glass rounded-full px-5 md:px-6 py-2.5 text-sm text-white cursor-pointer"
        >
          ابدأ مجاناً
        </button>
      </nav>

      {/* Hero */}
      <section
        dir="rtl"
        className="relative z-10 flex flex-col items-center text-center px-6 pt-16 md:pt-24 pb-24 md:pb-32 max-w-5xl mx-auto"
      >
        <h1
          className="v-rise text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
          style={{ lineHeight: 1.15, letterSpacing: "-0.02em" }}
        >
          <MegsyStar className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white/90 shrink-0" />
          <span>
            كل موديلات <span className="text-white/50">AI</span>
            <br />
            في تطبيق واحد.
          </span>
        </h1>

        <p className="v-rise-1 text-white/85 text-lg sm:text-xl md:text-2xl max-w-2xl mt-8 leading-relaxed">
          ChatGPT · Gemini · Claude · Midjourney · Sora
        </p>
        <p className="v-rise-1 text-white/60 text-sm sm:text-base mt-2">
          كلهم في اشتراك واحد.
        </p>

        <div className="v-rise-1 mt-8 flex items-baseline justify-center gap-3 text-lg sm:text-xl">
          <span className="text-white font-bold">349 ج.م / شهر</span>
          <span className="text-white/50 line-through text-sm sm:text-base">7,000+ ج.م</span>
        </div>

        <button
          type="button"
          onClick={() => go("/auth")}
          className="v-glass v-rise-2 rounded-full px-10 md:px-14 py-4 md:py-5 text-base text-white mt-8 md:mt-10 cursor-pointer font-medium"
        >
          جرّب مجاناً — بدون كارت ائتمان
        </button>
      </section>
    </div>
  );
}
