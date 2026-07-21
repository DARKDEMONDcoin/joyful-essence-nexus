import { m as motion } from "framer-motion";
import { Image as ImageIcon, Video as VideoIcon, Play, Pencil, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MediaPlanScene {
  index: number;
  title: string;
  prompt: string;
  duration_seconds?: number;
  first_frame_url?: string;
  last_frame_url?: string;
}

export interface MediaPlan {
  mode: "images" | "video" | "music";
  modelSlug: string;
  modelName: string;
  summary: string;
  scenes: MediaPlanScene[];
  estimatedTotalSeconds?: number;
  notes?: string;
  /** User-selected aspect ratio (from MediaSettings) — passed through to the provider. */
  aspectRatio?: string;
  /** For music mode: optional lyrics attached alongside the style prompt. */
  lyrics?: string;
}

interface Props {
  plan: MediaPlan;
  status: "awaiting" | "running" | "done" | "cancelled";
  currentSceneIndex?: number;
  onStart: () => void;
  onEditPrompt: () => void;
}

export default function MediaPlanCard({
  plan,
  status,
  currentSceneIndex,
  onStart,
  onEditPrompt,
}: Props) {
  const Icon = plan.mode === "video" ? VideoIcon : ImageIcon;
  const totalCount = plan.scenes.length;
  const hasGeneratedOutput = status === "running" || status === "done";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-2 max-w-[640px] rounded-2xl border border-white/10 bg-black/30 p-4 text-brand-parchment shadow-2xl backdrop-blur-2xl"
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: plan.mode === "video" ? "hsl(var(--brand-mint) / 0.22)" : "hsl(var(--brand-action) / 0.22)",
            border: `1px solid ${plan.mode === "video" ? "hsl(var(--brand-mint) / 0.35)" : "hsl(var(--brand-action) / 0.35)"}`,
            color: plan.mode === "video" ? "hsl(var(--brand-mint))" : "hsl(var(--brand-action))",
          }}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-brand-parchment">
            {plan.mode === "video" ? "Video plan" : "Image plan"}
          </div>
          <div className="text-[11px] text-brand-parchment/60 truncate">{plan.modelName}</div>
        </div>
        {plan.estimatedTotalSeconds ? (
          <div className="text-[11px] text-brand-parchment/60 flex items-center gap-1">
            <Clock className="w-3 h-3" />~{plan.estimatedTotalSeconds}s
          </div>
        ) : null}
      </div>

      {plan.summary && (
        <p className="text-sm text-brand-parchment/90 leading-relaxed mb-3">{plan.summary}</p>
      )}

      {hasGeneratedOutput ? (
        <ol className="mb-3 space-y-2">
          {plan.scenes.map((s) => {
            const active = status === "running" && currentSceneIndex === s.index;
            const done =
              (status === "running" &&
                typeof currentSceneIndex === "number" &&
                s.index < currentSceneIndex) ||
              status === "done";
            return (
              <li
                key={s.index}
                className="rounded-xl border border-white/10 bg-white/[0.05] p-3 text-sm transition-colors"
                style={{
                  boxShadow: active
                    ? "inset 0 0 0 1px hsl(var(--brand-action) / 0.5), 0 0 20px -6px hsl(var(--brand-action) / 0.35)"
                    : done
                      ? "inset 0 0 0 1px hsl(var(--brand-mint) / 0.4)"
                      : "none",
                  background: active
                    ? "linear-gradient(135deg, hsl(var(--brand-action) / 0.18), hsl(var(--brand-action) / 0.06))"
                    : done
                      ? "linear-gradient(135deg, hsl(var(--brand-mint) / 0.12), hsl(var(--brand-mint) / 0.04))"
                      : "hsl(0 0% 100% / 0.04)",
                }}
              >
                <div className="flex items-center gap-2.5 mb-1">
                  <span
                    className="w-6 h-6 rounded-full text-[11px] font-semibold flex items-center justify-center shrink-0"
                    style={{
                      background: done || active ? "hsl(var(--brand-action))" : "hsl(0 0% 100% / 0.1)",
                      color: done || active ? "hsl(var(--brand-ink))" : "hsl(var(--brand-parchment) / 0.7)",
                      border: `1px solid ${done || active ? "transparent" : "hsl(0 0% 100% / 0.15)"}`,
                    }}
                  >
                    {s.index}
                  </span>
                  <span className="font-semibold text-sm flex-1 min-w-0 truncate text-brand-ink">
                    {s.title}
                  </span>
                  {s.duration_seconds && (
                    <span className="text-[10px] text-brand-parchment/60 shrink-0">
                      {s.duration_seconds}s
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-brand-ink/80 leading-snug ps-8">{s.prompt}</p>
              </li>
            );
          })}
        </ol>
      ) : null}

      {plan.notes && <p className="text-[11px] text-brand-parchment/60 italic mb-3">{plan.notes}</p>}

      {status === "awaiting" && (
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            onClick={onStart}
            className="gap-1.5 bg-brand-action text-brand-ink hover:bg-brand-action/90 border-0"
          >
            <Play className="w-3.5 h-3.5" />
            Generate {totalCount}{" "}
            {plan.mode === "video"
              ? totalCount === 1
                ? "scene"
                : "scenes"
              : totalCount === 1
                ? "image"
                : "images"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onEditPrompt}
            className="gap-1.5 text-brand-parchment/80 hover:text-brand-parchment hover:bg-white/10"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit prompt
          </Button>
        </div>
      )}
      {status === "running" && (
        <div className="pt-1 space-y-2">
          <div className="flex items-center justify-between text-xs text-brand-parchment">
            <span className="inline-flex items-center gap-2">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-brand-action/60 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-brand-action" />
              </span>
              Generating {currentSceneIndex ?? 1} of {totalCount}…
            </span>
            <span className="text-brand-parchment/60">
              {Math.round((((currentSceneIndex ?? 1) - 1) / totalCount) * 100)}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "hsl(var(--brand-action))" }}
              initial={{ width: 0 }}
              animate={{
                width: `${(((currentSceneIndex ?? 1) - 1) / totalCount) * 100}%`,
              }}
              transition={{ type: "spring", stiffness: 120, damping: 22 }}
            />
          </div>
        </div>
      )}
      {status === "done" && (
        <div className="pt-1 text-xs text-brand-parchment/70">All outputs are ready.</div>
      )}
      {status === "cancelled" && (
        <div className="pt-1 text-xs text-brand-parchment/70">Cancelled</div>
      )}
    </motion.div>
  );
}
