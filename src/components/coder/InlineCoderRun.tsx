/** @doc Megsy Coder inline run — renders todo/files/terminal/integration cards INSIDE the chat feed (not modal). */
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  Check, Loader2, FileCode, Terminal, ListTodo, X, Github, Database,
  ExternalLink, Eye, ChevronDown, Copy, Download, Pencil,
} from "lucide-react";
import { runKimiCoder, type KimiEvent, type KimiFile, type KimiTodo } from "@/lib/kimiCoder";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { publishProject } from "@/lib/publishProject";
import { toast } from "sonner";
import { extractProjectFiles, type ProjectFile } from "@/lib/extractProjectFiles";

const ArtifactCanvas = lazy(() => import("@/components/chat/ArtifactCanvas"));
const CoderStudioModal = lazy(() => import("@/components/coder/CoderStudioModal"));

type BashLog = { command: string; output: string; ok: boolean };
type IntegrationReq = { kind: "github" | "supabase"; reason: string; state: "pending" | "connected" | "skipped" };

interface Props {
  runId: string;
  prompt: string;
  onClose: () => void;
  onFinish?: (files: KimiFile[], summary?: string) => void;
}

// Module-level cache so remounts of the parent don't re-fetch or abort the SSE run.
type RunEntry = {
  events: KimiEvent[];
  subs: Set<(ev: KimiEvent) => void>;
  finished: boolean;
  controller: AbortController;
};
const CODER_RUNS = new Map<string, RunEntry>();

function subscribeCoderRun(runId: string, prompt: string, onEvent: (ev: KimiEvent) => void): () => void {
  let entry = CODER_RUNS.get(runId);
  if (!entry) {
    console.log("[coder] START runId=", runId, "promptLen=", prompt.length);
    const controller = new AbortController();
    entry = { events: [], subs: new Set(), finished: false, controller };
    CODER_RUNS.set(runId, entry);
    runKimiCoder({
      prompt,
      signal: controller.signal,
      onEvent: (ev) => {
        console.log("[coder] ev", ev.type);
        entry!.events.push(ev);
        if (ev.type === "done" || ev.type === "error") entry!.finished = true;
        entry!.subs.forEach((s) => { try { s(ev); } catch { /* ignore */ } });
      },
    }).then(() => console.log("[coder] runKimiCoder resolved")).catch((e) => {
      console.log("[coder] runKimiCoder threw", e?.message);
      const ev: KimiEvent = { type: "error", error: e?.message || "network error" };
      entry!.events.push(ev);
      entry!.finished = true;
      entry!.subs.forEach((s) => { try { s(ev); } catch { /* ignore */ } });
    });
  } else {
    console.log("[coder] REUSE runId=", runId, "events so far=", entry.events.length);
  }
  for (const ev of entry.events) { try { onEvent(ev); } catch { /* ignore */ } }
  entry.subs.add(onEvent);
  return () => { entry!.subs.delete(onEvent); };
}


function abortCoderRun(runId: string) {
  const entry = CODER_RUNS.get(runId);
  if (!entry) return;
  try { entry.controller.abort(); } catch { /* ignore */ }
  CODER_RUNS.delete(runId);
}

