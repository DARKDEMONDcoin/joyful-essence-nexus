/** @doc Create a new shared workspace and invite teammates. */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Check, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { openWorkspaceCheckout } from "@/lib/workspaceCheckout";
import { isWorkspacePaidPlan, WORKSPACE_PLANS } from "@/lib/workspacePlans";
import { setActiveWorkspaceId } from "@/lib/activeWorkspace";
import { sanitizeErrorMessage } from "@/lib/sanitizeError";
import { SubShell, SubSection, SubCard } from "@/components/settings/SubShell";
import { cn } from "@/lib/utils";

type Step = "name" | "plan";

export default function WorkspaceCreatePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [plan, setPlan] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const pendingName = sessionStorage.getItem("megsy_pending_workspace_name");
      if (pendingName) setName(pendingName);
    } catch {}
  }, []);

  const create = async (selectedPlan: string | null) => {
    if (!name.trim()) return;
    setSubmitting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      navigate("/auth");
      return;
    }
    const { data, error } = await supabase.rpc("create_workspace", {
      p_name: name.trim(),
      p_plan: selectedPlan,
    } as never);
    setSubmitting(false);
    if (error) {
      toast.error(sanitizeErrorMessage(error, "Something went wrong"));
      return;
    }
    await supabase
      .from("profiles")
      .update({ active_workspace_id: (data as any).id } as any)
      .eq("id", user.id);
    setActiveWorkspaceId((data as any).id);
    try {
      sessionStorage.removeItem("megsy_pending_workspace_name");
    } catch {}
    toast.success("Workspace created");
    navigate(`/settings/workspaces/${(data as any).id}`);
  };

  const handleContinueWithPlan = async () => {
    if (!plan) return;
    if (plan === "free") {
      await create(null);
      return;
    }
    if (!isWorkspacePaidPlan(plan)) {
      toast.error("Plan not supported yet");
      return;
    }
    setSubmitting(true);
    try {
      sessionStorage.setItem("megsy_pending_workspace_name", name.trim());
      sessionStorage.setItem("megsy_pending_workspace_plan", plan);
    } catch {}
    const result = await openWorkspaceCheckout(plan, "monthly");
    if (!result.ok) {
      setSubmitting(false);
      if (result.reason === "auth_required") {
        navigate("/auth?redirect=/settings/workspaces/new");
        return;
      }
      toast.error("Could not open checkout page");
      return;
    }
    window.location.href = result.url;
  };

  return (
    <SubShell
      title={step === "name" ? "New Workspace" : "Choose a plan"}
      subtitle={
        step === "name"
          ? "Build a shared space for your team's chats, credits, and tasks."
          : `Pick the plan for ${name}. You can change or upgrade this later.`
      }
      backTo={step === "plan" ? undefined : "/settings/workspaces"}
    >
      {step === "name" && (
        <SubSection
          title="Workspace name"
          description="Choose a name your team will recognize. You can rename this later."
        >
          <SubCard>
            <label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground/80 font-medium">
              Name
            </label>
            <input
              placeholder="Marketing team"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep("plan")}
              autoFocus
              className="mt-2 w-full px-3.5 py-2.5 rounded-lg bg-background/60 border border-border/70 text-[14px] text-foreground outline-none focus:border-foreground/40 transition-colors"
            />
            <div className="mt-3 flex items-center gap-2 text-[12.5px] text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              You can invite teammates after creating it.
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => navigate("/settings/workspaces")}
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep("plan")}
                disabled={!name.trim()}
                className="px-4 py-2 rounded-lg text-[13px] font-medium bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40 transition-colors"
              >
                Continue
              </button>
            </div>
          </SubCard>
        </SubSection>
      )}

      {step === "plan" && (
        <SubSection
          title="Plan"
          description="Select the tier that fits your team. You can skip and pick this later."
        >
          <div className="space-y-2.5">
            {WORKSPACE_PLANS.map((p) => {
              const selected = plan === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  className={cn(
                    "w-full text-left rounded-2xl p-4 transition border bg-card/40",
                    selected
                      ? "border-foreground/60 bg-foreground/[0.03]"
                      : "border-border/70 hover:border-foreground/30"
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[15px] font-semibold tracking-tight text-foreground">
                        {p.name}
                      </span>
                      <span className="text-[12.5px] text-muted-foreground font-medium">
                        {p.monthlyPrice === 0 ? "Free" : `$${p.monthlyPrice}/mo`}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "w-5 h-5 rounded-full grid place-items-center border transition",
                        selected
                          ? "bg-foreground text-background border-foreground"
                          : "bg-transparent border-border"
                      )}
                    >
                      {selected && <Check className="w-3 h-3" strokeWidth={3} />}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-muted-foreground mb-2 leading-relaxed">
                    {p.tagline}
                  </p>
                  {p.creditsLabel && (
                    <p className="text-[12px] text-foreground/80 mb-2 font-medium">
                      {p.creditsLabel}
                    </p>
                  )}
                  <ul className="text-[12px] text-muted-foreground space-y-0.5">
                    {p.perks.map((x) => (
                      <li key={x} className="flex gap-1.5">
                        <span className="text-foreground/40">•</span>
                        {x}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              onClick={() => setStep("name")}
              className="px-4 py-2 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => create(null)}
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleContinueWithPlan}
              disabled={submitting || !plan}
              className="px-4 py-2 rounded-lg text-[13px] font-medium bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40 transition-colors inline-flex items-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : plan === "free" ? (
                "Create"
              ) : (
                "Pay & continue"
              )}
            </button>
          </div>
        </SubSection>
      )}
    </SubShell>
  );
}
