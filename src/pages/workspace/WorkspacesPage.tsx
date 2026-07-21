/** @doc List of all workspaces you belong to. */
// Workspaces list — unified editorial dark design across desktop + mobile.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus, Lock, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspaces } from "@/hooks/useWorkspace";
import { useUserPlan } from "@/hooks/useUserPlan";
import { SubShell, SubSection, SubStatStrip } from "@/components/settings/SubShell";
import { cn } from "@/lib/utils";

const PRO_PLANS = new Set(["pro", "elite", "business", "enterprise"]);

export default function WorkspacesPage() {
  const navigate = useNavigate();
  const { workspaces, activeId, setActive, loading } = useWorkspaces();
  const { plan } = useUserPlan();
  const canCreate = PRO_PLANS.has(plan);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!workspaces.length) return;
    (async () => {
      const ids = workspaces.map((w) => w.id);
      const { data } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .in("workspace_id", ids);
      const counts: Record<string, number> = {};
      (data ?? []).forEach((r: any) => {
        counts[r.workspace_id] = (counts[r.workspace_id] ?? 0) + 1;
      });
      setMemberCounts(counts);
    })();
  }, [workspaces]);

  const switchTo = async (id: string | null, name: string) => {
    await setActive(id);
    toast.success(`Switched to ${name}`);
  };

  const totalCredits = workspaces.reduce((sum, w) => sum + Number(w.credits ?? 0), 0);

  const allRows = [
    {
      id: null as string | null,
      name: "Personal",
      subtitle: "Your private space",
      credits: null as number | null,
      avatar: null as string | null,
    },
    ...workspaces.map((w) => ({
      id: w.id,
      name: w.name,
      subtitle: `${memberCounts[w.id] ?? 1} member${(memberCounts[w.id] ?? 1) === 1 ? "" : "s"} · Team`,
      credits: Number(w.credits),
      avatar: w.avatar_url,
    })),
  ];

  return (
    <SubShell
      title="Workspaces"
      subtitle="Switch between your personal space and shared team workspaces. Each workspace has its own members, credits, and settings."
      backTo="/settings"
    >
      <SubSection
        title="Overview"
        description="A quick look at all the spaces linked to your account."
      >
        <SubStatStrip
          items={[
            { label: "Spaces", value: String(workspaces.length + 1) },
            { label: "Team credits", value: totalCredits.toFixed(0), sub: "MC across teams" },
            { label: "Plan", value: canCreate ? "Pro" : "Free" },
            { label: "Active", value: activeId ? "Team" : "Personal" },
          ]}
        />
      </SubSection>

      <SubSection
        title="Your spaces"
        description="Tap Switch to make a space active, or Manage to open its settings."
      >
        <div className="rounded-2xl border border-border/70 bg-card/40 overflow-hidden divide-y divide-border/60">
          {loading && allRows.length === 1 ? (
            <div className="p-6 grid place-items-center">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            allRows.map((r) => {
              const isActive = activeId === r.id;
              return (
                <div key={r.id ?? "personal"} className="flex items-center gap-3 px-4 py-3.5">
                  {r.avatar ? (
                    <img
                      src={r.avatar}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover ring-1 ring-border/60 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-foreground/[0.06] border border-border/60 grid place-items-center text-[13.5px] font-semibold text-foreground shrink-0">
                      {r.name[0]?.toUpperCase() ?? "W"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[14.5px] font-medium text-foreground truncate">
                        {r.name}
                      </p>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[12.5px] text-muted-foreground truncate mt-0.5">
                      {r.subtitle}
                      {r.credits !== null && (
                        <span
                          className={cn(
                            "ml-1.5 tabular-nums",
                            r.credits < 50 && "text-rose-400"
                          )}
                        >
                          · {r.credits.toFixed(0)} MC
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {r.id && (
                      <button
                        onClick={() => navigate(`/settings/workspaces/${r.id}`)}
                        className="text-[12.5px] font-medium px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04] transition-colors"
                      >
                        Manage
                      </button>
                    )}
                    {!isActive && (
                      <button
                        onClick={() => switchTo(r.id, r.name)}
                        className="text-[12.5px] font-medium px-3 py-1.5 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors"
                      >
                        Switch
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SubSection>

      <SubSection
        title="Create workspace"
        description="Spin up a shared workspace for your team. Invite members and share credits."
      >
        {canCreate ? (
          <button
            onClick={() => navigate("/settings/workspaces/new")}
            className="group w-full rounded-2xl border border-dashed border-border/70 bg-card/30 px-5 py-4 flex items-center gap-3 hover:border-foreground/40 hover:bg-foreground/[0.02] transition-colors text-left"
          >
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-foreground/[0.06] border border-border/60 text-foreground shrink-0">
              <Plus className="w-4 h-4" strokeWidth={2} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-foreground">New workspace</p>
              <p className="text-[12.5px] text-muted-foreground mt-0.5">
                Invite teammates and share credits.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0" />
          </button>
        ) : (
          <button
            onClick={() => navigate("/pricing")}
            className="group w-full rounded-2xl border border-border/70 bg-card/40 px-5 py-4 flex items-center gap-3 hover:border-foreground/40 transition-colors text-left"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 shrink-0">
              <Lock className="w-4 h-4" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-medium text-foreground">Create workspace</p>
                <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-px rounded border border-amber-500/30 text-amber-400">
                  Pro
                </span>
              </div>
              <p className="text-[12.5px] text-muted-foreground mt-0.5">
                Upgrade your plan to unlock team workspaces.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0" />
          </button>
        )}
      </SubSection>
    </SubShell>
  );
}
