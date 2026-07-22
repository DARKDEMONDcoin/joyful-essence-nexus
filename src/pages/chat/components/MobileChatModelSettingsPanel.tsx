import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import {
  readChatModelPreferences,
  setChatModelPreferences,
  type ChatModelPreferences,
  type ModelEffort,
} from "@/lib/chatModelPreferences";

const EFFORTS: Array<{
  id: ModelEffort;
  label: string;
  description: string;
  badge?: string;
  icon: typeof Rabbit;
  routedTo: string;
}> = [
  { id: "low", label: "Low", description: "Quick replies to simple questions", icon: Rabbit, routedTo: "Megsy 3.9" },
  { id: "medium", label: "Medium", description: "Light, everyday tasks", badge: "Default", icon: Scale, routedTo: "Megsy 3.9" },
  { id: "high", label: "High", description: "Balanced for demanding work", icon: Gauge, routedTo: "GLM 5.3" },
  { id: "extra", label: "Extra", description: "Complex, detailed work", icon: Flame, routedTo: "Claude Sonnet 5" },
  { id: "max", label: "Max", description: "Hardest problems. Takes longest.", icon: Rocket, routedTo: "Claude Opus 4.8" },
];

export function MobileChatModelSettingsPanel() {
  const [preferences, setPreferences] = useState<ChatModelPreferences>({ effort: "medium", deepThinking: false });
  useEffect(() => setPreferences(readChatModelPreferences()), []);
  const update = (next: ChatModelPreferences) => {
    setPreferences(next);
    setChatModelPreferences(next);
  };

  return (
    <div className="space-y-4">
      {/* Effort card */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        <div className="px-4 pt-3 pb-1.5 text-[11px] uppercase tracking-[0.12em] font-semibold text-foreground/45">
          Model strength
        </div>
        {EFFORTS.map(({ id, label, description, badge, icon: Icon, routedTo }) => {
          const active = preferences.effort === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => update({ ...preferences, effort: id })}
              className={`flex w-full items-center gap-3 px-4 py-3 text-start border-t border-white/[0.05] transition-colors ${active ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"}`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05]">
                <Icon className="h-4 w-4 text-foreground/85" strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
                  {label}
                  {badge ? (
                    <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[9.5px] tracking-wide text-foreground/60">
                      {badge}
                    </span>
                  ) : null}
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-foreground/50">
                  <span className="truncate">{description}</span>
                  <span className="text-foreground/30">·</span>
                  <span className="truncate text-foreground/60">{routedTo}</span>
                </span>
              </span>
              {active ? (
                <Check className="h-5 w-5 shrink-0" strokeWidth={2.75} style={{ color: "var(--megsy-blue)" }} />
              ) : (
                <span className="h-5 w-5 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Deep thinking card */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05]">
            <Brain className="h-4 w-4 text-foreground/85" strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold text-foreground">Deep thinking</span>
            <span className="mt-0.5 block text-[11.5px] text-foreground/55">
              Plan step-by-step before answering. Best for long tasks.
            </span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={preferences.deepThinking}
            aria-label="Deep thinking"
            onClick={() => update({ ...preferences, deepThinking: !preferences.deepThinking })}
            className="relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-300 ease-out"
            style={{
              backgroundColor: preferences.deepThinking ? "var(--megsy-blue)" : "rgba(120,120,128,0.32)",
            }}
          >
            <span
              className="absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white transition-transform duration-300 ease-out"
              style={{
                transform: preferences.deepThinking ? "translateX(22px)" : "translateX(2px)",
                boxShadow: "0 3px 8px rgba(0,0,0,0.15), 0 3px 1px rgba(0,0,0,0.06)",
              }}
            />
          </button>
        </div>
      </div>

      <p className="px-2 text-[11px] leading-relaxed text-foreground/45">
        Higher strength routes to a more capable model and may take longer. Deep thinking adds a planning pass before the reply.
      </p>
    </div>
  );
}
