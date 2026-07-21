/** @doc Unified glass design primitives for mobile settings pages. */
import { ReactNode, MouseEventHandler } from "react";
import { useNavigate } from "react-router-dom";
import { m as motion, type HTMLMotionProps } from "framer-motion";
import { ChevronRight, ArrowLeft, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- Page ---------- */

export function GlassPage({
  title,
  back = "/settings",
  right,
  children,
}: {
  title: string;
  back?: string | (() => void);
  right?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const handleBack = () => {
    if (typeof back === "function") back();
    else navigate(back);
  };
  return (
    <div className="relative min-h-[100dvh] bg-background text-foreground overflow-visible safe-bottom">
      {/* Ambient glow backdrop */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-[60vh] -z-0 opacity-70 dark:opacity-50"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, hsl(var(--primary) / 0.18), transparent 70%), radial-gradient(40% 40% at 90% 10%, hsl(var(--accent) / 0.16), transparent 70%)",
        }}
      />
      {/* Header */}
      <header
        className="sticky top-0 z-20 border-b border-border/40 backdrop-blur-xl"
        style={{ background: "hsl(var(--background) / 0.7)" }}
      >
        <div className="max-w-lg mx-auto px-4 flex items-center justify-between gap-2 py-3 safe-top">
          <button
            onClick={handleBack}
            className="ios26-glass relative grid h-10 w-10 place-items-center rounded-full active:scale-95 transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 relative z-[1] text-foreground" strokeWidth={2.2} />
          </button>
          <h1 className="text-[16px] font-semibold tracking-tight truncate">{title}</h1>
          <div className="w-10 flex justify-end">{right}</div>
        </div>
      </header>
      <div className="relative z-[1] max-w-lg mx-auto px-4 pt-3 pb-10 space-y-4">{children}</div>
    </div>
  );
}

/* ---------- Sections ---------- */

const ease = [0.22, 1, 0.36, 1] as const;
export const glassStagger = (i: number): HTMLMotionProps<"div"> => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay: 0.04 + i * 0.05, ease },
});

export function GlassSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-2 mb-2 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </p>
  );
}

export function GlassCard({
  children,
  className,
  strong,
  padded,
}: {
  children: ReactNode;
  className?: string;
  strong?: boolean;
  padded?: boolean;
}) {
  return (
    <div
      className={cn(
        strong ? "ios26-glass-strong" : "ios26-glass",
        "relative rounded-2xl overflow-hidden",
        padded && "p-4",
        className,
      )}
    >
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

export function GlassList({ children }: { children: ReactNode }) {
  return (
    <GlassCard>
      <div className="divide-y divide-white/40 dark:divide-white/10">{children}</div>
    </GlassCard>
  );
}

/* ---------- Row ---------- */

export type GlassRowTone =
  | "default"
  | "primary"
  | "amber"
  | "emerald"
  | "rose"
  | "sky"
  | "violet"
  | "pink";

const TONE_BG: Record<GlassRowTone, string> = {
  default: "bg-white/45 dark:bg-white/10 ring-white/50 dark:ring-white/10",
  primary: "bg-primary/15 ring-primary/30",
  amber: "bg-amber-500/15 ring-amber-500/30",
  emerald: "bg-emerald-500/15 ring-emerald-500/30",
  rose: "bg-rose-500/15 ring-rose-500/30",
  sky: "bg-sky-500/15 ring-sky-500/30",
  violet: "bg-violet-500/15 ring-violet-500/30",
  pink: "bg-pink-500/15 ring-pink-500/30",
};

const TONE_FG: Record<GlassRowTone, string> = {
  default: "text-foreground",
  primary: "text-primary",
  amber: "text-amber-600 dark:text-amber-300",
  emerald: "text-emerald-600 dark:text-emerald-300",
  rose: "text-rose-500",
  sky: "text-sky-600 dark:text-sky-300",
  violet: "text-violet-600 dark:text-violet-300",
  pink: "text-pink-600 dark:text-pink-300",
};

export function GlassRow({
  icon: Icon,
  tone = "default",
  label,
  desc,
  trailing,
  onClick,
  destructive,
  disabled,
}: {
  icon?: LucideIcon;
  tone?: GlassRowTone;
  label: ReactNode;
  desc?: ReactNode;
  trailing?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  destructive?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-3 py-3 px-3.5 text-left transition",
        "active:bg-white/20 dark:active:bg-white/5",
        disabled && "opacity-60",
      )}
    >
      {Icon && (
        <span
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1",
            TONE_BG[tone],
          )}
        >
          <Icon className={cn("h-4 w-4", TONE_FG[tone])} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[14px] font-semibold",
            destructive ? "text-rose-500" : "text-foreground",
          )}
        >
          {label}
        </p>
        {desc && <p className="mt-0.5 text-[11.5px] text-muted-foreground truncate">{desc}</p>}
      </div>
      {trailing !== undefined ? (
        trailing
      ) : onClick ? (
        <ChevronRight className="h-4 w-4 text-muted-foreground/70 shrink-0" />
      ) : null}
    </button>
  );
}

/* ---------- Hero ---------- */

export function GlassHero({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  tone = "primary",
  cta,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: LucideIcon;
  tone?: GlassRowTone;
  cta?: ReactNode;
}) {
  return (
    <motion.div {...glassStagger(0)}>
      <GlassCard strong>
        <div className="p-5 flex items-start gap-4">
          {Icon && (
            <span
              className={cn(
                "grid h-12 w-12 shrink-0 place-items-center rounded-2xl ring-1 shadow-sm",
                TONE_BG[tone],
              )}
            >
              <Icon className={cn("h-5 w-5", TONE_FG[tone])} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            {eyebrow && (
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {eyebrow}
              </p>
            )}
            <h2 className="mt-0.5 text-[19px] font-semibold tracking-tight text-foreground leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-[12.5px] text-muted-foreground leading-relaxed">{subtitle}</p>
            )}
            {cta && <div className="mt-3">{cta}</div>}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ---------- Primary action button ---------- */

export function GlassButton({
  children,
  onClick,
  variant = "primary",
  className,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: "primary" | "ghost" | "danger";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full h-11 rounded-2xl text-[14px] font-semibold transition active:scale-[0.99] disabled:opacity-60",
        variant === "primary" &&
          "bg-foreground text-background hover:opacity-90 shadow-[0_8px_24px_-12px_hsl(var(--foreground)/0.5)]",
        variant === "ghost" &&
          "ios26-glass relative text-foreground",
        variant === "danger" && "bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/30",
        className,
      )}
    >
      <span className="relative z-[1]">{children}</span>
    </button>
  );
}

/* ---------- Section wrapper with motion + label ---------- */

export function GlassSection({
  label,
  index = 1,
  children,
}: {
  label?: ReactNode;
  index?: number;
  children: ReactNode;
}) {
  return (
    <motion.section {...glassStagger(index)}>
      {label && <GlassSectionLabel>{label}</GlassSectionLabel>}
      {children}
    </motion.section>
  );
}
