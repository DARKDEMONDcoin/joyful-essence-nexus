/** @doc Create a new custom skill with tools and a base model. */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUp, Sparkles } from "lucide-react";
import { SubShell, SubSection, SubCard } from "@/components/settings/SubShell";

const SUGGESTIONS = [
  "A no-nonsense legal advisor",
  "A senior code reviewer",
  "A YC pitch coach",
  "A TikTok hooks copywriter",
  "A growth-loop strategist",
  "A 5th grade math tutor",
];

export default function SkillsNewPage() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }, [value]);

  useEffect(() => {
    setTimeout(() => ref.current?.focus(), 80);
  }, []);

  const start = (text: string) => {
    const t = text.trim();
    if (!t) return;
    navigate("/settings/skills", { state: { seed: t } });
  };

  return (
    <SubShell
      title="New skill"
      subtitle="Describe the role, voice, and tools this expert should carry. Megsy will draft it in seconds."
      backTo="/settings/skills"
    >
      <SubSection
        title="Describe the expert"
        description="One or two sentences is enough. You can refine everything in the designer."
      >
        <SubCard flush>
          <div className="relative">
            <textarea
              ref={ref}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  (typeof window === "undefined" || window.innerWidth >= 768)
                ) {
                  e.preventDefault();
                  start(value);
                }
              }}
              rows={1}
              placeholder="A no-nonsense legal advisor who cites case law…"
              className="w-full resize-none bg-transparent outline-none text-[14.5px] leading-relaxed px-5 pt-4 pb-14 text-foreground placeholder:text-muted-foreground/60"
            />
            <button
              onClick={() => start(value)}
              disabled={!value.trim()}
              aria-label="Design skill"
              className="absolute right-3 bottom-3 h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center disabled:opacity-30 hover:opacity-90 transition"
            >
              <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </SubCard>
      </SubSection>

      <SubSection
        title="Inspiration"
        description="Tap one to jump into the designer with a starting brief."
      >
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => start(s)}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border border-border/70 bg-card/40 text-[12.5px] font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              <Sparkles className="w-3 h-3" /> {s}
            </button>
          ))}
        </div>
      </SubSection>
    </SubShell>
  );
}
