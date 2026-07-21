import { m as motion } from "framer-motion";
import type { ComponentType } from "react";

export interface MegsyOsIntroBodyProps {
  onClose: () => void;
  isProPlusPlan: () => boolean;
  navigate: (path: string) => void;
  handleModeChange: (mode: any) => void;
  icons: {
    ChevronLeft: ComponentType<any>;
    FileText: ComponentType<any>;
    Globe: ComponentType<any>;
    Layers: ComponentType<any>;
    Timer: ComponentType<any>;
    Users: ComponentType<any>;
    X: ComponentType<any>;
  };
}

export default function MegsyOsIntroBody({
  onClose,
  isProPlusPlan,
  navigate,
  handleModeChange,
  icons,
}: MegsyOsIntroBodyProps) {
  const { ChevronLeft, FileText, Globe, Layers, Timer, Users, X } = icons;
  return (
    <>
      {/* ─── Mobile bottom sheet (unchanged) ─── */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 36 }}
        className="md:hidden fixed inset-0 z-[81] bg-black flex flex-col"
      >
        {/* Fixed header */}
        <div className="shrink-0 px-4 pt-[calc(env(safe-area-inset-top)+0.875rem)] pb-4 border-b border-white/10 bg-black/95 backdrop-blur-md flex items-center gap-3">
          <button
            onClick={() => onClose()}
            aria-label="Back"
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-foreground/90 hover:bg-white/10 active:scale-95 transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-[14px] font-semibold text-foreground">Back</span>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-6 pt-6 pb-3">
            <h2
              style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif" }}
              className="text-[44px] leading-[0.9] tracking-tight text-foreground uppercase"
            >
              What megsy
              <br />
              <span className="bg-gradient-to-r from-purple-300 to-purple-500 bg-clip-text text-transparent">
                OS can do.
              </span>
            </h2>
            <p className="text-zinc-400 text-[13px] leading-relaxed mt-3">
              Your autonomous AI computer — swipe to see everything it ships for you.
            </p>
          </div>

          <div className="flex gap-4 overflow-x-auto pl-6 pr-6 pt-2 pb-6 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              {
                t: "A FULL\nAI TEAM",
                role: "The crew",
                bg: "bg-[#C9A7FF]",
                d: "Strategist, researcher, writer, designer & developer working in parallel on every task.",
                glyph: (
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="28" cy="28" r="14" fill="#FFEE00" />
                    <circle cx="72" cy="28" r="14" fill="#FFEE00" />
                    <circle cx="28" cy="72" r="14" fill="#FFEE00" />
                    <circle cx="72" cy="72" r="14" fill="#FFEE00" />
                    <path d="M50 38 L62 50 L50 62 L38 50 Z" fill="#FFEE00" />
                  </svg>
                ),
              },
              {
                t: "REAL\nBROWSER",
                role: "The hands",
                bg: "bg-[#F5C542]",
                d: "Signs into sites, fills forms, clicks buttons and uses live tools on your behalf — not just chat.",
                glyph: (
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <rect x="6" y="14" width="88" height="62" rx="6" fill="#1a1a1a" />
                    <circle cx="16" cy="24" r="2.5" fill="#FFEE00" />
                    <circle cx="24" cy="24" r="2.5" fill="#FFEE00" />
                    <circle cx="32" cy="24" r="2.5" fill="#FFEE00" />
                    <rect x="6" y="32" width="88" height="44" fill="#FFEE00" />
                    <path d="M50 44 L74 56 L62 60 L70 74 L64 76 L56 62 L48 68 Z" fill="#1a1a1a" />
                  </svg>
                ),
              },
              {
                t: "APPS &\nWEBSITES",
                role: "The builder",
                bg: "bg-[#9FE870]",
                d: "Builds full-stack apps, deploys them online and sends the live link straight back to chat.",
                glyph: (
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <rect x="6" y="10" width="88" height="80" rx="8" fill="#FFEE00" />
                    <rect x="6" y="10" width="88" height="16" rx="8" fill="#FFEE00" />
                    <circle cx="16" cy="18" r="2.5" fill="#1a1a1a" />
                    <circle cx="24" cy="18" r="2.5" fill="#1a1a1a" />
                    <circle cx="32" cy="18" r="2.5" fill="#1a1a1a" />
                    <path
                      d="M30 42 L20 56 L30 70"
                      stroke="#1a1a1a"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <path
                      d="M70 42 L80 56 L70 70"
                      stroke="#1a1a1a"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <path
                      d="M58 38 L42 74"
                      stroke="#1a1a1a"
                      strokeWidth="6"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                ),
              },
              {
                t: "STUDIO\nOUTPUT",
                role: "The studio",
                bg: "bg-[#FF8FA3]",
                d: "Studio-grade images, reports, decks and full business strategies ready to send to clients.",
                glyph: (
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <rect x="8" y="14" width="84" height="72" rx="6" fill="#FFEE00" />
                    <circle cx="32" cy="38" r="7" fill="#1a1a1a" />
                    <path d="M14 80 L40 54 L58 72 L74 56 L86 68 L86 80 Z" fill="#1a1a1a" />
                    <path
                      d="M76 18 L80 30 L92 34 L80 38 L76 50 L72 38 L60 34 L72 30 Z"
                      fill="#1a1a1a"
                    />
                  </svg>
                ),
              },
              {
                t: "RUNS\n24/7",
                role: "The engine",
                bg: "bg-[#7AB8FF]",
                d: "Works in the background — close the app and come back to finished tasks waiting for you.",
                glyph: (
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="44" fill="#FFEE00" />
                    <circle cx="50" cy="50" r="34" fill="none" stroke="#1a1a1a" strokeWidth="4" />
                    <rect x="47" y="22" width="6" height="30" rx="3" fill="#1a1a1a" />
                    <rect x="48" y="48" width="24" height="6" rx="3" fill="#1a1a1a" />
                    <circle cx="50" cy="50" r="4" fill="#1a1a1a" />
                    <circle cx="50" cy="14" r="3" fill="#1a1a1a" />
                    <circle cx="86" cy="50" r="3" fill="#1a1a1a" />
                    <circle cx="50" cy="86" r="3" fill="#1a1a1a" />
                    <circle cx="14" cy="50" r="3" fill="#1a1a1a" />
                  </svg>
                ),
              },
            ].map(({ t, d, role, bg, glyph }) => (
              <div
                key={role}
                className="shrink-0 w-[280px] snap-center flex flex-col rounded-ios-md overflow-hidden border-[1.5px] border-black shadow-[4px_4px_0_0_#000] bg-[#ECE6D8]"
                style={{ fontFamily: "'Chicago', 'VT323', ui-monospace, monospace" }}
              >
                {/* Mac OS title bar */}
                <div
                  className="relative flex items-center px-2 py-1.5 bg-[#ECE6D8] border-b-[1.5px] border-black"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, #000 0 1px, transparent 1px 3px)",
                  }}
                >
                  <div className="flex items-center gap-1 bg-[#ECE6D8] pr-2 z-10">
                    <span className="w-3 h-3 rounded-full bg-[#FF5F57] border border-black/70" />
                    <span className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-black/70" />
                    <span className="w-3 h-3 rounded-full bg-[#28C840] border border-black/70" />
                  </div>
                  <span
                    className="absolute left-1/2 -translate-x-1/2 px-2 bg-[#ECE6D8] text-[11px] font-bold tracking-wide text-foreground uppercase z-10"
                    style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif" }}
                  >
                    {role}.app
                  </span>
                </div>
                {/* Screen */}
                <div
                  className={`${bg} aspect-square p-8 flex items-center justify-center border-b-[1.5px] border-black`}
                >
                  {glyph}
                </div>
                {/* Body */}
                <div className="px-4 pt-4 pb-5 flex flex-col flex-1 bg-[#ECE6D8]">
                  <h3
                    style={{
                      fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                      color: "#0a0a0a",
                    }}
                    className="text-[32px] leading-[0.9] tracking-tight uppercase whitespace-pre-line"
                  >
                    {t}
                  </h3>
                  <p
                    style={{ color: "#1a1a1a" }}
                    className="text-[12.5px] leading-snug mt-2.5 font-medium"
                  >
                    {d}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fixed footer */}
        <div className="shrink-0 px-5 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] border-t border-white/10 bg-black/95 backdrop-blur-md grid grid-cols-2 gap-3">
          <button
            onClick={() => onClose()}
            className="py-3.5 rounded-full bg-white/[0.04] text-foreground border border-white/15 font-semibold text-[14px] hover:bg-white/10 active:scale-[0.98] transition-all"
          >
            Maybe later
          </button>
          <button
            onClick={() => {
              if (!isProPlusPlan()) {
                onClose();
                navigate("/pricing");
                return;
              }
              try {
                localStorage.setItem("megsy_os_intro_seen", "1");
              } catch {}
              onClose();
              handleModeChange("operator");
            }}
            className="py-3.5 bg-white text-foreground font-bold text-[14px] rounded-full hover:bg-zinc-200 active:scale-[0.98] transition-all"
          >
            {isProPlusPlan() ? "Start Now →" : "Upgrade to Pro →"}
          </button>
        </div>
      </motion.div>

      {/* ─── Desktop: Hero + Grid (Midnight Indigo / Archivo Black) ─── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="hidden md:flex fixed inset-0 z-[81] items-center justify-center p-6 pointer-events-none"
      >
        <div
          className="pointer-events-auto relative w-full max-w-[1180px] max-h-[92vh] overflow-y-auto rounded-ios-lg border-[1.5px] border-black shadow-[10px_10px_0_0_#000]"
          style={{
            fontFamily: "'Hind', 'Inter', system-ui, sans-serif",
            background: "#ECE6D8",
            color: "#0a0a0a",
          }}
          dir="ltr"
        >
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-9 pointer-events-none border-b-[1.5px] border-black"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, #000 0 1px, transparent 1px 3px)",
              backgroundColor: "#ECE6D8",
            }}
          />
          <div className="absolute top-1.5 left-3 z-10 flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#FF5F57] border border-black/70" />
            <span className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-black/70" />
            <span className="w-3 h-3 rounded-full bg-[#28C840] border border-black/70" />
          </div>
          <span
            className="absolute top-1.5 left-1/2 -translate-x-1/2 z-10 px-2 bg-[#ECE6D8] text-[11px] font-bold tracking-wide uppercase"
            style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", color: "#0a0a0a" }}
          >
            megsy-os.app
          </span>

          <button
            onClick={() => onClose()}
            aria-label="Close"
            className="absolute top-12 right-5 z-10 w-9 h-9 rounded-full flex items-center justify-center border-[1.5px] border-black bg-[#FFEE00] text-black hover:-translate-y-[1px] transition-transform shadow-[2px_2px_0_0_#000]"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>

          <div className="relative px-14 pt-20 pb-10 text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-[1.5px] border-black bg-[#FFEE00]">
              <span className="w-1.5 h-1.5 rounded-full bg-black" />
              <span
                className="text-[10.5px] font-bold tracking-[0.22em] uppercase"
                style={{ fontFamily: "'Archivo Black', sans-serif", color: "#0a0a0a" }}
              >
                MEGSY · OS
              </span>
            </span>
            <h2
              style={{
                fontFamily: "'Archivo Black', 'Inter', sans-serif",
                letterSpacing: "-0.02em",
                color: "#0a0a0a",
              }}
              className="mt-5 text-[64px] leading-[0.95] uppercase"
            >
              What Megsy{" "}
              <span
                className="inline-block px-3 -mx-1 border-[1.5px] border-black"
                style={{ background: "#FFEE00", color: "#0a0a0a" }}
              >
                OS
              </span>{" "}
              can do.
            </h2>
            <p
              className="mx-auto mt-4 max-w-[560px] text-[14.5px] leading-relaxed"
              style={{ color: "#1a1a1a" }}
            >
              Your autonomous AI computer — a full team that browses, builds, designs and ships
              finished work straight to your chat, 24/7.
            </p>
            <div className="mt-7 flex items-center justify-center gap-3">
              <button
                onClick={() => onClose()}
                className="px-6 py-3 rounded-full text-[13.5px] font-semibold border-[1.5px] border-black bg-[#ECE6D8] hover:bg-white transition-colors shadow-[3px_3px_0_0_#000] hover:-translate-y-[1px]"
                style={{ color: "#0a0a0a" }}
              >
                Maybe later
              </button>
              <button
                onClick={() => {
                  if (!isProPlusPlan()) {
                    onClose();
                    navigate("/pricing");
                    return;
                  }
                  try {
                    localStorage.setItem("megsy_os_intro_seen", "1");
                  } catch {}
                  onClose();
                  handleModeChange("operator");
                }}
                className="px-7 py-3 rounded-full text-[13.5px] font-bold transition-all hover:-translate-y-[1px] active:translate-y-0 border-[1.5px] border-black shadow-[3px_3px_0_0_#000]"
                style={{
                  fontFamily: "'Archivo Black', sans-serif",
                  letterSpacing: "0.04em",
                  background: "#FFEE00",
                  color: "#0a0a0a",
                }}
              >
                {isProPlusPlan() ? "START NOW →" : "UPGRADE TO PRO →"}
              </button>
            </div>
          </div>

          <div className="relative px-10 pb-12 grid grid-cols-3 gap-4">
            {[
              {
                t: "A FULL AI TEAM",
                role: "The crew",
                accent: "#C9A7FF",
                d: "Strategist, researcher, writer, designer & developer working in parallel on every task.",
                icon: <Users className="w-5 h-5" strokeWidth={2.4} />,
              },
              {
                t: "REAL BROWSER",
                role: "The hands",
                accent: "#F5C542",
                d: "Signs into sites, fills forms, clicks buttons and uses live tools on your behalf — not just chat.",
                icon: <Globe className="w-5 h-5" strokeWidth={2.4} />,
              },
              {
                t: "APPS & WEBSITES",
                role: "The builder",
                accent: "#9FE870",
                d: "Builds full-stack apps, deploys them online and sends the live link straight back to chat.",
                icon: <Layers className="w-5 h-5" strokeWidth={2.4} />,
              },
              {
                t: "STUDIO OUTPUT",
                role: "The studio",
                accent: "#FF8FA3",
                d: "Studio-grade images, reports, decks and full business strategies ready to send to clients.",
                icon: <FileText className="w-5 h-5" strokeWidth={2.4} />,
              },
              {
                t: "RUNS 24/7",
                role: "The engine",
                accent: "#7AB8FF",
                d: "Works in the background — close the app and come back to finished tasks waiting for you.",
                icon: <Timer className="w-5 h-5" strokeWidth={2.4} />,
              },
            ].map(({ t, d, role, accent, icon }, i) => (
              <motion.div
                key={role}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.08 + i * 0.06,
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`group relative rounded-2xl border-[1.5px] border-black p-5 flex flex-col gap-3 overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] ${i === 0 ? "col-span-2" : ""} ${i === 4 ? "col-span-2" : ""}`}
                style={{
                  background: accent,
                  color: "#0a0a0a",
                }}
              >
                <div className="flex items-center justify-between relative">
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[9.5px] font-bold tracking-[0.18em] uppercase border-[1.5px] border-black bg-[#ECE6D8]"
                    style={{
                      fontFamily: "'Archivo Black', sans-serif",
                      color: "#0a0a0a",
                    }}
                  >
                    {role}
                  </span>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border-[1.5px] border-black bg-[#ECE6D8]"
                    style={{ color: "#0a0a0a" }}
                  >
                    {icon}
                  </div>
                </div>
                <h3
                  className="uppercase mt-1"
                  style={{
                    fontFamily: "'Archivo Black', sans-serif",
                    fontSize: "26px",
                    lineHeight: "1.02",
                    letterSpacing: "-0.01em",
                    color: "#0a0a0a",
                  }}
                >
                  {t}
                </h3>
                <p className="text-[13px] leading-relaxed font-medium" style={{ color: "#1a1a1a" }}>
                  {d}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}
