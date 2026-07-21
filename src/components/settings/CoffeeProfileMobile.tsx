/** @doc Mobile settings — coffee/warm profile hero + real settings groups. */
import { useEffect, useMemo, useRef, useState, type FC, type SVGProps, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useActiveAccount } from "@/hooks/useActiveAccount";
import { t as authT, useUserLang, AVAILABLE_LANGS } from "@/lib/authI18n";
import MobilePushShell from "@/components/layout/MobilePushShell";
import { IOS26_ICONS } from "@/assets/ios26-icons";

const ICONS = IOS26_ICONS;

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260707_003042_3d2380a6-1ce6-4407-a2e2-cfec46546407.mp4";

const Laurel = ({ flip = false }: { flip?: boolean }) => (
  <svg
    viewBox="0 0 60 120"
    style={{
      height: 73,
      opacity: 0.6,
      transform: flip ? "scaleX(-1)" : undefined,
    }}
    fill="none"
    stroke="#ede4d8"
    strokeWidth="1.2"
    strokeLinecap="round"
  >
    <path d="M40 10 C 28 30, 22 55, 26 90 C 28 100, 34 108, 42 112" />
    {Array.from({ length: 9 }).map((_, i) => {
      const t = i / 8;
      const cx = 40 - 14 * t + 4 * Math.sin(t * 3);
      const cy = 14 + t * 96;
      return (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx="8"
          ry="3.2"
          fill="#ede4d8"
          fillOpacity="0.85"
          stroke="none"
          transform={`rotate(${-45 + t * 20} ${cx} ${cy})`}
        />
      );
    })}
  </svg>
);

type IconDef = FC<SVGProps<SVGSVGElement>> | string;
type Row = {
  icon: IconDef;
  label: string;
  path?: string;
  onClick?: () => void;
  trailing?: string;
  danger?: boolean;
};
type Group = { title: string; rows: Row[] };

