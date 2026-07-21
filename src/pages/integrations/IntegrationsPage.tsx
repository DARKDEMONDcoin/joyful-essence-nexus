/** @doc Integrations catalog — Liquid Glass redesign matching Security. */
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import { integrations, INTEGRATION_CATEGORIES, type Integration } from "@/lib/integrationsData";
import { loadIntegrationConnections } from "@/lib/integrationBackend";
import { brandLogoSources } from "@/lib/brandLogoSources";
import ProfileGlassShell, {
  GlassSection,
  GlassCard,
} from "@/components/profile/ProfileGlassShell";
import { cn } from "@/lib/utils";

const BrandLogo = ({ integration, size = 24 }: { integration: Integration; size?: number }) => {
  const [srcIdx, setSrcIdx] = useState(0);
  const sources = integration.domain ? brandLogoSources(integration.domain) : [];
  const url = sources[srcIdx];
  if (!url) {
    return (
      <span className="font-semibold text-white/70" style={{ fontSize: size * 0.55 }}>
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
      onError={() => setSrcIdx((i) => i + 1)}
    />
  );
};

export default function IntegrationsPage() {
  const navigate = useNavigate();
  const [connectedApps, setConnectedApps] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const snap = await loadIntegrationConnections(integrations);
        setConnectedApps(snap.connectedApps);
      } catch (e) {
        console.error("[integrations] load failed", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const isConnected = (app: string) => !!connectedApps[app];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return integrations.filter((i) => {
      if (activeCategory !== "All" && i.category !== activeCategory) return false;
      if (!q) return true;
      return (
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      );
    });
  }, [query, activeCategory]);

  const connectedCount = Object.keys(connectedApps).filter((k) => connectedApps[k]).length;

  const sortedByConnected = useMemo(() => {
    return [...filtered].sort((a, b) => Number(isConnected(b.app)) - Number(isConnected(a.app)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, connectedApps]);

  return (
    <ProfileGlassShell
      title="Integrations"
      subtitle="Connect your favorite tools so Megsy can act on your behalf."
      onBack={() => navigate("/settings")}
    >
      <style>{css}</style>

      <GlassSection>
        <div className="ig-stats liquid-glass">
          <div>
            <span className="ig-stat-num">{connectedCount}</span>
            <em>Connected</em>
          </div>
          <span className="ig-stat-sep" />
          <div>
            <span className="ig-stat-num">{integrations.length}</span>
            <em>Available</em>
          </div>
          <span className="ig-stat-sep" />
          <div>
            <span className="ig-stat-num">{INTEGRATION_CATEGORIES.length - 1}</span>
            <em>Categories</em>
          </div>
        </div>
      </GlassSection>

      <GlassSection>
        <div className="ig-search liquid-glass">
          <Search className="w-4 h-4 opacity-60 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search integrations"
          />
        </div>
        <div className="ig-cats">
          {INTEGRATION_CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn("ig-cat", active && "is-active")}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </GlassSection>

      <GlassSection title={isLoading ? "Loading" : `${filtered.length} apps`}>
        {isLoading ? (
          <GlassCard>
            <div className="ig-empty">
              <p>Loading integrations…</p>
            </div>
          </GlassCard>
        ) : filtered.length === 0 ? (
          <GlassCard>
            <div className="ig-empty">
              <p>No matches</p>
              <span>Try a different keyword or category.</span>
            </div>
          </GlassCard>
        ) : (
          <GlassCard>
            {sortedByConnected.map((integration) => {
              const isConn = isConnected(integration.app);
              return (
              <div key={integration.id} className="ig-row">
                  <button
                    className="ig-row-main"
                    onClick={() => navigate(`/settings/integrations/${integration.id}`)}
                  >
                    <span className="ig-logo liquid-glass" style={{ position: "relative" }}>
                      <BrandLogo integration={integration} size={22} />
                      {isConn && (
                        <span
                          aria-hidden
                          style={{
                            position: "absolute", top: -2, right: -2,
                            width: 12, height: 12, borderRadius: 999,
                            background: "#34c759",
                            boxShadow: "0 0 0 2px rgba(20,22,26,0.95), 0 0 8px rgba(52,199,89,0.6)",
                          }}
                        />
                      )}
                    </span>
                    <span className="ig-row-body">
                      <span className="ig-row-title">
                        {integration.name}
                        {isConn && (
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                            color: "#7be0a8", background: "rgba(52,199,89,0.14)", letterSpacing: 0.02,
                          }}>Connected</span>
                        )}
                      </span>
                      <span className="ig-row-desc">{integration.description}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-40 shrink-0" />
                  </button>
              </div>
              );
            })}
          </GlassCard>
        )}
      </GlassSection>
    </ProfileGlassShell>
  );
}

const css = `
.ig-stats {
  display: flex; align-items: center; gap: 8px;
  padding: 16px 18px; border-radius: 18px; color: #f2eee7;
}
.ig-stats > div { flex: 1; display: flex; flex-direction: column; gap: 4px; text-align: center; }
.ig-stat-num { font-size: 22px; font-weight: 600; letter-spacing: -0.02em; color: #f2eee7; }
.ig-stats em {
  font-style: normal; font-size: 10px; font-weight: 600;
  color: rgba(255,255,255,0.5); letter-spacing: 0.18em; text-transform: uppercase;
}
.ig-stat-sep {
  width: 1px; align-self: stretch;
  background: linear-gradient(180deg, transparent, rgba(255,255,255,0.14), transparent);
}

.ig-search {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 14px; border-radius: 16px; color: #f2eee7; margin-bottom: 10px;
}
.ig-search input {
  flex: 1; background: transparent; border: 0; outline: 0;
  font: inherit; font-size: 14.5px; color: inherit;
}
.ig-search input::placeholder { color: rgba(255,255,255,0.4); }

.ig-cats {
  display: flex; gap: 8px; overflow-x: auto; padding: 4px 2px;
  scrollbar-width: none;
}
.ig-cats::-webkit-scrollbar { display: none; }
.ig-cat {
  flex-shrink: 0; height: 32px; padding: 0 14px; border-radius: 999px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.7); font: inherit; font-size: 12.5px; font-weight: 500;
  cursor: pointer; transition: transform 150ms, background-color 150ms;
}
.ig-cat:hover { background: rgba(255,255,255,0.06); color: #f2eee7; }
.ig-cat:active { transform: scale(0.96); }
.ig-cat.is-active { background: #f2eee7; color: #14161a; border-color: transparent; }

.ig-row {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 14px; position: relative;
}
.ig-row + .ig-row::before {
  content: ""; position: absolute; top: 0; left: 14px; right: 14px; height: 1px;
  background: rgba(255,255,255,0.06);
}
.ig-row-main {
  flex: 1; display: flex; align-items: center; gap: 12px;
  background: transparent; border: 0; text-align: left; cursor: pointer;
  color: #f2eee7; padding: 0; min-width: 0;
}
.ig-logo {
  position: relative;
  width: 40px; height: 40px; border-radius: 12px;
  display: grid; place-items: center; shrink-0;
}
.ig-row-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.ig-row-title {
  display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap;
  font-size: 14.5px; font-weight: 500;
}
.ig-row-desc {
  font-size: 12px; color: rgba(255,255,255,0.5);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ig-empty { padding: 32px 20px; text-align: center; }
.ig-empty p { margin: 0; font-size: 14.5px; font-weight: 600; color: #f2eee7; }
.ig-empty span { display: block; font-size: 12.5px; color: rgba(255,255,255,0.5); margin-top: 6px; }
`;
