/** @doc System status — Apple-clean hero check + Uiverse-style gradient pipes per service. */
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SubShell } from "@/components/settings/SubShell";

type Incident = {
  id: string;
  service_name: string;
  status: string;
  title: string | null;
  message: string | null;
  started_at: string;
  resolved_at: string | null;
};

// Refined, muted palette — each service gets its own calm tone with a soft glow.
const SERVICES: { name: string; base: string; glow: string }[] = [
  { name: "Chat",     base: "#7a5af8", glow: "rgba(196, 181, 253, 0.75)" }, // soft indigo
  { name: "Images",   base: "#e07a5f", glow: "rgba(252, 190, 165, 0.75)" }, // warm terracotta
  { name: "Videos",   base: "#c9668a", glow: "rgba(244, 182, 200, 0.75)" }, // dusty rose
  { name: "Codes",    base: "#4a90a4", glow: "rgba(147, 197, 214, 0.75)" }, // muted teal
  { name: "Database", base: "#6ba368", glow: "rgba(167, 216, 165, 0.75)" }, // sage green
  { name: "Website",  base: "#c9a94a", glow: "rgba(238, 216, 149, 0.75)" }, // soft gold
];

const WINDOW_DAYS = 90;
const WINDOW_MS = WINDOW_DAYS * 24 * 60 * 60 * 1000;

const FloatingPoints = () => (
  <span className="status-points" aria-hidden>
    {Array.from({ length: 10 }).map((_, i) => (
      <span key={i} className="status-point" />
    ))}
  </span>
);

const SystemStatusPage = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      setIncidents([]);
      setLoading(false);
      await supabase.auth.getUser();
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const uptimeByService = useMemo(() => {
    const now = Date.now();
    const windowStart = now - WINDOW_MS;
    const map: Record<string, number> = {};
    for (const svc of SERVICES) {
      const downMs = incidents
        .filter((i) => i.service_name === svc.name)
        .reduce((acc, i) => {
          const start = new Date(i.started_at).getTime();
          const end = i.resolved_at ? new Date(i.resolved_at).getTime() : now;
          return acc + Math.max(0, Math.min(end, now) - Math.max(start, windowStart));
        }, 0);
      map[svc.name] = Math.max(0, 100 - (downMs / WINDOW_MS) * 100);
    }
    return map;
  }, [incidents]);

  const currentlyDown = useMemo(
    () => incidents.filter((i) => !i.resolved_at).map((i) => i.service_name),
    [incidents],
  );
  const allOperational = currentlyDown.length === 0;

  return (
    <SubShell title="System status" backTo="/settings">
      {/* Hero — Apple-style check */}
      <div className="pt-2 pb-2 flex flex-col items-center text-center">
        <div className="relative flex items-center justify-center w-20 h-20">
          <div
            className="status-check-badge relative w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: allOperational ? "#34C759" : "#FF3B30",
            }}
          >
            <svg
              className="status-check-svg w-11 h-11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M4.5 12.5l4.5 4.5L19.5 7" />
            </svg>
          </div>
        </div>
        <h2 className="mt-5 text-[22px] leading-tight font-semibold tracking-tight text-foreground">
          {loading
            ? "Checking systems…"
            : allOperational
              ? "All systems operational"
              : `${currentlyDown.length} service${currentlyDown.length === 1 ? "" : "s"} disrupted`}
        </h2>
      </div>

      {/* Uiverse-style gradient pipes */}
      <div className="mt-8 space-y-4">
        {SERVICES.map((svc) => {
          const uptime = uptimeByService[svc.name] ?? 100;
          const isDown = currentlyDown.includes(svc.name);
          const base = isDown ? "#f43f5e" : svc.base;
          const glow = isDown ? "rgba(255, 113, 143, 0.85)" : svc.glow;
          return (
            <div key={svc.name}>
              <div className="flex items-center justify-between mb-2 px-0.5">
                <span className="text-[14px] text-foreground">{svc.name}</span>
                <span className="text-[12px] tabular-nums text-muted-foreground">
                  {uptime.toFixed(2)}%
                </span>
              </div>
              <div className="status-pipe">
                <div
                  className="status-pipe-fill"
                  style={{
                    width: `${Math.max(4, uptime)}%`,
                    background: `radial-gradient(65.28% 65.28% at 50% 100%, ${glow} 0%, rgba(0,0,0,0) 100%), linear-gradient(0deg, ${base}, ${base})`,
                    boxShadow: `0 0 10px ${glow}`,
                  }}
                >
                  <span className="status-pipe-highlight" />
                  <FloatingPoints />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Past incidents — to be filled manually */}
      <div className="mt-12">
        <h3 className="text-[15px] font-semibold text-foreground tracking-tight mb-4 px-0.5">
          Past incidents
        </h3>
        {incidents.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border/60 rounded-2xl">
            <p className="text-[13.5px] text-muted-foreground">
              Nothing here yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60 border-y border-border/60">
            {incidents.map((incident) => {
              const isResolved = !!incident.resolved_at;
              return (
                <div key={incident.id} className="py-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        isResolved ? "bg-emerald-400" : "bg-rose-400"
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-[14px] text-foreground truncate">
                        {incident.title || `${incident.service_name} is down`}
                      </div>
                      <div className="text-[12px] text-muted-foreground mt-0.5">
                        {incident.message || "Service disruption"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[12px] text-muted-foreground tabular-nums">
                      {new Date(incident.started_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SubShell>
  );
};

export default SystemStatusPage;
