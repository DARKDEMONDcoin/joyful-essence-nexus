/** @doc Ask Tommy — full-screen minimal AI support chat, no header/footer. */
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ArrowUp, Square, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useCredits } from "@/hooks/useCredits";
import { buildSupportSystemPrompt } from "@/data/supportKnowledge";
import tommyAvatar from "@/assets/tommy-avatar.png";

const STORAGE_KEY = "megsy_tommy_chat_v1";
const MAX_HISTORY = 40;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How do credits work?",
  "How do I earn free credits?",
  "How do I cancel my subscription?",
  "Which image model is best?",
];

const loadHistory = (): Message[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.slice(-MAX_HISTORY) : [];
  } catch {
    return [];
  }
};

const saveHistory = (messages: Message[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)));
  } catch {
    /* ignore */
  }
};

const SupportPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(() => loadHistory());
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastUserMsgRef = useRef<string>("");
  const { credits, plan } = useCredits();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [input]);

  useEffect(() => {
    if (!isStreaming) textareaRef.current?.focus();
  }, [isStreaming]);

  const buildSystemPrompt = useCallback(async (): Promise<string> => {
    const ctx: string[] = [];
    try {
      const { data } = await supabase.auth.getUser();
      ctx.push(data?.user?.email ? `Signed-in user: ${data.user.email}` : "Guest user.");
    } catch { /* ignore */ }
    if (typeof credits === "number") ctx.push(`Credits: ${credits} MC`);
    if (plan) ctx.push(`Plan: ${plan}`);

    return `You are Tommy, Megsy's warm, friendly AI support assistant. Keep replies concise, human, and helpful. Use clear markdown.\n\n${buildSupportSystemPrompt()}\n\n## Live user context\n${ctx.join("\n")}`;
  }, [credits, plan]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      lastUserMsgRef.current = trimmed;
      setNetworkError(false);

      const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: trimmed };
      const assistantMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: "" };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
      setIsStreaming(true);

      const history = [...messages, userMsg]
        .slice(-MAX_HISTORY)
        .map((m) => ({ role: m.role, content: m.content }));

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const customSystem = await buildSystemPrompt();
        const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-alibaba`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: history,
            customSystem,
            model: "qwen-max",
            tier: "max",
            useTools: false,
          }),
          signal: controller.signal,
        });

        if (!resp.ok || !resp.body) throw new Error(`status_${resp.status}`);

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                setMessages((prev) => {
                  const copy = [...prev];
                  const last = copy[copy.length - 1];
                  if (last && last.role === "assistant") {
                    copy[copy.length - 1] = { ...last, content: last.content + content };
                  }
                  return copy;
                });
              }
            } catch {
              break;
            }
          }
        }
      } catch (err: unknown) {
        const aborted =
          err instanceof Error && (err.name === "AbortError" || err.message === "cancelled");
        if (!aborted) {
          setNetworkError(true);
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last && last.role === "assistant" && !last.content) copy.pop();
            return copy;
          });
        }
      } finally {
        abortRef.current = null;
        setIsStreaming(false);
      }
    },
    [buildSystemPrompt, isStreaming, messages],
  );

  const retry = useCallback(() => {
    if (lastUserMsgRef.current) void send(lastUserMsgRef.current);
  }, [send]);

  const newChat = useCallback(() => {
    if (isStreaming) abortRef.current?.abort();
    setMessages([]);
    setNetworkError(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
    textareaRef.current?.focus();
  }, [isStreaming]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) void send(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) void send(input);
    }
  };

  const goBack = () =>
    window.history.length > 1 ? window.history.back() : navigate("/settings/support");

  return (
    <div className="relative h-[100dvh] flex flex-col text-foreground overflow-hidden">
      {/* Ambient glass background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background via-background to-background" />
      <div className="pointer-events-none absolute -top-32 -left-24 -z-10 w-[420px] h-[420px] rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 -z-10 w-[420px] h-[420px] rounded-full bg-fuchsia-500/15 blur-[120px]" />

      {/* Glass top bar */}
      <div
        className="shrink-0 sticky top-0 z-10 backdrop-blur-xl bg-background/60 border-b border-foreground/[0.08]"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="max-w-2xl mx-auto w-full flex items-center gap-3 px-4 h-14">
          <button
            onClick={goBack}
            aria-label="Back"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-foreground/[0.04] border border-foreground/10 hover:bg-foreground/[0.08] active:scale-95 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="relative w-9 h-9 shrink-0">
              <img
                src={tommyAvatar}
                alt="Tommy"
                width={36}
                height={36}
                className="w-9 h-9 rounded-full object-cover ring-1 ring-foreground/10"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-background" />
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold leading-tight truncate">Tommy</p>
              <p className="text-[11.5px] text-foreground/50 leading-tight">AI assistant · online</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={newChat}
              className="text-[12.5px] font-medium px-3 h-9 rounded-full bg-foreground/[0.04] border border-foreground/10 hover:bg-foreground/[0.08] active:scale-95 transition"
            >
              New chat
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full px-4 py-6 animate-fade-in">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center text-center pt-8">
              <div className="relative mb-5">
                <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl" />
                <img
                  src={tommyAvatar}
                  alt="Tommy"
                  width={96}
                  height={96}
                  className="relative w-24 h-24 rounded-full ring-1 ring-foreground/10"
                />
              </div>
              <h1 className="text-[26px] font-semibold tracking-tight">Hi, I'm Tommy 👋</h1>
              <p className="mt-2 text-[15px] text-foreground/60 max-w-sm">
                Your personal Megsy assistant. Ask me about subscriptions, credits, models, or anything else — I'll help you out.
              </p>
              <div className="mt-8 w-full grid grid-cols-1 gap-2">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => void send(s)}
                    style={{ animationDelay: `${i * 60}ms` }}
                    className="animate-fade-in text-left text-[14px] px-4 py-3 rounded-2xl backdrop-blur-xl bg-foreground/[0.03] border border-foreground/10 hover:bg-foreground/[0.06] hover:border-foreground/20 active:scale-[0.99] transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex animate-fade-in ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "user" ? (
                    <div className="max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 bg-primary text-primary-foreground text-[15px] leading-relaxed whitespace-pre-wrap break-words shadow-sm">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="max-w-[92%] text-[15px] leading-relaxed text-foreground">
                      {msg.content ? (
                        <div className="rounded-2xl rounded-bl-md px-4 py-2.5 backdrop-blur-xl bg-foreground/[0.04] border border-foreground/10">
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-md backdrop-blur-xl bg-foreground/[0.04] border border-foreground/10">
                          <span className="w-1.5 h-1.5 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {networkError && (
                <div className="flex items-center gap-2 rounded-2xl px-4 py-3 backdrop-blur-xl bg-rose-500/10 border border-rose-500/20 text-[13px] text-rose-300 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="flex-1">Something went wrong.</span>
                  <button
                    onClick={retry}
                    className="text-[12px] font-medium underline underline-offset-2"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Glass composer */}
      <div
        className="shrink-0 backdrop-blur-xl bg-background/70 border-t border-foreground/[0.08]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto w-full px-4 py-3 flex items-end gap-2"
        >
          <div className="flex-1 rounded-3xl backdrop-blur-xl bg-foreground/[0.04] border border-foreground/10 px-4 py-2.5 flex items-end gap-2 focus-within:border-foreground/25 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Message Tommy…"
              className="flex-1 bg-transparent resize-none outline-none text-[15px] leading-6 text-foreground placeholder:text-foreground/40 max-h-40"
            />
          </div>
          {isStreaming ? (
            <button
              type="button"
              onClick={stop}
              aria-label="Stop"
              className="shrink-0 w-11 h-11 rounded-full bg-foreground text-background flex items-center justify-center active:scale-95 transition"
            >
              <Square className="w-4 h-4" fill="currentColor" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send"
              className="shrink-0 w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 disabled:bg-foreground/20 active:scale-95 transition shadow-sm"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default SupportPage;
