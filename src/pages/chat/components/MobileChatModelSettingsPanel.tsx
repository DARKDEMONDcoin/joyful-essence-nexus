import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { m as motion } from "framer-motion";
import {
  readChatModelPreferences,
  setChatModelPreferences,
  type ChatModelPreferences,
} from "@/lib/chatModelPreferences";
import { getEffortPresetsForModel } from "../chatConstants";

interface Props {
  /** Currently active model id — resolves the per-model effort presets. */
  activeModelId?: string | null;
}

export function MobileChatModelSettingsPanel({ activeModelId }: Props) {
  const [preferences, setPreferences] = useState<ChatModelPreferences>({ effort: "medium", deepThinking: false });
  useEffect(() => setPreferences(readChatModelPreferences()), []);
  const update = (next: ChatModelPreferences) => {
    setPreferences(next);
    setChatModelPreferences(next);
  };

  const presets = getEffortPresetsForModel(activeModelId);
  // Ensure the stored effort is valid for this model; fall back to the middle option.
  const activeEffort = presets.find((p) => p.id === preferences.effort)?.id ?? presets[Math.floor(presets.length / 2)].id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="space-y-3"
    >
      {/* Effort card — no header, no icons, no helper text */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        {presets.map(({ id, label, description }) => {
          const active = activeEffort === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => update({ ...preferences, effort: id })}
              className={`flex w-full items-center gap-3 px-4 py-3.5 text-start border-t border-white/[0.05] first:border-t-0 transition-colors ${active ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"}`}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-foreground">{label}</span>
                <span className="mt-0.5 block text-[12px] text-foreground/50">{description}</span>
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

      {/* Deep thinking — inline row, matches Effort card style */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        <button
          type="button"
          role="switch"
          aria-checked={preferences.deepThinking}
          onClick={() => update({ ...preferences, deepThinking: !preferences.deepThinking })}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-start"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold text-foreground">Deep thinking</span>
            <span className="mt-0.5 block text-[12px] text-foreground/50">Plan step-by-step before answering</span>
          </span>
          <span
            aria-hidden="true"
            className="relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-300 ease-out"
            style={{
              backgroundColor: preferences.deepThinking ? "var(--megsy-blue)" : "rgba(120,120,128,0.32)",
            }}
          >
            <span
              className="absolute top-1/2 left-0 h-[27px] w-[27px] rounded-full bg-white transition-transform duration-300 ease-out"
              style={{
                transform: `translate(${preferences.deepThinking ? "22px" : "2px"}, -50%)`,
                boxShadow: "0 3px 8px rgba(0,0,0,0.15), 0 3px 1px rgba(0,0,0,0.06)",
              }}
            />
          </span>
        </button>
      </div>
    </motion.div>
  );
}