export default function InlineCoderRun({ runId, prompt, onClose, onFinish }: Props) {
  const instId = useRef(Math.random().toString(36).slice(2, 6)).current;
  const [todos, setTodos] = useState<KimiTodo[]>([]);
  const [files, setFiles] = useState<Map<string, string>>(new Map());
  const [bash, setBash] = useState<BashLog[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationReq[]>([]);
  const [status, setStatus] = useState<"running" | "done" | "error">("running");
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [tab, setTab] = useState<"plan" | "files" | "logs" | "notes">("plan");
  const [collapsed, setCollapsed] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [canvasOpen, setCanvasOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const finished = useRef(false);
  const filesRef = useRef<Map<string, string>>(new Map());
  const notesRef = useRef("");
  

  


  const mergeProjectFiles = (projectFiles: ProjectFile[]) => {
    if (projectFiles.length === 0) return;
    setFiles((prev) => {
      const next = new Map(prev);
      for (const file of projectFiles) next.set(file.path, file.content);
      filesRef.current = next;
      return next;
    });
    setSelectedFile((cur) => cur ?? projectFiles[0]?.path ?? null);
  };

  useEffect(() => {
    const unsub = subscribeCoderRun(runId, prompt, (ev: KimiEvent) => {
      if (ev.type === "todo") setTodos(ev.todos);
      else if (ev.type === "text") {
        const next = `${notesRef.current}${notesRef.current && ev.text ? "\n\n" : ""}${ev.text || ""}`;
        notesRef.current = next;
        setNotes(next);
        mergeProjectFiles(extractProjectFiles(next));
      }
      else if (ev.type === "file") {
        setFiles((prev) => {
          const next = new Map(prev);
          next.set(ev.path, ev.content);
          filesRef.current = next;
          return next;
        });
        setSelectedFile((cur) => cur ?? ev.path);
      } else if (ev.type === "bash")
        setBash((prev) => [...prev, { command: ev.command, output: ev.output, ok: ev.ok }]);
      else if (ev.type === "integration") {
        setIntegrations((prev) =>
          prev.find((p) => p.kind === ev.kind)
            ? prev
            : [...prev, { kind: ev.kind, reason: ev.reason, state: "pending" }],
        );
      } else if (ev.type === "done") {
        if (finished.current) return;
        finished.current = true;
        const parsed = extractProjectFiles(notesRef.current);
        if (parsed.length > 0) mergeProjectFiles(parsed);
        const finalFiles = parsed.length > 0
          ? parsed.map(({ path, content }) => ({ path, content }))
          : Array.from(filesRef.current.entries()).map(([path, content]) => ({ path, content }));
        setStatus("done");
        onFinish?.(finalFiles.length > 0 ? finalFiles : ev.files, ev.summary || notesRef.current.slice(0, 500));
      } else if (ev.type === "error") {
        setStatus("error");
        setError(ev.error);
      }
    });
    return () => { unsub(); };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);



  const doneCount = todos.filter((t) => t.done).length;
  const fileList = useMemo(() => Array.from(files.keys()).sort(), [files]);
  const projectFiles = useMemo<ProjectFile[]>(
    () => Array.from(files.entries()).map(([path, content]) => ({
      path,
      content,
      lang: (path.split(".").pop() || "txt").toLowerCase(),
    })),
    [files],
  );

  const copyAllFiles = async () => {
    if (projectFiles.length === 0) return toast.error("No files yet");
    await navigator.clipboard.writeText(
      projectFiles.map((f) => `--- ${f.path} ---\n${f.content}`).join("\n\n"),
    );
    toast.success("Files copied");
  };

  const downloadProjectJson = () => {
    if (projectFiles.length === 0) return toast.error("No files yet");
    const blob = new Blob([JSON.stringify(projectFiles, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "megsy-coder-project.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePreview = async () => {
    if (projectFiles.length === 0) {
      toast.error("No files yet");
      return;
    }
    setPublishing(true);
    try {
      const { url } = await publishProject(projectFiles, { title: prompt.slice(0, 60), prompt });
      window.open(url, "_blank");
    } catch (e: any) {
      toast.error(e?.message || "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  const updateIntegration = (kind: "github" | "supabase", state: "connected" | "skipped") => {
    setIntegrations((prev) => prev.map((p) => (p.kind === kind ? { ...p, state } : p)));
  };

  return (
    <div className="my-4 w-full rounded-2xl border border-white/10 bg-neutral-950/80 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          {status === "running" ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : status === "done" ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : (
            <X className="h-4 w-4 text-destructive" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-white">Megsy Coder</div>
          <div className="truncate text-[11px] text-white/60">
            {status === "running"
              ? `Building… ${doneCount}/${todos.length || "?"} · ${files.size} files`
              : status === "done"
                ? `Done · ${files.size} files`
                : `Error: ${error}`}
          </div>
        </div>
        {status === "done" && files.size > 0 && (
          <Button size="sm" variant="secondary" onClick={() => setCanvasOpen(true)} className="h-7 text-xs">
            <Eye className="h-3.5 w-3.5 mr-1" />
            Canvas
          </Button>
        )}
        {status === "done" && files.size > 0 && (
          <Button size="sm" variant="ghost" onClick={() => setStudioOpen(true)} className="h-7 text-xs text-white/80">
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Studio
          </Button>
        )}
        {status === "done" && files.size > 0 && (
          <Button size="sm" variant="ghost" onClick={handlePreview} disabled={publishing} className="h-7 text-xs text-white/80">
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            {publishing ? "..." : "Publish"}
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCollapsed((c) => !c)}>
          <ChevronDown className={cn("h-4 w-4 text-white/70 transition-transform", collapsed && "-rotate-90")} />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4 text-white/70" />
        </Button>
      </div>

      {collapsed ? null : (
        <>
          {/* Integration prompts */}
          {integrations.length > 0 && (
            <div className="flex flex-wrap gap-2 border-b border-white/10 p-3">
              {integrations.map((ig) => (
                <div
                  key={ig.kind}
                  className="flex min-w-[240px] flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  {ig.kind === "github" ? (
                    <Github className="h-5 w-5 text-white/80" />
                  ) : (
                    <Database className="h-5 w-5 text-emerald-400" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white capitalize">
                      Connect {ig.kind === "github" ? "GitHub" : "Supabase"}
                    </div>
                    <div className="text-[10px] text-white/60 truncate">{ig.reason}</div>
                  </div>
                  {ig.state === "pending" ? (
                    <>
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          updateIntegration(ig.kind, "connected");
                          const url =
                            ig.kind === "github"
                              ? "/integrations/github"
                              : "https://supabase.com/dashboard";
                          window.open(url, "_blank");
                        }}
                      >
                        Connect <ExternalLink className="h-3 w-3 mr-1" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-white/70"
                        onClick={() => updateIntegration(ig.kind, "skipped")}
                      >
                        Skip
                      </Button>
                    </>
                  ) : (
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full",
                        ig.state === "connected"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-white/10 text-white/50",
                      )}
                    >
                      {ig.state === "connected" ? "✓ Connected" : "Skipped"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 border-b border-white/10 px-2 py-1.5">
            {(
              [
                { id: "plan", icon: ListTodo, label: "Plan", count: todos.length },
                { id: "files", icon: FileCode, label: "Files", count: files.size },
                { id: "logs", icon: Terminal, label: "Log", count: bash.length },
                { id: "notes", icon: Copy, label: "Notes", count: notes ? 1 : 0 },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                  tab === t.id
                    ? "bg-primary/20 text-white"
                    : "text-white/60 hover:bg-white/5",
                )}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
                {t.count > 0 && (
                  <span className="rounded-full bg-white/10 px-1.5 text-[10px]">{t.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="max-h-[420px] min-h-[180px] overflow-hidden">
            {tab === "plan" && (
              <div className="h-full max-h-[420px] overflow-y-auto p-4">
                {todos.length === 0 ? (
                  <div className="text-sm text-white/50">
                    {status === "running" ? "Preparing plan…" : "No plan"}
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {todos.map((t) => (
                      <li
                        key={t.id}
                        className="flex items-start gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded",
                            t.done ? "bg-emerald-500 text-white" : "border border-white/30",
                          )}
                        >
                          {t.done && <Check className="h-3 w-3" />}
                        </span>
                        <span className={cn("text-sm text-white", t.done && "text-white/40 line-through")}>
                          {t.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {tab === "files" && (
              <div className="flex h-full max-h-[420px]">
                <div className="w-52 shrink-0 overflow-y-auto border-r border-white/10 p-2">
                  {fileList.length === 0 && (
                    <div className="p-2 text-xs text-white/50">No files yet…</div>
                  )}
                  {fileList.map((path) => (
                    <button
                      key={path}
                      onClick={() => setSelectedFile(path)}
                      className={cn(
                        "block w-full truncate rounded px-2 py-1 text-left text-xs",
                        selectedFile === path
                          ? "bg-primary/20 text-white"
                          : "text-white/70 hover:bg-white/5",
                      )}
                    >
                      {path}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-auto bg-black/40">
                  {selectedFile ? (
                    <div className="min-h-full">
                      <div className="sticky top-0 z-10 flex items-center justify-end gap-1 border-b border-white/10 bg-black/70 px-2 py-1 backdrop-blur">
                        <button onClick={copyAllFiles} className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] text-white/70 hover:bg-white/10">
                          <Copy className="h-3 w-3" /> Copy all
                        </button>
                        <button onClick={downloadProjectJson} className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] text-white/70 hover:bg-white/10">
                          <Download className="h-3 w-3" /> JSON
                        </button>
                      </div>
                      <pre className="p-3 text-xs leading-relaxed text-white/90">
                        <code>{files.get(selectedFile)}</code>
                      </pre>
                    </div>
                  ) : (
                    <div className="p-4 text-xs text-white/50">Choose a file</div>
                  )}
                </div>
              </div>
            )}

            {tab === "logs" && (
              <div className="h-full max-h-[420px] overflow-y-auto bg-black p-3 font-mono text-xs text-emerald-300">
                {bash.length === 0 && <div className="text-white/40">No commands yet…</div>}
                {bash.map((b, i) => (
                  <div key={i} className="mb-2">
                    <div className={cn("font-semibold", b.ok ? "text-cyan-300" : "text-red-400")}>
                      $ {b.command}
                    </div>
                    <div className="whitespace-pre-wrap opacity-80">{b.output}</div>
                  </div>
                ))}
              </div>
            )}

            {tab === "notes" && (
              <div className="h-full max-h-[420px] overflow-y-auto bg-black/60 p-3 text-xs leading-relaxed text-white/80 whitespace-pre-wrap">
                {notes || (status === "running" ? "Waiting for coder notes…" : "No notes")}
              </div>
            )}
          </div>
        </>
      )}
      <Suspense fallback={null}>
        {canvasOpen && (
          <ArtifactCanvas
            open={canvasOpen}
            onOpenChange={setCanvasOpen}
            content={notes || prompt}
            files={projectFiles}
          />
        )}
        {studioOpen && (
          <CoderStudioModal
            open={studioOpen}
            onClose={() => setStudioOpen(false)}
            initialFiles={projectFiles}
          />
        )}
      </Suspense>
    </div>
  );
}
