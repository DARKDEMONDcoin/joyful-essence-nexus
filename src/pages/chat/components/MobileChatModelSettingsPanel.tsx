import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import {
  readChatModelPreferences,
  setChatModelPreferences,
  type ChatModelPreferences,
  type ModelEffort,
} from "@/lib/chatModelPreferences";

const EFFORTS: Array<{ id: ModelEffort; label: string; description: string; badge?: string }> = [
  { id: "low", label: "Low", description: "Quick replies to simple questions" },
  { id: "medium", label: "Medium", description: "Light, everyday tasks", badge: "Default" },
  { id: "high", label: "High", description: "Balanced for demanding work" },
  { id: "extra", label: "Extra", description: "Complex, detailed work" },
  { id: "max", label: "Max", description: "The hardest problems. Takes longest." },
];

export function MobileChatModelSettingsPanel() {
  const [preferences, setPreferences] = useState<ChatModelPreferences>({ effort: "medium", deepThinking: false });
  useEffect(() => setPreferences(readChatModelPreferences()), []);
  const update = (next: ChatModelPreferences) => {
    setPreferences(next);
    setChatModelPreferences(next);
  };

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl bg-foreground/[0.045] px-4">
        {EFFORTS.map(({ id, label, description, badge }, index) => {
          const active = preferences.effort === id;
          return (
            <button key={id} type="button" onClick={() => update({ ...preferences, effort: id })} className={`flex w-full items-center gap-3 py-3 text-start ${index ? "border-t border-foreground/10" : ""}`}>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
                  {label}
                  {badge ? <span className="rounded-full bg-foreground/[0.08] px-2 py-0.5 text-[9px] text-foreground/60">{badge}</span> : null}
                </span>
                <span className="mt-0.5 block text-[11px] text-foreground/50">{description}</span>
              </span>
              {active ? <Check className="h-5 w-5 shrink-0 text-primary" strokeWidth={2.5} /> : null}
            </button>
          );
        })}
      </div>
      <p className="px-2 text-[11px] leading-relaxed text-foreground/50">Higher effort produces more thorough answers, but may take longer.</p>
      <div className="flex items-center gap-3 rounded-2xl bg-foreground/[0.045] px-4 py-3.5">
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold text-foreground">Deep thinking</span>
          <span className="mt-0.5 block text-[11px] text-foreground/50">For long and complex tasks</span>
        </span>
        <button type="button" role="switch" aria-checked={preferences.deepThinking} aria-label="Deep thinking" onClick={() => update({ ...preferences, deepThinking: !preferences.deepThinking })} className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${preferences.deepThinking ? "bg-primary" : "bg-foreground/15"}`}>
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-background shadow-sm transition-transform ${preferences.deepThinking ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>
    </div>
  );
}