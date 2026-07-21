/** @doc Appearance — Noir & Gold redesign. Accent color + composer key. */
import { useState, useCallback } from "react";
import { Check } from "lucide-react";
import ProfileGlassShell, {
  GlassSection,
  GlassCard,
} from "@/components/profile/ProfileGlassShell";
import { getSendMode, setSendMode, type SendMode } from "@/lib/composerKey";

const ACCENTS = [
  { hsl: "45 90% 55%", hex: "#c9a84c", name: "Gold" },
  { hsl: "262 60% 55%", hex: "#7c5cfc", name: "Violet" },
  { hsl: "210 80% 55%", hex: "#3b82f6", name: "Blue" },
  { hsl: "142 50% 50%", hex: "#22c55e", name: "Green" },
  { hsl: "330 70% 55%", hex: "#ec4899", name: "Pink" },
  { hsl: "25 90% 55%", hex: "#f97316", name: "Orange" },
  { hsl: "160 60% 45%", hex: "#14b8a6", name: "Teal" },
  { hsl: "0 70% 55%", hex: "#ef4444", name: "Red" },
  { hsl: "180 60% 45%", hex: "#06b6d4", name: "Cyan" },
  { hsl: "270 60% 55%", hex: "#8b5cf6", name: "Purple" },
  { hsl: "85 60% 45%", hex: "#84cc16", name: "Lime" },
  { hsl: "12 85% 58%", hex: "#f56042", name: "Coral" },
];

const CustomizationPage = () => {
  const [accent, setAccent] = useState(() => localStorage.getItem("accent") || "45 90% 55%");
  const [mode, setMode] = useState<SendMode>(() => getSendMode());

  const changeAccent = useCallback((hsl: string) => {
    document.documentElement.style.setProperty("--primary", hsl);
    document.documentElement.style.setProperty("--user-bubble", `hsl(${hsl})`);
    localStorage.setItem("accent", hsl);
    localStorage.setItem("userBubbleColor", `hsl(${hsl})`);
    setAccent(hsl);
  }, []);

  const changeMode = useCallback((m: SendMode) => {
    setSendMode(m);
    setMode(m);
  }, []);

  const activeHex = ACCENTS.find((c) => c.hsl === accent)?.hex ?? "#c9a84c";
  const activeName = ACCENTS.find((c) => c.hsl === accent)?.name ?? "Gold";

  return (
    <ProfileGlassShell title="Appearance" subtitle="Accent color and composer behavior.">
      <style>{css}</style>

      <GlassSection title="Accent color" index="01">
        <GlassCard>
          <div className="ap-preview" style={{ ["--ac" as any]: activeHex }}>
            <div className="ap-bubble ap-in">How does this look?</div>
            <div className="ap-bubble ap-out">Beautiful.</div>
            <span className="ap-preview-name">{activeName}</span>
          </div>
          <div className="ap-grid">
            {ACCENTS.map((c) => {
              const on = c.hsl === accent;
              return (
                <button
                  key={c.hex}
                  onClick={() => changeAccent(c.hsl)}
                  aria-label={c.name}
                  className={`ap-swatch ${on ? "is-on" : ""}`}
                  style={{ background: c.hex }}
                >
                  {on && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </GlassCard>
      </GlassSection>

      <GlassSection title="Composer" index="02">
        <GlassCard>
          <div className="ap-composer">
            <p className="ap-composer-hint">
              {mode === "enter"
                ? "Enter sends · Shift + Enter for new line."
                : "Shift + Enter sends · Enter for new line."}
            </p>
            <div className="ap-seg">
              {(["enter", "shift_enter"] as SendMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => changeMode(m)}
                  className={`ap-seg-btn ${mode === m ? "is-on" : ""}`}
                >
                  {m === "enter" ? "Enter" : "Shift + Enter"}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      </GlassSection>
    </ProfileGlassShell>
  );
};

const css = `
.ap-preview {
  padding: 20px 18px 16px;
  display: flex; flex-direction: column; gap: 8px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  position: relative;
}
.ap-preview-name {
  position: absolute; top: 14px; right: 16px;
  font-family: "Space Grotesk", sans-serif; font-size: 10px; font-weight: 600;
  letter-spacing: 0.18em; color: var(--ac); text-transform: uppercase;
}
.ap-bubble { max-width: 78%; padding: 10px 14px; border-radius: 16px; font-size: 13px; }
.ap-in { align-self: flex-start; background: rgba(255,255,255,0.05); color: #f4ebde; border-bottom-left-radius: 4px; }
.ap-out {
  align-self: flex-end; background: var(--ac); color: #0a0a0a; font-weight: 500;
  border-bottom-right-radius: 4px; transition: background-color 250ms ease;
}
.ap-grid {
  padding: 16px 18px 18px;
  display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px;
}
.ap-swatch {
  width: 100%; aspect-ratio: 1; border-radius: 999px; border: 0;
  display: grid; place-items: center; color: #0a0a0a;
  cursor: pointer;
  transition: transform 180ms cubic-bezier(0.34,1.35,0.64,1), box-shadow 180ms ease;
}
.ap-swatch:active { transform: scale(0.9); }
.ap-swatch.is-on { box-shadow: 0 0 0 2px #0a0a0a, 0 0 0 4px #c9a84c; }

.ap-composer { padding: 18px; display: flex; flex-direction: column; gap: 14px; }
.ap-composer-hint { margin: 0; font-size: 12.5px; color: rgba(235,220,205,0.55); }
.ap-seg {
  display: flex; gap: 4px; padding: 4px;
  background: rgba(0,0,0,0.35); border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.05);
}
.ap-seg-btn {
  flex: 1; height: 38px; border: 0; background: transparent;
  color: rgba(235,220,205,0.55); font: inherit; font-size: 12.5px; font-weight: 600;
  border-radius: 999px; cursor: pointer;
  transition: background-color 200ms ease, color 200ms ease;
}
.ap-seg-btn.is-on {
  background: linear-gradient(180deg, #f0d78c, #c9a84c);
  color: #0a0a0a;
}
`;

export default CustomizationPage;
