/** @doc Manage long-running autonomous Operator agents. */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { m as motion } from "framer-motion";
import { Loader2, Bot, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { GlassPage, GlassCard, glassStagger } from "@/components/settings/glass/GlassShell";

interface DynAgent {
  id: string;
  key: string;
  label: string;
  description: string | null;
  color: string;
  usage_count: number;
  created_at: string;
}

const OperatorAgentsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<DynAgent[]>([]);

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    const { data } = await supabase
      .from("operator_dynamic_agents")
      .select("id,key,label,description,color,usage_count,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setAgents(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string, label: string) => {
    if (!confirm(`Delete ${label}?`)) return;
    const { error } = await supabase.from("operator_dynamic_agents").delete().eq("id", id);
    if (error) toast.error("Delete failed");
    else {
      toast.success("Deleted");
      load();
    }
  };

  return (
    <div className="amber-settings">
      <GlassPage title="The Guild" back="/settings/operator">
        <div className="amb-hero">
          <div className="amb-hero-inner">
            <div className="amb-emblem"><Bot className="w-6 h-6" /></div>
            <p className="amb-eyebrow text-[13px]">The Guild</p>
            <h2 className="amb-display text-[28px] leading-[1.05] font-semibold mt-1">
              Specialist agents, <span className="amb-gold-text italic">summoned as needed.</span>
            </h2>
            <p className="text-[13px] mt-2 leading-relaxed text-[color:var(--amb-cream-dim)]">
              Each guild member wakes when a task in their specialty appears in your chat.
            </p>
            <div className="amb-rule mt-4" />
            <p className="amb-mono mt-3">{agents.length} guild members</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[color:var(--amb-gold-2)]" />
          </div>
        ) : agents.length === 0 ? (
          <div className="amb-plate p-8 text-center">
            <Bot className="w-10 h-10 mx-auto mb-3 text-[color:var(--amb-gold-2)] opacity-70" />
            <p className="text-sm text-[color:var(--amb-cream-dim)]">
              The guild hall is empty. Ask for a specialized task and a new member will be sworn in.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {agents.map((a, i) => (
              <motion.div key={a.id} {...glassStagger(Math.min(i, 6))}>
                <div className="amb-plate p-4 h-full relative overflow-hidden">
                  <span
                    aria-hidden
                    className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-30 blur-2xl"
                    style={{ background: a.color }}
                  />
                  <div className="relative flex items-start gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl grid place-items-center shrink-0 border"
                      style={{ background: `${a.color}22`, borderColor: `${a.color}55` }}
                    >
                      <Sparkles className="w-5 h-5" style={{ color: a.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[color:var(--amb-cream)]">{a.label}</p>
                      {a.description && (
                        <p className="text-xs text-[color:var(--amb-cream-dim)] mt-0.5 line-clamp-2">
                          {a.description}
                        </p>
                      )}
                      <p className="amb-mono mt-2">
                        {a.usage_count}× summoned · {new Date(a.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => remove(a.id, a.label)}
                      className="w-8 h-8 rounded-lg hover:bg-[color:var(--amb-danger)]/15 grid place-items-center text-[color:var(--amb-danger)]/80 hover:text-[color:var(--amb-danger)] transition"
                      aria-label="Dismiss agent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassPage>
    </div>
  );
};

export default OperatorAgentsPage;
