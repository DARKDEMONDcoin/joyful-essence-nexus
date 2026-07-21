import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity,
  UserPlus,
  UserMinus,
  Settings2,
  Wallet,
  Mail,
  ShieldCheck,
  Crown,
  Pause,
  Play,
  Trash2,
  Pencil,
  LogIn,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import type { WorkspaceCtx } from "@/hooks/useWorkspaceContext";

// Map action keywords → icon + tint so the audit log reads at a glance.
function iconFor(action: string): { Icon: LucideIcon; tint: string } {
  const a = action.toLowerCase();
  if (a.includes("invite"))
    return { Icon: Mail, tint: "text-amber-500 bg-amber-500/10 ring-amber-500/20" };
  if (a.includes("join") || a.includes("accept"))
    return { Icon: LogIn, tint: "text-emerald-500 bg-emerald-500/10 ring-emerald-500/20" };
  if (a.includes("add") && a.includes("member"))
    return { Icon: UserPlus, tint: "text-emerald-500 bg-emerald-500/10 ring-emerald-500/20" };
  if (a.includes("remove") || a.includes("delete"))
    return { Icon: UserMinus, tint: "text-destructive bg-destructive/10 ring-destructive/20" };
  if (a.includes("role") || a.includes("permission"))
    return { Icon: ShieldCheck, tint: "text-blue-500 bg-blue-500/10 ring-blue-500/20" };
  if (a.includes("owner"))
    return { Icon: Crown, tint: "text-amber-500 bg-amber-500/10 ring-amber-500/20" };
  if (a.includes("suspend"))
    return { Icon: Pause, tint: "text-orange-500 bg-orange-500/10 ring-orange-500/20" };
  if (a.includes("unsuspend") || a.includes("reactivate"))
    return { Icon: Play, tint: "text-emerald-500 bg-emerald-500/10 ring-emerald-500/20" };
  if (a.includes("credit") || a.includes("topup") || a.includes("payment") || a.includes("billing"))
    return { Icon: Wallet, tint: "text-emerald-500 bg-emerald-500/10 ring-emerald-500/20" };
  if (a.includes("trash"))
    return { Icon: Trash2, tint: "text-destructive bg-destructive/10 ring-destructive/20" };
  if (a.includes("update") || a.includes("edit") || a.includes("rename"))
    return { Icon: Pencil, tint: "text-foreground bg-foreground/[0.06] ring-border" };
  if (a.includes("setting") || a.includes("config"))
    return { Icon: Settings2, tint: "text-foreground bg-foreground/[0.06] ring-border" };
  return { Icon: Activity, tint: "text-muted-foreground bg-foreground/[0.04] ring-border" };
}

function relativeTime(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function ActivityTab() {
  const { ws } = useOutletContext<{ ws: WorkspaceCtx }>();
  const [logs, setLogs] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "members" | "billing" | "settings">("all");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("workspace_audit_log")
        .select("*")
        .eq("workspace_id", ws.id)
        .order("created_at", { ascending: false })
        .limit(200);
      setLogs((data as any) ?? []);
    })();
  }, [ws.id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs.filter((l) => {
      const a = (l.action || "").toLowerCase();
      if (filter === "members" && !/(member|invite|join|role|owner|suspend)/.test(a)) return false;
      if (filter === "billing" && !/(credit|topup|payment|billing|invoice|plan)/.test(a))
        return false;
      if (
        filter === "settings" &&
        !/(setting|config|rename|update|brand|notification|security|data)/.test(a)
      )
        return false;
      if (q && !a.includes(q) && !(l.target_type || "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [logs, query, filter]);

  // Group by day for a readable timeline.
  const grouped = useMemo(() => {
    const map = new Map<string, any[]>();
    filtered.forEach((l) => {
      const key = new Date(l.created_at).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(l);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const FILTERS: { id: typeof filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "members", label: "Members" },
    { id: "billing", label: "Billing" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-[22px] font-semibold tracking-tight text-foreground">Activity</h2>
        <p className="text-[13px] text-muted-foreground mt-1">
          Audit trail of recent actions in this workspace.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <Input
          placeholder="Search actions…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 rounded-lg flex-1"
        />
        <div className="inline-flex p-1 rounded-lg border border-border bg-card gap-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 h-8 text-[12.5px] font-medium rounded-md transition-colors ${
                filter === f.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-10 rounded-2xl border border-dashed border-border/60 bg-card/40 text-center">
          <Activity className="w-5 h-5 text-muted-foreground/60 mx-auto mb-2" />
          <p className="text-[13px] text-muted-foreground">
            {logs.length === 0 ? "No activity recorded yet." : "Nothing matches that filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([day, items]) => (
            <div key={day}>
              <h4 className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70 mb-3 px-1">
                {day}
              </h4>
              <div className="rounded-2xl border border-border/60 bg-card divide-y divide-border/60 overflow-hidden">
                {items.map((l) => {
                  const { Icon, tint } = iconFor(l.action || "");
                  return (
                    <div
                      key={l.id}
                      className="px-4 py-3.5 hover:bg-foreground/[0.02] transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg grid place-items-center ring-1 shrink-0 ${tint}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13.5px] font-medium capitalize text-foreground leading-snug">
                            {l.action.replace(/_/g, " ")}
                          </p>
                          <p className="text-[11.5px] text-muted-foreground mt-0.5 tabular-nums">
                            {relativeTime(l.created_at)}
                            {l.target_type && (
                              <>
                                <span className="mx-1.5 text-muted-foreground/40">·</span>
                                <span className="capitalize">{l.target_type}</span>
                              </>
                            )}
                          </p>
                          {l.metadata && Object.keys(l.metadata).length > 0 && (
                            <details className="mt-2 group">
                              <summary className="text-[11px] text-muted-foreground/80 cursor-pointer hover:text-foreground select-none">
                                Details
                              </summary>
                              <pre className="text-[10.5px] text-muted-foreground/80 mt-2 p-2.5 rounded-lg bg-foreground/[0.03] border border-border/40 overflow-x-auto">
                                {JSON.stringify(l.metadata, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
