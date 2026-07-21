/** @doc Full-page integration detail: connect, disconnect, or manage a single app. Glass redesign. */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, Loader2, Shield, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { integrations, type Integration } from "@/lib/integrationsData";
import {
  disconnectIntegration,
  loadIntegrationConnections,
  startIntegrationConnection,
  waitForConnectionRefresh,
} from "@/lib/integrationBackend";
import { getLongDescription } from "@/lib/integrationLongDescription";
import ProfileGlassShell, {
  GlassSection,
  GlassCard,
  GlassPrimaryButton,
} from "@/components/profile/ProfileGlassShell";
import { brandLogoSources } from "@/lib/brandLogoSources";

const SUPABASE_FUNCTIONS_URL = "https://ltgampdtawuefwwayncx.supabase.co/functions/v1";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0Z2FtcGR0YXd1ZWZ3d2F5bmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3Njk5ODAsImV4cCI6MjA4ODM0NTk4MH0.5ZOzuxCrm-TO4zzRDJ68LrCLH3f0itiznUxhbEupvGg";

async function invokeIntegrationStatus(functionName: string, body: Record<string, unknown>) {
  const { data: { session } } = await supabase.auth.getSession();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/${functionName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_PUBLISHABLE_KEY,
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error || data?.message || `${functionName} failed`);
    return data;
  } finally {
    window.clearTimeout(timeout);
  }
}


function AppLogo({ integration, size = 56 }: { integration: Integration; size?: number }) {
  const [idx, setIdx] = useState(0);
  const sources = integration.domain ? brandLogoSources(integration.domain) : [];
  const url = sources[idx];
  if (!url) {
    return (
      <span className="font-semibold text-foreground/70" style={{ fontSize: size * 0.4 }}>
        {integration.name.charAt(0)}
      </span>
    );
  }
  return (
    <img
      src={url}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="object-contain"
      loading="lazy"
      onError={() => setIdx((i) => i + 1)}
    />
  );
}

