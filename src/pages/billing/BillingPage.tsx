/** @doc Subscription management page. */
import { useState, useEffect } from "react";
import {
  ArrowUpRight,
  MessageCircle,
  BadgeCheck,
  CalendarClock,
  Rocket,
  HeartHandshake,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { SubShell, SubSection, SubCard } from "@/components/settings/SubShell";
import ProfileGlassShell, {
  GlassSection,
  GlassCard,
  GlassRow,
  GlassPrimaryButton,
  GlassSecondaryButton,
} from "@/components/profile/ProfileGlassShell";
import { toast } from "sonner";

type Sub = {
  plan: string | null;
  status: string | null;
  current_period_end: string | null;
  amount_cents: number | null;
  currency: string | null;
};

const fmtDate = (s?: string | null) =>
  s
    ? new Date(s).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

const REASONS = [
  "Too expensive",
  "Not using it enough",
  "Missing features",
  "Found an alternative",
  "Other",
];

const BillingPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [credits, setCredits] = useState(0);
  const [plan, setPlan] = useState("Free");
  const [sub, setSub] = useState<Sub | null>(null);

  // cancel flow
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [improvement, setImprovement] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("credits, plan")
        .eq("id", user.id)
        .single();
      if (profile) {
        setCredits(Number(profile.credits) || 0);
        setPlan(profile.plan || "Free");
      }
      const { data: subData } = await supabase
        .from("subscriptions")
        .select("plan, status, current_period_end, amount_cents, currency")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (subData) setSub(subData as Sub);
    })();
  }, []);

  const goBack = () => navigate("/settings");
  const isActive = sub?.status === "active" || sub?.status === "trialing";
  const priceLabel = sub?.amount_cents
    ? `${(sub.amount_cents / 100).toFixed(0)} ${sub.currency || "EGP"}`
    : null;

  const submitCancel = async () => {
    if (!reason) {
      toast.error("Please tell us why you're cancelling");
      return;
    }
    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("contact_submissions").insert({
        user_id: user.id,
        subject: "Subscription cancellation",
        message: `Reason: ${reason}\n\nHow we can improve:\n${improvement || "—"}`,
      } as any);
      if (error) throw error;
      toast.success("Cancellation request sent. Our team will reach out shortly.");
      setCancelOpen(false);
      setReason("");
      setImprovement("");
    } catch (e: any) {
      toast.error(e?.message || "Could not submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const CancelForm = (
    <GlassCard>
      <div style={{ padding: 16, display: "grid", gap: 14 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 8 }}>
            Why are you cancelling?
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {REASONS.map((r) => {
              const active = reason === r;
              return (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    fontSize: 12.5,
                    fontWeight: 500,
                    border: `1px solid ${active ? "rgba(255,255,255,0.55)" : "var(--overlay-white-14)"}`,
                    background: active ? "rgba(255,255,255,0.16)" : "var(--overlay-white-04)",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--overlay-white-70)", display: "block", marginBottom: 6 }}>
            How can we improve?
          </label>
          <textarea
            placeholder="Optional — what would have kept you here?"
            value={improvement}
            onChange={(e) => setImprovement(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 12,
              background: "var(--overlay-white-04)",
              border: "1px solid var(--overlay-white-12)",
              color: "#fff",
              fontSize: 13,
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
        </div>
        <div className="ng-actions" style={{ marginTop: 4 }}>
          <GlassSecondaryButton onClick={() => setCancelOpen(false)}>
            Keep plan
          </GlassSecondaryButton>
          <GlassPrimaryButton onClick={submitCancel} disabled={submitting}>
            {submitting ? "Sending…" : "Confirm cancel"}
          </GlassPrimaryButton>
        </div>
      </div>
    </GlassCard>
  );

  if (isMobile) {
    return (
      <ProfileGlassShell
        title="Subscription"
        subtitle="Manage your plan and message credits."
        onBack={goBack}
      >
        <GlassSection title="Credits">
          <GlassCard>
            <GlassRow
              icon={<MessageCircle className="w-[18px] h-[18px]" />}
              label="Message credits"
              hint={`${credits.toLocaleString()} MC available`}
              trailing={
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--overlay-white-80)",
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "var(--overlay-white-08)",
                  }}
                >
                  {plan}
                </span>
              }
            />
          </GlassCard>
        </GlassSection>

        <GlassSection title="Plan details">
          <GlassCard>
            <GlassRow
              icon={<BadgeCheck className="w-[18px] h-[18px]" />}
              label="Status"
              hint={
                isActive
                  ? priceLabel
                    ? `${sub?.status} · ${priceLabel}`
                    : String(sub?.status)
                  : "No active subscription"
              }
              trailing={null}
            />
            {isActive && sub?.current_period_end && (
              <GlassRow
                icon={<CalendarClock className="w-[18px] h-[18px]" />}
                label="Next renewal"
                hint={fmtDate(sub.current_period_end)}
                trailing={null}
              />
            )}
          </GlassCard>
        </GlassSection>

        <GlassSection title="Manage">
          <GlassCard>
            <GlassRow
              icon={<Rocket className="w-[18px] h-[18px]" />}
              label={isActive ? "Change plan" : "Upgrade plan"}
              hint="View pricing and switch plans"
              onClick={() => navigate("/pricing")}
            />
            <GlassRow
              icon={<HeartHandshake className="w-[18px] h-[18px]" />}
              label="Earn free MC"
              hint="Invite friends and unlock bonuses"
              onClick={() => navigate("/settings/referrals")}
            />
            {isActive && !cancelOpen && (
              <GlassRow
                icon={<LogOut className="w-[18px] h-[18px]" />}
                label="Cancel subscription"
                hint="One tap — we'll ask a quick question"
                onClick={() => setCancelOpen(true)}
                danger
              />
            )}
          </GlassCard>
        </GlassSection>

        {isActive && cancelOpen && (
          <GlassSection title="Before you go">{CancelForm}</GlassSection>
        )}

        <div className="ng-actions">
          <GlassPrimaryButton onClick={() => navigate("/pricing")}>
            Top up MC <ArrowUpRight className="w-4 h-4" />
          </GlassPrimaryButton>
        </div>
      </ProfileGlassShell>
    );
  }

  return (
    <SubShell
      title="Subscription"
      subtitle="Manage your plan and message credits."
      backTo="/settings"
    >
      <SubSection title="Credits" description="Message credits available on your account.">
        <SubCard>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground/80 font-medium">
                Message credits
              </p>
              <p className="mt-2 text-[32px] font-semibold text-foreground leading-none">
                {credits.toLocaleString()}
                <span className="ml-2 text-[13px] font-medium text-muted-foreground">MC</span>
              </p>
            </div>
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full border border-border bg-background/60 uppercase tracking-[0.14em]">
              {plan}
            </span>
          </div>
          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              onClick={() => navigate("/settings/referrals")}
              className="px-4 py-2 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Earn MC
            </button>
            <button
              onClick={() => navigate("/pricing")}
              className="px-4 py-2 rounded-lg text-[13px] font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors inline-flex items-center gap-1.5"
            >
              Top up <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </SubCard>
      </SubSection>

      <SubSection title="Plan details" description="Your active subscription.">
        <SubCard>
          <div className="grid grid-cols-2 gap-4 text-[13px]">
            <div>
              <p className="text-muted-foreground text-[11px] uppercase tracking-[0.14em]">Status</p>
              <p className="mt-1 font-medium text-foreground">{sub?.status || "free"}</p>
            </div>
            {isActive && (
              <>
                <div>
                  <p className="text-muted-foreground text-[11px] uppercase tracking-[0.14em]">Price</p>
                  <p className="mt-1 font-medium text-foreground">{priceLabel || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] uppercase tracking-[0.14em]">Renews on</p>
                  <p className="mt-1 font-medium text-foreground">{fmtDate(sub?.current_period_end)}</p>
                </div>
              </>
            )}
          </div>
          <div className="mt-5 flex items-center justify-end gap-2">
            {isActive && (
              <button
                onClick={() => setCancelOpen((v) => !v)}
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
              >
                Cancel subscription
              </button>
            )}
            <button
              onClick={() => navigate("/pricing")}
              className="px-4 py-2 rounded-lg text-[13px] font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors inline-flex items-center gap-1.5"
            >
              {isActive ? "Change plan" : "Upgrade"} <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </SubCard>
      </SubSection>

      {isActive && cancelOpen && (
        <SubSection title="Before you go" description="Tell us why so we can improve.">
          <SubCard>{CancelForm}</SubCard>
        </SubSection>
      )}
    </SubShell>
  );
};

export default BillingPage;
