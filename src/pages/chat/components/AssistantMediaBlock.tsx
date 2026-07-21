import { Suspense, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { runMediaPlan, regenerateScene } from "@/lib/mediaGeneration";
import { updateMessageMetadata } from "../services/conversationApi";
import { MediaResultCard } from "../lazyComponents";
import type { Message } from "../chatConstants";

interface Props {
  msg: Message;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setInput: (v: string) => void;
  setIsLoading: (v: boolean) => void;
  setIsThinking: (v: boolean) => void;
}

export default function AssistantMediaBlock({ msg, setMessages, setInput, setIsLoading, setIsThinking }: Props) {
  if (!msg.mediaPlan) return null;
  const targetKey = msg.id ?? msg.clientId;
  const matches = useCallback(
    (mm: Message) =>
      targetKey ? mm.id === targetKey || mm.clientId === targetKey : mm === msg,
    [targetKey, msg],
  );

  const autoStartRef = useRef(false);

  const startGeneration = useCallback(async () => {
    setIsLoading(true);
    setIsThinking(false);
    if (msg.id) {
      void updateMessageMetadata(msg.id, { mediaStatus: "running" });
    }
    setMessages((prev) =>
      prev.map((mm) =>
        matches(mm) ? { ...mm, mediaStatus: "running", mediaCurrentScene: 1 } : mm,
      ),
    );
    const liveResults = [...(msg.mediaResults ?? [])];
    try {
      await runMediaPlan({
        plan: msg.mediaPlan!,
        onSceneStart: (idx) => {
          setMessages((prev) =>
            prev.map((mm) =>
              matches(mm)
                ? {
                    ...mm,
                    mediaCurrentScene: idx,
                    mediaResults: (mm.mediaResults ?? []).map((r) =>
                      r.index === idx ? { ...r, status: "running" as const } : r,
                    ),
                  }
                : mm,
            ),
          );
        },
        onScenePartial: (idx, previewUrl, progress) => {
          setMessages((prev) =>
            prev.map((mm) =>
              matches(mm)
                ? {
                    ...mm,
                    mediaResults: (mm.mediaResults ?? []).map((r) =>
                      r.index === idx ? { ...r, previewUrl, progress } : r,
                    ),
                  }
                : mm,
            ),
          );
        },
        onSceneCountdown: (idx, endsAt) => {
          setMessages((prev) =>
            prev.map((mm) =>
              matches(mm)
                ? {
                    ...mm,
                    mediaResults: (mm.mediaResults ?? []).map((r) =>
                      r.index === idx ? { ...r, taskEndsAt: endsAt } : r,
                    ),
                  }
                : mm,
            ),
          );
        },
        onSceneDone: (res) => {
          const i = liveResults.findIndex((r) => r.index === res.index);
          if (i >= 0) liveResults[i] = res;
          else liveResults.push(res);
          setMessages((prev) =>
            prev.map((mm) =>
              matches(mm)
                ? {
                    ...mm,
                    mediaResults: (mm.mediaResults ?? []).map((r) =>
                      r.index === res.index ? res : r,
                    ),
                  }
                : mm,
            ),
          );
          if (msg.id) {
            void updateMessageMetadata(msg.id, { mediaResults: liveResults });
          }
        },
      });
      setMessages((prev) =>
        prev.map((mm) => (matches(mm) ? { ...mm, mediaStatus: "done" } : mm)),
      );
      if (msg.id) {
        void updateMessageMetadata(msg.id, {
          mediaStatus: "done",
          mediaResults: liveResults,
        });
      }
    } finally {
      setIsLoading(false);
      setIsThinking(false);
    }
  }, [msg.id, msg.mediaPlan, msg.mediaResults, matches, setMessages, setIsLoading, setIsThinking]);

  // Auto-start generation immediately without any confirmation/plan step.
  useEffect(() => {
    if (autoStartRef.current) return;
    const status = msg.mediaStatus ?? "awaiting";
    if (status !== "awaiting") return;
    autoStartRef.current = true;
    void startGeneration();
  }, [msg.mediaStatus, startGeneration]);

  return (
    <div className="px-3 md:px-12 space-y-2">
      <Suspense fallback={null}>
        {msg.mediaResults && msg.mediaResults.length > 0 && (
          <MediaResultCard
            results={msg.mediaResults}
            finalVideoUrl={msg.mediaFinalVideoUrl}
            mergeStatus={msg.mediaMergeStatus}
            mergeError={msg.mediaMergeError}
            onMergeVideos={async () => {
              const urls = (msg.mediaResults ?? [])
                .filter((r) => r.type === "video" && r.status === "done" && r.url)
                .map((r) => r.url!) as string[];
              if (urls.length < 2) {
                toast.error("Need at least 2 finished clips to merge");
                return;
              }
              setMessages((prev) =>
                prev.map((mm) =>
                  matches(mm)
                    ? { ...mm, mediaMergeStatus: "merging", mediaMergeError: undefined }
                    : mm,
                ),
              );
              try {
                const { mergeVideosInBrowser } = await import("@/lib/mergeVideosClient");
                const blob = await mergeVideosInBrowser(urls, () => {});
                const objectUrl = URL.createObjectURL(blob);
                setMessages((prev) =>
                  prev.map((mm) =>
                    matches(mm)
                      ? {
                          ...mm,
                          mediaMergeStatus: "done",
                          mediaFinalVideoUrl: objectUrl,
                        }
                      : mm,
                  ),
                );
                toast.success("Final video ready");
              } catch (e) {
                const m = e instanceof Error ? e.message : "Merge failed";
                setMessages((prev) =>
                  prev.map((mm) =>
                    matches(mm) ? { ...mm, mediaMergeStatus: "error", mediaMergeError: m } : mm,
                  ),
                );
                toast.error(m);
              }
            }}
            onRetry={async (idx) => {
              setMessages((prev) =>
                prev.map((mm) =>
                  matches(mm)
                    ? {
                        ...mm,
                        mediaResults: (mm.mediaResults ?? []).map((r) =>
                          r.index === idx
                            ? { ...r, status: "running" as const, error: undefined }
                            : r,
                        ),
                      }
                    : mm,
                ),
              );
              const res = await regenerateScene(
                msg.mediaPlan!,
                idx,
                (i, previewUrl, progress) => {
                  setMessages((prev) =>
                    prev.map((mm) =>
                      matches(mm)
                        ? {
                            ...mm,
                            mediaResults: (mm.mediaResults ?? []).map((r) =>
                              r.index === i ? { ...r, previewUrl, progress } : r,
                            ),
                          }
                        : mm,
                    ),
                  );
                },
                (i, endsAt) => {
                  setMessages((prev) =>
                    prev.map((mm) =>
                      matches(mm)
                        ? {
                            ...mm,
                            mediaResults: (mm.mediaResults ?? []).map((r) =>
                              r.index === i ? { ...r, taskEndsAt: endsAt } : r,
                            ),
                          }
                        : mm,
                    ),
                  );
                },
              );

              const merged = (msg.mediaResults ?? []).map((r) => (r.index === idx ? res : r));
              setMessages((prev) =>
                prev.map((mm) =>
                  matches(mm)
                    ? { ...mm, mediaResults: merged }
                    : mm,
                ),
              );
              if (msg.id) {
                void updateMessageMetadata(msg.id, { mediaResults: merged });
              }
            }}
          />
        )}
      </Suspense>
      {/* Unused in direct mode, but referenced to keep setInput import used */}
      <span className="hidden" data-set-input={setInput ? "1" : "0"} />
    </div>
  );
}
