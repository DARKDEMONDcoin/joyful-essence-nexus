/** @doc Audit trail of every action an Operator agent has taken. */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { m as motion } from "framer-motion";
import { Loader2, ScrollText } from "lucide-react";
import { GlassPage, GlassCard, glassStagger } from "@/components/settings/glass/GlassShell";

interface AuditEntry {
  id: string;
  agent: string;
  action: string;
  payload: any;
  error: string | null;
  created_at: string;
  run_id: string | null;
}

const OperatorAuditPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      const { data } = await supabase
        .from("operator_audit_log")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200);
      setEntries(data || []);
      setLoading(false);
    })();
  }, [navigate]);

  return (
    <div className="amber-settings">
      <GlassPage title="Chronicle" back="/settings/operator">
        <div className="amb-hero">
          <div className="amb-hero-inner">
            <div className="amb-emblem"><ScrollText className="w-6 h-6" /></div>
            <p className="amb-eyebrow text-[13px]">The Chronicle</p>
            <h2 className="amb-display text-[28px] leading-[1.05] font-semibold mt-1">
              Every action, <span className="amb-gold-text italic">inked in gold.</span>
            </h2>
            <p className="text-[13px] mt-2 leading-relaxed text-[color:var(--amb-cream-dim)]">
              A running ledger of the last 200 commands your Operator agents have taken on your behalf.
            </p>
            <div className="amb-rule mt-4" />
            <p className="amb-mono mt-3">{entries.length} entries · newest first</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[color:var(--amb-gold-2)]" />
          </div>
        ) : entries.length === 0 ? (
          <div className="amb-plate p-8 text-center">
            <ScrollText className="w-10 h-10 mx-auto mb-3 text-[color:var(--amb-gold-2)] opacity-70" />
            <p className="text-sm text-[color:var(--amb-cream-dim)]">
              The page is blank. Every command an agent runs will be inscribed here.
            </p>
          </div>
        ) : (
          <div className="relative pl-6">
            <span className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-[color:var(--amb-gold-2)]/60 via-[color:var(--amb-gold-2)]/20 to-transparent" />
            <div className="space-y-3">
              {entries.map((e, i) => (
                <motion.div key={e.id} {...glassStagger(Math.min(i, 6))} className="relative">
                  <span className="absolute -left-[19px] top-4 w-2.5 h-2.5 rounded-full bg-[color:var(--amb-gold-2)] shadow-[0_0_10px_rgba(252,211,77,0.6)]" />
                  <div className="amb-plate p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="amb-mono text-[color:var(--amb-gold-2)]">{e.agent}</span>
                      <span className="text-[10px] text-[color:var(--amb-cream-mute)]">
                        {new Date(e.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[color:var(--amb-cream)]">{e.action}</p>
                    {e.payload && Object.keys(e.payload).length > 0 && (
                      <pre
                        className="mt-2 text-[10px] text-[color:var(--amb-cream-dim)] bg-black/40 border border-[color:var(--amb-line)] p-2 rounded-lg overflow-x-auto max-h-32"
                        dir="ltr"
                      >
                        {JSON.stringify(e.payload, null, 2)}
                      </pre>
                    )}
                    {e.error && <p className="mt-2 text-xs text-[color:var(--amb-danger)]">{e.error}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </GlassPage>
    </div>
  );
};

export default OperatorAuditPage;
