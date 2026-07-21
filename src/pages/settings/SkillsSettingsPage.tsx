/** @doc Browse and manage installed skills. */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowUp, Pencil, Trash2, X, Plus, Paperclip, Loader2, Sparkles } from "lucide-react";
import { m as motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSkills, type Skill } from "@/hooks/useSkills";
import { SKILL_TOOLS, SKILL_MODELS } from "@/lib/skillTools";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import MegsyStar from "@/components/files/MegsyStar";
// (goBackOr no longer needed — SubShell handles back nav)
import { getActiveWorkspaceId } from "@/lib/activeWorkspace";
import { SubShell, SubSection, SubCard, SubStatStrip } from "@/components/settings/SubShell";
import { cn } from "@/lib/utils";

import { sanitizeErrorMessage } from "@/lib/sanitizeError";
type DraftSkill = Partial<Skill> & {
  name: string;
  description: string;
  body: string;
  triggers: string[];
  enabled_tools: string[];
};

const emptyDraft = (): DraftSkill => ({
  name: "",
  description: "",
  body: "",
  triggers: [],
  enabled_tools: [],
  preferred_model: null,
  icon: null,
});

const SUGGESTIONS = [
  "A YC pitch coach",
  "A TikTok hooks copywriter",
  "A senior code reviewer",
  "A no-nonsense legal advisor",
  "A growth-loop strategist",
  "A 5th grade math tutor",
];

