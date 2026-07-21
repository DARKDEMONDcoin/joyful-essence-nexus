/** @doc Public status page — anyone can view Megsy system health, incident timeline, and 90-day uptime per service. */
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { CheckCircle2, AlertTriangle, XCircle, Circle } from "lucide-react";
import SEOHead from "@/components/common/SEOHead";

type Incident = {
  id: string;
  service_name: string;
  status: string;
  title: string | null;
  message: string | null;
  started_at: string;
  resolved_at: string | null;
};

const SERVICES = [
  { name: "Chat", label: "Chat & AI" },
  { name: "Images", label: "Image Generation" },
  { name: "Videos", label: "Video Generation" },
  { name: "Codes", label: "Megsy Coder" },
  { name: "Database", label: "Database & Auth" },
  { name: "Website", label: "Website & API" },
];

const WINDOW_DAYS = 90;
const WINDOW_MS = WINDOW_DAYS * 24 * 60 * 60 * 1000;

function statusOf(currentlyDown: string[], service: string) {
  if (!currentlyDown.includes(service)) return "operational";
  return "outage";
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { icon: JSX.Element; label: string; className: string }> = {
    operational: {
      icon: <CheckCircle2 className="h-4 w-4" />,
      label: "Operational",
      className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
    degraded: {
      icon: <AlertTriangle className="h-4 w-4" />,
      label: "Degraded",
      className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    outage: {
      icon: <XCircle className="h-4 w-4" />,
      label: "Outage",
      className: "bg-red-500/10 text-red-500 border-red-500/20",
    },
  };
  const s = map[status] ?? map.operational;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${s.className}`}>
      {s.icon}
      {s.label}
    </span>
  );
}

function UptimeBar({ pct }: { pct: number }) {
  const bars = Array.from({ length: 60 });
  return (
    <div className="flex gap-0.5 h-8 items-end">
      {bars.map((_, i) => {
        // Distribute "down" ticks proportionally to visualize
        const isDown = i < Math.round((100 - pct) * 0.6);
        return (
          <div
            key={i}
            className={`flex-1 rounded-sm ${isDown ? "bg-red-500/70" : "bg-emerald-500/60"} hover:opacity-100 opacity-90`}
            style={{ height: isDown ? "60%" : "100%" }}
            title={isDown ? "Incident detected" : "Operational"}
          />
        );
      })}
    </div>
  );
}

export default function PublicStatusPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const cutoff = new Date(Date.now() - WINDOW_MS).toISOString();
      const { data, error } = await supabase
        .from("service_incidents")
        .select("id, service_name, status, title, message, started_at, resolved_at")
        .gte("started_at", cutoff)
        .order("started_at", { ascending: false })
        .limit(200);
      if (cancelled) return;
      if (!error && data) setIncidents(data as Incident[]);
      setLoading(false);
      setLastChecked(new Date());
    }
    load();
    const interval = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
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

  const openIncidents = incidents.filter((i) => !i.resolved_at);
  const recentResolved = incidents.filter((i) => i.resolved_at).slice(0, 10);

  return (
    <>
      <SEOHead
        title="Megsy Status — Live system health"
        description="Real-time status of Megsy AI services: chat, image generation, video generation, database, and API. 90-day uptime metrics."
        path="/status"
      />

      <main className="min-h-dvh bg-background text-foreground">
        <header className="border-b border-border">
          <div className="mx-auto max-w-4xl px-4 py-6 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold">
              Megsy
            </Link>
            <span className="text-xs text-muted-foreground">
              Updated {lastChecked.toLocaleTimeString()}
            </span>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-4 py-12">
          {/* Overall banner */}
          <div
            className={`rounded-2xl border p-6 mb-8 flex items-center gap-4 ${
              allOperational
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-red-500/5 border-red-500/20"
            }`}
          >
            {allOperational ? (
              <CheckCircle2 className="h-10 w-10 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="h-10 w-10 text-red-500 shrink-0" />
            )}
            <div>
              <h1 className="text-2xl font-bold">
                {loading
                  ? "Checking system health…"
                  : allOperational
                    ? "All systems operational"
                    : `${currentlyDown.length} service${currentlyDown.length > 1 ? "s" : ""} affected`}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Auto-refreshes every 60 seconds. History window: last {WINDOW_DAYS} days.
              </p>
            </div>
          </div>

          {/* Per-service list */}
          <section aria-labelledby="services-heading" className="space-y-3 mb-12">
            <h2 id="services-heading" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Services
            </h2>
            {SERVICES.map((svc) => {
              const status = statusOf(currentlyDown, svc.name);
              const pct = uptimeByService[svc.name] ?? 100;
              return (
                <article key={svc.name} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Circle className="h-2 w-2 fill-current text-muted-foreground" aria-hidden />
                      <span className="font-medium">{svc.label}</span>
                    </div>
                    <StatusPill status={status} />
                  </div>
                  <UptimeBar pct={pct} />
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{WINDOW_DAYS} days ago</span>
                    <span className="font-mono">{pct.toFixed(3)}% uptime</span>
                    <span>Today</span>
                  </div>
                </article>
              );
            })}
          </section>

          {/* Active incidents */}
          {openIncidents.length > 0 && (
            <section className="mb-10">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-red-500 mb-3">
                Active incidents
              </h2>
              <div className="space-y-2">
                {openIncidents.map((i) => (
                  <div key={i.id} className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{i.title || i.service_name}</p>
                        {i.message && <p className="text-sm text-muted-foreground mt-1">{i.message}</p>}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(i.started_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recent history */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Recent incidents
            </h2>
            {recentResolved.length === 0 ? (
              <p className="text-sm text-muted-foreground">No incidents in the last {WINDOW_DAYS} days.</p>
            ) : (
              <ul className="space-y-2">
                {recentResolved.map((i) => (
                  <li key={i.id} className="rounded-lg border border-border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {i.title || i.service_name}
                        <span className="ml-2 text-xs text-muted-foreground">({i.service_name})</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(i.resolved_at!).toLocaleDateString()}
                      </span>
                    </div>
                    {i.message && <p className="text-xs text-muted-foreground mt-1">{i.message}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <footer className="mt-16 pt-6 border-t border-border text-xs text-muted-foreground text-center">
            <p>
              Subscribe to updates via{" "}
              <a href="mailto:support@megsyai.com" className="underline hover:no-underline">
                support@megsyai.com
              </a>
              . Powered by Megsy.
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