const CoffeeProfileMobile = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const account = useActiveAccount();
  const lang = useUserLang();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const userName = account.name || userEmail.split("@")[0] || "User";

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      setUserEmail(user.email || "");
    })();
    return () => { cancelled = true; };
  }, []);

  const currentLangLabel = useMemo(
    () => AVAILABLE_LANGS.find((l) => l.code === lang)?.native ?? "English",
    [lang],
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const groups: Group[] = [
    {
      title: authT("settingsAccount"),
      rows: [
        { icon: ICONS.privacy, label: "Security", path: "/settings/security" },
        { icon: ICONS.billing, label: authT("rowBilling"), path: "/settings/billing" },
      ],
    },
    {
      title: authT("settingsPreferences"),
      rows: [
        { icon: ICONS.appearance, label: authT("rowAppearance"), path: "/settings/customization" },
        
        { icon: ICONS.memory, label: "Memory", path: "/settings/memory" },
        { icon: ICONS.integrations, label: authT("rowIntegrations"), path: "/settings/integrations" },
        { icon: ICONS.integrations, label: "MCP Servers", path: "/settings/mcp" },
        {
          icon: ICONS.language,
          label: authT("rowLanguage"),
          path: "/settings/language",
          trailing: currentLangLabel,
        },
      ],
    },
    {
      title: authT("settingsMore"),
      rows: [
        { icon: ICONS.support, label: authT("rowHelp"), path: "/settings/support" },
        { icon: ICONS.privacy, label: authT("rowPrivacy"), path: "/settings/privacy" },
        { icon: ICONS.status, label: authT("rowStatus"), path: "/settings/system-status" },
      ],
    },
    {
      title: "",
      rows: [
        { icon: ICONS.logout, label: authT("rowLogout"), onClick: handleLogout, danger: true },
      ],
    },
  ];

  return (
    <MobilePushShell open={sidebarOpen} onOpenChange={setSidebarOpen} currentMode="settings">
      <div className="cpm-root">
        <style>{cpmCss}</style>
        <div className="cpm-screen">
          {/* Hero */}
          <div className="cpm-hero">
            <video
              ref={videoRef}
              className="cpm-video"
              src={VIDEO_URL}
              autoPlay
              muted
              loop
              playsInline
            />
            <div className="cpm-hero-fade" />
            <div className="cpm-topbar">
              {/* Sidebar toggle */}
              <button
                className="cpm-glass cpm-circle cpm-anim-drop1"
                aria-label="Open menu"
                onClick={() => setSidebarOpen(true)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ede4d8" strokeWidth="1.7" strokeLinecap="round">
                  <rect x="3.25" y="4.5" width="17.5" height="15" rx="3.5" />
                  <line x1="9.25" y1="4.5" x2="9.25" y2="19.5" />
                  <line x1="5.5" y1="9" x2="7" y2="9" />
                  <line x1="5.5" y1="12" x2="7" y2="12" />
                  <line x1="5.5" y1="15" x2="7" y2="15" />
                </svg>
              </button>
              {/* Edit → profile editor */}
              <button
                className="cpm-glass cpm-circle cpm-anim-drop2"
                aria-label="Edit profile"
                onClick={() => navigate("/settings/profile/edit")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ede4d8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Identity */}
          <div className="cpm-identity">
            <div className="cpm-laurel cpm-laurel-l cpm-anim-fade"><Laurel /></div>
            <div className="cpm-laurel cpm-laurel-r cpm-anim-fade"><Laurel flip /></div>
            <h1 className="cpm-name cpm-anim-rise1">{userName}</h1>
            <p className="cpm-subtitle cpm-anim-rise2">{userEmail || "—"}</p>
          </div>

          {/* Settings groups */}
          <div className="cpm-groups cpm-anim-rise3">
            {groups.map((group, gIdx) => (
              <section key={group.title || `g${gIdx}`} className="cpm-group">
                {group.title && <h2 className="cpm-group-title">{group.title}</h2>}
                <div className="cpm-card">
                  {group.rows.map((row, rIdx) => {
                    const iconNode: ReactNode =
                      typeof row.icon === "string" ? (
                        <img src={row.icon} alt="" className="cpm-row-icon cpm-row-icon-img" loading="lazy" />
                      ) : (
                        <row.icon className="cpm-row-icon" />
                      );
                    return (
                      <button
                        key={row.label}
                        onClick={() => (row.onClick ? row.onClick() : row.path && navigate(row.path))}
                        className={`cpm-row${rIdx > 0 ? " cpm-row-b" : ""}${row.danger ? " cpm-row-danger" : ""}`}
                      >
                        {iconNode}
                        <span className="cpm-row-label">{row.label}</span>
                        {row.trailing && <span className="cpm-row-trailing">{row.trailing}</span>}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <div className="cpm-bottom-spacer" />
        </div>
      </div>
    </MobilePushShell>
  );
};

const cpmCss = `
.cpm-root {
  min-height: 100dvh;
  background:
    radial-gradient(ellipse 65% 55% at 15% 52%, rgba(168,78,10,0.22), transparent 70%),
    radial-gradient(ellipse 52% 48% at 83% 26%, rgba(122,52,8,0.17), transparent 70%),
    radial-gradient(ellipse 44% 52% at 56% 92%, rgba(98,36,5,0.14), transparent 70%),
    radial-gradient(ellipse 30% 30% at 72% 75%, rgba(60,20,5,0.10), transparent 70%),
    #070402;
  color: #ede4d8;
  font-family: "Neue Haas Unica", "Helvetica Now Display", -apple-system, "SF Pro Display", Inter, "Segoe UI", Roboto, sans-serif;
  display: flex;
  justify-content: center;
}
.cpm-screen {
  width: 100%;
  max-width: 430px;
  background: #180a06;
  min-height: 100dvh;
  overflow-x: hidden;
  overflow-y: visible;
  position: relative;
  scrollbar-width: none;
}
.cpm-screen::-webkit-scrollbar { display: none; }

.cpm-hero {
  position: relative; width: 100%; height: 430px; overflow: hidden;
}
.cpm-video {
  width: 100%; height: 100%;
  object-fit: cover; object-position: center top;
  display: block;
  animation: cpm-heroReveal 1.9s cubic-bezier(0.16,1,0.3,1) both;
}
.cpm-hero-fade {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, transparent 52%, #180a06 100%);
  pointer-events: none;
}
.cpm-topbar {
  position: absolute; top: 18px; left: 0; right: 0;
  display: flex; justify-content: space-between;
  padding: 0 16px; z-index: 3;
}

.cpm-glass {
  border: 0;
  background: var(--overlay-white-05);
  color: #ede4d8;
  backdrop-filter: blur(2px) saturate(1.3);
  -webkit-tap-highlight-color: transparent;
  box-shadow: none;
  transition: transform 0.15s ease, background-color 0.15s ease;
  cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
}
.cpm-glass:active { transform: scale(0.94); background: var(--overlay-white-08); }
.cpm-circle { width: 46px; height: 44px; border-radius: 22px; }

/* Identity */
.cpm-identity {
  position: relative;
  margin-top: -112px;
  padding: 0 16px;
  text-align: center;
  z-index: 2;
}
.cpm-name {
  font-size: 28px; font-weight: 500; margin: 0;
  letter-spacing: -0.02em;
}
.cpm-subtitle {
  margin: 4px 0 0; font-size: 14px;
  color: rgba(235,220,205,0.55);
}
.cpm-laurel { position: absolute; top: 0; pointer-events: none; }
.cpm-laurel-l { right: calc(50% + 66px); }
.cpm-laurel-r { left: calc(50% + 66px); }

/* Settings groups */
.cpm-groups { padding: 28px 16px 0; display: flex; flex-direction: column; gap: 22px; }
.cpm-group-title {
  font-size: 12px; font-weight: 500;
  color: rgba(235,220,205,0.5);
  margin: 0 4px 8px;
  text-transform: uppercase; letter-spacing: 0.06em;
}
.cpm-card {
  background: var(--overlay-white-05);
  border: 0;
  border-radius: 20px;
  overflow: hidden;
  backdrop-filter: blur(6px);
}
.cpm-row {
  width: 100%;
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px;
  background: transparent;
  border: 0;
  color: #ede4d8;
  text-align: left;
  cursor: pointer;
  font: inherit;
  transition: background-color 180ms ease;
}
.cpm-row:active { background: var(--overlay-white-05); }
.cpm-row-b { border-top: 0; }
.cpm-row-icon {
  width: 32px; height: 32px; flex-shrink: 0;
  color: rgba(235,220,205,0.85);
  background: transparent;
  border: 0;
  border-radius: 7px;
  opacity: 1;
  filter: drop-shadow(0 5px 10px rgba(0,0,0,0.28));
}
.cpm-row-icon-img {
  object-fit: contain;
  display: block;
  background: transparent;
}
.cpm-row-label { flex: 1; font-size: 15px; font-weight: 500; }
.cpm-row-trailing {
  font-size: 13px; color: rgba(235,220,205,0.5);
  flex-shrink: 0;
}
.cpm-row-danger { color: #f87171; }
.cpm-row-danger .cpm-row-icon { color: #f87171; }
.cpm-row-danger .cpm-row-label { color: #f87171; }

.cpm-bottom-spacer { height: calc(env(safe-area-inset-bottom, 0px) + 40px); }

@keyframes cpm-heroReveal {
  from { opacity: 0; transform: scale(1.01); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes cpm-dropIn {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes cpm-fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes cpm-fadeRise {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.cpm-anim-drop1 { animation: cpm-dropIn 0.7s cubic-bezier(0.16,1,0.3,1) 0.35s both; }
.cpm-anim-drop2 { animation: cpm-dropIn 0.7s cubic-bezier(0.16,1,0.3,1) 0.42s both; }
.cpm-anim-fade  { animation: cpm-fadeIn 0.8s ease-out 0.5s both; }
.cpm-anim-rise1 { animation: cpm-fadeRise 0.7s cubic-bezier(0.16,1,0.3,1) 0.5s both; }
.cpm-anim-rise2 { animation: cpm-fadeRise 0.7s cubic-bezier(0.16,1,0.3,1) 0.58s both; }
.cpm-anim-rise3 { animation: cpm-fadeRise 0.7s cubic-bezier(0.16,1,0.3,1) 0.66s both; }

@media (prefers-reduced-motion: reduce) {
  .cpm-anim-drop1,.cpm-anim-drop2,.cpm-anim-fade,.cpm-anim-rise1,.cpm-anim-rise2,
  .cpm-anim-rise3,.cpm-video { animation: none !important; }
}
`;

export default CoffeeProfileMobile;
