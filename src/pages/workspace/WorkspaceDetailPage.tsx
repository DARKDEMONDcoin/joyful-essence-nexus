/** @doc Workspace home — members, billing, brand, integrations, danger zone. */
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { ChevronLeft, Loader2, Menu, Plus, AlertTriangle, X } from "lucide-react";
import { useWorkspaceContext } from "@/hooks/useWorkspaceContext";
import WorkspaceSideNav from "@/components/workspace/WorkspaceSideNav";
import PresenceBar from "@/components/workspace/PresenceBar";
import { cn } from "@/lib/utils";

export default function WorkspaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ctx = useWorkspaceContext(id);
  const [navOpen, setNavOpen] = useState(false);

  if (ctx.loading || !ctx.ws) {
    return (
      <div className="min-h-dvh grid place-items-center bg-background">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const credits = Number(ctx.ws.credits ?? 0);
  const lowCredits = credits < 50;
  const avatarUrl = (ctx.ws as any).avatar_url as string | undefined;

  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3 safe-top">
          <button
            onClick={() => navigate("/settings/workspaces")}
            className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2} />
            <span className="hidden sm:inline">Workspaces</span>
          </button>

          <div className="flex items-center gap-2.5 flex-1 min-w-0 pl-2 sm:pl-4 sm:border-l border-border/60 sm:ml-1">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="w-8 h-8 rounded-lg object-cover shrink-0 ring-1 ring-border/60"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg grid place-items-center text-[13px] shrink-0 bg-foreground/[0.06] border border-border/60 text-foreground font-semibold">
                {ctx.ws.name[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex items-center gap-2">
              <h1 className="text-[14.5px] font-semibold tracking-tight truncate text-foreground">
                {ctx.ws.name}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-border/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
                  {ctx.myRole || "member"}
                </span>
              </span>
            </div>
          </div>

          <div
            className={cn(
              "hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] tabular-nums border",
              lowCredits
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                : "bg-foreground/[0.04] border-border/60 text-foreground",
            )}
          >
            {credits.toFixed(0)}
            <span className="opacity-60">cr</span>
            {lowCredits && <AlertTriangle className="w-3 h-3" />}
          </div>

          {ctx.canBilling && (
            <button
              onClick={() => navigate(`/settings/workspaces/${ctx.ws!.id}/billing`)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-[12px] font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2} /> Top up
            </button>
          )}

          <PresenceBar workspaceId={ctx.ws.id} />

          <button
            onClick={() => setNavOpen((v) => !v)}
            className="md:hidden grid h-9 w-9 place-items-center rounded-lg bg-foreground/[0.06] border border-border/60 hover:bg-foreground/[0.1] transition-colors"
            aria-label="Menu"
          >
            {navOpen ? (
              <X className="w-4 h-4" strokeWidth={2} />
            ) : (
              <Menu className="w-4 h-4" strokeWidth={2} />
            )}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 md:gap-10">
        <aside className={`${navOpen ? "block" : "hidden"} md:block`}>
          <div onClick={() => setNavOpen(false)} className="md:sticky md:top-20">
            <WorkspaceSideNav />
          </div>
        </aside>
        <main className="min-w-0 max-w-3xl">
          <Outlet
            context={{
              ws: ctx.ws,
              me: ctx.me,
              myRole: ctx.myRole,
              isOwner: ctx.isOwner,
              isAdmin: ctx.isAdmin,
              canBilling: ctx.canBilling,
            }}
          />
        </main>
      </div>
    </div>
  );
}
