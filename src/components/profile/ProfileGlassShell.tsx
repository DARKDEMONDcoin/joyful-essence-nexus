/** @doc Mobile shell for settings subpages — Liquid Glass wellness aesthetic. */
import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from "react";
import { GrainGradient } from "@paper-design/shaders-react";
type ShellProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  trailing?: ReactNode;
  children: ReactNode;
};

const ProfileGlassShell = ({ title, subtitle, onBack, trailing, children }: ShellProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const back =
    onBack ??
    (() => {
      const parts = location.pathname.split("/").filter(Boolean);
      if (parts.length > 1) {
        const parent = "/" + parts.slice(0, -1).join("/");
        navigate(parent);
      } else {
        navigate("/settings");
      }
    });

  return (
    <div className="ng-root">
      <style>{ngCss}</style>
      <div className="ng-bg" aria-hidden>
        <GrainGradient
          style={{ width: "100%", height: "100%" }}
          colorBack="#0a0a0a"
          softness={1}
          intensity={0.4}
          noise={0.35}
          shape="corners"
          offsetX={0}
          offsetY={0}
          scale={1}
          rotation={0}
          speed={1}
          colors={["#8a9aaa", "#1a2028", "#c9a56a"]}
        />
      </div>
      <div className="ng-overlay" aria-hidden />

      <div className="ng-screen">
        <div className="ng-topbar">
          <button onClick={back} aria-label="Back" className="ng-back liquid-glass ng-a1">
            <ArrowLeft className="w-[18px] h-[18px]" />
          </button>
          <div className="ng-topbar-trail ng-a1">{trailing}</div>
        </div>

        <header className="ng-hero ng-a2">
          <h1 className="ng-hero-title">{title}</h1>
          {subtitle && <p className="ng-hero-sub">{subtitle}</p>}
        </header>


        <div className="ng-content">{children}</div>
        <div className="ng-bottom-spacer" />
      </div>
    </div>
  );
};


/* ---------- Building blocks ---------- */

export const GlassSection = ({
  title,
  children,
}: {
  title?: string;
  index?: string;
  children: ReactNode;
}) => (
  <section className="ng-section">
    {title && <h2 className="ng-section-title">{title}</h2>}
    {children}
  </section>
);

export const GlassCard = ({
  children,
  selected = false,
  className = "",
}: {
  children: ReactNode;
  selected?: boolean;
  className?: string;
}) => (
  <div className={`ng-card ${selected ? "liquid-glass-selected" : "liquid-glass"} ${className}`}>
    {children}
  </div>
);

type RowProps = {
  index?: string;
  icon?: ReactNode;
  label: string;
  hint?: string;
  trailing?: ReactNode;
  danger?: boolean;
  onClick?: () => void;
};

export const GlassRow = ({ icon, label, hint, trailing, danger, onClick }: RowProps) => (
  <button onClick={onClick} className={`ng-row ${danger ? "ng-row-danger" : ""}`} type="button">
    {icon && <span className="ng-row-icon">{icon}</span>}
    <span className="ng-row-body">
      <span className="ng-row-label">{label}</span>
      {hint && <span className="ng-row-hint">{hint}</span>}
    </span>
    {trailing !== undefined ? (
      <span className="ng-row-trailing">{trailing}</span>
    ) : (
      <span className="ng-row-arrow" aria-hidden>›</span>
    )}
  </button>
);

