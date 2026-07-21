import { useEffect, useState } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { m as motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface RecentConv {
  id: string;
  title: string;
  updated_at: string;
  preview: string;
}

const relativeTime = (iso: string): string => {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, Math.floor((now - then) / 1000));
  if (diff < 60) return "الآن";
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} د`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} س`;
  if (diff < 86400 * 7) return `منذ ${Math.floor(diff / 86400)} يوم`;
  return new Date(iso).toLocaleDateString("ar-EG");
};

/**
 * Empty-state "resurface unfinished thread" card. Fetches the user's most
 * recent conversation with a preview snippet of the last message. Clicking
 * dispatches `megsy:open-conversation` which ChatPage listens for.
 *
 * Renders nothing while loading, on error, or when the user has no history.
 * Auto-hides if the fetched conversation is empty (no preview).
 */
export const ContinueLastChatCard = () => {
  const [conv, setConv] = useState<RecentConv | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData?.user?.id;
        if (!uid) return;

        const { data: convs } = await supabase
          .from("conversations")
          .select("id, title, updated_at")
          .eq("user_id", uid)
          .order("updated_at", { ascending: false })
          .limit(1);
        const c = convs?.[0];
        if (!c || cancelled) return;

        const { data: msgs } = await supabase
          .from("messages")
          .select("content, role")
          .eq("conversation_id", c.id)
          .order("created_at", { ascending: false })
          .limit(1);
        const last = msgs?.[0];
        if (!last || !last.content || cancelled) return;

        const preview = String(last.content)
          .replace(/```[\s\S]*?```/g, "")
          .replace(/[#*_>`]/g, "")
          .trim()
          .slice(0, 110);
        if (!preview) return;

        setConv({
          id: c.id,
          title: c.title || "محادثة",
          updated_at: c.updated_at,
          preview,
        });
      } catch {
        // silent — card just hides
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!conv) return null;

  const open = () => {
    window.dispatchEvent(
      new CustomEvent("megsy:open-conversation", { detail: { id: conv.id } }),
    );
  };

  return (
    <motion.button
      dir="rtl"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      onClick={open}
      className="group mt-5 w-full max-w-xl mx-auto text-right flex items-center gap-3 rounded-2xl border border-border/50 bg-background/60 backdrop-blur-sm px-4 py-3 hover:border-primary/40 hover:bg-background/80 transition-all shadow-sm hover:shadow-md"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1">
          <Clock className="w-3 h-3" />
          <span>تابع آخر محادثة · {relativeTime(conv.updated_at)}</span>
        </div>
        <div className="font-semibold text-sm truncate text-foreground">{conv.title}</div>
        <div className="text-xs text-muted-foreground/80 truncate mt-0.5" dir="auto">
          {conv.preview}
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-primary shrink-0 rtl:rotate-180 group-hover:translate-x-[-2px] rtl:group-hover:translate-x-[2px] transition-transform" />
    </motion.button>
  );
};

export default ContinueLastChatCard;
