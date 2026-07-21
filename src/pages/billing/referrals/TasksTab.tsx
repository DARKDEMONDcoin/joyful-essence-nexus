/** @doc Tasks sub-tab — obsidian glass rows, gold hairline rewards. */
import { Check, Gift, Lock } from "lucide-react";
import iconX from "@/assets/task-icons/x.png";
import iconInstagram from "@/assets/task-icons/instagram.png";
import iconFacebook from "@/assets/task-icons/facebook.png";
import iconLinkedin from "@/assets/task-icons/linkedin.png";
import iconTelegram from "@/assets/task-icons/telegram.png";
import iconInvite3 from "@/assets/task-icons/invite-3.png";
import iconInvite10 from "@/assets/task-icons/invite-10.png";
import { EmptyState, RewardTask, useReferrals, GOLD, GOLD_SOFT } from "../ReferralsPage";

const resolveTaskIconSrc = (task: {
  task_key?: string;
  action_url?: string | null;
  action_type?: string;
}): string | null => {
  const k = (task.task_key || "").toLowerCase();
  const url = (task.action_url || "").toLowerCase();
  const hay = `${k} ${url}`;
  if (/twitter|x\.com|follow_x/.test(hay)) return iconX;
  if (/instagram/.test(hay)) return iconInstagram;
  if (/facebook|\bfb\b/.test(hay)) return iconFacebook;
  if (/linkedin/.test(hay)) return iconLinkedin;
  if (/telegram|t\.me/.test(hay)) return iconTelegram;
  if (task.action_type === "invite_friends") {
    if (/10|big|mega/.test(k)) return iconInvite10;
    return iconInvite3;
  }
  return null;
};

const TaskIcon = ({
  task,
}: {
  task: { task_key?: string; action_url?: string | null; action_type?: string };
}) => {
  const src = resolveTaskIconSrc(task);
  if (!src) return <Gift className="h-4 w-4 text-white/70" strokeWidth={2} />;
  return (
    <img
      src={src}
      alt=""
      width={512}
      height={512}
      loading="lazy"
      className="h-7 w-7 object-contain"
    />
  );
};

export default function TasksTab() {
  const { tasks, userTasks, refs, claimTask } = useReferrals();
  const completed = userTasks.filter((u) => u.completed_at).length;
  const pct = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  if (tasks.length === 0) {
    return (
      <div className="mt-6">
        <EmptyState title="No tasks available" hint="Check back soon for new tasks." />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-16">
      {/* Progress hero */}
      <div className="relative overflow-hidden rounded-[24px] bg-black ref-gold-hairline p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-white/45">
              Rituals
            </p>
            <h1
              className="mt-2 text-[24px] leading-none tracking-tight"
              style={{
                fontWeight: 300,
                letterSpacing: "-0.025em",
                background: `linear-gradient(180deg, #ffffff 0%, ${GOLD_SOFT} 60%, ${GOLD} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Small acts,
              <br />
              standing rewards.
            </h1>
            <p className="mt-2.5 max-w-[240px] text-[12.5px] leading-relaxed text-white/55">
              Finish tasks to earn bonus credits — quietly compounding.
            </p>
          </div>
          <div className="text-right">
            <div
              className="text-[38px] font-light tabular-nums leading-none"
              style={{ color: GOLD_SOFT }}
            >
              {completed}
              <span className="text-white/40">/{tasks.length}</span>
            </div>
            <div className="mt-1 text-[10.5px] font-medium uppercase tracking-[0.2em] text-white/45">
              Complete
            </div>
          </div>
        </div>

        <div className="mt-4 ref-rail">
          <div className="ref-rail__fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Task list */}
      <ul className="space-y-2">
        {tasks.map((t: RewardTask) => {
          const ut = userTasks.find((u) => u.task_id === t.id);
          const isDone = !!ut?.completed_at;
          const progress =
            t.action_type === "invite_friends"
              ? Math.min(refs.length, t.target_count)
              : (ut?.progress ?? 0);
          const locked =
            t.action_type === "invite_friends" && progress < t.target_count && !isDone;

          return (
            <li
              key={t.id}
              className="flex items-center gap-3 rounded-2xl px-3.5 py-3"
              style={{
                background: "hsl(0 0% 100% / 0.03)",
                border: "1px solid hsl(0 0% 100% / 0.06)",
                opacity: isDone ? 0.5 : 1,
              }}
            >
              <div
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                style={{
                  background: "hsl(0 0% 100% / 0.04)",
                  border: `1px solid ${isDone ? GOLD : GOLD}33`,
                }}
              >
                {isDone ? (
                  <Check className="h-4 w-4" strokeWidth={2.4} style={{ color: GOLD }} />
                ) : (
                  <TaskIcon task={t} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium leading-tight text-white">
                  {t.title}
                </p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-[11.5px] text-white/50">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10.5px] font-mono tabular-nums"
                    style={{
                      color: GOLD_SOFT,
                      background: "rgba(201,162,76,0.06)",
                      border: `1px solid ${GOLD}44`,
                    }}
                  >
                    +{t.reward_credits}
                  </span>
                  <span>credits</span>
                  {t.action_type === "invite_friends" && (
                    <span className="tabular-nums text-white/40">
                      · {progress}/{t.target_count}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => claimTask(t)}
                disabled={isDone || locked}
                className="shrink-0 rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold transition active:scale-95 disabled:cursor-default disabled:active:scale-100"
                style={
                  isDone
                    ? {
                        color: "rgba(255,255,255,0.4)",
                        background: "hsl(0 0% 100% / 0.03)",
                        border: "1px solid hsl(0 0% 100% / 0.06)",
                      }
                    : locked
                      ? {
                          color: "rgba(255,255,255,0.35)",
                          background: "hsl(0 0% 100% / 0.03)",
                          border: "1px solid hsl(0 0% 100% / 0.06)",
                        }
                      : {
                          color: "#000",
                          background: `linear-gradient(180deg, ${GOLD_SOFT}, ${GOLD})`,
                          boxShadow: `0 10px 24px -12px ${GOLD}90`,
                        }
                }
              >
                {isDone ? (
                  <span className="inline-flex items-center gap-1">
                    <Check className="h-3 w-3" strokeWidth={2.6} /> Done
                  </span>
                ) : locked ? (
                  <span className="inline-flex items-center gap-1">
                    <Lock className="h-3 w-3" strokeWidth={2.4} /> Locked
                  </span>
                ) : t.action_type === "invite_friends" ? (
                  "Claim"
                ) : (
                  "Go"
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
