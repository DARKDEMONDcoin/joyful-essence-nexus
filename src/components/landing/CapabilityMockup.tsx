import { useEffect, useState } from "react";
import genImg1 from "@/assets/gen-img-1.jpg";
import genImg2 from "@/assets/gen-img-2.jpg";
import genImg3 from "@/assets/gen-img-3.jpg";
import genImg4 from "@/assets/gen-img-4.jpg";
import genImg6 from "@/assets/gen-img-6.jpg";
import genVideoFrame from "@/assets/gen-video-frame.jpg";
import capVideoReal from "@/assets/cap-video-user.mov.asset.json";

const C = {
  card: "#ffffff",
  ink: "#0f0f10",
  mute: "#6b7280",
  mute2: "#9ca3af",
  line: "#ececea",
  soft: "#f4f4f2",
  page: "#fafaf9",
};

const Frame = ({ children, tone = "light", pad = true }: { children: React.ReactNode; tone?: "light" | "dark"; pad?: boolean }) => (
  <div
    className={`rounded-[18px] overflow-hidden ${pad ? "p-5" : ""}`}
    style={{
      background: tone === "dark" ? C.ink : C.page,
      border: `1px solid ${tone === "dark" ? "rgba(255,255,255,.08)" : C.line}`,
      color: tone === "dark" ? "#fff" : C.ink,
      minHeight: 240,
    }}
  >
    {children}
  </div>
);

