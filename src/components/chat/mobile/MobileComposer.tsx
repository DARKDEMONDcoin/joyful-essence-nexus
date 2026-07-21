import { useEffect, useRef, useState } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowUp, Square, Mic } from "lucide-react";
import { translateExactText, useUserLang } from "@/lib/authI18n";

const PLUS_HINT_KEY = "megsy_plus_hint_dismissed_v1";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onCancel?: () => void;
  onPlus?: () => void;
  onMic?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

// iOS-feel spring — snappy, settles fast, no overshoot.
const TAP_SPRING = { type: "spring" as const, stiffness: 420, damping: 28, mass: 0.55 };

/**
 * Luma neutral mobile composer.
 * Single rounded surface: [+]  textarea  [send]
 * Uses framer-motion whileTap with iOS spring physics — feels closer to
 * a native UIButton press than a plain CSS :active flicker.
 */
export default function MobileComposer({
  value,
  onChange,
  onSend,
  onCancel,
  onPlus,
  onMic,
  disabled,
  isLoading,
  placeholder,
  autoFocus,
}: Props) {
  const lang = useUserLang();
  const tx = (text: string) => translateExactText(text, lang);
  const ref = useRef<HTMLTextAreaElement>(null);

  // auto-grow
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [value]);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  const canSend = value.trim().length > 0 && !disabled;
  const ph = placeholder ?? tx("Ask anything…");

  // First-time hint that explains the + menu (images, videos, services).
  const [showHint, setShowHint] = useState(false);
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      if (!localStorage.getItem(PLUS_HINT_KEY)) {
        const t = window.setTimeout(() => setShowHint(true), 700);
        return () => window.clearTimeout(t);
      }
    } catch {}
  }, []);
  const dismissHint = () => {
    setShowHint(false);
    try { localStorage.setItem(PLUS_HINT_KEY, "1"); } catch {}
  };

  return (
    <div
      data-testid="mobile-composer"
      data-tour="composer"
      className="md:hidden relative flex items-end gap-2 px-2 py-2 rounded-[24px] border-0"
      style={{
        background: "hsl(var(--foreground) / 0.09)",
        backdropFilter: "blur(22px) saturate(180%) brightness(1.06)",
        WebkitBackdropFilter: "blur(22px) saturate(180%) brightness(1.06)",
        boxShadow:
          "inset 1px 1px 1px 0 hsl(var(--foreground) / 0.3), inset -1px -1px 1px 0 hsl(var(--foreground) / 0.12), 0 14px 36px hsl(0 0% 0% / 0.34)",
      }}
    >
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 360, damping: 26 }}
            onClick={dismissHint}
            role="button"
            aria-label={tx("Got it")}
            className="absolute left-2 bottom-[calc(100%+10px)] z-50 max-w-[78vw] px-3.5 py-2.5 rounded-2xl text-[12.5px] font-medium text-foreground cursor-pointer select-none"
            style={{
              background: "hsl(var(--foreground) / 0.12)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              boxShadow:
                "inset 0 1px 0 hsl(var(--foreground) / 0.18), 0 12px 28px hsl(0 0% 0% / 0.35)",
              border: "1px solid hsl(var(--foreground) / 0.08)",
            }}
          >
            <span dir="auto">{tx("Photos, videos and tools all live inside +")}</span>
            <span
              aria-hidden
              className="absolute left-5 -bottom-[6px] w-3 h-3 rotate-45"
              style={{
                background: "hsl(var(--foreground) / 0.12)",
                borderRight: "1px solid hsl(var(--foreground) / 0.08)",
                borderBottom: "1px solid hsl(var(--foreground) / 0.08)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label={tx("Attach")}
        data-testid="mobile-composer-plus"
        data-tour="plus"
        data-plus-trigger
        onClick={() => { dismissHint(); onPlus?.(); }}
        whileTap={{ scale: 0.9 }}
        transition={TAP_SPRING}
        className="shrink-0 flex items-center justify-center text-foreground/90 hover:text-foreground transition-colors border-0 bg-transparent"
        style={{
          height: "2.5rem",
          width: "2.5rem",
          borderRadius: "999px",
        }}
      >
        <Plus className="w-5 h-5" strokeWidth={2.2} />
      </motion.button>


      <textarea
        ref={ref}
        value={value}
        data-testid="mobile-composer-input"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={() => {
          // Mobile composer: Enter inserts a newline by default (no send).
        }}
        placeholder={ph}
        rows={1}
        dir="auto"
        className="flex-1 resize-none bg-transparent border-0 outline-none text-[15px] leading-6 px-2 py-2 max-h-40 text-foreground placeholder:text-foreground/45"
      />

      {isLoading ? (
        <motion.button
          type="button"
          aria-label={tx("Stop")}
          data-testid="mobile-composer-stop"
          onClick={onCancel}
          whileTap={{ scale: 0.9 }}
          transition={TAP_SPRING}
          className="theme-fixed shrink-0 flex items-center justify-center bg-destructive text-white shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
          style={{ height: "2.75rem", width: "2.75rem", borderRadius: "999px" }}
        >
          <Square className="w-4 h-4" />
        </motion.button>
      ) : (
        <motion.button
          type="button"
          aria-label={tx("Send message")}
          data-testid="mobile-composer-send"
          data-tour="send"
          onClick={onSend}
          disabled={!canSend}
          whileTap={canSend ? { scale: 0.88 } : undefined}
          transition={TAP_SPRING}
          className="theme-fixed shrink-0 flex items-center justify-center bg-white text-black shadow-[0_2px_10px_rgba(0,0,0,0.3)] disabled:opacity-40 disabled:bg-foreground/15 disabled:text-foreground/60 disabled:shadow-none"
          style={{ height: "2.75rem", width: "2.75rem", borderRadius: "999px" }}
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  );
}
