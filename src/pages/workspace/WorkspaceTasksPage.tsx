/** @doc Shared tasks and assignments inside a workspace. */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Plus,
  Loader2,
  X,
  MessageSquare,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
} from "lucide-react";
import { m as motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useWorkspaceMembers } from "@/hooks/useWorkspace";
import { sanitizeErrorMessage } from "@/lib/sanitizeError";
import {
  GlassPage,
  GlassCard,
  GlassSection,
  glassStagger,
} from "@/components/settings/glass/GlassShell";
import { cn } from "@/lib/utils";

type Status = "todo" | "doing" | "done";
type Priority = "low" | "medium" | "high";

interface Task {
  id: string;
  workspace_id: string;
  parent_task_id: string | null;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  assignee_id: string | null;
  created_by: string;
  due_date: string | null;
  tags: string[];
  position: number;
  completed_at: string | null;
  created_at: string;
}

const STATUS_COLS: { id: Status; label: string; icon: any; tone: string; ring: string }[] = [
  { id: "todo", label: "To do", icon: Circle, tone: "text-sky-500", ring: "ring-sky-500/30 bg-sky-500/10" },
  { id: "doing", label: "In progress", icon: Clock, tone: "text-amber-500", ring: "ring-amber-500/30 bg-amber-500/10" },
  { id: "done", label: "Done", icon: CheckCircle2, tone: "text-emerald-500", ring: "ring-emerald-500/30 bg-emerald-500/10" },
];

const PRIORITY_STYLE: Record<Priority, string> = {
  low: "bg-white/40 dark:bg-white/10 text-muted-foreground ring-white/40 dark:ring-white/10",
  medium: "bg-amber-500/15 text-amber-600 dark:text-amber-300 ring-amber-500/30",
  high: "bg-rose-500/15 text-rose-500 ring-rose-500/30",
};