export const GlassField = ({
  label,
  hint,
  ...rest
}: { label?: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) => (
  <label className="ng-field">
    {label && <span className="ng-field-label">{label}</span>}
    <input {...rest} className="ng-input liquid-glass" />
    {hint && <span className="ng-field-hint">{hint}</span>}
  </label>
);

export const GlassPrimaryButton = ({ children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...rest} className={`ng-btn ng-btn-primary liquid-glass-selected ${rest.className ?? ""}`}>
    {children}
  </button>
);

export const GlassSecondaryButton = ({ children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...rest} className={`ng-btn ng-btn-secondary liquid-glass ${rest.className ?? ""}`}>
    {children}
  </button>
);

/* ---------- CSS (Liquid Glass wellness) ---------- */

const BG_URL =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260704_143500_a76b8e64-2c69-4683-80e7-2bb060a921d6.png&w=1280&q=85";

const ngCss = `
@import url("https://db.onlinewebfonts.com/c/e66905e07608167a84e6ad52f638c3c6?family=Helvetica+Now+Var");

.ng-root {
  position: relative;
  min-height: 100dvh;
  color: var(--overlay-white-100);
  font-family: "Helvetica Now Var", "Helvetica Neue", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  display: flex; justify-content: center;
  isolation: isolate;
  overflow-x: hidden;
}
.ng-bg {
  position: fixed; inset: 0;
  z-index: -2;
  overflow: hidden;
}
.ng-bg > * { width: 100% !important; height: 100% !important; display: block; }
.ng-overlay {
  position: fixed; inset: 0;
  background: rgba(10, 12, 16, 0.28);
  z-index: -1;
}
.ng-screen {
  position: relative;
  width: 100%; max-width: 430px;
  min-height: 100dvh;
  padding: max(env(safe-area-inset-top, 0px), 18px) 24px 0;
}

/* --- Top bar --- */
.ng-topbar {
  position: relative;
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 0;
  z-index: 2;
}
.ng-back {
  width: 44px; height: 44px; padding: 0;
  border: 0; border-radius: 999px;
  color: var(--overlay-white-100);
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform 150ms ease;
}
.ng-back:active { transform: scale(0.94); }
.ng-topbar-trail { display: flex; align-items: center; gap: 8px; }

/* --- Hero --- */
.ng-hero {
  position: relative;
  padding: 18px 2px 20px;
  z-index: 1;
  display: flex; flex-direction: column; align-items: flex-start;
  gap: 6px;
}
.ng-hero-title {
  margin: 0;
  font-size: 26px; font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: var(--overlay-white-100);
}
.ng-hero-sub {
  margin: 0;
  font-size: 13.5px; line-height: 1.5;
  color: var(--overlay-white-60);
  font-weight: 400;
  max-width: 56ch;
}

.ng-content { display: flex; flex-direction: column; gap: 22px; padding-top: 8px; }

/* --- Sections --- */
.ng-section { display: flex; flex-direction: column; gap: 12px; }
.ng-section-title {
  margin: 0 6px 4px;
  font-size: 11.5px; font-weight: 500;
  color: var(--overlay-white-60);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}


/* --- Liquid Glass base --- */
.liquid-glass, .liquid-glass-selected {
  position: relative;
  background-color: var(--overlay-white-03);
  background-blend-mode: luminosity;
  backdrop-filter: blur(4px);
  box-shadow: inset 0 1px 1px var(--overlay-white-10);
  border-radius: 24px;
  overflow: hidden;
}
.liquid-glass-selected {
  background-color: var(--overlay-white-12);
  backdrop-filter: blur(8px);
  box-shadow: inset 0 1px 2px var(--overlay-white-22);
}
.liquid-glass::before, .liquid-glass-selected::before {
  content: "";
  position: absolute; inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background: linear-gradient(180deg,
    var(--overlay-white-45) 0%,
    var(--overlay-white-14) 20%,
    transparent 40%,
    transparent 60%,
    var(--overlay-white-14) 80%,
    var(--overlay-white-45) 100%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  pointer-events: none;
}
.liquid-glass-selected::before {
  background: linear-gradient(180deg,
    var(--overlay-white-60) 0%,
    var(--overlay-white-22) 20%,
    transparent 40%,
    transparent 60%,
    var(--overlay-white-22) 80%,
    var(--overlay-white-60) 100%);
}

/* --- Card --- */
.ng-card { padding: 6px 0; border-radius: 26px; }
.ng-card-pad { padding: 18px 20px; display: flex; flex-direction: column; gap: 14px; }
.ng-actions { display: flex; gap: 10px; padding-top: 4px; }
.ng-actions > * { flex: 1; }


/* --- Rows (airy) --- */
.ng-row {
  width: 100%;
  display: flex; align-items: center; gap: 16px;
  padding: 18px 20px;
  background: transparent;
  border: 0;
  color: var(--overlay-white-100);
  text-align: left;
  cursor: pointer;
  font: inherit;
  transition: background-color 180ms ease;
  position: relative;
}
.ng-row + .ng-row::before {
  content: "";
  position: absolute; top: 0; left: 60px; right: 20px;
  height: 1px; background: var(--overlay-white-08);
}
.ng-row:active { background: var(--overlay-white-06); }
/* Clean glass icons — no bg, no border, soft luminous drop-shadow */
.ng-row-icon {
  width: 30px; height: 30px;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  color: var(--overlay-white-95);
  background: transparent;
  border: 0;
  filter:
    drop-shadow(0 1px 0 var(--overlay-white-45))
    drop-shadow(0 2px 6px var(--overlay-black-22))
    saturate(1.05) brightness(1.05);
}
.ng-row-icon > svg { width: 22px; height: 22px; stroke-width: 1.6; }
.ng-row-icon img { width: 100%; height: 100%; object-fit: contain; display: block; }
.ng-row-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.ng-row-label { font-size: 15.5px; font-weight: 500; color: var(--overlay-white-100); letter-spacing: 0.005em; }
.ng-row-hint { font-size: 12.5px; color: var(--overlay-white-60); line-height: 1.4; }
.ng-row-trailing {
  font-size: 13px; color: var(--overlay-white-60);
  flex-shrink: 0; max-width: 55%;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ng-row-arrow {
  font-size: 22px; color: var(--overlay-white-45);
  flex-shrink: 0; line-height: 1;
  transition: transform 180ms ease, color 180ms ease;
}
.ng-row:hover .ng-row-arrow { transform: translateX(2px); color: var(--overlay-white-70); }
.ng-row-danger .ng-row-label,
.ng-row-danger .ng-row-icon { color: #fda4af; }
.ng-row-danger .ng-row-arrow { color: rgba(253,164,175,0.6); }

/* --- Fields --- */
.ng-field {
  display: flex; flex-direction: column; gap: 8px;
  padding: 4px 2px;
}
.ng-field-label {
  padding-left: 6px;
  font-size: 12px; font-weight: 500;
  color: var(--overlay-white-60);
  letter-spacing: 0.02em;
}
.ng-input {
  width: 100%;
  border: 0;
  border-radius: 18px;
  padding: 14px 16px;
  color: var(--overlay-white-100);
  font: inherit;
  font-size: 15px;
  outline: none;
}
.ng-input::placeholder { color: var(--overlay-white-45); }
.ng-field-hint {
  padding-left: 6px;
  font-size: 12.5px; color: var(--overlay-white-60);
  line-height: 1.5;
}

/* --- Buttons --- */
.ng-btn {
  height: 52px;
  border: 0; padding: 0 22px;
  border-radius: 999px;
  font: inherit;
  font-size: 15px; font-weight: 500;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.2s ease;
  display: inline-flex; align-items: center; justify-content: center;
  letter-spacing: 0.01em;
  -webkit-tap-highlight-color: transparent;
  color: var(--overlay-white-100);
}
.ng-btn:active { transform: scale(0.98); }
.ng-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.ng-bottom-spacer { height: calc(env(safe-area-inset-bottom, 0px) + 48px); }

/* --- Animations (staggered fade-up) --- */
@keyframes ng-rise {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.ng-a1 { animation: ng-rise 0.5s cubic-bezier(0.22,1,0.36,1) 0.10s both; }
.ng-a2 { animation: ng-rise 0.5s cubic-bezier(0.22,1,0.36,1) 0.25s both; }
.ng-content > *:nth-child(1) { animation: ng-rise 0.5s cubic-bezier(0.22,1,0.36,1) 0.40s both; }
.ng-content > *:nth-child(2) { animation: ng-rise 0.5s cubic-bezier(0.22,1,0.36,1) 0.48s both; }
.ng-content > *:nth-child(3) { animation: ng-rise 0.5s cubic-bezier(0.22,1,0.36,1) 0.56s both; }
.ng-content > *:nth-child(4) { animation: ng-rise 0.5s cubic-bezier(0.22,1,0.36,1) 0.64s both; }
.ng-content > *:nth-child(5) { animation: ng-rise 0.5s cubic-bezier(0.22,1,0.36,1) 0.72s both; }
.ng-content > *:nth-child(6) { animation: ng-rise 0.5s cubic-bezier(0.22,1,0.36,1) 0.80s both; }

@media (prefers-reduced-motion: reduce) {
  .ng-a1,.ng-a2,.ng-content > * { animation: none !important; }
}

/* Keep legacy pgs-* classnames working */
.pgs-anim-drop1,.pgs-anim-drop2,.pgs-anim-rise1,.pgs-anim-rise2,.pgs-anim-rise3,.pgs-anim-rise4,.pgs-anim-rise5 {
  animation: ng-rise 0.55s cubic-bezier(0.22,1,0.36,1) both;
}
.pgs-anim-drop1 { animation-delay: 0.10s; }
.pgs-anim-drop2 { animation-delay: 0.18s; }
.pgs-anim-rise1 { animation-delay: 0.26s; }
.pgs-anim-rise2 { animation-delay: 0.34s; }
.pgs-anim-rise3 { animation-delay: 0.42s; }
.pgs-anim-rise4 { animation-delay: 0.50s; }
.pgs-anim-rise5 { animation-delay: 0.58s; }
`;

export default ProfileGlassShell;
