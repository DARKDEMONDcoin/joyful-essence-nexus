/** @doc Switch between multiple signed-in Megsy accounts. */
import { useNavigate } from "react-router-dom";
import { Check, Plus, Settings2, Users, UserCircle2 } from "lucide-react";
import { useWorkspaces } from "@/hooks/useWorkspace";
import { useActiveAccount } from "@/hooks/useActiveAccount";
import { toast } from "sonner";
import {
  GlassPage,
  GlassSection,
  GlassList,
  GlassRow,
  GlassHero,
} from "@/components/settings/glass/GlassShell";

const SwitchAccountPage = () => {
  const navigate = useNavigate();
  const { workspaces, activeId, setActive, loading } = useWorkspaces();
  const account = useActiveAccount();

  const switchTo = async (id: string | null, name: string) => {
    await setActive(id);
    toast.success(`Switched to ${name}`);
  };

  const ActiveCheck = () => (
    <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
      <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={3} />
    </span>
  );

  return (
    <div className="amber-settings">
      <GlassPage title="Signet" back="/settings">
        <div className="amb-hero">
          <div className="amb-hero-inner flex items-start gap-4">
            <div className="amb-emblem shrink-0"><UserCircle2 className="w-6 h-6" /></div>
            <div className="min-w-0">
              <p className="amb-eyebrow text-[13px]">Currently bearing the signet</p>
              <h2 className="amb-display text-[28px] leading-[1.05] font-semibold mt-1 truncate">
                {account.name || "Personal"}
              </h2>
              <div className="amb-rule my-3 max-w-[220px]" />
              <p className="amb-mono">
                {account.kind === "workspace" ? "Workspace" : "Personal"} · {account.credits.toFixed(0)} credits
              </p>
            </div>
          </div>
        </div>

        <p className="amb-mono mb-2 px-1">Your seals</p>
        <div className="amb-plate mb-6 overflow-hidden">
          <button
            onClick={() => switchTo(null, "Personal")}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[color:var(--amb-line)] transition"
          >
            <span className="amb-icon-capsule"><UserCircle2 className="w-5 h-5" /></span>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[color:var(--amb-cream)]">Personal</p>
              <p className="text-[12px] text-[color:var(--amb-cream-dim)]">Your private space</p>
            </div>
            {activeId === null && <ActiveCheck />}
          </button>
          {loading ? (
            <div className="px-4 py-3 amb-mono">Loading…</div>
          ) : (
            workspaces.map((w) => (
              <div key={w.id} className="border-t border-[color:var(--amb-line)]">
                <button
                  onClick={() => switchTo(w.id, w.name)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[color:var(--amb-line)] transition"
                >
                  <span className="amb-icon-capsule"><Users className="w-5 h-5" /></span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[color:var(--amb-cream)] truncate">{w.name}</p>
                    <p className="text-[12px] text-[color:var(--amb-cream-dim)]">{Number(w.credits).toFixed(0)} credits</p>
                  </div>
                  {activeId === w.id && <ActiveCheck />}
                </button>
              </div>
            ))
          )}
        </div>

        <p className="amb-mono mb-2 px-1">Manage</p>
        <div className="amb-plate overflow-hidden">
          {activeId && (
            <button
              onClick={() => navigate(`/settings/workspaces/${activeId}`)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[color:var(--amb-line)] transition"
            >
              <span className="amb-icon-capsule"><Settings2 className="w-5 h-5" /></span>
              <p className="text-[14px] font-semibold text-[color:var(--amb-cream)]">Manage current workspace</p>
            </button>
          )}
          <button
            onClick={() => navigate("/settings/workspaces")}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[color:var(--amb-line)] transition border-t border-[color:var(--amb-line)]"
          >
            <span className="amb-icon-capsule"><Users className="w-5 h-5" /></span>
            <p className="text-[14px] font-semibold text-[color:var(--amb-cream)]">All workspaces</p>
          </button>
          <button
            onClick={() => navigate("/settings/workspaces/new")}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[color:var(--amb-line)] transition border-t border-[color:var(--amb-line)]"
          >
            <span className="amb-icon-capsule"><Plus className="w-5 h-5" /></span>
            <p className="text-[14px] font-semibold text-[color:var(--amb-cream)]">New workspace</p>
          </button>
        </div>
      </GlassPage>
    </div>
  );
};

export default SwitchAccountPage;
