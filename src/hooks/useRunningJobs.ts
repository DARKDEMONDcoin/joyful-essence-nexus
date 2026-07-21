/** @doc Realtime subscription to all the current user's queued/running background_jobs + research_jobs, used by RunningJobsIndicator. */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RunningJob {
  id: string;
  kind: string;
  status: string;
  status_text: string | null;
  phase: string | null;
  progress: number;
  conversation_id: string | null;
  attempt: number;
  max_attempts: number;
  updated_at: string;
  source: "background" | "research";
}

const ACTIVE_BG = new Set(["queued", "running", "needs_input"]);
const ACTIVE_RS = new Set(["queued", "planning", "awaiting_approval", "searching", "synthesizing"]);

export function useRunningJobs(userId: string | null | undefined) {
  const [jobs, setJobs] = useState<RunningJob[]>([]);

  useEffect(() => {
    if (!userId) {
      setJobs([]);
      return;
    }
    let cancelled = false;

    const load = async () => {
      const [{ data: bg }, { data: rs }] = await Promise.all([
        supabase
          .from("background_jobs")
          .select("id, kind, status, status_text, phase, progress, conversation_id, attempt, max_attempts, updated_at")
          .eq("user_id", userId)
          .in("status", ["queued", "running", "needs_input"])
          .order("updated_at", { ascending: false })
          .limit(20),
        supabase
          .from("research_jobs")
          .select("id, status, stage, progress, conversation_id, attempt, max_attempts, updated_at")
          .eq("user_id", userId)
          .in("status", ["queued", "planning", "awaiting_approval", "searching", "synthesizing"])
          .order("updated_at", { ascending: false })
          .limit(20),
      ]);
      if (cancelled) return;
      const a: RunningJob[] = (bg ?? []).map((r: any) => ({
        id: r.id,
        kind: r.kind,
        status: r.status,
        status_text: r.status_text,
        phase: r.phase,
        progress: r.progress ?? 0,
        conversation_id: r.conversation_id,
        attempt: r.attempt ?? 0,
        max_attempts: r.max_attempts ?? 3,
        updated_at: r.updated_at,
        source: "background",
      }));
      const b: RunningJob[] = (rs ?? []).map((r: any) => ({
        id: r.id,
        kind: "deep_research",
        status: r.status,
        status_text: r.stage,
        phase: r.stage,
        progress: r.progress ?? 0,
        conversation_id: r.conversation_id,
        attempt: r.attempt ?? 0,
        max_attempts: r.max_attempts ?? 3,
        updated_at: r.updated_at,
        source: "research",
      }));
      setJobs([...a, ...b].sort((x, y) => y.updated_at.localeCompare(x.updated_at)));
    };

    void load();

    const ch = supabase
      .channel(`running-jobs-${userId}-${Math.random().toString(36).slice(2, 8)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "background_jobs", filter: `user_id=eq.${userId}` },
        () => void load(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "research_jobs", filter: `user_id=eq.${userId}` },
        () => void load(),
      )
      .subscribe();

    const poll = setInterval(() => void load(), 20_000);

    return () => {
      cancelled = true;
      clearInterval(poll);
      supabase.removeChannel(ch);
    };
  }, [userId]);

  return jobs.filter((j) =>
    j.source === "background" ? ACTIVE_BG.has(j.status) : ACTIVE_RS.has(j.status),
  );
}
