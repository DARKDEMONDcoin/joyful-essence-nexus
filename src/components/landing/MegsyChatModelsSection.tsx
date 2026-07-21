import { m as motion } from "framer-motion";
import { useLandingContent } from "@/lib/landing/LandingContentContext";
import {
  Image as ImageIcon,
  Film,
  Wand2,
  Sparkles,
  Eraser,
  ScanFace,
  Sun,
  Palette,
  Scissors,
  ArrowUpRightSquare,
  Brush,
  Camera,
  Video,
  Clapperboard,
  Zap,
} from "lucide-react";

type Pill = {
  title: string;
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
};

const ROW_ONE: Pill[] = [
  { title: "Nano Banana", Icon: ImageIcon, color: "#f5d90a" },
  { title: "Nano Banana Pro", Icon: Camera, color: "#f5d90a" },
  { title: "Nano Banana 2", Icon: Sparkles, color: "#f5d90a" },
  { title: "Flux Schnell", Icon: Zap, color: "#22d36b" },
  { title: "Flux Pro", Icon: Brush, color: "#22d36b" },
  { title: "GPT-Image 2", Icon: Wand2, color: "#7dd3fc" },
  { title: "Gemini 3 Pro Image", Icon: ImageIcon, color: "#7dd3fc" },
  { title: "Face Swap", Icon: ScanFace, color: "#e879c1" },
  { title: "Background Remove", Icon: Eraser, color: "#e879c1" },
  { title: "Relight", Icon: Sun, color: "#e879c1" },
];

const ROW_TWO: Pill[] = [
  { title: "Veo 3.1", Icon: Film, color: "#ff6b5e" },
  { title: "Kling 3.0 Pro", Icon: Clapperboard, color: "#ff6b5e" },
  { title: "Runway Gen-4", Icon: Video, color: "#ff6b5e" },
  { title: "Hailuo 02", Icon: Film, color: "#ff6b5e" },
  { title: "Sora", Icon: Clapperboard, color: "#c4b5fd" },
  { title: "Hunyuan", Icon: Video, color: "#c4b5fd" },
  { title: "Upscale 4K", Icon: ArrowUpRightSquare, color: "#22d36b" },
  { title: "Style Transfer", Icon: Palette, color: "#22d36b" },
  { title: "Video Inpaint", Icon: Scissors, color: "#7dd3fc" },
  { title: "Lip Sync", Icon: Sparkles, color: "#7dd3fc" },
];

const MarqueeRow = ({
  items,
  direction = "left",
  duration = 40,
}: {
  items: Pill[];
  direction?: "left" | "right";
  duration?: number;
}) => {
  const track = [...items, ...items];
  const from = direction === "left" ? "0%" : "-50%";
  const to = direction === "left" ? "-50%" : "0%";

  return (
    <div className="relative w-full overflow-hidden">
      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 md:w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 md:w-24 bg-gradient-to-l from-background to-transparent" />

      <motion.div
        className="flex gap-3 md:gap-4 w-max py-1"
        animate={{ x: [from, to] }}
        transition={{ duration, ease: "linear", repeat: Infinity }}
      >
        {track.map((p, i) => (
          <div
            key={`${p.title}-${i}`}
            className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm px-4 py-2.5 md:px-5 md:py-3 shrink-0 transition-colors hover:border-white/25"
          >
            <span
              className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full shrink-0"
              style={{ backgroundColor: `${p.color}22`, color: p.color }}
            >
              <p.Icon className="h-4 w-4 md:h-[18px] md:w-[18px]" />
            </span>
            <span className="text-sm md:text-base font-medium text-foreground whitespace-nowrap">
              {p.title}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const MegsyChatModelsSection = () => {
  const { content } = useLandingContent();
  const { chatModels: c } = content;

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute left-1/2 top-1/2 -z-10 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/8 blur-[180px]" />

      <div className="mx-auto max-w-7xl px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center font-display text-[12vw] font-black uppercase leading-[0.9] tracking-tighter text-foreground md:text-[7vw]"
        >
          {c.title}{" "}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            {c.titleHighlight}
          </span>
        </motion.h2>

        <p className="mx-auto mt-5 max-w-2xl text-center text-base text-foreground/50 md:text-lg">
          {c.subtitle}
        </p>
      </div>

      {/* Two animated strips */}
      <div className="mt-12 md:mt-16 flex flex-col gap-4 md:gap-5">
        <MarqueeRow items={ROW_ONE} direction="left" duration={48} />
        <MarqueeRow items={ROW_TWO} direction="right" duration={54} />
      </div>
    </section>
  );
};

export default MegsyChatModelsSection;
