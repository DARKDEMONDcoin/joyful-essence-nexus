import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { friendlyUserMessage, reportError } from "@/lib/errors";
import type { Message } from "../chatConstants";

export interface RunDocsTurnArgs {
  userInput: string;
  localTurnId: string;
  chatUserId: string | null | undefined;
  navigate: (path: string) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setSearchStatus: (v: string) => void;
  setIsLoading: (v: boolean) => void;
  setIsThinking: (v: boolean) => void;
  resetToolUi: () => void;
  startDocsStatusFallback: () => void;
  stopDocsStatusFallback: () => void;
  createOrUpdateConversation: (title: string) => Promise<string | null>;
  saveMessage: (
    cid: string,
    role: string,
    content: string,
    modelId?: any,
    meta?: any,
  ) => Promise<string | undefined>;
  ownInsertedIdsRef: React.MutableRefObject<Set<string>>;
}

/**
 * Returns `true` if the docs flow handled the request and the caller should
 * `return`. Returns `false` only if the user must be redirected (caller is
 * responsible for clearing `isSubmittingRef`).
 */
export async function runDocsTurn(args: RunDocsTurnArgs): Promise<boolean> {
  const {
    userInput,
    localTurnId,
    chatUserId,
    navigate,
    messages,
    setMessages,
    setSearchStatus,
    setIsLoading,
    setIsThinking,
    resetToolUi,
    startDocsStatusFallback,
    stopDocsStatusFallback,
    createOrUpdateConversation,
    saveMessage,
    ownInsertedIdsRef,
  } = args;

  if (!chatUserId) {
    toast.error("Please sign in to generate documents.");
    navigate(
      `/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`,
    );
    return false;
  }

  const conversationPromise = createOrUpdateConversation(userInput || "Document").catch(() => null);

  void conversationPromise.then(async (cid) => {
    if (!cid) return;
    const insertedId = await saveMessage(cid, "user", userInput);
    if (insertedId) {
      ownInsertedIdsRef.current.add(insertedId);
      window.dispatchEvent(new CustomEvent("megsy:conversations-changed"));
    }
  });

  try {
    startDocsStatusFallback();
    const [{ streamDoc }, { saveDocHtml, newArtifactId }] = await Promise.all([
      import("@/lib/agent/docs/docsGenerator"),
      import("@/lib/agent/docs/htmlCache"),
    ]);
    const recentHistory = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }));
    const artifactId = newArtifactId();

    const cid = await conversationPromise;
    let placeholderMessageId: string | null = null;
    if (cid) {
      placeholderMessageId =
        (await saveMessage(
          cid,
          "assistant",
          "Preparing the document on the server… you can close the tab and we'll save the result here.",
          undefined,
          {
            kind: "docsPending",
            originalPrompt: userInput,
            docsArtifact: { artifactId, title: "Document", docType: "document" },
          },
        )) ?? null;
      if (placeholderMessageId) {
        ownInsertedIdsRef.current.add(placeholderMessageId);
        setMessages((prev) =>
          prev.map((m) =>
            m.clientId === `assistant-${localTurnId}`
              ? { ...m, id: placeholderMessageId ?? undefined }
              : m,
          ),
        );
      }
    }

    let pendingMeta: { title: string; doc_type: string } | null = null;
    let lastFlush = 0;
    let isClarify = false;

    const flush = (full: string, force = false) => {
      const now = Date.now();
      if (!force && now - lastFlush < 250) return;
      lastFlush = now;
      setMessages((prev) =>
        prev.map((m) =>
          m.clientId === `assistant-${localTurnId}`
            ? {
                ...m,
                content: "",
                docsArtifact: {
                  artifactId,
                  title: pendingMeta?.title ?? "Document",
                  docType: pendingMeta?.doc_type ?? "document",
                  html: full,
                },
              }
            : m,
        ),
      );
    };

    let finalHtml = "";
    let finalMeta: { title: string; doc_type: string } | null = null;
    let finalFriendly = "";
    let clarifyPayload: { reason: string; questions: any[] } | null = null;
    let receivedJobId: string | null = null;

    await streamDoc(
      {
        prompt: userInput,
        history: recentHistory,
        conversationId: cid ?? null,
        messageId: placeholderMessageId,
      },
      {
        onJobId: async (jobId) => {
          receivedJobId = jobId;
          if (placeholderMessageId) {
            try {
              await supabase
                .from("messages")
                .update({
                  metadata: {
                    kind: "docsPending",
                    originalPrompt: userInput,
                    docsJobId: jobId,
                    docsArtifact: { artifactId, title: "Document", docType: "document" },
                  },
                })
                .eq("id", placeholderMessageId);
            } catch {
              /* best-effort */
            }
          }
        },
        onStatus: (text) => {
          stopDocsStatusFallback();
          setSearchStatus(text);
        },
        onMeta: (m) => {
          pendingMeta = m;
          finalMeta = m;
          flush("<!DOCTYPE html><html><body></body></html>", true);
        },
        onHtmlDelta: (_chunk, full) => {
          finalHtml = full;
          flush(full);
        },
        onHtmlDone: (full, friendly) => {
          finalHtml = full;
          if (friendly) finalFriendly = friendly;
          flush(full, true);
        },
        onClarify: (c) => {
          isClarify = true;
          clarifyPayload = c;
          setMessages((prev) =>
            prev.map((m) =>
              m.clientId === `assistant-${localTurnId}`
                ? {
                    ...m,
                    content: c.reason,
                    docsArtifact: undefined,
                    docsClarify: {
                      reason: c.reason,
                      questions: c.questions,
                      ui: c.ui,
                      originalPrompt: userInput,
                    },
                  }
                : m,
            ),
          );
        },
        onError: (msg) => {
          throw new Error(msg);
        },
      },
    );

    if (isClarify && clarifyPayload && placeholderMessageId) {
      const cp = clarifyPayload as { reason: string; questions: any[] };
      await supabase
        .from("messages")
        .update({
          content: cp.reason,
          metadata: { kind: "docsClarify", docsClarify: { ...cp, originalPrompt: userInput } },
        })
        .eq("id", placeholderMessageId);
    } else if (finalHtml && finalHtml.length > 400 && finalMeta) {
      saveDocHtml(artifactId, finalHtml);
      const fm = finalMeta as { title: string; doc_type: string };
      let friendly = finalFriendly;
      if (!friendly) {
        const { buildDocReadyMessageAI } = await import("@/lib/agent/docs/readyMessage");
        friendly = await buildDocReadyMessageAI({
          title: fm.title,
          html: finalHtml,
          docType: fm.doc_type,
          prompt: userInput,
        });
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.clientId === `assistant-${localTurnId}`
            ? {
                ...m,
                content: friendly,
                docsArtifact: {
                  artifactId,
                  title: fm.title,
                  docType: fm.doc_type,
                  html: finalHtml,
                },
              }
            : m,
        ),
      );
      if (placeholderMessageId) {
        await supabase
          .from("messages")
          .update({
            content: friendly,
            metadata: {
              kind: "docsArtifact",
              docsArtifact: { artifactId, title: fm.title, docType: fm.doc_type, html: finalHtml },
            },
          })
          .eq("id", placeholderMessageId);
      }
    } else if (!receivedJobId) {
      toast.error("Document was not created — please try again");
      setMessages((prev) =>
        prev.map((m) =>
          m.clientId === `assistant-${localTurnId}`
            ? {
                ...m,
                docsArtifact: undefined,
                content: "Could not create the document this time. Try rephrasing or try again.",
              }
            : m,
        ),
      );
    }
  } catch (e) {
    console.error(e);
    const safe = friendlyUserMessage(e, "We couldn't create the document. Please try again.");
    void reportError(e, { source: "docs-generate", context: { localTurnId } });
    toast.error(safe);
    setMessages((prev) =>
      prev.map((m) =>
        m.clientId === `assistant-${localTurnId}`
          ? { ...m, docsArtifact: undefined, content: safe }
          : m,
      ),
    );
  } finally {
    stopDocsStatusFallback();
    setIsLoading(false);
    setIsThinking(false);
    resetToolUi();
  }

  return true;
}