/* ---------- 1. Chat ---------- */
const ChatMock = () => {
  const [dots, setDots] = useState(1);
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d % 3) + 1), 450);
    return () => clearInterval(t);
  }, []);
  const models = ["GPT-5.5", "Gemini 3", "Claude 4.5", "Grok 4"];
  return (
    <Frame>
      <div className="flex items-center justify-between mb-4">
        <div className="text-[11px] tracking-wide uppercase" style={{ color: C.mute2 }}>Conversation</div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#22c55e" }} />
          <span className="text-[11px]" style={{ color: C.mute }}>Live</span>
        </div>
      </div>
      <div className="space-y-2.5">
        <div className="ml-auto max-w-[78%] rounded-[16px] rounded-tr-[6px] px-3.5 py-2 text-[13px] leading-snug" style={{ background: C.ink, color: "#fff" }}>
          Compare the top 3 EV batteries for 2026.
        </div>
        <div className="max-w-[85%] rounded-[16px] rounded-tl-[6px] px-3.5 py-2 text-[13px] leading-snug" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
          CATL's Shenxing leads on charge speed, BYD Blade wins on safety and cost, while QuantumScape's solid-state prototype…
        </div>
        <div className="max-w-[30%] rounded-[16px] rounded-tl-[6px] px-3.5 py-2.5 flex items-center gap-1" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
          {[1, 2, 3].map((n) => (
            <span key={n} className="w-1.5 h-1.5 rounded-full transition-opacity" style={{ background: C.mute2, opacity: dots >= n ? 1 : 0.25 }} />
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {models.map((m, i) => (
          <span key={m} className="px-2.5 py-1 rounded-full text-[11px]" style={{ background: i === 0 ? C.ink : "#fff", color: i === 0 ? "#fff" : C.ink, border: `1px solid ${i === 0 ? C.ink : C.line}` }}>{m}</span>
        ))}
      </div>
    </Frame>
  );
};

/* ---------- 2. Images ---------- */
const ImagesMock = () => {
  const imgs = [
    { src: genImg1, label: "Neon coastline" },
    { src: genImg2, label: "Editorial portrait" },
    { src: genImg3, label: "Product · perfume" },
    { src: genImg4, label: "Aerial landscape" },
    { src: genImg6, label: "Architectural" },
  ];
  return (
    <Frame>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[13px] font-medium">Latest generations</div>
        <div className="text-[11px]" style={{ color: C.mute }}>4K · this session</div>
      </div>
      <div className="grid grid-cols-6 grid-rows-2 gap-1.5" style={{ height: 200 }}>
        <img src={imgs[0].src} alt={imgs[0].label} loading="lazy" className="col-span-4 row-span-2 w-full h-full object-cover rounded-[10px]" />
        <img src={imgs[1].src} alt={imgs[1].label} loading="lazy" className="col-span-2 row-span-1 w-full h-full object-cover rounded-[10px]" />
        <img src={imgs[2].src} alt={imgs[2].label} loading="lazy" className="col-span-2 row-span-1 w-full h-full object-cover rounded-[10px]" />
      </div>
      <div className="grid grid-cols-2 gap-1.5 mt-1.5">
        <img src={imgs[3].src} alt={imgs[3].label} loading="lazy" className="w-full h-20 object-cover rounded-[10px]" />
        <img src={imgs[4].src} alt={imgs[4].label} loading="lazy" className="w-full h-20 object-cover rounded-[10px]" />
      </div>
    </Frame>
  );
};

/* ---------- 3. Video ---------- */
const VideoMock = () => (
  <Frame tone="dark" pad={false}>
    <div className="p-4 pb-3 flex items-center justify-between">
      <div className="text-[12px]" style={{ color: "rgba(255,255,255,.6)" }}>Veo 3.1 · 5s · 1080p</div>
      <div className="text-[11px]" style={{ color: "rgba(255,255,255,.4)" }}>Just now</div>
    </div>
    <div className="relative" style={{ aspectRatio: "16/9", background: "#000" }}>
      <video
        src={capVideoReal.url}
        poster={genVideoFrame}
        className="w-full h-full object-cover block"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
    </div>
    <div className="p-4 pt-3 text-[11px]" style={{ color: "rgba(255,255,255,.55)" }}>
      "Cinematic wave crashing at sunset, film grain, dramatic light."
    </div>
  </Frame>
);

/* ---------- 4. Slides ---------- */
const SlidesMock = () => (
  <Frame>
    <div className="flex items-center justify-between mb-3">
      <div className="text-[13px] font-medium">Q1 Product Launch</div>
      <div className="text-[11px]" style={{ color: C.mute }}>12 slides</div>
    </div>
    <div className="grid grid-cols-3 gap-2">
      {[
        { t: "The problem", sub: "Cover" },
        { t: "72% growth", sub: "Chart" },
        { t: "What's next", sub: "Roadmap" },
      ].map((s, i) => (
        <div key={i} className="rounded-[10px] p-2.5 aspect-[4/3] flex flex-col justify-between" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
          <div className="text-[9px] font-semibold leading-tight">{s.t}</div>
          {i === 1 ? (
            <div className="flex items-end gap-0.5 h-6">
              {[3, 5, 4, 7, 6, 9, 8].map((h, j) => (
                <div key={j} className="flex-1 rounded-sm" style={{ height: `${h * 10}%`, background: C.ink }} />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="h-[3px] rounded" style={{ background: C.soft }} />
              <div className="h-[3px] rounded w-4/5" style={{ background: C.soft }} />
              <div className="h-[3px] rounded w-3/5" style={{ background: C.soft }} />
            </div>
          )}
          <div className="text-[8px]" style={{ color: C.mute2 }}>0{i + 1} · {s.sub}</div>
        </div>
      ))}
    </div>
    <div className="mt-3 text-[11px]" style={{ color: C.mute }}>Export · PPTX · PDF · Google Slides</div>
  </Frame>
);

/* ---------- 5. Research ---------- */
const ResearchMock = () => (
  <Frame>
    <div className="text-[11px] tracking-wide uppercase mb-2" style={{ color: C.mute2 }}>Research report</div>
    <div className="text-[15px] font-semibold leading-tight mb-3">EV battery outlook — 2026</div>
    <div className="space-y-1.5 mb-4">
      <div className="h-[6px] rounded-full" style={{ background: C.soft }} />
      <div className="h-[6px] rounded-full w-[92%]" style={{ background: C.soft }} />
      <div className="h-[6px] rounded-full w-[78%]" style={{ background: C.soft }} />
      <div className="h-[6px] rounded-full w-[85%]" style={{ background: C.soft }} />
    </div>
    <div className="text-[11px] mb-2" style={{ color: C.mute }}>Sources</div>
    <div className="space-y-1.5">
      {[
        { n: "1", d: "IEA — Global EV Outlook" },
        { n: "2", d: "Bloomberg NEF · battery pack prices" },
        { n: "3", d: "McKinsey — Mobility 2030" },
      ].map((s) => (
        <div key={s.n} className="flex items-center gap-2.5 text-[12px]" style={{ color: C.ink }}>
          <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-medium" style={{ background: C.ink, color: "#fff" }}>{s.n}</span>
          <span>{s.d}</span>
        </div>
      ))}
    </div>
  </Frame>
);

/* ---------- 6. Apps ---------- */
const AppsMock = () => (
  <Frame>
    <div className="rounded-[10px] px-3 py-2.5 mb-3 text-[12px]" style={{ background: "#fff", border: `1px solid ${C.line}`, color: C.mute }}>
      "Build me a tip calculator with a clean dark UI"
    </div>
    <div className="rounded-[14px] p-4" style={{ background: C.ink, color: "#fff" }}>
      <div className="text-[10px] mb-1" style={{ color: "rgba(255,255,255,.4)" }}>tipcalc.app</div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-[11px]" style={{ color: "rgba(255,255,255,.5)" }}>Total per person</span>
      </div>
      <div className="text-[28px] font-semibold tracking-tight mb-3">$14.40</div>
      <div className="grid grid-cols-3 gap-1.5">
        {["15%", "18%", "20%"].map((t, i) => (
          <div key={t} className="text-center py-2 rounded-[8px] text-[12px] font-medium" style={{ background: i === 1 ? "#fff" : "rgba(255,255,255,.08)", color: i === 1 ? C.ink : "#fff" }}>{t}</div>
        ))}
      </div>
    </div>
    <div className="mt-3 text-[11px]" style={{ color: C.mute }}>Deployed · custom domain · GitHub synced</div>
  </Frame>
);

/* ---------- 7. Agents ---------- */
const AgentsMock = () => {
  const [pulse, setPulse] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setPulse((p) => !p), 900);
    return () => clearInterval(t);
  }, []);
  const rows = [
    { name: "Weekly sales report", meta: "Every Monday 9:00", status: "done", detail: "Sent to 4 recipients" },
    { name: "Monitor competitor pricing", meta: "Hourly", status: "run", detail: "3 changes today" },
    { name: "Draft LinkedIn posts", meta: "Daily 07:00", status: "run", detail: "Preparing 2 drafts" },
  ];
  return (
    <Frame tone="dark">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[13px] font-medium">Background agents</div>
        <div className="text-[11px]" style={{ color: "rgba(255,255,255,.5)" }}>3 active</div>
      </div>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.name} className="rounded-[10px] px-3 py-2.5" style={{ background: "rgba(255,255,255,.05)" }}>
            <div className="flex items-center justify-between">
              <span className="text-[12.5px]">{r.name}</span>
              {r.status === "done" ? (
                <span className="text-[10px]" style={{ color: "#4ade80" }}>Complete</span>
              ) : (
                <span className="text-[10px] flex items-center gap-1" style={{ color: "#60a5fa" }}>
                  <span className="w-1.5 h-1.5 rounded-full transition-opacity" style={{ background: "#60a5fa", opacity: pulse ? 1 : 0.3 }} />
                  Running
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-[10px] mt-1" style={{ color: "rgba(255,255,255,.4)" }}>
              <span>{r.meta}</span>
              <span>{r.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
};

/* ---------- 8. Credit ---------- */
const CreditMock = () => (
  <Frame>
    <div className="text-[11px] tracking-wide uppercase mb-2" style={{ color: C.mute2 }}>Balance</div>
    <div className="flex items-baseline gap-1.5 mb-1">
      <span className="text-[38px] font-semibold tracking-tight leading-none">2,450</span>
      <span className="text-[14px] font-medium" style={{ color: C.mute }}>MC</span>
    </div>
    <div className="text-[12px] mb-4" style={{ color: C.mute }}>One credit. Every tool.</div>
    <div className="space-y-2">
      {[
        { l: "Chat", v: "unlimited", w: "100%", tone: "ink" },
        { l: "Image", v: "1 MC / image", w: "72%", tone: "mid" },
        { l: "Video", v: "40 MC / clip", w: "44%", tone: "mid" },
        { l: "Slides", v: "5 MC / deck", w: "62%", tone: "mid" },
      ].map((r) => (
        <div key={r.l}>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span style={{ color: C.ink }}>{r.l}</span>
            <span style={{ color: C.mute }}>{r.v}</span>
          </div>
          <div className="h-[4px] rounded-full" style={{ background: C.soft }}>
            <div className="h-full rounded-full" style={{ width: r.w, background: r.tone === "ink" ? C.ink : "#374151" }} />
          </div>
        </div>
      ))}
    </div>
  </Frame>
);

/* ---------- 9. Teams ---------- */
const TeamsMock = () => (
  <Frame>
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="text-[13px] font-medium">Acme Studio</div>
        <div className="text-[11px]" style={{ color: C.mute }}>12 members · Business plan</div>
      </div>
      <div className="flex -space-x-1.5">
        {[
          { c: "#f97316", i: "A" },
          { c: "#3b82f6", i: "M" },
          { c: "#10b981", i: "S" },
          { c: "#ec4899", i: "L" },
        ].map((a) => (
          <div key={a.i} className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-semibold text-white" style={{ background: a.c, borderColor: "#fff" }}>{a.i}</div>
        ))}
        <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-medium" style={{ background: C.soft, borderColor: "#fff", color: C.ink }}>+8</div>
      </div>
    </div>
    <div className="space-y-1.5">
      {[
        { p: "Q1 launch deck", who: "Maya · edited 2m ago" },
        { p: "Brand image library", who: "Sam · 48 assets" },
        { p: "Weekly research digest", who: "Auto · updated hourly" },
      ].map((r) => (
        <div key={r.p} className="rounded-[10px] px-3 py-2.5" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
          <div className="text-[12.5px] font-medium">{r.p}</div>
          <div className="text-[10.5px]" style={{ color: C.mute }}>{r.who}</div>
        </div>
      ))}
    </div>
  </Frame>
);

/* ---------- 10. Queue ---------- */
const QueueMock = () => {
  const [t, setT] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setT((v) => (v >= 100 ? 0 : v + 3)), 90);
    return () => clearInterval(iv);
  }, []);
  return (
    <Frame tone="dark">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[13px] font-medium">Generation queue</div>
        <div className="text-[11px]" style={{ color: "rgba(255,255,255,.5)" }}>Priority · Elite</div>
      </div>
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span style={{ color: "rgba(255,255,255,.55)" }}>Standard</span>
            <span style={{ color: "rgba(255,255,255,.4)" }}>~45s</span>
          </div>
          <div className="h-[6px] rounded-full" style={{ background: "rgba(255,255,255,.08)" }}>
            <div className="h-full rounded-full" style={{ width: `${Math.min(t * 0.33, 33)}%`, background: "rgba(255,255,255,.35)" }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span style={{ color: "#fff" }}>Elite · Business</span>
            <span style={{ color: "#fff" }}>~12s</span>
          </div>
          <div className="h-[6px] rounded-full" style={{ background: "rgba(255,255,255,.08)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${t}%`, background: "#fff" }} />
          </div>
        </div>
      </div>
      <div className="mt-5 pt-4 flex items-center justify-between text-[11px]" style={{ borderTop: "1px solid rgba(255,255,255,.08)", color: "rgba(255,255,255,.5)" }}>
        <span>3× faster</span>
        <span>99.9% SLA</span>
        <span>Dedicated CSM</span>
      </div>
    </Frame>
  );
};

export const CapabilityMockup = ({ kind }: { kind: string; accent?: string }) => {
  switch (kind) {
    case "chat": return <ChatMock />;
    case "images": return <ImagesMock />;
    case "video": return <VideoMock />;
    case "slides": return <SlidesMock />;
    case "research": return <ResearchMock />;
    case "apps": return <AppsMock />;
    case "agents": return <AgentsMock />;
    case "credit": return <CreditMock />;
    case "teams": return <TeamsMock />;
    case "queue": return <QueueMock />;
    default: return null;
  }
};
