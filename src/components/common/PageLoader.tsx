import { t as uiT } from "@/lib/authI18n";

const PageLoader = () => {
  return (
    <div
      className="relative h-dvh w-full overflow-hidden bg-background text-foreground"
      aria-label={uiT("loadingMegsy")}
    >
      <div className="pointer-events-none absolute left-4 right-4 top-4 z-10 flex items-center justify-between">
        <div className="h-12 w-12 rounded-full border border-foreground/20 bg-foreground/[0.06]" />
        <div className="h-12 w-12 rounded-full border border-foreground/20 bg-foreground/[0.06]" />
      </div>

      <div className="flex h-full flex-col items-center justify-end px-4 pb-5 pt-24">
        <div className="flex flex-1 flex-col items-center justify-center gap-7">
          <div className="loader" />
          <div className="h-8 w-56 max-w-[70vw] rounded-full bg-foreground/[0.08] shimmer" />
        </div>

        <div className="mb-3 flex w-full gap-3 overflow-hidden">
          <div className="h-[52px] w-[120px] shrink-0 rounded-full border border-foreground/15 bg-foreground/[0.04]" />
          <div className="h-[52px] w-[122px] shrink-0 rounded-full border border-foreground/15 bg-foreground/[0.04]" />
          <div className="h-[52px] w-[190px] shrink-0 rounded-full border border-foreground/15 bg-foreground/[0.04]" />
        </div>

        <div className="w-full rounded-[28px] border border-foreground/10 bg-card/70 p-6 shadow-2xl">
          <div className="h-7 w-[86%] rounded-full bg-foreground/[0.08] shimmer" />
          <div className="mt-9 flex items-center gap-5">
            <div className="h-7 w-7 rounded-full bg-foreground/[0.1]" />
            <div className="h-7 w-24 rounded-full bg-foreground/[0.08] shimmer" />
          </div>
        </div>
      </div>
      <style>{`
        .loader {
          display: block;
          width: 78px;
          height: 78px;
          position: relative;
        }
        .loader::before, .loader::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: 0;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: currentColor;
          transform: translate(-50%, -100%) scale(0);
          animation: push_401 2s infinite linear;
        }
        .loader::after {
          animation-delay: 1s;
        }
        @keyframes push_401 {
          0%, 50% {
            transform: translate(-50%, 0%) scale(1);
          }
          100% {
            transform: translate(-50%, -100%) scale(0);
          }
        }
        .shimmer {
          background-image: linear-gradient(90deg, var(--overlay-white-06), rgba(255,255,255,0.16), var(--overlay-white-06));
          background-size: 220% 100%;
          animation: loader_shimmer 1.25s ease-in-out infinite;
        }
        @keyframes loader_shimmer {
          0% { background-position: 120% 0; }
          100% { background-position: -120% 0; }
        }
      `}</style>
    </div>
  );
};

export default PageLoader;
