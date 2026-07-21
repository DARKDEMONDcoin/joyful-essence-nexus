import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface Props {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}

export function HlsBackgroundVideo({ src, className, style }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: false });
      hls.loadSource(src);
      hls.attachMedia(video);
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      className={className}
      style={style}
    />
  );
}