export default function SkillsSettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mySkills, librarySkills, loading, reload, toggleEnabled } = useSkills();
  const [editing, setEditing] = useState<DraftSkill | null>(null);
  const [seedPrompt, setSeedPrompt] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [triggerInput, setTriggerInput] = useState("");
  const [tab, setTab] = useState<"mine" | "library">("mine");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Open the designer when arriving with a seed prompt from /settings/skills/new
  useEffect(() => {
    const seed = (location.state as { seed?: string } | null)?.seed;
    if (seed && seed.trim()) {
      setSeedPrompt(seed.trim());
      setEditing(emptyDraft());
      // Clear the navigation state so refresh doesn't re-trigger
      navigate(location.pathname, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const startNew = (prompt = "") => {
    setSeedPrompt(prompt);
    setEditing(emptyDraft());
  };
  const startEdit = (s: Skill) => {
    setSeedPrompt("");
    setEditing({
      ...s,
      body: s.body || s.instructions || "",
      triggers: s.triggers || [],
      enabled_tools: s.enabled_tools || [],
    });
  };

  const handleSave = async (silent = false) => {
    if (!editing) return;
    if (!editing.name.trim()) {
      if (!silent) toast.error("Name is required");
      return;
    }
    if (!editing.body.trim()) {
      if (!silent) toast.error("Instructions are required");
      return;
    }
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      if (!silent) toast.error("Sign in required");
      return;
    }

    const payload = {
      user_id: user.id,
      workspace_id: getActiveWorkspaceId(),
      name: editing.name.trim(),
      description: editing.description?.trim() || "",
      instructions: editing.body.trim().slice(0, 6000),
      body: editing.body.trim(),
      triggers: editing.triggers,
      enabled_tools: editing.enabled_tools,
      preferred_model:
        editing.preferred_model && editing.preferred_model !== "auto"
          ? editing.preferred_model
          : null,
      icon: editing.icon || null,
    };

    const res = editing.id
      ? await supabase.from("skills").update(payload).eq("id", editing.id)
      : await supabase.from("skills").insert(payload).select("id").single();

    setSaving(false);
    if (res.error) {
      if (!silent) toast.error(res.error.message);
      return;
    }
    // For brand-new skills, capture the new id so subsequent auto-saves UPDATE in place
    const newId = (res.data as { id?: string } | null)?.id;
    if (!editing.id && newId) {
      setEditing({ ...editing, id: newId });
    }
    if (!silent) {
      toast.success(editing.id ? "Updated" : "Created");
    }
    reload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this skill?")) return;
    const { error } = await supabase.from("skills").delete().eq("id", id);
    if (error) {
      toast.error(sanitizeErrorMessage(error, "Something went wrong"));
      return;
    }
    toast.success("Deleted");
    reload();
  };

  const handleAddFromLibrary = async (s: Skill) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Sign in required");
      return;
    }
    const { error } = await supabase.from("skills").insert({
      user_id: user.id,
      workspace_id: getActiveWorkspaceId(),
      name: s.name,
      description: s.description,
      instructions: s.instructions,
      body: s.body || s.instructions,
      triggers: s.triggers || [],
      enabled_tools: s.enabled_tools || [],
      preferred_model: s.preferred_model,
      icon: s.icon,
      is_enabled: true,
    });
    if (error) {
      toast.error(sanitizeErrorMessage(error, "Something went wrong"));
      return;
    }
    toast.success(`Added "${s.name}"`);
    reload();
  };

  const handleImportZip = async (file: File) => {
    if (!file.name.endsWith(".zip")) {
      toast.error("Please pick a .zip file");
      return;
    }
    setImporting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const form = new FormData();
      form.append("file", file);
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-skill`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: form,
      });
      const json = await resp.json();
      if (!resp.ok || json.error) throw new Error(json.error || "Import failed");
      toast.success(`Imported "${json.name}"`);
      reload();
    } catch (e: unknown) {
      toast.error(sanitizeErrorMessage(e, "Import failed"));
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const toggleTool = (name: string) => {
    if (!editing) return;
    const has = editing.enabled_tools.includes(name);
    setEditing({
      ...editing,
      enabled_tools: has
        ? editing.enabled_tools.filter((t) => t !== name)
        : [...editing.enabled_tools, name],
    });
  };

  const addTrigger = () => {
    if (!editing) return;
    const v = triggerInput.trim().toLowerCase();
    if (!v || editing.triggers.includes(v)) return;
    setEditing({ ...editing, triggers: [...editing.triggers, v] });
    setTriggerInput("");
  };

  const removeTrigger = (t: string) => {
    if (!editing) return;
    setEditing({ ...editing, triggers: editing.triggers.filter((x) => x !== t) });
  };

  // ===== Editor view (conversational AI Skill Designer) =====
  if (editing) {
    return (
      <SkillDesigner
        key={editing.id || "new"}
        draft={editing}
        setDraft={setEditing}
        onClose={() => {
          setEditing(null);
          setSeedPrompt("");
        }}
        onSave={handleSave}
        saving={saving}
        seedPrompt={seedPrompt}
        onImportZip={(f) => {
          handleImportZip(f).then(() => setEditing(null));
        }}
        importing={importing}
        triggerInput={triggerInput}
        setTriggerInput={setTriggerInput}
        addTrigger={addTrigger}
        removeTrigger={removeTrigger}
        toggleTool={toggleTool}
      />
    );
  }

  // ===== List view =====
  const enabledCount = mySkills.filter((s) => s.is_enabled !== false).length;
  const totalCount = mySkills.length;

  const INDIGO = "#4f46e5";
  const INDIGO_DEEP = "#1e1e5a";
  const INK_SOFT = "rgba(255,255,255,0.55)";
  const INK_MUTE = "rgba(255,255,255,0.38)";
  const CARD_BG = "rgba(20,20,50,0.55)";
  const CARD_BORDER = "var(--overlay-white-06)";
  const HEADING = { fontFamily: "'Space Grotesk', system-ui, sans-serif" };
  const BODY = { fontFamily: "'DM Sans', system-ui, sans-serif" };

  return (
    <SubShell
      title="Skills"
      subtitle="Design experts Megsy can switch into inside chat."
      action={
        <button
          onClick={() => navigate("/settings/skills/new")}
          aria-label="Create skill"
          className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-semibold text-white hover:opacity-90 transition"
          style={{ backgroundColor: INDIGO, ...HEADING }}
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.4} />
          Create
        </button>
      }
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleImportZip(f);
        }}
      />

      <div className="pt-4" style={BODY}>
        {/* Hero stat card — Midnight Indigo gradient */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 mb-5"
          style={{
            background: `linear-gradient(135deg, ${INDIGO_DEEP} 0%, #0a0a1a 70%)`,
            border: `1px solid ${CARD_BORDER}`,
          }}
        >
          <div
            className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-40 blur-3xl"
            style={{ background: INDIGO }}
          />
          <div className="relative">
            <p
              className="text-[10.5px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: "rgba(167,163,255,0.8)", ...HEADING }}
            >
              Active roster
            </p>
            <div className="mt-3 flex items-end gap-6">
              <div>
                <p
                  className="text-[44px] leading-none font-semibold text-white tracking-tight"
                  style={HEADING}
                >
                  {enabledCount}
                  <span className="text-[20px]" style={{ color: INK_MUTE }}>
                    /{totalCount || 0}
                  </span>
                </p>
                <p className="mt-1.5 text-[12px]" style={{ color: INK_SOFT }}>
                  enabled in every chat
                </p>
              </div>
              <div className="ml-auto text-right">
                <p
                  className="text-[24px] font-semibold text-white leading-none"
                  style={HEADING}
                >
                  {librarySkills.length}
                </p>
                <p className="mt-1.5 text-[11px]" style={{ color: INK_MUTE }}>
                  in library
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => navigate("/settings/skills/new")}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[12.5px] font-semibold text-white transition hover:brightness-110"
                style={{ backgroundColor: INDIGO, ...HEADING }}
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2.4} /> Create skill
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[12.5px] font-medium text-white/85 transition hover:bg-white/[0.06] disabled:opacity-50"
                style={{ border: `1px solid ${CARD_BORDER}`, backgroundColor: "var(--overlay-white-03)" }}
              >
                <Paperclip className="w-3.5 h-3.5" strokeWidth={2} /> Import .zip
              </button>
            </div>
          </div>
        </div>

        {/* Segmented tabs */}
        <div
          className="mb-4 inline-flex items-center gap-1 p-1 rounded-full"
          style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          {[
            { id: "mine" as const, label: "My skills", count: mySkills.length },
            { id: "library" as const, label: "Library", count: librarySkills.length },
          ].map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex items-center gap-2 px-4 h-8 text-[12.5px] font-semibold rounded-full transition-all"
                style={{
                  ...HEADING,
                  backgroundColor: active ? INDIGO : "transparent",
                  color: active ? "#fff" : INK_SOFT,
                }}
              >
                <span>{t.label}</span>
                <span
                  className="min-w-[18px] h-[18px] inline-flex items-center justify-center text-[10px] font-bold px-1.5 rounded-full"
                  style={{
                    backgroundColor: active ? "var(--overlay-white-20)" : "var(--overlay-white-06)",
                    color: active ? "#fff" : INK_MUTE,
                  }}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Masonry-style list */}
        {tab === "mine" ? (
          loading ? (
            <div
              className="flex items-center justify-center py-16 rounded-3xl"
              style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
            >
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: INK_SOFT }} />
            </div>
          ) : mySkills.length === 0 ? (
            <div
              className="text-center py-14 px-6 rounded-3xl"
              style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
            >
              <p className="text-[15px] font-semibold text-white" style={HEADING}>
                No skills yet
              </p>
              <p className="text-[12.5px] mt-2 max-w-sm mx-auto leading-relaxed" style={{ color: INK_SOFT }}>
                Create your first expert, or browse the library for starters.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => navigate("/settings/skills/new")}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[12.5px] font-semibold text-white hover:brightness-110 transition"
                  style={{ backgroundColor: INDIGO, ...HEADING }}
                >
                  <Plus className="w-3.5 h-3.5" /> Create skill
                </button>
                <button
                  onClick={() => setTab("library")}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[12.5px] font-medium text-white/85 hover:bg-white/[0.06] transition"
                  style={{ border: `1px solid ${CARD_BORDER}` }}
                >
                  Browse library
                </button>
              </div>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 gap-3 [column-fill:_balance]">
              {mySkills.map((s) => (
                <div key={s.id} className="mb-3 break-inside-avoid">
                  <SkillCardIndigo
                    skill={s}
                    onEdit={() => startEdit(s)}
                    onDelete={() => handleDelete(s.id)}
                    onToggle={(v) => toggleEnabled(s, v)}
                    indigo={INDIGO}
                    cardBg={CARD_BG}
                    cardBorder={CARD_BORDER}
                    inkSoft={INK_SOFT}
                    inkMute={INK_MUTE}
                    heading={HEADING}
                  />
                </div>
              ))}
            </div>
          )
        ) : librarySkills.length === 0 ? (
          <div
            className="text-center py-14 rounded-3xl"
            style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
          >
            <p className="text-[15px] font-semibold text-white" style={HEADING}>
              The library is empty
            </p>
            <p className="text-[12.5px] mt-2" style={{ color: INK_SOFT }}>
              Check back later for curated skills.
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 gap-3 [column-fill:_balance]">
            {librarySkills.map((s) => {
              const exists = mySkills.some((m) => m.name === s.name);
              return (
                <div
                  key={s.id}
                  className="mb-3 break-inside-avoid rounded-2xl p-4"
                  style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
                >
                  <p className="text-[14px] font-semibold text-white" style={HEADING}>
                    {s.name}
                  </p>
                  {s.description && (
                    <p
                      className="text-[12.5px] line-clamp-3 mt-1.5 leading-snug"
                      style={{ color: INK_SOFT }}
                    >
                      {s.description}
                    </p>
                  )}
                  <button
                    disabled={exists}
                    onClick={() => handleAddFromLibrary(s)}
                    className="mt-3 w-full inline-flex items-center justify-center gap-1 h-8 px-3 rounded-full text-[12px] font-semibold transition"
                    style={{
                      ...HEADING,
                      backgroundColor: exists ? "transparent" : INDIGO,
                      color: exists ? INK_MUTE : "#fff",
                      border: exists ? `1px solid ${CARD_BORDER}` : "none",
                      cursor: exists ? "not-allowed" : "pointer",
                    }}
                  >
                    {exists ? "Added" : "Add to roster"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Inspiration */}
        <div className="mt-8">
          <p
            className="text-[10.5px] font-semibold uppercase tracking-[0.18em] mb-3"
            style={{ color: INK_MUTE, ...HEADING }}
          >
            Inspiration
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.slice(0, 6).map((s) => (
              <button
                key={s}
                onClick={() => navigate("/settings/skills/new", { state: { seed: s } })}
                className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-[12.5px] transition-colors hover:text-white"
                style={{
                  color: INK_SOFT,
                  border: `1px solid ${CARD_BORDER}`,
                  backgroundColor: "rgba(255,255,255,0.02)",
                }}
              >
                <Sparkles className="w-3 h-3" style={{ color: INDIGO }} /> {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SubShell>
  );
}

function SkillCardIndigo({
  skill,
  onEdit,
  onDelete,
  onToggle,
  indigo,
  cardBg,
  cardBorder,
  inkSoft,
  inkMute,
  heading,
}: {
  skill: Skill;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (v: boolean) => void;
  indigo: string;
  cardBg: string;
  cardBorder: string;
  inkSoft: string;
  inkMute: string;
  heading: React.CSSProperties;
}) {
  const enabled = skill.is_enabled !== false;
  return (
    <div
      className={cn(
        "group relative rounded-2xl p-4 transition-colors",
        enabled ? "" : "opacity-55",
      )}
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${enabled ? "rgba(79,70,229,0.25)" : cardBorder}`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: enabled ? indigo : "var(--overlay-white-20)" }}
            />
            <p className="text-[14px] font-semibold text-white truncate" style={heading}>
              {skill.name}
            </p>
          </div>
          {skill.description && (
            <p
              className="text-[12.5px] line-clamp-3 mt-1.5 leading-snug"
              style={{ color: inkSoft }}
            >
              {skill.description}
            </p>
          )}
          {skill.triggers && skill.triggers.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {skill.triggers.slice(0, 4).map((t, i) => (
                <span
                  key={i}
                  className="inline-flex items-center h-5 px-1.5 rounded text-[10.5px] font-medium"
                  style={{
                    backgroundColor: "rgba(79,70,229,0.12)",
                    color: "rgba(167,163,255,0.85)",
                  }}
                >
                  /{t}
                </span>
              ))}
              {skill.triggers.length > 4 && (
                <span
                  className="inline-flex items-center h-5 px-1.5 rounded text-[10.5px] font-medium"
                  style={{ backgroundColor: "var(--overlay-white-06)", color: inkMute }}
                >
                  +{skill.triggers.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>
      <div className="mt-3 flex items-center justify-end gap-1">
        <button
          onClick={onEdit}
          className="grid h-8 w-8 place-items-center rounded-lg transition-all hover:bg-white/[0.06]"
          style={{ color: inkSoft }}
          aria-label="Edit"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="grid h-8 w-8 place-items-center rounded-lg transition-all hover:bg-rose-500/10 hover:text-rose-400"
          style={{ color: inkMute }}
          aria-label="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}





// ===========================================================================
// Conversational Skill Designer
// ===========================================================================
type ChatMsg = {
  role: "user" | "assistant";
  content: string;
  draft?: DraftSkill;
  summary?: string;
};

const STAGES = [
  "Reading your brief",
  "Picking the right voice",
  "Writing instructions",
  "Choosing tools & triggers",
  "Polishing the draft",
];

function SkillDesigner({
  draft,
  setDraft,
  onClose,
  onSave,
  saving,
  seedPrompt,
  onImportZip,
  importing,
  triggerInput,
  setTriggerInput,
  addTrigger,
  removeTrigger,
  toggleTool,
}: {
  draft: DraftSkill;
  setDraft: (d: DraftSkill) => void;
  onClose: () => void;
  onSave: (silent?: boolean) => void;
  saving: boolean;
  seedPrompt?: string;
  onImportZip: (file: File) => void;
  importing: boolean;
  triggerInput: string;
  setTriggerInput: (v: string) => void;
  addTrigger: () => void;
  removeTrigger: (t: string) => void;
  toggleTool: (n: string) => void;
}) {
  const isEdit = !!draft.id;
  const [messages, setMessages] = useState<ChatMsg[]>(() =>
    isEdit
      ? [
          {
            role: "assistant",
            content: `You're editing "${draft.name}". Tell me what you want to change — tone, expertise, tools, triggers — and I'll update the draft.`,
          },
        ]
      : [
          {
            role: "assistant",
            content:
              'Hey! Tell me what kind of expert you want — for example: "a YC pitch coach" or "a TikTok hooks copywriter". I\'ll ask a couple of questions and build it.',
          },
        ],
  );
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  // (preview is desktop-only, mobile users see only chat)
  const scrollRef = useRef<HTMLDivElement>(null);
  const seedSentRef = useRef(false);
  const zipInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  // Rotate through stage labels while waiting
  useEffect(() => {
    if (!thinking) {
      setStageIdx(0);
      return;
    }
    const id = setInterval(() => setStageIdx((i) => (i + 1) % STAGES.length), 1400);
    return () => clearInterval(id);
  }, [thinking]);

  const sendText = async (text: string) => {
    if (!text || thinking) return;
    const next: ChatMsg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setThinking(true);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-skill`;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await resp.json();
      if (data.action === "draft" && data.skill) {
        const s = data.skill;
        setDraft({
          ...draft,
          name: s.name || draft.name,
          description: s.description || "",
          body: s.body || "",
          triggers: Array.isArray(s.triggers)
            ? s.triggers.map((t: string) => String(t).toLowerCase())
            : [],
          enabled_tools: Array.isArray(s.enabled_tools) ? s.enabled_tools : [],
          preferred_model: s.preferred_model ?? null,
        });
        setMessages([
          ...next,
          {
            role: "assistant",
            content:
              data.summary ||
              `I've drafted "${s.name}". Open the preview to fine-tune anything, or hit Save.`,
            draft: s,
            summary: data.summary,
          },
        ]);
      } else {
        setMessages([
          ...next,
          { role: "assistant", content: data.message || "Could you tell me a bit more?" },
        ]);
      }
    } catch {
      setMessages([...next, { role: "assistant", content: "Sorry — I hit an error. Try again?" }]);
    } finally {
      setThinking(false);
    }
  };

  const send = () => sendText(input.trim());

  // Auto-send the seed prompt from the hero composer
  useEffect(() => {
    if (seedSentRef.current) return;
    if (seedPrompt && seedPrompt.trim()) {
      seedSentRef.current = true;
      sendText(seedPrompt.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedPrompt]);

  const hasDraft = !!draft.name && !!draft.body;

  // Auto-save: debounce while user has a valid draft
  const lastSavedRef = useRef<string>("");
  useEffect(() => {
    if (!hasDraft) return;
    const sig = JSON.stringify({
      n: draft.name,
      d: draft.description,
      b: draft.body,
      t: draft.triggers,
      e: draft.enabled_tools,
      m: draft.preferred_model,
    });
    if (sig === lastSavedRef.current) return;
    const id = setTimeout(() => {
      lastSavedRef.current = sig;
      onSave(true);
    }, 1500);
    return () => clearTimeout(id);
  }, [
    draft.name,
    draft.description,
    draft.body,
    draft.triggers,
    draft.enabled_tools,
    draft.preferred_model,
    hasDraft,
    onSave,
  ]);

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <header className="sticky top-0 z-20 bg-background/85 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 -ml-2 rounded-xl hover:bg-accent/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="text-[11.5px] text-muted-foreground tabular-nums">
            {saving ? "Saving…" : hasDraft ? "Saved" : ""}
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-5xl w-full mx-auto grid lg:grid-cols-[1fr_400px] gap-0 lg:gap-6 lg:px-4 lg:py-4">
        {/* Chat panel */}
        <section className="flex flex-col h-[calc(100dvh-3.5rem)] lg:h-[calc(100dvh-5rem)] lg:rounded-2xl lg:border lg:border-border/30 lg:bg-card/30 flex">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "user" ? (
                  <div className="max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 bg-primary text-primary-foreground text-[14px] whitespace-pre-wrap leading-relaxed">
                    {m.content}
                  </div>
                ) : (
                  <div className="max-w-[92%] w-full">
                    <div className="flex items-start gap-2.5">
                      <div className="shrink-0 mt-0.5">
                        <MegsyStar size={20} static />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] whitespace-pre-wrap text-foreground leading-relaxed">
                          {m.content}
                        </p>
                        {m.draft && (
                          <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[12px] font-medium">
                            Draft ready · {m.draft.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <AnimatePresence>
              {thinking && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2.5"
                >
                  <div className="shrink-0 mt-0.5">
                    <MegsyStar size={20} static />
                  </div>
                  <div className="flex-1">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={stageIdx}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.25 }}
                        className="text-[14px] font-semibold bg-gradient-to-r from-white via-white/85 to-white/60 bg-clip-text text-transparent"
                      >
                        {STAGES[stageIdx]}…
                      </motion.p>
                    </AnimatePresence>
                    <div className="mt-1.5 flex gap-1">
                      {STAGES.map((_, i) => (
                        <span
                          key={i}
                          className={`h-1 rounded-full transition-all ${
                            i <= stageIdx ? "bg-primary w-6" : "bg-muted w-3"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="px-4 py-3 border-t border-border/30 bg-background/50">
            <div className="relative rounded-2xl border border-border/60 bg-card focus-within:border-foreground/30 transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    (typeof window === "undefined" || window.innerWidth >= 768)
                  ) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder={
                  hasDraft
                    ? 'Refine the skill — e.g. "add SEO triggers", "make tone bolder"…'
                    : "Describe the expert you want…"
                }
                className="w-full resize-none bg-transparent outline-none text-[14px] leading-relaxed pl-12 pr-4 pt-3 pb-12 max-h-32 placeholder:text-muted-foreground/70"
              />
              <input
                ref={zipInputRef}
                type="file"
                accept=".zip"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onImportZip(f);
                }}
              />
              <button
                type="button"
                onClick={() => zipInputRef.current?.click()}
                disabled={importing}
                aria-label="Import .zip"
                title="Import a SKILL.md .zip"
                className="absolute left-2.5 bottom-2.5 h-8 w-8 rounded-full hover:bg-accent/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                onClick={send}
                disabled={!input.trim() || thinking}
                className="absolute right-2.5 bottom-2.5 h-8 w-8 rounded-full bg-foreground text-background flex items-center justify-center disabled:opacity-30 hover:scale-105 active:scale-95 transition-transform"
                aria-label="Send"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Live draft preview / editor */}
        <aside className="h-[calc(100dvh-3.5rem)] lg:h-[calc(100dvh-5rem)] overflow-y-auto px-4 lg:px-5 py-5 space-y-5 lg:rounded-2xl lg:border lg:border-border/30 lg:bg-card/30 hidden lg:block">
          {!hasDraft ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <MegsyStar size={36} static />
              <div className="text-[14px] font-semibold mt-4">Your skill will appear here</div>
              <p className="text-[12.5px] text-muted-foreground mt-1.5 max-w-xs leading-relaxed">
                Chat with the designer. Once it's drafted you can fine-tune every field and save.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                <MegsyStar size={12} static /> Live draft
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Name
                </Label>
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Description
                </Label>
                <Input
                  value={draft.description || ""}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Triggers
                </Label>
                <div className="flex gap-1.5 flex-wrap p-2 rounded-xl border border-border/50 bg-card min-h-[42px]">
                  {draft.triggers.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 text-[11.5px] px-2 py-0.5 rounded-full bg-primary/12 text-primary"
                    >
                      {t}
                      <button
                        onClick={() => removeTrigger(t)}
                        className="hover:bg-primary/25 rounded-full p-0.5"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  <input
                    value={triggerInput}
                    onChange={(e) => setTriggerInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addTrigger();
                      }
                    }}
                    onBlur={addTrigger}
                    placeholder="add keyword…"
                    className="flex-1 min-w-[100px] bg-transparent outline-none text-[12.5px] px-1"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Instructions
                </Label>
                <Textarea
                  rows={10}
                  value={draft.body}
                  onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                  className="font-mono text-[12px] leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Tools
                </Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {SKILL_TOOLS.map((tool) => {
                    const active = draft.enabled_tools.includes(tool.name);
                    return (
                      <button
                        key={tool.name}
                        onClick={() => toggleTool(tool.name)}
                        className={`text-left p-2 rounded-lg border transition-all ${active ? "bg-primary/10 border-primary/50" : "border-border/40 hover:border-border bg-card"}`}
                      >
                        <div className="text-[12px] font-medium">{tool.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5 pb-4">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Preferred model
                </Label>
                <select
                  value={draft.preferred_model || "auto"}
                  onChange={(e) => setDraft({ ...draft, preferred_model: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border/50 bg-card px-3 text-[13px] outline-none focus:border-primary/50"
                >
                  {SKILL_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
