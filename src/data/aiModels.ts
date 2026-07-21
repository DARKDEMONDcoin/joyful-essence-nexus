/** @doc Shared catalog of the six flagship chat models surfaced on /ai-chat and their dedicated /ai-chat/models/:slug pages. */
import silkMegsy from "@/assets/silk-megsy.jpg";
import silkGemini from "@/assets/silk-gemini.jpg";
import silkGpt from "@/assets/silk-gpt.jpg";
import silkGrok from "@/assets/silk-grok.jpg";
import silkSonnet from "@/assets/silk-sonnet.jpg";
import silkOpus from "@/assets/silk-opus.jpg";
import portraitMegsy from "@/assets/model-megsy.jpg";
import portraitGemini from "@/assets/model-gemini.jpg";
import portraitGpt from "@/assets/model-gpt.jpg";
import portraitGrok from "@/assets/model-grok.jpg";
import portraitSonnet from "@/assets/model-sonnet.jpg";
import portraitOpus from "@/assets/model-opus.jpg";

const PORTRAITS: Record<string, string> = {
  "megsy-v1": portraitMegsy,
  "gemini-3-5": portraitGemini,
  "gpt-5-5": portraitGpt,
  "grok-4": portraitGrok,
  "claude-sonnet-4-6": portraitSonnet,
  "claude-opus-4-8": portraitOpus,
};

export const MODEL_HERO_VIDEOS: Record<string, string> = {
  "megsy-v1": "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260602_150901_c45b90ec-18d7-42ff-90e2-b95d7109e330.mp4",
  "gemini-3-5": "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260520_133010_cb9c806d-bc9d-47f1-ac4c-b1759134ec8b.mp4",
  "gpt-5-5": "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260525_052706_d2e390fd-1846-4fe7-a4d8-8d2f1c875358.mp4",
  "grok-4": "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260517_070729_32a7eb4e-d6e2-4571-badc-91b4dab1ecbe.mp4",
  "claude-sonnet-4-6": "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_131941_d136af49-e243-493a-be14-6ff3f24e09e6.mp4",
  "claude-opus-4-8": "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260514_102933_4e8f73b5-775a-4179-b2fb-472f59063dcd.mp4",
};



export type ModelSpec = { label: string; value: string };
export type ModelUseCase = { title: string; body: string };
export type ModelFaq = { q: string; a: string };

export type AiModel = {
  id: string;
  name: string;
  vendor: string;
  tagline: string;
  body: string;
  bullets: string[];
  image: string;
  portrait?: string;
  badge: string | null;
  // dedicated page extras
  hero: string;
  specs: ModelSpec[];
  strengths: string[];
  useCases: ModelUseCase[];
  benchmarks: { name: string; score: string; note?: string }[];
  pricing: string;
  faq: ModelFaq[];
};



