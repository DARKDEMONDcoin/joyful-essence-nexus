/** @doc Small bar under assistant messages: shows a response-mode badge (Fast/Deep/Creative)
 *  inferred from content, and a one-tap "Save to memory" chip so users can capture
 *  useful replies into long-term memory without leaving the chat. */
import { useMemo, useState } from "react";
import { Zap, Brain, Sparkles, BookmarkPlus, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  content: string;
  userId?: string | null;
  isArabic?: boolean;
}

type Mode = { key: "fast" | "deep" | "creative"; label: string; icon: React.ReactNode; className: string };

function detectMode(content: string, isArabic: boolean): Mode {
  const len = content.length;
  const hasCode = /```/.test(content);
  const hasLists = (content.match(/^\s*[-*\d]+[.)]?\s/gm) || []).length >= 4;
  const isDeep = len > 1200 || hasCode || hasLists;
  const isCreative = /[""''«»]/.test(content) && !hasCode && len < 800;

  if (isDeep) {
    return {
      key: "deep",
      label: isArabic ? "رد عميق" : "Deep",
      icon: <Brain className="w-3 h-3" />,
      className: "text-[#5B8DEF] bg-[#5B8DEF]/10 border-[#5B8DEF]/20",
    };
  }
  if (isCreative) {
    return {
      key: "creative",
      label: isArabic ? "إبداعي" : "Creative",
      icon: <Sparkles className="w-3 h-3" />,
      className: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    };
  }
  return {
    key: "fast",
    label: isArabic ? "رد سريع" : "Fast",
    icon: <Zap className="w-3 h-3" />,
    className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  };
}

function summarize(content: string, maxLen = 220): string {
  const stripped = content
    .replace(/```[\s\S]*?```/g, " [code] ")
    .replace(/[#*_>`~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return stripped.length > maxLen ? stripped.slice(0, maxLen).trim() + "…" : stripped;
}

const MessageInsightsBar = ({ content, userId, isArabic }: Props) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const mode = useMemo(() => detectMode(content, !!isArabic), [content, isArabic]);

  const handleSave = async () => {
    if (!userId || saving || saved) return;
    setSaving(true);
    try {
      const summary = summarize(content);
      if (!summary) return;
      const title = summary.split(/[.!?،؟]/)[0].slice(0, 80) || (isArabic ? "ملاحظة محفوظة" : "Saved note");
      const { error } = await supabase.from("user_memory_entries").insert({
        user_id: userId,
        title,
        summary,
        scope: "manual",
      });
      if (error) throw error;
      setSaved(true);
      toast.success(isArabic ? "تم الحفظ في الذاكرة" : "Saved to memory");
    } catch (e: any) {
      toast.error(e?.message || (isArabic ? "فشل الحفظ" : "Failed to save"));
    } finally {
      setSaving(false);
    }
  };

  if (!content || content.trim().length < 40) return null;

  return (
    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap" dir={isArabic ? "rtl" : "ltr"}>
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-medium ${mode.className}`}
        title={isArabic ? "وضع الاستجابة المكتشف" : "Detected response mode"}
      >
        {mode.icon}
        {mode.label}
      </span>
      {userId && (
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || saved}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-medium transition ${
            saved
              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 cursor-default"
              : "text-muted-foreground bg-secondary/40 border-border/40 hover:text-foreground hover:border-border"
          }`}
          title={isArabic ? "احفظ هذا في الذاكرة" : "Save to memory"}
        >
          {saved ? <Check className="w-3 h-3" /> : <BookmarkPlus className="w-3 h-3" />}
          {saved
            ? isArabic ? "محفوظ" : "Saved"
            : isArabic ? "احفظ في الذاكرة" : "Save to memory"}
        </button>
      )}
    </div>
  );
};

export default MessageInsightsBar;
