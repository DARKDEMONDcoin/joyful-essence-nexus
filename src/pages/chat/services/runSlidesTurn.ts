import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { failStaleJob } from "@/lib/jobs/client";
import { isStandardSlides, findSlidesTemplate } from "@/lib/slidesTemplates";
import { authorizePremiumSlide, FREE_PREMIUM_SLIDES_PER_DAY } from "@/lib/slidesQuota";
import type { SlideDeck } from "@/components/chat/SlidesDeckCard";
import type { Message } from "../chatConstants";
import { SLIDES_CLIENT_TIMEOUT_MS, SLIDES_TIMEOUT_MESSAGE } from "../chatUtils";

export interface RunSlidesTurnArgs {
  userInput: string;
  localTurnId: string;
  chatUserId: string | null | undefined;
  slidesTemplate: string;
  setChatMode: (m: any) => void;
  setSearchEnabled: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  setIsThinking: (v: boolean) => void;
  resetToolUi: () => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setSearchStatus: (v: string) => void;
  createOrUpdateConversation: (title: string) => Promise<string | null>;
  saveMessage: (
    cid: string,
    role: string,
    content: string,
    modelId?: any,
    meta?: any,
  ) => Promise<string | undefined>;
  ownInsertedIdsRef: React.MutableRefObject<Set<string>>;
  fetchSlidesNarration: (p: any) => Promise<string>;
  insertAssistantNarration: (
    cid: string | null | undefined,
    text: string,
    clientId?: string,
  ) => Promise<void>;
  clearSlidesTimeout: (jobId: string) => void;
  slidesTimeoutsRef: React.MutableRefObject<Record<string, number>>;
  slidesGenerationTokenRef: React.MutableRefObject<number>;
}

/**
 * Returns true if the slides turn was started successfully and the caller
 * should `return`. Returns false if validation prevented work (caller still
 * returns; isSubmittingRef is reset by caller).
 */
