import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LazyVideoProps {
  src: string;
  className?: string;
  poster?: string;
}

const LazyVideo = ({ src, className = "", poster }: LazyVideoProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [muted, setMuted] = useState(true);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.matchMedia("(max-width: 767px)").matches : false,
  );
  const [saveData, setSaveData] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    const rmHandler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    rm.addEventListener("change", rmHandler);
    const conn = (navigator as any).connection;
    if (conn) {
      const update = () => {
        setSaveData(
          !!conn.saveData ||
            conn.effectiveType === "slow-2g" ||
            conn.effectiveType === "2g" ||
            conn.effectiveType === "3g",
        );
      };
      update();
      conn.addEventListener?.("change", update);
      return () => {
        mq.removeEventListener("change", handler);
        rm.removeEventListener("change", rmHandler);
        conn.removeEventListener?.("change", update);
      };
    }
    return () => {
      mq.removeEventListener("change", handler);
      rm.removeEventListener("change", rmHandler);
    };
  }, []);


  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "150px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    v.muted = next;
    setMuted(next);
    if (!next) {
      v.play().catch(() => {});
    }
  };

  const showPosterOnly = (isMobile || saveData || reducedMotion) && !!poster;

  return (
    <div ref={ref} className={`relative ${className}`}>
      {showPosterOnly ? (
        <img
          src={poster}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : inView ? (
        <>
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            autoPlay
            loop
            muted={muted}
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute video" : "Mute video"}
            className="absolute bottom-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80"
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </>
      ) : poster ? (
        <img
          src={poster}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <Skeleton className="h-full w-full" />
      )}
    </div>
  );
};

export default LazyVideo;
