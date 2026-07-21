/** @doc Memory — Noir & Gold redesign. */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Trash2, RotateCcw, Plus, Pencil, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import ProfileGlassShell, {
  GlassSection,
  GlassCard,
} from "@/components/profile/ProfileGlassShell";

interface MemoryEntry {
  id: string;
  title: string;
  summary: string;
  scope: string | null;
  created_at: string;
}

const MemoryPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [summary, setSummary] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Record<string, any> | null>(null);
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      setUserId(user.id);
      await refresh(user.id);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = async (uid: string) => {
    const [{ data: prof }, { data: rows }] = await Promise.all([
      supabase.from("user_memory_profiles").select("account_summary, preferences").eq("user_id", uid).maybeSingle(),
      supabase.from("user_memory_entries").select("id, title, summary, scope, created_at")
        .eq("user_id", uid).order("created_at", { ascending: false }).limit(200),
    ]);
    setSummary((prof as any)?.account_summary ?? null);
    setPrefs((prof as any)?.preferences ?? null);
    setEnabled(((prof as any)?.preferences?.enabled ?? true) !== false);
    setEntries((rows as MemoryEntry[]) ?? []);
  };

  const toggle = async (next: boolean) => {
    if (!userId) return;
    setBusy(true); setEnabled(next);
    try {
      const nextPrefs = { ...(prefs ?? {}), enabled: next };
      const { error } = await supabase.from("user_memory_profiles")
        .upsert({ user_id: userId, preferences: nextPrefs }, { onConflict: "user_id" });
      if (error) throw error;
      setPrefs(nextPrefs);
      toast.success(next ? "Memory enabled" : "Memory paused");
    } catch (e: any) {
      setEnabled(!next);
      toast.error(e?.message || "Failed to update");
    } finally { setBusy(false); }
  };

  const del = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase.from("user_memory_entries").delete().eq("id", id);
      if (error) throw error;
      setEntries((es) => es.filter((e) => e.id !== id));
      toast.success("Memory removed");
    } catch (e: any) { toast.error(e?.message || "Failed to delete"); }
    finally { setDeletingId(null); }
  };

  const saveEdit = async (id: string, title: string, summary: string) => {
    const t = title.trim().slice(0, 200);
    const s = summary.trim().slice(0, 2000);
    if (!t || !s) { toast.error("Title and summary are required"); return false; }
    try {
      const { error } = await supabase.from("user_memory_entries")
        .update({ title: t, summary: s }).eq("id", id);
      if (error) throw error;
      setEntries((es) => es.map((e) => e.id === id ? { ...e, title: t, summary: s } : e));
      toast.success("Memory updated");
      return true;
    } catch (e: any) {
      toast.error(e?.message || "Failed to update");
      return false;
    }
  };

  const reset = async () => {
    if (!userId) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("user_memory_entries").delete().eq("user_id", userId);
      if (error) throw error;
      setEntries([]); setResetOpen(false);
      toast.success("All memories reset");
    } catch (e: any) { toast.error(e?.message || "Failed to reset"); }
    finally { setBusy(false); }
  };

  const add = async () => {
    if (!userId) return;
    const t = newTitle.trim().slice(0, 200);
    const s = newSummary.trim().slice(0, 2000);
    if (!t || !s) { toast.error("Title and summary are required"); return; }
    setAdding(true);
    try {
      const { data, error } = await supabase.from("user_memory_entries")
        .insert({ user_id: userId, title: t, summary: s, scope: "manual" })
        .select("id, title, summary, scope, created_at").maybeSingle();
      if (error) throw error;
      if (data) setEntries((es) => [data as MemoryEntry, ...es]);
      setNewTitle(""); setNewSummary(""); setAddOpen(false);
      toast.success("Memory added");
    } catch (e: any) { toast.error(e?.message || "Failed to add"); }
    finally { setAdding(false); }
  };

  const grouped = useMemo(() => ({
    manual: entries.filter((e) => e.scope === "manual"),
    auto: entries.filter((e) => e.scope !== "manual"),
  }), [entries]);

  if (loading) {
    return (
      <ProfileGlassShell title="Memory">
        <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin" style={{ color: "#c9a84c" }} /></div>
      </ProfileGlassShell>
    );
  }

  return (
    <ProfileGlassShell title="Memory" subtitle="Facts Megsy has archived about you.">
      <style>{css}</style>

      {/* Status hero */}
      <section className={`mem-hero ${enabled ? "is-on" : "is-off"}`}>
        <div className="mem-hero-row">
          <div className="mem-hero-body">
            <p>{enabled ? "Memory is active" : "Memory is paused"}</p>
            <span>{entries.length} {entries.length === 1 ? "memory" : "memories"} stored</span>
          </div>
          <Switch checked={enabled} onCheckedChange={toggle} disabled={busy} />
        </div>
        <div className="mem-stats">
          <div><span>{entries.length}</span><em>Total</em></div>
          <span className="mem-stat-sep" />
          <div><span>{grouped.manual.length}</span><em>By you</em></div>
          <span className="mem-stat-sep" />
          <div><span>{grouped.auto.length}</span><em>From chats</em></div>
        </div>
      </section>

      <GlassSection title="Teach Megsy" index="01">
        <GlassCard>
          {!addOpen ? (
            <button onClick={() => setAddOpen(true)} className="mem-add">
              <Plus className="w-4 h-4" /> Add memory
            </button>
          ) : (
            <div className="mem-form">
              <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Short title (e.g. Loves espresso)" maxLength={200} className="ng-input" />
              <textarea value={newSummary} onChange={(e) => setNewSummary(e.target.value)}
                placeholder="One fact Megsy should remember" rows={3} maxLength={2000}
                className="ng-input" style={{ resize: "none" }} />
              <div className="mem-form-actions">
                <button onClick={() => { setAddOpen(false); setNewTitle(""); setNewSummary(""); }}
                  className="ng-btn ng-btn-secondary" style={{ height: 40 }}>Cancel</button>
                <button onClick={add} disabled={adding} className="ng-btn ng-btn-primary" style={{ height: 40 }}>
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                </button>
              </div>
            </div>
          )}
        </GlassCard>
      </GlassSection>

      {summary && (
        <GlassSection title="Account summary" index="02">
          <GlassCard>
            <p className="mem-summary">{summary}</p>
          </GlassCard>
        </GlassSection>
      )}

      <GlassSection title="Stored memories" index={summary ? "03" : "02"}>
        {entries.length === 0 ? (
          <GlassCard>
            <div className="mem-empty">
              <p>Nothing remembered yet</p>
              <span>Share durable facts in chat — Megsy will save them.</span>
            </div>
          </GlassCard>
        ) : (
          <div className="mem-groups">
            {grouped.manual.length > 0 && <MemGroup title="Added by you" items={grouped.manual} onDelete={del} onSave={saveEdit} deletingId={deletingId} />}
            {grouped.auto.length > 0 && <MemGroup title="Learned from chats" items={grouped.auto} onDelete={del} onSave={saveEdit} deletingId={deletingId} />}
          </div>
        )}
      </GlassSection>

      {entries.length > 0 && (
        <GlassSection title="Danger zone" index={summary ? "04" : "03"}>
          {!resetOpen ? (
            <div className="mem-danger">
              <div>
                <p>Reset all memories</p>
                <span>Megsy will forget every fact it learned.</span>
              </div>
              <button onClick={() => setResetOpen(true)} className="mem-danger-btn">
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          ) : (
            <div className="mem-danger-open">
              <p>Reset all memories?</p>
              <span>This can't be undone.</span>
              <div className="mem-form-actions">
                <button onClick={() => setResetOpen(false)} className="ng-btn ng-btn-secondary" style={{ height: 40 }}>Cancel</button>
                <button onClick={reset} disabled={busy}
                  className="ng-btn" style={{ height: 40, background: "#ef4444", color: "#fff" }}>
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset everything"}
                </button>
              </div>
            </div>
          )}
        </GlassSection>
      )}
    </ProfileGlassShell>
  );
};