export async function runSlidesTurn(args: RunSlidesTurnArgs): Promise<void> {
  const {
    userInput,
    localTurnId,
    chatUserId,
    slidesTemplate,
    setChatMode,
    setSearchEnabled,
    setIsLoading,
    setIsThinking,
    resetToolUi,
    setMessages,
    setSearchStatus,
    createOrUpdateConversation,
    saveMessage,
    ownInsertedIdsRef,
    fetchSlidesNarration,
    insertAssistantNarration,
    clearSlidesTimeout,
    slidesTimeoutsRef,
    slidesGenerationTokenRef,
  } = args;

  const slidesRequestToken = ++slidesGenerationTokenRef.current;
  const isSlidesRequestCancelled = () => slidesGenerationTokenRef.current !== slidesRequestToken;

  const slidesTopic = (userInput || "").trim();
  const genericSlideAsks =
    /^(Build|Build me|I want|make|create|generate|build|do)\s*(for me|me)?\s*(slides|presentation|deck)\s*[!.??]*$/i;
  if (!slidesTopic || slidesTopic.length < 6 || genericSlideAsks.test(slidesTopic)) {
    toast.error(
      'Please describe the slides topic clearly, e.g.: "Create slides about ancient Egyptian history in 10 slides"',
    );
    setChatMode("normal");
    setSearchEnabled(true);
    setIsLoading(false);
    setIsThinking(false);
    resetToolUi();
    setMessages((prev) =>
      prev[prev.length - 1]?.role === "assistant" && !prev[prev.length - 1]?.content
        ? prev.slice(0, -1)
        : prev,
    );
    return;
  }

  const conversationPromise = createOrUpdateConversation(userInput || "Slides").catch(() => null);
  const userSavePromise = conversationPromise.then(async (cid) => {
    if (!cid) return;
    const insertedId = await saveMessage(cid, "user", userInput);
    if (insertedId) {
      ownInsertedIdsRef.current.add(insertedId);
      window.dispatchEvent(new CustomEvent("megsy:conversations-changed"));
    }
  });

  const tplPicked = findSlidesTemplate(slidesTemplate);
  if (tplPicked.category === "premium" && chatUserId) {
    const auth = await authorizePremiumSlide(chatUserId);
    if (!auth.ok) {
      toast.error((auth as { reason?: string }).reason || "Could not start premium slides");
      setIsLoading(false);
      setIsThinking(false);
      resetToolUi();
      return;
    }
    if (auth.charged) {
      toast.info(`Used 1 credit (daily ${FREE_PREMIUM_SLIDES_PER_DAY} free premium slides used)`);
    } else if (auth.remainingFree === 0) {
      toast.info("Last free premium slide today — next ones cost 1 credit");
    }
  }

  try {
    const cid = await conversationPromise;
    await userSavePromise.catch(() => {});

    const planText = await fetchSlidesNarration({
      mode: "plan",
      topic: slidesTopic,
      kind: "slides",
      title: slidesTopic.slice(0, 80),
    });
    if (planText) {
      await insertAssistantNarration(cid, planText, `assistant-${localTurnId}`);
    }
    if (isSlidesRequestCancelled()) return;

    let placeholderId: string | null = null;
    if (cid) {
      placeholderId =
        (await saveMessage(cid, "assistant", "", undefined, {
          kind: "slidesPending",
          topic: userInput,
          templateId: slidesTemplate,
        })) ?? null;
      if (placeholderId) ownInsertedIdsRef.current.add(placeholderId);
      if (placeholderId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.clientId === `assistant-${localTurnId}`
              ? { ...m, id: placeholderId ?? undefined, slidesPendingTopic: userInput }
              : m,
          ),
        );
      }
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString(), mode: "slides" } as any)
        .eq("id", cid);
    }
    if (isSlidesRequestCancelled()) return;

    // All slide generation is routed through Plus AI Presentations API now.
    const { subscribeJob, startPlusAIPresentation } = await import("@/lib/jobs/client");
    void isStandardSlides; // kept import for tree-shake friendliness; no longer used to branch
    const { jobId } = await startPlusAIPresentation({
      topic: userInput,
      templateId: slidesTemplate,
      conversation_id: cid,
      message_id: placeholderId,
    });
    if (isSlidesRequestCancelled()) {
      clearSlidesTimeout(jobId);
      void failStaleJob(jobId, "Slides generation was cancelled.").catch(() => {});
      return;
    }

    if (placeholderId) {
      try {
        await supabase
          .from("messages")
          .update({
            metadata: {
              kind: "slidesPending",
              topic: userInput,
              templateId: slidesTemplate,
              slidesJobId: jobId,
            } as any,
          })
          .eq("id", placeholderId);
      } catch {
        /* best-effort */
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId || m.clientId === `assistant-${localTurnId}`
            ? {
                ...m,
                id: placeholderId || m.id,
                slidesJobId: jobId,
                slidesPendingTopic: userInput,
                mode: "slides",
              }
            : m,
        ),
      );
    }

    let narrative = "";
    let finalDeck: any = null;
    let finalStandardSlides: any = null;
    setSearchStatus("Starting…");

    await new Promise<void>((resolve) => {
      let unsub: (() => void) | undefined;
      clearSlidesTimeout(jobId);

      // Idle timeout: only fire if the job goes silent for this long with no
      // progress / narrative / output events. A long-but-still-streaming job
      // must not be killed just because the absolute clock ran out.
      const IDLE_TIMEOUT_MS = Math.min(SLIDES_CLIENT_TIMEOUT_MS, 240_000); // 4 min of silence
      const scheduleIdleTimeout = () => {
        clearSlidesTimeout(jobId);
        slidesTimeoutsRef.current[jobId] = window.setTimeout(() => {
          void failStaleJob(jobId, SLIDES_TIMEOUT_MESSAGE);
          if (placeholderId) {
            void supabase
              .from("messages")
              .update({
                content: (narrative || SLIDES_TIMEOUT_MESSAGE).trim(),
                metadata: {
                  kind: "slidesError",
                  topic: userInput,
                  templateId: slidesTemplate,
                } as any,
              })
              .eq("id", placeholderId);
          }
          unsub?.();
          clearSlidesTimeout(jobId);
          setMessages((prev) =>
            prev.map((m) =>
              m.clientId === `assistant-${localTurnId}` ||
              (!!placeholderId && m.id === placeholderId)
                ? {
                    ...m,
                    content: (narrative || SLIDES_TIMEOUT_MESSAGE).trim(),
                    slidesJobId: undefined,
                    mode: "slides",
                  }
                : m,
            ),
          );
          toast.error("Slides generation took too long. Please try again.");
          resolve();
        }, IDLE_TIMEOUT_MS);
      };
      scheduleIdleTimeout();

      unsub = subscribeJob(jobId, {
        onProgress: (_p, phase) => {
          scheduleIdleTimeout();
          if (isSlidesRequestCancelled()) return;
          if (!phase) return;
          const phaseLabels: Record<string, string> = {
            search: "Searching the web",
            findings: "Reviewing findings",
            outline: "Drafting outline",
            content: "Writing slides",
            images: "Selecting images",
            review: "Polishing deck",
            finalize: "Finalizing deck",
          };
          const lbl = phaseLabels[phase];
          setSearchStatus(lbl || "Preparing your deck");
          if (!narrative) setIsThinking(true);
        },
        onDelta: (_chunk, full) => {
          scheduleIdleTimeout();
          if (isSlidesRequestCancelled()) return;
          narrative = full;
          setMessages((prev) =>
            prev.map((m) =>
              m.clientId === `assistant-${localTurnId}` ||
              (!!placeholderId && m.id === placeholderId)
                ? { ...m, content: narrative }
                : m,
            ),
          );
        },
        onOutput: (out) => {
          scheduleIdleTimeout();
          if (isSlidesRequestCancelled()) return;
          if (out?.deck) finalDeck = out.deck;
          if (out?.standardSlides) finalStandardSlides = out.standardSlides;
        },

        onDone: async () => {
          if (isSlidesRequestCancelled()) {
            clearSlidesTimeout(jobId);
            unsub?.();
            resolve();
            return;
          }
          clearSlidesTimeout(jobId);
          if (finalStandardSlides) {
            const ss = finalStandardSlides as {
              title: string;
              templateName: string;
              url: string;
              colors: [string, string];
              slides?: string[];
              slideCount?: number;
            };
            const summaryText = await fetchSlidesNarration({
              mode: "summary",
              topic: slidesTopic,
              kind: "slides",
              title: ss.title,
              slideCount: ss.slideCount ?? ss.slides?.length,
            });
            const finalContent = (narrative || summaryText || "").trim();
            setMessages((prev) =>
              prev.map((m) =>
                m.clientId === `assistant-${localTurnId}` ||
                (!!placeholderId && m.id === placeholderId)
                  ? {
                      ...m,
                      content: finalContent || m.content,
                      standardSlides: ss,
                      slidesJobId: undefined,
                      mode: "slides",
                    }
                  : m,
              ),
            );
            if (placeholderId) {
              try {
                await supabase
                  .from("messages")
                  .update({
                    content: finalContent,
                    metadata: { kind: "standardSlides", standardSlides: ss } as any,
                  })
                  .eq("id", placeholderId);
              } catch {
                /* best-effort */
              }
            }
          } else if (finalDeck) {
            const tpl = findSlidesTemplate(finalDeck.templateId || slidesTemplate);
            const enrichedDeck: SlideDeck & { htmlSlug?: string; variant?: string } = tpl.htmlSlug
              ? { ...finalDeck, templateId: tpl.id, htmlSlug: tpl.htmlSlug, variant: tpl.variant }
              : finalDeck;
            const summaryText = await fetchSlidesNarration({
              mode: "summary",
              topic: slidesTopic,
              kind: "slides",
              title: enrichedDeck.title || slidesTopic.slice(0, 80),
              slideCount: enrichedDeck.slides?.length,
            });
            const finalContent = (narrative || summaryText || "").trim();
            setMessages((prev) =>
              prev.map((m) =>
                m.clientId === `assistant-${localTurnId}` ||
                (!!placeholderId && m.id === placeholderId)
                  ? {
                      ...m,
                      content: finalContent || m.content,
                      slidesDeck: enrichedDeck,
                      slidesJobId: undefined,
                      mode: "slides",
                    }
                  : m,
              ),
            );
            if (placeholderId) {
              try {
                await supabase
                  .from("messages")
                  .update({
                    content: finalContent,
                    metadata: { kind: "slidesDeck", slidesDeck: enrichedDeck } as any,
                  })
                  .eq("id", placeholderId);
              } catch {
                /* best-effort */
              }
            }
          } else {
            if (placeholderId) {
              void supabase
                .from("messages")
                .update({
                  content: "Slides generation finished without a deck. Please try again.",
                  metadata: {
                    kind: "slidesError",
                    topic: userInput,
                    templateId: slidesTemplate,
                  } as any,
                })
                .eq("id", placeholderId);
            }
            setMessages((prev) =>
              prev.map((m) =>
                m.clientId === `assistant-${localTurnId}` ||
                (!!placeholderId && m.id === placeholderId)
                  ? {
                      ...m,
                      content: "Slides generation finished without a deck. Please try again.",
                      slidesJobId: undefined,
                      mode: "slides",
                    }
                  : m,
              ),
            );
            toast.error("Slides generation failed");
          }
          unsub?.();
          resolve();
        },
        onError: (msg) => {
          if (isSlidesRequestCancelled()) {
            clearSlidesTimeout(jobId);
            unsub?.();
            resolve();
            return;
          }
          clearSlidesTimeout(jobId);
          if (placeholderId) {
            void supabase
              .from("messages")
              .update({
                content: `Could not create the presentation: ${msg}`,
                metadata: {
                  kind: "slidesError",
                  topic: userInput,
                  templateId: slidesTemplate,
                } as any,
              })
              .eq("id", placeholderId);
          }
          setMessages((prev) =>
            prev.map((m) =>
              m.clientId === `assistant-${localTurnId}` ||
              (!!placeholderId && m.id === placeholderId)
                ? {
                    ...m,
                    content: `Could not create the presentation: ${msg}`,
                    slidesJobId: undefined,
                    mode: "slides",
                  }
                : m,
            ),
          );
          toast.error(`Slides error: ${msg}`);
          unsub?.();
          resolve();
        },
        onStale: async (row) => {
          if (isSlidesRequestCancelled()) {
            clearSlidesTimeout(jobId);
            unsub?.();
            resolve();
            return;
          }
          clearSlidesTimeout(jobId);
          try {
            await failStaleJob(jobId, "Slides generation stopped unexpectedly. Please try again.");
          } catch {
            /* ignore */
          }
          const partial = (row.stream_text || narrative || "").trim();
          if (placeholderId) {
            void supabase
              .from("messages")
              .update({
                content: partial || "Slides generation stopped unexpectedly. Please try again.",
                metadata: {
                  kind: "slidesError",
                  topic: userInput,
                  templateId: slidesTemplate,
                } as any,
              })
              .eq("id", placeholderId);
          }
          setMessages((prev) =>
            prev.map((m) =>
              m.clientId === `assistant-${localTurnId}`
                ? {
                    ...m,
                    content: partial || "Slides generation stopped unexpectedly. Please try again.",
                    slidesJobId: undefined,
                  }
                : m,
            ),
          );
          toast.error("Slides generation stopped unexpectedly. Please try again.");
          unsub?.();
          resolve();
        },
      });
    });
  } catch (e) {
    console.error(e);
    toast.error("Slides generation error");
  } finally {
    setIsLoading(false);
    setIsThinking(false);
    resetToolUi();
  }
}
