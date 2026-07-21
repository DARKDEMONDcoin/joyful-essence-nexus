import { useEffect, useState } from "react";
import { Flame, Snowflake } from "lucide-react";
import { readStreak, isStreakAtRisk, type StreakState } from "@/lib/streaks";

/**
 * Small flame badge showing the current daily-chat streak. Reads localStorage
 * on mount and listens for the custom "megsy:streak" event so bumps elsewhere
 * (after a message is sent) update the badge without a reload.
 *
 * v2: shows a subtle Snowflake pill when the user has streak freezes stored,
 * and a slow pulse when the streak is at risk today (nudge without nagging).
 */
export function StreakBadge({ className = "" }: { className?: string }) {
  const [state, setState] = useState<StreakState>(() => ({
    count: 0,
    lastDay: "",
    best: 0,
    daysThisWeek: [],
    freezes: 0,
    freezesUsed: 0,
  }));
  const [atRisk, setAtRisk] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setState(readStreak());
      setAtRisk(isStreakAtRisk());
    };
    refresh();
    window.addEventListener("megsy:streak", refresh);
    // re-check periodically so the risk state kicks in as the day progresses
    const iv = window.setInterval(refresh, 60_000);
    return () => {
      window.removeEventListener("megsy:streak", refresh);
      window.clearInterval(iv);
    };
  }, []);

  if (!state.count) return null;

  const hot = state.count >= 3;
  return (
    <div className={"inline-flex items-center gap-1.5 " + className}>
      <div
        className={
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold transition-all " +
          (hot
            ? "bg-gradient-to-r from-orange-500/90 to-rose-500/90 text-white shadow-[0_0_12px_rgba(251,146,60,0.5)]"
            : "bg-white/10 text-white/90 backdrop-blur") +
          (atRisk ? " ring-2 ring-amber-400/60 animate-pulse" : "")
        }
        title={
          atRisk
            ? `سلسلتك في خطر — أرسل رسالة اليوم للحفاظ عليها (أطول سلسلة: ${state.best})`
            : `أطول سلسلة: ${state.best} يوم`
        }
        aria-label={`سلسلة ${state.count} أيام${atRisk ? " — في خطر" : ""}`}
      >
        <Flame className={"h-3.5 w-3.5 " + (hot && !atRisk ? "animate-pulse" : "")} />
        <span>{state.count}</span>
      </div>
      {state.freezes > 0 && (
        <div
          className="inline-flex items-center gap-0.5 rounded-full bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-sky-100 backdrop-blur"
          title={`لديك ${state.freezes} تجميدة تحمي سلسلتك من الانقطاع ليوم واحد`}
          aria-label={`${state.freezes} freeze`}
        >
          <Snowflake className="h-3 w-3" />
          <span>{state.freezes}</span>
        </div>
      )}
    </div>
  );
}
