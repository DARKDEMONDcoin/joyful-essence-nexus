import { Check, Sparkles, Zap, BookOpen, Briefcase, Smile } from "lucide-react";
import { useEffect, useState } from "react";
import {
  readResponseStyle,
  setResponseStyle,
  STYLE_LABELS_AR,
  type ResponseStyle,
} from "@/lib/responseStyle";

const OPTIONS: Array<{ id: ResponseStyle; icon: typeof Sparkles; description: string }> = [
  { id: "auto", icon: Sparkles, description: "Adapts the answer to your request" },
  { id: "concise", icon: Zap, description: "Short, direct answers" },
  { id: "detailed", icon: BookOpen, description: "Thorough answers with examples" },
  { id: "formal", icon: Briefcase, description: "Professional, structured tone" },
  { id: "friendly", icon: Smile, description: "Warm, conversational tone" },
];

export function ChatModelSettingsPanel() {
  const [current, setCurrent] = useState<ResponseStyle>("auto");
  useEffect(() => setCurrent(readResponseStyle()), []);

  return (
    <div className="space-y-1">
      <div className="px-2 pb-2">
        <p className="text-[13px] font-semibold text-foreground">Response style</p>
        <p className="mt-0.5 text-[11px] text-foreground/50">Applied to chat and service responses</p>
      </div>
      {OPTIONS.map(({ id, icon: Icon, description }) => {
        const active = current === id;
        return <button key={id} type="button" onClick={() => { setResponseStyle(id); setCurrent(id); }} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-start transition-colors ${active ? "border-foreground/15 bg-foreground/[0.09]" : "border-transparent hover:bg-foreground/[0.05]"}`}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground/[0.07]"><Icon className="h-4 w-4 text-foreground/80" /></span>
          <span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold text-foreground">{STYLE_LABELS_AR[id]}</span><span className="block truncate text-[10.5px] text-foreground/50">{description}</span></span>
          {active ? <Check className="h-4 w-4 shrink-0 text-foreground" strokeWidth={2.5} /> : null}
        </button>;
      })}
    </div>
  );
}