export default function IntegrationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const integration = useMemo(() => integrations.find((i) => i.id === id), [id]);

  const [connected, setConnected] = useState(false);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);

  useEffect(() => {
    if (!integration) return;
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [integration?.id]);

  const loadStatus = async () => {
    if (!integration) return;
    setLoadingStatus(true);
    const timeoutId = window.setTimeout(() => {
      setLoadingStatus(false);
    }, 9_000);
    try {
      if (integration.type === "oauth" && integration.app === "github") {
        const data = await invokeIntegrationStatus("github-push", { action: "status" });
        setConnected(!!data?.connected);
        setMeta(data?.account ?? (data?.account_name ? { account_name: data.account_name } : null));
        return;
      }
      const snapshot = await loadIntegrationConnections([integration]);
      setConnected(!!snapshot.connectedApps[integration.app]);
      setMeta(snapshot.appMeta[integration.app] ?? null);
    } catch (error) {
      console.error("[integration-detail] status failed", error);
      setConnected(false);
      setMeta(null);
    } finally {
      window.clearTimeout(timeoutId);
      setLoadingStatus(false);
    }
  };

  const handleConnect = async () => {
    if (!integration) return;
    setLoading(true);
    try {
      const result = await startIntegrationConnection(integration);
      if (result.mode === "local") {
        setConnected(true);
        setMeta((prev: any) => prev ?? { account_name: integration.name });
        setLoadingStatus(false);
        void loadStatus();
        toast.success(`${integration.name} connected`);
        return;
      }
      toast.success(`Finish connecting ${integration.name} in the popup`);
      await waitForConnectionRefresh(async () => {
        if (integration.type === "oauth" && integration.app === "github") {
          const data = await invokeIntegrationStatus("github-push", { action: "status" }).catch(() => null);
          const ok = !!data?.connected;
          setConnected(ok);
          setMeta(data?.account ?? (data?.account_name ? { account_name: data.account_name } : null));
          return ok;
        }
        const snapshot = await loadIntegrationConnections([integration]);
        const ok = !!snapshot.connectedApps[integration.app];
        setConnected(ok);
        setMeta(snapshot.appMeta[integration.app] ?? null);
        return ok;
      }, result.popup);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `${integration.name} failed`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!integration) return;
    setLoading(true);
    try {
      await disconnectIntegration(integration);
      await loadStatus();
      toast.success(`${integration.name} disconnected`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Disconnect failed");
    } finally {
      setLoading(false);
    }
  };


  if (!integration) {
    return (
      <ProfileGlassShell
        title="Integration not found"
        subtitle="This integration does not exist or has been removed."
        onBack={() => navigate("/settings/integrations")}
      >
        <GlassSection>
          <GlassPrimaryButton onClick={() => navigate("/settings/integrations")}>
            Back to integrations
          </GlassPrimaryButton>
        </GlassSection>
      </ProfileGlassShell>
    );
  }

  const longDesc = getLongDescription(integration);
  const highlights = [
    { icon: Shield, label: "Secure connection", desc: "Tokens are stored on the server and never exposed to the browser." },
    { icon: Zap, label: "Instant actions", desc: `Megsy can trigger ${integration.name} actions directly from the chat.` },
  ];

  return (
    <ProfileGlassShell
      title={integration.name}
      subtitle={integration.description}
      onBack={() => navigate("/settings/integrations")}
    >
      <style>{css}</style>

      <GlassSection>
        <div className="idp-hero liquid-glass">
          <div className="idp-hero-glow" aria-hidden />
          <div className={`idp-logo liquid-glass ${connected ? "is-connected" : ""}`}>
            <AppLogo integration={integration} size={48} />
            {connected && <span className="idp-logo-dot" aria-hidden />}
          </div>
          <h2 className="idp-hero-title">{integration.name}</h2>
          <span className={`idp-status-chip ${connected ? "is-ok" : "is-muted"}`}>
            <span className="dot" />
            {connected ? "Connected" : "Not connected"}
          </span>
          <button
            onClick={connected ? handleDisconnect : handleConnect}
            disabled={loading || loadingStatus}
            className={`idp-btn ${connected ? "is-danger" : "is-primary"}`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {connected ? "Disconnect" : loading ? "Connecting…" : `Connect ${integration.name}`}
          </button>
        </div>
      </GlassSection>

      <GlassSection title="About">
        <GlassCard>
          <p className="idp-about">{longDesc.intro}</p>
        </GlassCard>
      </GlassSection>

      <GlassSection title="What you can do">
        <GlassCard>
          <ul className="idp-uses">
            {longDesc.uses.map((use) => (
              <li key={use}>
                <span className="idp-check">
                  <Check className="w-2.5 h-2.5" strokeWidth={3} />
                </span>
                <span>{use}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </GlassSection>

      <GlassSection title="Built-in safeguards">
        <GlassCard>
          {highlights.map((h, i) => (
            <div key={h.label} className={`idp-safe ${i > 0 ? "has-divider" : ""}`}>
              <span className="idp-safe-ic">
                <h.icon className="w-[18px] h-[18px]" strokeWidth={1.6} />
              </span>
              <div className="idp-safe-body">
                <p className="idp-safe-label">{h.label}</p>
                <p className="idp-safe-desc">{h.desc}</p>
              </div>
            </div>
          ))}
        </GlassCard>
      </GlassSection>
    </ProfileGlassShell>
  );
}

const css = `
.idp-hero {
  position: relative; overflow: hidden;
  display: flex; flex-direction: column; align-items: center;
  gap: 14px; padding: 28px 20px 20px; border-radius: 24px; color: #f2eee7;
  text-align: center;
}
.idp-hero-glow {
  position: absolute; inset: -40% -20% auto -20%; height: 220px; pointer-events: none;
  background: radial-gradient(50% 60% at 50% 0%, rgba(255,255,255,0.10), transparent 70%);
  filter: blur(4px);
}
.idp-logo {
  position: relative;
  width: 76px; height: 76px; border-radius: 22px;
  display: grid; place-items: center; flex-shrink: 0;
  box-shadow: 0 12px 30px -18px rgba(0,0,0,0.6);
}
.idp-logo-dot {
  position: absolute; top: -2px; right: -2px;
  width: 14px; height: 14px; border-radius: 999px;
  background: #34c759;
  box-shadow: 0 0 0 3px rgba(20,22,26,0.95), 0 0 12px rgba(52,199,89,0.6);
}
.idp-hero-title {
  margin: 4px 0 0; font-size: 20px; font-weight: 600;
  letter-spacing: -0.02em; color: #f2eee7;
}
.idp-status-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 11px; border-radius: 999px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.02em;
}
.idp-status-chip .dot { width: 6px; height: 6px; border-radius: 999px; }
.idp-status-chip.is-ok { color: #7be0a8; background: rgba(52,199,89,0.14); }
.idp-status-chip.is-ok .dot { background: #34c759; box-shadow: 0 0 8px rgba(52,199,89,0.7); }
.idp-status-chip.is-muted { color: rgba(255,255,255,0.55); background: rgba(255,255,255,0.06); }
.idp-status-chip.is-muted .dot { background: rgba(255,255,255,0.3); }
.idp-btn {
  margin-top: 6px; width: 100%; max-width: 320px;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  height: 44px; padding: 0 22px; border-radius: 999px;
  font: inherit; font-size: 14px; font-weight: 600;
  border: 0; cursor: pointer; transition: transform 150ms, opacity 150ms;
}
.idp-btn:active { transform: scale(0.98); }
.idp-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.idp-btn.is-primary { background: #f2eee7; color: #14161a; box-shadow: 0 10px 24px -12px rgba(242,238,231,0.5); }
.idp-btn.is-danger { background: rgba(248,113,113,0.14); color: #f87171; border: 1px solid rgba(248,113,113,0.28); }

.idp-about {
  margin: 0; padding: 18px; font-size: 14px; line-height: 1.65;
  color: rgba(242,238,231,0.78);
}
.idp-uses { margin: 0; padding: 16px 18px; list-style: none; display: flex; flex-direction: column; gap: 12px; }
.idp-uses li { display: flex; align-items: flex-start; gap: 10px; font-size: 13.5px; line-height: 1.5; color: rgba(242,238,231,0.85); }
.idp-check {
  margin-top: 3px; width: 16px; height: 16px; border-radius: 999px;
  display: grid; place-items: center; shrink-0;
  background: rgba(52,199,89,0.18); color: #7be0a8;
}
.idp-safe {
  display: flex; align-items: flex-start; gap: 12px; padding: 14px 18px; position: relative;
}
.idp-safe.has-divider::before {
  content: ""; position: absolute; top: 0; left: 18px; right: 18px; height: 1px;
  background: rgba(255,255,255,0.06);
}
.idp-safe-ic {
  width: 36px; height: 36px; border-radius: 12px;
  display: grid; place-items: center; shrink-0;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  color: rgba(242,238,231,0.8);
}
.idp-safe-body { min-width: 0; flex: 1; }
.idp-safe-label { margin: 0; font-size: 13.5px; font-weight: 600; color: #f2eee7; }
.idp-safe-desc { margin: 4px 0 0; font-size: 12.5px; line-height: 1.5; color: rgba(255,255,255,0.55); }
`;