export default function WorkspaceTasksPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<string | null>(null);
  const { members } = useWorkspaceMembers(id ?? null);
  const [showCreate, setShowCreate] = useState<Status | null>(null);
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    priority: "medium" as Priority,
    assignee_id: "",
    due_date: "",
    tags: "",
  });
  const [openTask, setOpenTask] = useState<Task | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setMe(user?.id ?? null);
    })();
  }, []);

  const refresh = async () => {
    if (!id) return;
    const { data } = await supabase
      .from("workspace_tasks")
      .select("*")
      .eq("workspace_id", id)
      .order("position")
      .order("created_at");
    setTasks((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    if (!id) return;
    const channelName = `ws-tasks-${id}-${Math.random().toString(36).slice(2, 10)}`;
    const ch = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "workspace_tasks", filter: `workspace_id=eq.${id}` },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const grouped = useMemo(() => {
    const g: Record<Status, Task[]> = { todo: [], doing: [], done: [] };
    tasks.filter((t) => !t.parent_task_id).forEach((t) => g[t.status].push(t));
    return g;
  }, [tasks]);

  const createTask = async (status: Status) => {
    if (!id || !me || !draft.title.trim()) return;
    const title = draft.title.trim();
    if (title.length > 200) {
      toast.error("Title is too long (max 200 chars)");
      return;
    }
    const tags = draft.tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const { error } = await supabase.from("workspace_tasks").insert({
      workspace_id: id,
      created_by: me,
      status,
      title,
      description: draft.description.trim() || null,
      priority: draft.priority,
      assignee_id: draft.assignee_id || null,
      due_date: draft.due_date || null,
      tags,
    } as any);
    if (error) {
      toast.error(sanitizeErrorMessage(error, "Failed to create task"));
      return;
    }
    toast.success("Task created");
    setDraft({
      title: "",
      description: "",
      priority: "medium",
      assignee_id: "",
      due_date: "",
      tags: "",
    });
    setShowCreate(null);
    if (draft.assignee_id && draft.assignee_id !== me) {
      try {
        await supabase.functions.invoke("report-error", {
          headers: { "x-fn": "workspace-notify" },
          body: { type: "task_assigned", workspace_id: id, assignee_id: draft.assignee_id, title },
        });
      } catch {}
    }
  };

  const updateStatus = async (task: Task, status: Status) => {
    const { error } = await supabase
      .from("workspace_tasks")
      .update({ status } as any)
      .eq("id", task.id);
    if (error) toast.error(sanitizeErrorMessage(error, "Failed to update status"));
  };
  const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from("workspace_tasks").delete().eq("id", taskId);
    if (error) {
      toast.error(sanitizeErrorMessage(error, "Failed to delete task"));
      return;
    }
    toast.success("Task deleted");
    setOpenTask(null);
  };

  return (
    <GlassPage title="Tasks" back={() => navigate(`/settings/workspaces/${id}`)}>
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {STATUS_COLS.map((col, idx) => {
            const Icon = col.icon;
            return (
              <GlassSection key={col.id} index={idx + 1}>
                <GlassCard padded>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={cn("grid h-7 w-7 place-items-center rounded-lg ring-1", col.ring)}>
                        <Icon className={cn("w-3.5 h-3.5", col.tone)} />
                      </span>
                      <h2 className="text-[13px] font-semibold tracking-tight">{col.label}</h2>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {grouped[col.id].length}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowCreate(col.id)}
                      className="grid h-7 w-7 place-items-center rounded-lg bg-white/40 dark:bg-white/10 ring-1 ring-white/50 dark:ring-white/10 hover:bg-white/60 transition"
                      aria-label="Add task"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <AnimatePresence>
                    {showCreate === col.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-3"
                      >
                        <div className="p-3 rounded-xl bg-white/40 dark:bg-white/5 ring-1 ring-white/50 dark:ring-white/10 space-y-2">
                          <Input
                            placeholder="Title"
                            autoFocus
                            value={draft.title}
                            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                            className="bg-white/60 dark:bg-white/5 border-0 ring-1 ring-white/40 dark:ring-white/10"
                          />
                          <Textarea
                            placeholder="Description"
                            rows={2}
                            value={draft.description}
                            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                            className="bg-white/60 dark:bg-white/5 border-0 ring-1 ring-white/40 dark:ring-white/10 resize-none"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={draft.priority}
                              onChange={(e) =>
                                setDraft({ ...draft, priority: e.target.value as Priority })
                              }
                              className="text-xs h-9 rounded-md bg-white/60 dark:bg-white/5 ring-1 ring-white/40 dark:ring-white/10 px-2"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                            <select
                              value={draft.assignee_id}
                              onChange={(e) => setDraft({ ...draft, assignee_id: e.target.value })}
                              className="text-xs h-9 rounded-md bg-white/60 dark:bg-white/5 ring-1 ring-white/40 dark:ring-white/10 px-2"
                            >
                              <option value="">Unassigned</option>
                              {members.map((m) => (
                                <option key={m.user_id} value={m.user_id}>
                                  {m.display_name || "Member"}
                                </option>
                              ))}
                            </select>
                          </div>
                          <Input
                            type="date"
                            value={draft.due_date}
                            onChange={(e) => setDraft({ ...draft, due_date: e.target.value })}
                            className="bg-white/60 dark:bg-white/5 border-0 ring-1 ring-white/40 dark:ring-white/10"
                          />
                          <Input
                            placeholder="Tags (comma-separated)"
                            value={draft.tags}
                            onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
                            className="bg-white/60 dark:bg-white/5 border-0 ring-1 ring-white/40 dark:ring-white/10"
                          />
                          <div className="flex gap-2 pt-1">
                            <Button
                              size="sm"
                              onClick={() => createTask(col.id)}
                              className="flex-1 bg-foreground text-background hover:opacity-90"
                            >
                              Add
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setShowCreate(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2">
                    {grouped[col.id].map((t, i) => {
                      const assignee = members.find((m) => m.user_id === t.assignee_id);
                      const subCount = tasks.filter((s) => s.parent_task_id === t.id).length;
                      const subDone = tasks.filter(
                        (s) => s.parent_task_id === t.id && s.status === "done",
                      ).length;
                      return (
                        <motion.button
                          key={t.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.03 }}
                          onClick={() => setOpenTask(t)}
                          className="w-full text-left p-3 rounded-xl bg-white/50 dark:bg-white/5 ring-1 ring-white/50 dark:ring-white/10 hover:bg-white/70 dark:hover:bg-white/10 transition"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[13px] font-semibold flex-1 leading-snug">
                              {t.title}
                            </p>
                            <span
                              className={cn(
                                "text-[9.5px] uppercase tracking-wider px-1.5 py-0.5 rounded-md ring-1 font-semibold",
                                PRIORITY_STYLE[t.priority],
                              )}
                            >
                              {t.priority}
                            </span>
                          </div>
                          {t.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {t.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/40 dark:bg-white/10 ring-1 ring-white/40 dark:ring-white/10 text-muted-foreground"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
                            <span className="truncate">
                              {assignee?.display_name ?? "Unassigned"}
                            </span>
                            <div className="flex items-center gap-2">
                              {subCount > 0 && (
                                <span>
                                  {subDone}/{subCount}
                                </span>
                              )}
                              {t.due_date && (
                                <span>{new Date(t.due_date).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 mt-2">
                            {STATUS_COLS.filter((s) => s.id !== t.status).map((s) => (
                              <button
                                key={s.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateStatus(t, s.id);
                                }}
                                className="text-[10px] h-6 px-2 rounded-md bg-white/40 dark:bg-white/10 ring-1 ring-white/40 dark:ring-white/10 hover:bg-white/60 transition text-muted-foreground hover:text-foreground"
                              >
                                → {s.label}
                              </button>
                            ))}
                          </div>
                        </motion.button>
                      );
                    })}
                    {grouped[col.id].length === 0 && showCreate !== col.id && (
                      <p className="text-[11.5px] text-muted-foreground text-center py-6">
                        No tasks yet
                      </p>
                    )}
                  </div>
                </GlassCard>
              </GlassSection>
            );
          })}
        </div>
      )}

      {openTask && (
        <TaskDrawer
          task={openTask}
          allTasks={tasks}
          members={members}
          onClose={() => setOpenTask(null)}
          onDelete={() => deleteTask(openTask.id)}
        />
      )}
    </GlassPage>
  );
}

function TaskDrawer({ task, allTasks, members: _members, onClose, onDelete }: any) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newSub, setNewSub] = useState("");
  const subs = allTasks.filter((t: Task) => t.parent_task_id === task.id);

  const refresh = async () => {
    const { data } = await supabase
      .from("workspace_task_comments")
      .select("*")
      .eq("task_id", task.id)
      .order("created_at");
    const list = (data as any) ?? [];
    if (list.length) {
      const ids = [...new Set(list.map((c: any) => c.user_id))];
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", ids as string[]);
      const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
      setComments(list.map((c: any) => ({ ...c, profile: map.get(c.user_id) })));
    } else setComments([]);
  };

  useEffect(() => {
    refresh();
    const channelName = `task-comments-${task.id}-${Math.random().toString(36).slice(2, 10)}`;
    const ch = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workspace_task_comments",
          filter: `task_id=eq.${task.id}`,
        },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id]);

  const addComment = async () => {
    if (!newComment.trim()) return;
    const content = newComment.trim();
    if (content.length > 2000) {
      toast.error("Comment too long (max 2000 chars)");
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("workspace_task_comments")
      .insert({ task_id: task.id, user_id: user.id, content } as any);
    if (error) {
      toast.error(sanitizeErrorMessage(error, "Failed to post comment"));
      return;
    }
    setNewComment("");
    const targets = Array.from(
      new Set([task.assignee_id, task.created_by].filter((x: any) => x && x !== user.id)),
    );
    for (const t of targets) {
      try {
        await supabase.functions.invoke("report-error", {
          headers: { "x-fn": "workspace-notify" },
          body: {
            type: "task_comment",
            workspace_id: task.workspace_id,
            assignee_id: t,
            title: task.title,
          },
        });
      } catch {}
    }
  };

  const addSub = async () => {
    if (!newSub.trim()) return;
    const title = newSub.trim();
    if (title.length > 200) {
      toast.error("Title too long");
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("workspace_tasks").insert({
      workspace_id: task.workspace_id,
      parent_task_id: task.id,
      created_by: user.id,
      title,
      status: "todo",
    } as any);
    if (error) {
      toast.error(sanitizeErrorMessage(error, "Failed to add sub-task"));
      return;
    }
    setNewSub("");
  };

  const toggleSub = async (s: Task) => {
    const { error } = await supabase
      .from("workspace_tasks")
      .update({ status: s.status === "done" ? "todo" : "done" } as any)
      .eq("id", s.id);
    if (error) toast.error(sanitizeErrorMessage(error, "Failed to update sub-task"));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 240 }}
        className="absolute right-0 top-0 bottom-0 w-full max-w-md ios26-glass-strong border-l border-white/40 dark:border-white/10 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative z-[1]">
          <div className="sticky top-0 z-10 backdrop-blur-xl bg-background/70 border-b border-white/30 dark:border-white/10 p-4 flex items-center justify-between">
            <h2 className="font-semibold tracking-tight truncate flex-1">{task.title}</h2>
            <button
              onClick={onClose}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/40 dark:bg-white/10 ring-1 ring-white/50 dark:ring-white/10 hover:bg-white/60 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-6">
            {task.description && (
              <div className="text-[13px] text-muted-foreground whitespace-pre-wrap p-3 rounded-xl bg-white/40 dark:bg-white/5 ring-1 ring-white/40 dark:ring-white/10 leading-relaxed">
                {task.description}
              </div>
            )}

            <div>
              <h3 className="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-muted-foreground mb-2">
                Sub-tasks
              </h3>
              <div className="rounded-xl bg-white/40 dark:bg-white/5 ring-1 ring-white/40 dark:ring-white/10 p-2 space-y-1">
                {subs.map((s: Task) => (
                  <button
                    key={s.id}
                    onClick={() => toggleSub(s)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/40 dark:hover:bg-white/5 text-left text-[13px] transition"
                  >
                    {s.status === "done" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span
                      className={
                        s.status === "done" ? "line-through text-muted-foreground" : ""
                      }
                    >
                      {s.title}
                    </span>
                  </button>
                ))}
                {subs.length === 0 && (
                  <p className="text-[11.5px] text-muted-foreground text-center py-2">
                    No sub-tasks
                  </p>
                )}
                <div className="flex gap-2 pt-1">
                  <Input
                    placeholder="Add sub-task"
                    value={newSub}
                    onChange={(e) => setNewSub(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSub()}
                    className="bg-white/60 dark:bg-white/5 border-0 ring-1 ring-white/40 dark:ring-white/10"
                  />
                  <Button size="sm" onClick={addSub} className="bg-foreground text-background">
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3" /> Comments
              </h3>
              <div className="space-y-2">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="text-[13px] p-3 rounded-xl bg-white/40 dark:bg-white/5 ring-1 ring-white/40 dark:ring-white/10"
                  >
                    <p className="text-[10.5px] text-muted-foreground font-medium mb-0.5">
                      {c.profile?.display_name || "User"}
                    </p>
                    <p className="leading-relaxed">{c.content}</p>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-[11.5px] text-muted-foreground text-center py-2">
                    No comments yet
                  </p>
                )}
                <div className="flex gap-2 pt-1">
                  <Input
                    placeholder="Add comment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addComment()}
                    className="bg-white/60 dark:bg-white/5 border-0 ring-1 ring-white/40 dark:ring-white/10"
                  />
                  <Button
                    size="sm"
                    onClick={addComment}
                    className="bg-foreground text-background"
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>

            <button
              onClick={onDelete}
              className="w-full h-11 rounded-2xl text-[14px] font-semibold bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/30 hover:bg-rose-500/20 transition flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete task
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// keep import noise low — glassStagger only used by parent
void glassStagger;
