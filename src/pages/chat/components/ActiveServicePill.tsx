import { memo } from "react";
import { X } from "lucide-react";
import type { AgentDef } from "@/lib/agentRegistry";

type ChipId =
  | "code"
  | "images"
  | "video"
  | "music"
  | "deep-research"
  | "slides"
  | "docs"
  | "learning";

const LABELS: Record<ChipId, string> = {
  code: "Coder Mode",
  images: "Images",
  video: "Videos",
  music: "Music",
  "deep-research": "Deep Research",
  slides: "Slides",
  docs: "Docs",
  learning: "Learning",
};

interface ActiveServicePillProps {
  chatMode: string;
  selectedAgent: AgentDef | null;
  onClear: () => void;
}

/**
 * Full-width active-service strip rendered inside the composer card.
 * Shows only the service name + close. No icon.
 */
function ActiveServicePillImpl({
  chatMode,
  selectedAgent,
  onClear,
}: ActiveServicePillProps) {
  const id: ChipId | null =
    selectedAgent?.id === "docs"
      ? "docs"
      : (LABELS[chatMode as ChipId] ? (chatMode as ChipId) : null);
  if (!id) return null;
  const label = LABELS[id];
  return (
    <div
      className="flex h-7 w-full items-center justify-between gap-2 px-2 text-[12px] font-semibold uppercase tracking-[0.08em]"
      style={{
        color: "var(--megsy-blue)",
        borderBottom: "1px solid hsl(var(--foreground) / 0.08)",
      }}
    >
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={onClear}
        aria-label={`Clear ${label}`}
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-white/10"
        style={{ color: "var(--megsy-blue)" }}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export const ActiveServicePill = memo(ActiveServicePillImpl);

export default ActiveServicePill;
