import { useEffect, useState } from "react";
import { Sparkles, Zap, BookOpen, Briefcase, Smile, Check } from "lucide-react";
import {
  readResponseStyle,
  setResponseStyle,
  STYLE_LABELS_AR,
  type ResponseStyle,
} from "@/lib/responseStyle";
import {
  glassModelMenu,
  glassModelMenuStyle,
} from "@/components/model-picker/glassModelMenuStyles";

/**
 * Compact toggle showing the current reply style and letting the user swap
 * it in one click. Lives near the composer. The choice is persisted per user
 * in localStorage and read by the send pipeline via `styleHint()`.
 */
const ICONS: Record<ResponseStyle, React.ComponentType<{ className?: string }>> = {
  auto: Sparkles,
  concise: Zap,
  detailed: BookOpen,
  formal: Briefcase,
  friendly: Smile,
};

const ORDER: ResponseStyle[] = ["auto", "concise", "detailed", "formal", "friendly"];

export function ResponseStyleToggle({ className = "" }: { className?: string }) {
  const [current, setCurrent] = useState<ResponseStyle>("auto");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setCurrent(readResponseStyle());
    const onChange = (e: Event) => {
      const v = (e as CustomEvent<ResponseStyle>).detail;
      if (v) setCurrent(v);
    };
    window.addEventListener("megsy:response-style", onChange);
    return () => window.removeEventListener("megsy:response-style", onChange);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-response-style]")) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const Icon = ICONS[current];

  return (
    <div data-response-style className={"relative inline-block " + className}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-card/60 hover:bg-accent hover:text-accent-foreground active:scale-95 px-2.5 py-1 text-xs text-foreground/85 hover:text-foreground transition-all backdrop-blur-md"
        title="أسلوب الرد"
        aria-label={`أسلوب الرد: ${STYLE_LABELS_AR[current]}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Icon className="h-3.5 w-3.5" />
        <span>{STYLE_LABELS_AR[current]}</span>
      </button>
      {open && (
        <div
          role="listbox"
          style={glassModelMenuStyle}
          className={`${glassModelMenu.panel} absolute bottom-full mb-2 right-0 min-w-[180px] animate-in fade-in slide-in-from-bottom-2 duration-150`}
        >
          {ORDER.map((s) => {
            const I = ICONS[s];
            const selected = s === current;
            return (
              <button
                key={s}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  setResponseStyle(s);
                  setCurrent(s);
                  setOpen(false);
                }}
                className={glassModelMenu.item(selected, "text-xs text-right")}
              >
                <I className="h-4 w-4 shrink-0 opacity-80" />
                <span className="flex-1">{STYLE_LABELS_AR[s]}</span>
                {selected && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
