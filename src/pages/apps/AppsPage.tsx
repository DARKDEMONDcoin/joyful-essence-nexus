import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { m as motion } from "framer-motion";
import { translateExactText, useUserLang } from "@/lib/authI18n";
import MobilePushShell from "@/components/layout/MobilePushShell";
import { MobileSidebarButton } from "@/components/shared/MobileSidebarButton";

import heroChat from "@/assets/apps/hero/chat.webp";
import heroImages from "@/assets/apps/hero/images.webp";
import heroVideos from "@/assets/apps/hero/videos.webp";
import heroSlides from "@/assets/apps/hero/slides.webp";
import heroDocs from "@/assets/apps/hero/docs.webp";
import heroResearch from "@/assets/apps/hero/research.webp";
import heroLearning from "@/assets/apps/hero/learning.jpg";
import heroCoder from "@/assets/apps/hero/coder.jpg";
import heroMusic from "@/assets/apps/hero/music.jpg";

type AppLaunch =
  | { kind: "mode"; mode: string }
  | { kind: "agent"; agent: string };

interface AppItem {
  id: string;
  name: string;
  desc: string;
  cta: string;
  image: string;
  launch: AppLaunch;
}

const APPS: AppItem[] = [
  { id: "chat", name: "Chat", desc: "Talk to any AI in one place. Ask the world's best models anything and get instant answers.", cta: "Start chatting", image: heroChat, launch: { kind: "mode", mode: "normal" } },
  { id: "images", name: "Create Images", desc: "Generate stunning, high-detail AI images with the world's best models.", cta: "Start creating", image: heroImages, launch: { kind: "mode", mode: "images" } },
  { id: "videos", name: "Create Videos", desc: "Turn a single prompt into a cinematic AI video in seconds.", cta: "Create a video", image: heroVideos, launch: { kind: "mode", mode: "video" } },
  
  { id: "slides", name: "Slides", desc: "Design beautiful, story-driven presentations in one click.", cta: "Build a deck", image: heroSlides, launch: { kind: "mode", mode: "slides" } },
  { id: "docs", name: "Docs", desc: "Draft polished documents, reports and templates that ship-ready.", cta: "Write a doc", image: heroDocs, launch: { kind: "agent", agent: "docs" } },
  { id: "deep-research", name: "Deep Research", desc: "In-depth web research with real citations and analyst-grade reports.", cta: "Start research", image: heroResearch, launch: { kind: "mode", mode: "deep-research" } },
  { id: "learning", name: "Learning", desc: "Your personal AI tutor for any topic, explained step by step.", cta: "Start learning", image: heroLearning, launch: { kind: "mode", mode: "learning" } },
  { id: "coder", name: "Coder", desc: "Ship code faster with an AI pair programmer that reads your repo.", cta: "Open Coder", image: heroCoder, launch: { kind: "mode", mode: "code" } },
];

export default function AppsPage() {
  const navigate = useNavigate();
  const lang = useUserLang();
  const tx = (s: string) => translateExactText(s, lang);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const apps = useMemo(() => APPS, []);

  const launch = (app: AppItem) => {
    try {
      const payload = JSON.stringify({ ...app.launch, at: Date.now() });
      sessionStorage.setItem("megsy_launch_app", payload);
    } catch {
      /* ignore */
    }
    navigate("/");
  };

  return (
    <MobilePushShell
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
      onNewChat={() => navigate("/")}
      currentMode="chat"
    >
      <div className="min-h-[100dvh] bg-background text-foreground">
        <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-foreground/10">
          <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-3 sm:px-6 safe-top">
            <MobileSidebarButton onClick={() => setSidebarOpen(true)} />
            <h1 className="text-[17px] font-bold tracking-tight" dir="auto">
              {tx("AI Tools")}
            </h1>
          </div>
        </header>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-24">
        <header className="mb-6 sm:mb-10 hidden md:block" dir="auto">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            {tx("AI Tools")}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-foreground/60 max-w-2xl">
            {tx("Your all-in-one creative space. Whatever you want to create, there's an AI-powered tool for it.")}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {apps.map((app, i) => {
            const displayName = tx(app.name);
            const displayDesc = tx(app.desc);
            const displayCta = tx(app.cta);
            return (
              <motion.article
                key={app.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3), type: "spring", stiffness: 320, damping: 28 }}
                className="group rounded-[28px] p-3 sm:p-4 border border-foreground/10 bg-foreground/[0.03] hover:border-foreground/20 transition-colors"
              >
                <div className="relative w-full overflow-hidden rounded-[22px] bg-foreground/5">
                  <img
                    src={app.image}
                    alt={displayName}
                    width={1536}
                    height={896}
                    loading="lazy"
                    className="w-full h-auto aspect-[16/10] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="mt-4 px-1 sm:px-2" dir="auto">
                  <h3 className="text-lg sm:text-2xl font-black leading-tight">
                    {displayName}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] sm:text-[15px] text-foreground/60 leading-snug">
                    {displayDesc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => launch(app)}
                  className="mt-4 w-full h-12 rounded-full bg-foreground text-background font-bold text-[15px] sm:text-base transition active:scale-[0.98] hover:opacity-90"
                >
                  {displayCta}
                </button>
              </motion.article>
            );
          })}
        </div>
      </div>
      </div>
    </MobilePushShell>
  );
}