export const MODELS: AiModel[] = [
  {
    id: "megsy-v1",
    name: "Megsy 3.9",
    vendor: "Megsy · in-house",
    tagline: "Our default model — free on every plan.",
    body: "Megsy 3.9 is our in-house default. Fast, multilingual, and tuned for chat, skills, file Q&A and tool use. It's the brain behind every free conversation in Megsy and runs with native web search, image generation and code execution built in.",
    bullets: [
      "Free on every plan, including the free tier",
      "Native web search, files, image gen and code tools",
      "Tuned for Arabic, English and 100+ languages",
      "Fast first-token latency — built for daily use",
    ],
    image: silkMegsy,
    badge: null,
    hero: "The default brain behind every free Megsy conversation — multilingual, tool-native, and tuned for daily work.",
    specs: [
      { label: "Context window", value: "256K tokens" },
      { label: "Output limit", value: "16K tokens" },
      { label: "Modalities", value: "Text · Image · File" },
      { label: "Tools", value: "Web search · Code · Image · Files" },
      { label: "Languages", value: "Arabic, English + 100 more" },
      { label: "Latency", value: "~0.4s first token" },
    ],
    strengths: [
      "Native Arabic + RTL handling without quality drop",
      "Built-in tool routing: search, files, image, code",
      "Lowest latency in the lineup for short prompts",
      "Free unlimited use on the daily-credit tier",
    ],
    useCases: [
      { title: "Daily chat & research", body: "Quick answers with citations, summaries of long pages, follow-up Q&A in the same thread." },
      { title: "File Q&A", body: "Drop PDFs, sheets or transcripts — Megsy 3.9 answers with page-level grounding." },
      { title: "Skills & automation", body: "Routes prompts to the right skill (writer, analyst, designer) without you picking one." },
      { title: "Arabic content", body: "Native-quality Arabic writing, translation and dialect handling out of the box." },
    ],
    benchmarks: [
      { name: "MMLU", score: "83.4%", note: "general knowledge" },
      { name: "HumanEval", score: "78.1%", note: "Python coding" },
      { name: "Arabic MMLU", score: "81.7%", note: "best-in-class for the price" },
    ],
    pricing: "Free on every Megsy plan, including the daily-credit free tier.",
    faq: [
      { q: "Is Megsy 3.9 really free?", a: "Yes — unlimited daily credits on the free tier, no card needed. Paid plans only unlock the premium third-party models." },
      { q: "Does it have web search?", a: "Yes, on by default for time-sensitive questions, with inline citations." },
    ],
  },
  {
    id: "gemini-3-5",
    name: "Gemini 3.5",
    vendor: "Google · multimodal",
    tagline: "Google's flagship for long context and multimodal reasoning.",
    body: "Gemini 3.5 brings a huge context window and best-in-class multimodal understanding. Drop in PDFs, screenshots, charts, audio or video — it reads them all and reasons across them in one shot.",
    bullets: [
      "Massive context window for entire books and codebases",
      "Native vision, audio and video understanding",
      "Strong at math, science and structured extraction",
      "Available on every paid Megsy plan",
    ],
    image: silkGemini,
    badge: null,
    hero: "Google's flagship multimodal model — long context, native video & audio, and frontier math.",
    specs: [
      { label: "Context window", value: "2M tokens" },
      { label: "Output limit", value: "64K tokens" },
      { label: "Modalities", value: "Text · Image · Audio · Video · PDF" },
      { label: "Vision", value: "Native, with video frame reasoning" },
      { label: "Knowledge cutoff", value: "Jan 2026" },
      { label: "Latency", value: "~1.2s first token" },
    ],
    strengths: [
      "Reads entire books, codebases or 1-hour videos in one prompt",
      "Best-in-class video and audio comprehension",
      "Strong structured extraction with JSON schemas",
      "Top scores on AIME, GPQA and MathArena",
    ],
    useCases: [
      { title: "Long document analysis", body: "Drop a 500-page PDF, a full repo or a 1-hour meeting recording — Gemini 3.5 reasons across all of it." },
      { title: "Video understanding", body: "Summarise lectures, extract scenes, transcribe and timestamp meetings." },
      { title: "Math & science", body: "Olympiad-level math, proof checking, scientific paper synthesis." },
      { title: "Structured extraction", body: "Convert messy PDFs and screenshots into clean JSON with strict schemas." },
    ],
    benchmarks: [
      { name: "MMLU-Pro", score: "86.2%" },
      { name: "AIME 2025", score: "92.0%", note: "math olympiad" },
      { name: "Video-MME", score: "79.4%", note: "video reasoning" },
    ],
    pricing: "Included on Pro, Unlimited and Workspace plans.",
    faq: [
      { q: "Can it watch a full video?", a: "Yes — Gemini 3.5 processes up to ~1 hour of video natively, with timestamped answers." },
      { q: "What about audio files?", a: "MP3/WAV/M4A up to 100MB are read directly, no separate transcription step needed." },
    ],
  },
  {
    id: "gpt-5-5",
    name: "GPT‑5.5",
    vendor: "OpenAI · flagship",
    tagline: "OpenAI's most capable general-purpose model.",
    body: "GPT‑5.5 is the all-rounder we reach for when accuracy matters most — legal drafts, structured extraction, multi-step planning and careful code review. Sharp reasoning, reliable instruction following, vision built in.",
    bullets: [
      "Frontier reasoning across MMLU, GPQA, SWE-bench",
      "Vision: read screenshots, charts, whiteboards, mockups",
      "Excellent at following long, layered instructions",
      "Available on Pro and Unlimited plans",
    ],
    image: silkGpt,
    badge: null,
    hero: "OpenAI's flagship — frontier reasoning, careful instruction following and best-in-class agentic coding.",
    specs: [
      { label: "Context window", value: "400K tokens" },
      { label: "Output limit", value: "32K tokens" },
      { label: "Modalities", value: "Text · Image" },
      { label: "Reasoning", value: "Adjustable: minimal → high" },
      { label: "Knowledge cutoff", value: "Oct 2025" },
      { label: "Latency", value: "~1.5s first token" },
    ],
    strengths: [
      "Top SWE-bench Verified scores for agentic coding",
      "Best instruction-following on long, layered prompts",
      "Native vision for screenshots, mockups and charts",
      "Reliable structured output with JSON schema mode",
    ],
    useCases: [
      { title: "Agentic coding", body: "Multi-file refactors, test writing and PR drafts inside Megsy's Claude Code-style sandbox." },
      { title: "Legal & contract work", body: "Drafts, redlines and clause-by-clause review with careful, conservative reasoning." },
      { title: "Strategy & planning", body: "Multi-step plans, OKRs, market analyses — follows nuanced briefs without drifting." },
      { title: "Vision tasks", body: "Read whiteboards, mockups and dashboards; explain charts; extract text from screenshots." },
    ],
    benchmarks: [
      { name: "SWE-bench Verified", score: "74.9%", note: "agentic coding" },
      { name: "GPQA Diamond", score: "85.7%", note: "PhD-level science" },
      { name: "MMMU", score: "84.2%", note: "multimodal reasoning" },
    ],
    pricing: "Included on Pro and Unlimited plans.",
    faq: [
      { q: "Is reasoning effort adjustable?", a: "Yes — you can pick minimal, medium or high in the model picker. Higher reasoning is slower but more accurate on hard tasks." },
      { q: "Does it have web search?", a: "Yes, through Megsy's built-in browse tool with inline citations." },
    ],
  },
  {
    id: "grok-4",
    name: "Grok 4",
    vendor: "xAI · realtime",
    tagline: "Live web, live X, no-nonsense tone.",
    body: "Grok 4 is wired into the realtime web and the X firehose, with a sharper, less-filtered conversational style. Reach for it on breaking news, market chatter and culture-shift research.",
    bullets: [
      "Live web and X timeline access",
      "Strong reasoning with a direct, candid voice",
      "Great for news, finance and trend analysis",
      "Available on Pro and Unlimited plans",
    ],
    image: silkGrok,
    badge: null,
    hero: "xAI's realtime flagship — wired into live web and the X firehose, with a direct, unfiltered voice.",
    specs: [
      { label: "Context window", value: "256K tokens" },
      { label: "Output limit", value: "16K tokens" },
      { label: "Modalities", value: "Text · Image" },
      { label: "Realtime data", value: "Live web + X timeline" },
      { label: "Knowledge cutoff", value: "Continuously updated" },
      { label: "Latency", value: "~1.0s first token" },
    ],
    strengths: [
      "Native X (Twitter) timeline access — no scraping",
      "Live web index updated continuously, not on a cutoff",
      "Sharper, less hedged tone for research and analysis",
      "Strong on finance, sports and news reasoning",
    ],
    useCases: [
      { title: "Breaking news research", body: "Get a sourced briefing on what happened in the last hour, with X quotes pulled in." },
      { title: "Market & finance", body: "Tickers, earnings, crypto chatter — Grok 4 pulls live prices and sentiment." },
      { title: "Trend & culture analysis", body: "Spot emerging memes, narrative shifts and creator moves on X." },
      { title: "Unfiltered Q&A", body: "Direct, candid answers without excessive hedging — great for first drafts." },
    ],
    benchmarks: [
      { name: "HLE", score: "44.4%", note: "Humanity's Last Exam" },
      { name: "AIME 2025", score: "93.3%" },
      { name: "LiveBench", score: "78.1%" },
    ],
    pricing: "Included on Pro and Unlimited plans.",
    faq: [
      { q: "Can it really read X in real time?", a: "Yes — Grok 4 has first-party access to the X firehose, so it sees posts within seconds." },
      { q: "Is the tone safe for work?", a: "Yes inside Megsy. We use the standard Grok endpoint with default safety settings." },
    ],
  },
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    vendor: "Anthropic · balanced",
    tagline: "The most-loved model for writing, code and daily work.",
    body: "Sonnet 4.6 is the daily-driver favorite — warm prose, careful reasoning and best-in-class code edits. Lower latency than Opus with most of the intelligence, and it powers Claude Code inside Megsy.",
    bullets: [
      "Best-in-class long-form writing and tone control",
      "Strong at refactoring and writing tests across files",
      "Large context window with high recall",
      "Native Claude Code agent inside chat",
    ],
    image: silkSonnet,
    badge: "PRO",
    hero: "Anthropic's daily-driver — warm prose, careful reasoning and the engine behind Claude Code inside Megsy.",
    specs: [
      { label: "Context window", value: "200K tokens" },
      { label: "Output limit", value: "64K tokens" },
      { label: "Modalities", value: "Text · Image · PDF" },
      { label: "Tools", value: "Read · Edit · Bash · WebFetch · Task" },
      { label: "Knowledge cutoff", value: "Jul 2025" },
      { label: "Latency", value: "~0.9s first token" },
    ],
    strengths: [
      "Powers Megsy's native Claude Code integration",
      "Best long-form writing — tone, voice and rhythm",
      "High recall over the full 200K context",
      "Excellent at refactors, tests and PR-ready edits",
    ],
    useCases: [
      { title: "Code editing", body: "Multi-file edits, refactors and test writing through the Claude Code SDK toolset." },
      { title: "Long-form writing", body: "Essays, reports, threads and ghost-written drafts that hold a single voice." },
      { title: "Research synthesis", body: "Read a dozen PDFs in one shot and produce a structured, cited brief." },
      { title: "Customer comms", body: "Tone-tuned replies, escalation drafts and policy explanations." },
    ],
    benchmarks: [
      { name: "SWE-bench Verified", score: "77.2%", note: "best in lineup" },
      { name: "MMLU", score: "88.7%" },
      { name: "GPQA Diamond", score: "83.4%" },
    ],
    pricing: "Included on Pro, Unlimited and Workspace plans.",
    faq: [
      { q: "Is this the model behind Claude Code?", a: "Yes — Sonnet 4.6 runs the Read/Edit/Bash/Task tools inside every Megsy chat." },
      { q: "Why pick Sonnet over Opus?", a: "Sonnet is ~3× faster and cheaper, with most of Opus's quality on day-to-day work." },
    ],
  },
  {
    id: "claude-opus-4-8",
    name: "Claude Opus 4.8",
    vendor: "Anthropic · deep reasoning",
    tagline: "When the answer has to be right the first time.",
    body: "Opus 4.8 is Anthropic's heavyweight — deeper reasoning, more careful planning, longer chains of thought. Reach for it on hard math, research synthesis, contract analysis and architecture decisions.",
    bullets: [
      "Top-tier results on hard reasoning benchmarks",
      "Multi-hour agentic runs without losing the plot",
      "Best for legal, scientific and financial analysis",
      "Unlimited-plan model",
    ],
    image: silkOpus,
    badge: "PRO",
    hero: "Anthropic's heavyweight — for the prompts where the answer has to be right the first time.",
    specs: [
      { label: "Context window", value: "200K tokens" },
      { label: "Output limit", value: "32K tokens" },
      { label: "Modalities", value: "Text · Image · PDF" },
      { label: "Reasoning", value: "Extended thinking mode" },
      { label: "Knowledge cutoff", value: "Jul 2025" },
      { label: "Latency", value: "~3s first token (extended)" },
    ],
    strengths: [
      "Highest reasoning quality on hard, multi-step problems",
      "Stays coherent across multi-hour agentic runs",
      "Best at legal, scientific and financial analysis",
      "Excellent at architecture and system design",
    ],
    useCases: [
      { title: "Hard reasoning", body: "Olympiad math, complex logic puzzles, scientific proofs." },
      { title: "Legal & contracts", body: "Clause-by-clause analysis, redlines and risk memos." },
      { title: "Research synthesis", body: "Dozens of papers reduced to a single, defensible briefing." },
      { title: "Architecture & strategy", body: "System design, migrations and multi-quarter strategy docs." },
    ],
    benchmarks: [
      { name: "ARC-AGI-2", score: "27.6%", note: "frontier reasoning" },
      { name: "GPQA Diamond", score: "87.8%" },
      { name: "MathArena", score: "91.4%" },
    ],
    pricing: "Unlimited and Workspace plans only.",
    faq: [
      { q: "When should I pick Opus over Sonnet?", a: "When the cost of a wrong answer is high — legal, finance, architecture, hard math." },
      { q: "Is extended thinking always on?", a: "Megsy turns it on automatically for hard prompts, and you can force it from the model picker." },
    ],
  },
].map((m) => ({ ...m, portrait: PORTRAITS[m.id] ?? m.image }));

export const getModelBySlug = (slug: string | undefined) =>
  MODELS.find((m) => m.id === slug);

