/** @doc Megsy Operator — command deck HUD with gilded controls (Amber/Gold identity). */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Loader2,
  ShieldCheck,
  Bot,
  Terminal,
  Globe,
  Users,
  Wallet,
  ScrollText,
  Cpu,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface OperatorSettings {
  ask_before_sensitive: boolean;
  ask_before_anything: boolean;
  allow_free_shell: boolean;
  allow_browser_automation: boolean;
  allow_dynamic_agents: boolean;
  max_parallel_agents: number;
  budget_cap_cents: number;
}

const DEFAULTS: OperatorSettings = {
  ask_before_sensitive: true,
  ask_before_anything: false,
  allow_free_shell: false,
  allow_browser_automation: true,
  allow_dynamic_agents: true,
  max_parallel_agents: 3,
  budget_cap_cents: 500,
};

export default function MegsyOperatorSettingsPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [settings, setSettings] = useState<OperatorSettings>(DEFAULTS);
  const [agentCount, setAgentCount] = useState(0);
  const [auditCount, setAuditCount] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);
      const [{ data: s }, { count: ac }, { count: lc }] = await Promise.all([
        supabase.from("operator_user_settings").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("operator_dynamic_agents").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("operator_audit_log").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      if (s) setSettings({ ...DEFAULTS, ...s });
      setAgentCount(ac || 0);
      setAuditCount(lc || 0);
      setLoading(false);
    })();
  }, [navigate]);

  const save = async (patch: Partial<OperatorSettings>) => {
    if (!userId) return;
    const next = { ...settings, ...patch };
    setSettings(next);
    setSaving(true);
    const { error } = await supabase
      .from("operator_user_settings")
      .upsert({ user_id: userId, ...next });
    setSaving(false);
    if (error) toast.error("Save failed");
    else toast.success("Saved");
  };

  const goBack = () =>
    window.history.length > 1 ? window.history.back() : navigate("/settings");

  if (loading) {
    return (
      <div className="amber-settings grid place-items-center">
        <Loader2 className="w-6 h-6 animate-spin text-[color:var(--amb-gold-2)]" />
      </div>
    );
  }

  const HudStat = ({ label, value }: { label: string; value: string | number }) => (
    <div className="amb-plate p-4">
      <p className="amb-mono">{label}</p>
      <p className="amb-display text-[26px] font-semibold mt-1 tabular-nums amb-gold-text">
        {value}
      </p>
    </div>
  );

  const ToggleRow = ({
    icon: Icon,
    label,
    desc,
    checked,
    onChange,
  }: {
    icon: any;
    label: string;
    desc: string;
    checked: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <label className="flex items-center gap-4 px-5 py-4 cursor-pointer transition hover:bg-[rgba(245,158,11,0.04)]">
      <span className="amb-icon-capsule shrink-0">
        <Icon className="w-4 h-4" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium">{label}</p>
        <p className="text-[12.5px] mt-0.5 text-[color:var(--amb-cream-dim)]">{desc}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-[color:var(--amb-gold)]"
      />
    </label>
  );

  const SliderCard = ({
    icon: Icon,
    label,
    valueLabel,
    value,
    min,
    max,
    step,
    onChange,
    onCommit,
  }: {
    icon: any;
    label: string;
    valueLabel: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (v: number) => void;
    onCommit: (v: number) => void;
  }) => (
    <div className="amb-plate p-5">
      <div className="flex items-center gap-3 mb-4">
        <span className="amb-icon-capsule">
          <Icon className="w-4 h-4" />
        </span>
        <div className="flex-1">
          <p className="text-[14px] font-medium">{label}</p>
          <p className="amb-mono mt-0.5">{valueLabel}</p>
        </div>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
        onValueCommit={(v) => onCommit(v[0])}
      />
    </div>
  );

  const Section = ({ n, title, children }: { n: string; title: string; children: React.ReactNode }) => (
    <section>
      <div className="flex items-baseline gap-4">
        <span className="amb-eyebrow text-[13px] tabular-nums">{n}</span>
        <h3 className="amb-display text-[22px] font-semibold">{title}</h3>
        <div className="amb-rule flex-1 self-center" />
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );

  const content = (
    <>
      {/* Hero */}
      <div className="amb-plate-strong p-6 md:p-8 flex items-start gap-5">
        <span className="grid h-14 w-14 place-items-center rounded-2xl amb-badge shrink-0">
          <Cpu className="w-6 h-6" />
        </span>
        <div className="flex-1">
          <p className="amb-eyebrow text-[13px]">Megsy Computer</p>
          <h2 className="amb-display text-[26px] md:text-[32px] font-semibold leading-tight mt-1">
            Operator <span className="amb-gold-text italic">controls.</span>
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--amb-cream-dim)]">
            Permissions inside the AI's own environment — browser, shell, dynamic agents, and spend limits.
          </p>
        </div>
        {saving && (
          <Loader2 className="w-4 h-4 animate-spin text-[color:var(--amb-gold-2)] mt-1" />
        )}
      </div>

      {/* HUD */}
      <Section n="01" title="Telemetry">
        <div className="grid grid-cols-2 gap-3">
          <HudStat label="Generated agents" value={agentCount} />
          <HudStat label="Audit entries" value={auditCount} />
        </div>
      </Section>

      {/* Approval gates */}
      <Section n="02" title="Approval gates">
        <div className="amb-plate overflow-hidden">
          <ToggleRow
            icon={ShieldCheck}
            label="Ask before sensitive actions"
            desc="Payments, emails, deleting files, public publishing."
            checked={settings.ask_before_sensitive}
            onChange={(v) => save({ ask_before_sensitive: v })}
          />
          <div className="amb-divider" />
          <ToggleRow
            icon={ShieldCheck}
            label="Ask before any action"
            desc="Strict mode — the AI asks before every tool."
            checked={settings.ask_before_anything}
            onChange={(v) => save({ ask_before_anything: v })}
          />
        </div>
      </Section>

      {/* Capabilities */}
      <Section n="03" title="Capabilities">
        <div className="amb-plate overflow-hidden">
          <ToggleRow
            icon={Globe}
            label="Browser automation"
            desc="Open sites, click, fill forms, extract data."
            checked={settings.allow_browser_automation}
            onChange={(v) => save({ allow_browser_automation: v })}
          />
          <div className="amb-divider" />
          <ToggleRow
            icon={Terminal}
            label="Free shell"
            desc="bash, apt, python, ffmpeg. Advanced users only."
            checked={settings.allow_free_shell}
            onChange={(v) => save({ allow_free_shell: v })}
          />
          <div className="amb-divider" />
          <ToggleRow
            icon={Bot}
            label="Dynamic agents"
            desc="AI generates specialized agents on demand."
            checked={settings.allow_dynamic_agents}
            onChange={(v) => save({ allow_dynamic_agents: v })}
          />
        </div>
      </Section>

      {/* Limits */}
      <Section n="04" title="Limits">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SliderCard
            icon={Users}
            label="Parallel agents"
            valueLabel={`${settings.max_parallel_agents} working together`}
            value={settings.max_parallel_agents}
            min={1}
            max={10}
            step={1}
            onChange={(v) => setSettings({ ...settings, max_parallel_agents: v })}
            onCommit={(v) => save({ max_parallel_agents: v })}
          />
          <SliderCard
            icon={Wallet}
            label="Spend limit per task"
            valueLabel={`$${(settings.budget_cap_cents / 100).toFixed(2)} max`}
            value={settings.budget_cap_cents}
            min={50}
            max={5000}
            step={50}
            onChange={(v) => setSettings({ ...settings, budget_cap_cents: v })}
            onCommit={(v) => save({ budget_cap_cents: v })}
          />
        </div>
      </Section>

      {/* Details */}
      <Section n="05" title="Details">
        <div className="amb-plate overflow-hidden">
          <button
            onClick={() => navigate("/settings/operator/agents")}
            className="w-full flex items-center gap-4 px-5 py-4 text-left transition hover:bg-[rgba(245,158,11,0.04)]"
          >
            <span className="amb-icon-capsule">
              <Bot className="w-4 h-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium">Dynamic agents</p>
              <p className="text-[12.5px] mt-0.5 text-[color:var(--amb-cream-dim)]">
                {agentCount} specialist agents
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-[color:var(--amb-gold-2)]" />
          </button>
          <div className="amb-divider" />
          <button
            onClick={() => navigate("/settings/operator/audit")}
            className="w-full flex items-center gap-4 px-5 py-4 text-left transition hover:bg-[rgba(245,158,11,0.04)]"
          >
            <span className="amb-icon-capsule">
              <ScrollText className="w-4 h-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium">Full audit log</p>
              <p className="text-[12.5px] mt-0.5 text-[color:var(--amb-cream-dim)]">
                Every action the AI performed
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-[color:var(--amb-gold-2)]" />
          </button>
        </div>
      </Section>
    </>
  );

  // ---- DESKTOP ----
  if (!isMobile) {
    return (
      <div className="amber-settings">
        <div className="mx-auto max-w-5xl px-8 py-14 space-y-10">
          <button onClick={goBack} className="amb-back">
            <span className="text-[18px] leading-none">‹</span>
          </button>
          {content}
        </div>
      </div>
    );
  }

  // ---- MOBILE ----
  return (
    <div className="amber-settings">
      <div className="max-w-lg mx-auto px-5 pt-4 pb-16 safe-bottom space-y-6">
        <div className="relative flex items-center justify-center h-11">
          <button onClick={goBack} aria-label="Back" className="amb-back absolute left-0">
            <span className="text-[18px] leading-none">‹</span>
          </button>
          <h1 className="text-[15px] font-semibold tracking-tight">Operator</h1>
        </div>
        {content}
      </div>
    </div>
  );
}