function MemGroup({ title, items, onDelete, onSave, deletingId }: {
  title: string; items: MemoryEntry[];
  onDelete: (id: string) => void;
  onSave: (id: string, title: string, summary: string) => Promise<boolean>;
  deletingId: string | null;
}) {
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [saving, setSaving] = useState(false);

  const startEdit = (e: MemoryEntry) => {
    setEditId(e.id); setEditTitle(e.title); setEditSummary(e.summary);
  };
  const cancelEdit = () => { setEditId(null); setEditTitle(""); setEditSummary(""); };
  const commitEdit = async () => {
    if (!editId) return;
    setSaving(true);
    const ok = await onSave(editId, editTitle, editSummary);
    setSaving(false);
    if (ok) cancelEdit();
  };

  return (
    <div className="mem-group">
      <div className="mem-group-head">
        <span>{title}</span><em>{items.length}</em>
      </div>
      <GlassCard>
        <ul className="mem-list">
          {items.map((e) => (
            <li key={e.id} className="mem-item">
              {editId === e.id ? (
                <div className="mem-item-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <input value={editTitle} onChange={(ev) => setEditTitle(ev.target.value)}
                    maxLength={200} className="ng-input" placeholder="Title" />
                  <textarea value={editSummary} onChange={(ev) => setEditSummary(ev.target.value)}
                    rows={3} maxLength={2000} className="ng-input" style={{ resize: "none" }} placeholder="Summary" />
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <button onClick={cancelEdit} disabled={saving} className="mem-del" aria-label="Cancel edit">
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={commitEdit} disabled={saving} className="mem-del" aria-label="Save edit"
                      style={{ color: "#c9a84c" }}>
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mem-item-body">
                    <p>{e.title}</p>
                    <span>{e.summary}</span>
                  </div>
                  <button onClick={() => startEdit(e)} className="mem-del" aria-label="Edit">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => onDelete(e.id)} disabled={deletingId === e.id}
                    className="mem-del" aria-label="Delete">
                    {deletingId === e.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}

const css = `
.mem-hero {
  padding: 18px 20px; border-radius: 20px;
  background: linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.01));
  border: 1px solid rgba(201,168,76,0.28);
}
.mem-hero.is-off { border-color: rgba(255,180,80,0.28); }
.mem-hero-row { display: flex; align-items: center; gap: 14px; }
.mem-hero-ic {
  width: 40px; height: 40px; border-radius: 999px;
  display: grid; place-items: center;
  background: rgba(201,168,76,0.12); color: #f0d78c;
  border: 1px solid rgba(201,168,76,0.3);
}
.mem-hero.is-off .mem-hero-ic { background: rgba(255,180,80,0.12); color: #fbbf24; border-color: rgba(255,180,80,0.3); }
.mem-hero-body { flex: 1; min-width: 0; }
.mem-hero-body p { margin: 0; font-size: 15px; font-weight: 600; color: #f4ebde; }
.mem-hero-body span { font-size: 12.5px; color: rgba(235,220,205,0.5); }
.mem-stats {
  display: flex; align-items: center; gap: 8px; margin-top: 16px;
  padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.05);
}
.mem-stats > div { flex: 1; display: flex; flex-direction: column; gap: 4px; text-align: center; }
.mem-stats span { font-family: "Space Grotesk", sans-serif; font-size: 22px; font-weight: 600; color: #f4ebde; letter-spacing: -0.02em; }
.mem-stats em {
  font-style: normal; font-family: "Space Grotesk", sans-serif; font-size: 9.5px; font-weight: 600;
  color: rgba(240,215,140,0.6); letter-spacing: 0.18em; text-transform: uppercase;
}
.mem-stat-sep { width: 1px; align-self: stretch; background: linear-gradient(180deg, transparent, rgba(201,168,76,0.3), transparent); flex: 0; }

.mem-add {
  width: 100%; padding: 16px; border: 0; background: transparent;
  color: #f4ebde; font: inherit; font-size: 13.5px; font-weight: 500;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  cursor: pointer;
}
.mem-add:hover { background: rgba(201,168,76,0.05); }
.mem-form { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.mem-form-actions { display: flex; gap: 8px; justify-content: flex-end; }
.mem-form-actions .ng-btn { padding: 0 18px; }

.mem-summary { margin: 0; padding: 16px 18px; font-size: 13.5px; line-height: 1.6; color: #f4ebde; white-space: pre-wrap; }

.mem-groups { display: flex; flex-direction: column; gap: 20px; }
.mem-group-head {
  display: flex; justify-content: space-between; align-items: baseline;
  padding: 0 4px 10px;
}
.mem-group-head span { font-family: "Space Grotesk", sans-serif; font-size: 10.5px; font-weight: 600; letter-spacing: 0.2em; color: rgba(240,215,140,0.65); text-transform: uppercase; }
.mem-group-head em { font-style: normal; font-size: 11px; color: rgba(235,220,205,0.45); }
.mem-list { list-style: none; margin: 0; padding: 0; }
.mem-item {
  display: flex; align-items: flex-start; gap: 12px; padding: 14px 18px;
  position: relative;
}
.mem-item + .mem-item::before {
  content: ""; position: absolute; top: 0; left: 18px; right: 18px; height: 1px;
  background: rgba(255,255,255,0.05);
}
.mem-item-body { flex: 1; min-width: 0; }
.mem-item-body p { margin: 0; font-size: 14px; font-weight: 500; color: #f4ebde; }
.mem-item-body span { display: block; font-size: 12.5px; color: rgba(235,220,205,0.55); line-height: 1.5; margin-top: 4px; white-space: pre-wrap; }
.mem-del {
  width: 30px; height: 30px; border: 0; border-radius: 8px; background: transparent;
  color: rgba(235,220,205,0.45); cursor: pointer;
  display: grid; place-items: center; flex-shrink: 0;
  transition: color 150ms, background-color 150ms;
}
.mem-del:hover { color: #ef4444; background: rgba(239,68,68,0.1); }

.mem-empty { padding: 40px 20px; text-align: center; }
.mem-empty p { margin: 0; font-size: 14.5px; font-weight: 600; color: #f4ebde; }
.mem-empty span { display: block; font-size: 12.5px; color: rgba(235,220,205,0.5); margin-top: 6px; }

.mem-danger {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 18px; border-radius: 18px;
  background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.25);
}
.mem-danger > div { flex: 1; }
.mem-danger p { margin: 0; font-size: 14px; font-weight: 600; color: #fca5a5; }
.mem-danger span { font-size: 12px; color: rgba(235,220,205,0.5); }
.mem-danger-btn {
  height: 36px; padding: 0 14px; border-radius: 999px;
  border: 1px solid rgba(239,68,68,0.4); background: transparent;
  color: #fca5a5; font: inherit; font-size: 12.5px; font-weight: 600;
  display: inline-flex; align-items: center; gap: 6px; cursor: pointer;
}
.mem-danger-btn:hover { background: rgba(239,68,68,0.1); }
.mem-danger-open {
  padding: 18px; border-radius: 18px;
  background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.3);
}
.mem-danger-open p { margin: 0; font-size: 15px; font-weight: 600; color: #fca5a5; }
.mem-danger-open span { display: block; font-size: 12.5px; color: rgba(235,220,205,0.5); margin-top: 4px; margin-bottom: 14px; }
`;

export default MemoryPage;
