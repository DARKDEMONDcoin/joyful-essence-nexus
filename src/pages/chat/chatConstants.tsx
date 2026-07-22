// Static prompts, constants, types, and small presentational atoms used by
// ChatPage. Extracted out of ChatPage.tsx to shrink the monolithic file and
// improve HMR / code-splitting.
import Claude from "@lobehub/icons/es/Claude";
import Gemini from "@lobehub/icons/es/Gemini";
import OpenAI from "@lobehub/icons/es/OpenAI";
import Zhipu from "@lobehub/icons/es/Zhipu";
import Kimi from "@lobehub/icons/es/Kimi";
import { useBrandLogo } from "@/hooks/useBrandLogo";
import {
  isLegacyMegsyChatSelection,
  MEGSY_CHAT_MODEL_LABEL,
  normalizeMegsyModelLabel,
} from "@/lib/megsyModelDisplay";
import type { SlideDeck } from "@/components/chat/SlidesDeckCard";
import type { MediaPlan } from "@/components/chat/media/MediaPlanCard";
import type { MediaSceneResult } from "@/components/chat/media/MediaResultCard";
import type { ModelEffort } from "@/lib/chatModelPreferences";

export interface ProductResult {
  title: string;
  price: string;
  image?: string;
  link?: string;
  seller?: string;
  rating?: string | null;
  delivery?: string | null;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  clientId?: string;
  images?: string[];
  videos?: string[];
  audios?: string[];
  products?: ProductResult[];
  attachedImages?: string[];
  /** Public URLs for user-uploaded videos (Qwen VL video_url parts). */
  attachedVideos?: string[];
  attachedFiles?: { name: string; type: string }[];
  liked?: boolean | null;
  id?: string;
  user_id?: string | null;
  senderName?: string | null;
  senderAvatar?: string | null;
  /** Internal UI events that are sent to the tutor for context but never shown as user bubbles. */
  hiddenFromTranscript?: boolean;
  mode?:
    | "normal"
    | "learning"
    | "shopping"
    | "deep-research"
    | "slides"
    | "slides-images"
    | "operator"
    | "images"
    | "video"
    | "music"
    | "code";
  slidesDeck?: SlideDeck;
  standardSlides?: {
    title: string;
    templateName: string;
    url: string;
    colors: [string, string];
    slides?: string[];
    slideCount?: number;
  };
  imageSlides?: { title: string; url: string; slideCount?: number };
  slidesPendingTopic?: string;
  slidesJobId?: string;
  docsArtifact?: { artifactId: string; title: string; docType: string; html?: string };
  docsClarify?: {
    reason: string;
    questions: import("@/lib/agent/docs/types").DocsClarifyQuestion[];
    originalPrompt: string;
    ui?: import("@/lib/agent/docs/types").DocsClarifyUi;
  };
  docsJobId?: string;
  chatJobId?: string;
  operatorRunId?: string;
  researchJobId?: string;
  // Media generation (image/video) — plan card + per-scene results live on a
  // single assistant message so the whole flow stays in the transcript.
  mediaPlan?: MediaPlan;
  mediaStatus?: "awaiting" | "running" | "done" | "cancelled";
  mediaCurrentScene?: number;
  mediaResults?: MediaSceneResult[];
  /** Final merged video URL after stitching all video scenes together. */
  mediaFinalVideoUrl?: string;
  mediaMergeStatus?: "idle" | "merging" | "done" | "error" | "unavailable";
  mediaMergeError?: string;
  /** Reference to a row in `generated_sites` — rendered as a live build card. */
  siteBuild?: { siteId: string };
  /** Premium upgrade card shown when a free user requests a paid feature. */
  paywall?: { feature: "images" | "video" | "code" | "music" };
}

export const EMPTY_READERS: { user_id: string; name?: string; avatar?: string }[] = [];
export const EMPTY_REACTIONS: { id: string; emoji: string; user_id: string }[] = [];

export type ChatMode =
  | "normal"
  | "learning"
  | "shopping"
  | "deep-research"
  | "slides"
  | "slides-images"
  | "operator"
  | "images"
  | "video"
  | "music"
  | "code";

export const LANG_RULE =
  "CRITICAL: Reply in the exact same language and dialect as the user's latest message. Egyptian Arabic -> Egyptian Arabic, English -> English, French -> French. Never force English unless the user wrote in English.";

export const ASK_TOOL_RULE = `

🧰 ASK TOOL (use sparingly, only when clarification is genuinely needed):
When — and ONLY when — you need 1–3 pieces of information from the user before you can give a great answer, emit a single fenced JSON block of the form:

\`\`\`json
{"type":"questions","questions":[{"title":"<short question in English>","options":["<chip 1>","<chip 2>","<chip 3>"],"allowText":true}]}
\`\`\`

Rules:
- Use 2–4 options per question, each ≤ 4 words, written in the user's latest language/dialect.
- Set "allowText": true when the user might want to type a custom answer.
- Do NOT include the JSON block when the request is already clear — just answer directly.
- Do NOT mention the JSON block or the word "options" in your prose. The UI renders it as tappable pills inside the input.
- Never emit more than one questions block per message.`;

export const MODE_PROMPTS: Record<ChatMode, string> = {
  normal: LANG_RULE + ASK_TOOL_RULE,
  learning:
    LANG_RULE +
    ASK_TOOL_RULE +
    " You are in Learning Mode. Explain everything step by step with examples, analogies, and clear breakdowns. Make complex topics easy to understand. Use bullet points, numbered steps, and structured format.",
  shopping:
    LANG_RULE +
    ASK_TOOL_RULE +
    " You are in Shopping Mode. Help the user find the best products, compare prices, suggest alternatives, and provide purchase recommendations. Include pros/cons when comparing items.",
  "deep-research": LANG_RULE,
  slides: LANG_RULE,
  "slides-images": LANG_RULE,
  images: LANG_RULE,
  video: LANG_RULE,
  music: LANG_RULE,
  code:
    LANG_RULE +
    " You are in Coder Mode. Write clean, production-ready code. Prefer TypeScript/React with Tailwind for UI. Return runnable examples in fenced code blocks with the correct language tag (```tsx, ```html, ```js, ```python, etc.). Keep prose short — the user wants the code.",
  operator: `You are "Megsy Operator" — a multi-layer AI agent inside the Megsy platform, similar to Manus and Kimi, capable of fully controlling a virtual computer and executing any digital task end-to-end without human intervention.

🧠 Internal Architecture (Multi-Layer Agent System):
1. Orchestrator Layer: Understands the user's request, converts it into a Task Plan, distributes tasks across agents, manages sequencing, and retries on failure.
2. Computer Execution Layer: Cloud environment (E2B Sandbox / Docker runtime) for running code, managing files, and running servers.
3. Browser Automation Layer: Playwright for opening sites, browsing, logging in, filling forms, scraping, and executing workflows.
4. Agent Framework Layer: LangGraph / CrewAI / AutoGen to split work across agents and run them in parallel.
5. Memory System: PostgreSQL + Redis + Vector DB (ChromaDB) for storage and retrieval.
6. Deployment Layer: GitHub API + Vercel/Netlify for automatic deployment.

👥 Internal Agents:
- CEO Agent: Sets vision and strategy, makes final decisions, prioritizes tasks.
- COO Agent: Manages daily operations, coordinates between teams, follows up on execution and quality.
- CTO Agent: Handles technical decisions, picks technologies, reviews code and architecture.

🔄 Workflow:
1. Understand: Analyze the user's goal in depth.
2. Plan: Create a multi-step plan (clear numbered Task Plan).
3. Distribute tasks: Decide which Agent (CEO/COO/CTO/Browser/Code) handles each step.
4. Execute: Run step by step, automatically correcting errors.
5. Result: Deliver a final, ready output (link, report, or a complete project).

Operate as a real digital employee 24/7. Always start with: analyze the goal → numbered plan → distribute to agents → execute → result.`,
};

export const PegtopIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="28"
    height="28"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M50 5 L60 40 L95 50 L60 60 L50 95 L40 60 L5 50 L40 40 Z" fill="currentColor" />
  </svg>
);

export const MEGSY_MODEL = "google/gemini-2.5-flash-lite-preview-09-2025";

export const getMegsyTierLabel = (tier: "lite" | "pro" | "max") => {
  const brand = MEGSY_CHAT_MODEL_LABEL;
  return tier === "lite" ? brand : tier === "pro" ? `${brand} Pro` : `${brand} Max`;
};

export const getChatModelDisplayLabel = (
  selectedModel: { id?: string; label?: string } | null | undefined,
  tier: "lite" | "pro" | "max",
) => {
  if (!selectedModel) return getMegsyTierLabel(tier);
  if (isLegacyMegsyChatSelection(selectedModel)) {
    return normalizeMegsyModelLabel(selectedModel.label);
  }
  return (
    CHAT_COMPOSER_MODEL_OPTIONS.find((item) => item.kind === "model" && item.id === selectedModel.id)
      ?.label || normalizeMegsyModelLabel(selectedModel.label) || getMegsyTierLabel(tier)
  );
};


export const CHAT_COMPOSER_MODEL_OPTIONS = [
  {
    kind: "tier" as const,
    id: "lite",
    label: `${MEGSY_CHAT_MODEL_LABEL} 3.9`,
    desc: "The default. Fast, warm, and gets everyday tasks done.",
    premium: false,
    brand: "megsy" as const,
    strength: "Balanced" as const,
  },
  {
    kind: "model" as const,
    id: "z-ai/glm-4.6:glm-5.3",
    label: "GLM 5.3",
    desc: "Zhipu's flagship reasoning model for hard analytical work.",
    premium: true,
    brand: "glm" as const,
    strength: "Powerful" as const,
  },
  {
    kind: "model" as const,
    id: "google/gemini-2.5-flash:gemini-3-pro",
    label: "Gemini 3 Pro",
    desc: "Multimodal thinking across text, images, and long context.",
    premium: true,
    brand: "gemini" as const,
    strength: "Powerful" as const,
  },
  {
    kind: "model" as const,
    id: "anthropic/claude-sonnet-4.5:claude-sonnet-5",
    label: "Claude Sonnet 5",
    desc: "Fast, sharp writing and reasoning from Anthropic.",
    premium: true,
    brand: "claude" as const,
    strength: "Powerful" as const,
  },
  {
    kind: "model" as const,
    id: "anthropic/claude-sonnet-4.5:claude-opus-4.8",
    label: "Claude Opus 4.8",
    desc: "Anthropic's most capable model for deep research and code.",
    premium: true,
    brand: "claude" as const,
    strength: "Max" as const,
  },
  {
    kind: "model" as const,
    id: "moonshot/kimi-k3:kimi-k3",
    label: "Kimi K3",
    desc: "Moonshot's long-context expert. Best for large documents.",
    premium: true,
    brand: "kimi" as const,
    strength: "Powerful" as const,
  },
  {
    kind: "model" as const,
    id: "openai/gpt-sol:gpt-sol",
    label: "GPT Sol",
    desc: "OpenAI's 2026 flagship. Elite reasoning and world knowledge.",
    premium: true,
    brand: "openai" as const,
    strength: "Max" as const,
  },
];

export type ChatModelBrand = "megsy" | "claude" | "gemini" | "openai" | "glm" | "kimi";

// Per-model effort presets. Each model exposes its own list — shorter, curated names.
export interface EffortPreset {
  id: ModelEffort;
  label: string;
  description: string;
}

const EFFORTS_BALANCED: EffortPreset[] = [
  { id: "low", label: "Fast", description: "Quick everyday replies" },
  { id: "medium", label: "Balanced", description: "The default" },
  { id: "high", label: "Smart", description: "More careful reasoning" },
];

const EFFORTS_POWERFUL: EffortPreset[] = [
  { id: "medium", label: "Fast", description: "Quick answers" },
  { id: "high", label: "Balanced", description: "The default" },
  { id: "extra", label: "Deep", description: "Careful, detailed work" },
];

const EFFORTS_MAX: EffortPreset[] = [
  { id: "high", label: "Fast", description: "Quicker replies" },
  { id: "extra", label: "Deep", description: "Detailed reasoning" },
  { id: "max", label: "Max", description: "Hardest problems" },
];

export const MODEL_EFFORT_PRESETS: Record<string, EffortPreset[]> = {
  lite: EFFORTS_BALANCED,
  "z-ai/glm-4.6:glm-5.3": EFFORTS_POWERFUL,
  "google/gemini-2.5-flash:gemini-3-pro": EFFORTS_POWERFUL,
  "anthropic/claude-sonnet-4.5:claude-sonnet-5": EFFORTS_POWERFUL,
  "anthropic/claude-sonnet-4.5:claude-opus-4.8": EFFORTS_MAX,
  "moonshot/kimi-k3:kimi-k3": EFFORTS_POWERFUL,
  "openai/gpt-sol:gpt-sol": EFFORTS_MAX,
};

export function getEffortPresetsForModel(modelId: string | null | undefined): EffortPreset[] {
  if (!modelId) return EFFORTS_BALANCED;
  return MODEL_EFFORT_PRESETS[modelId] ?? EFFORTS_BALANCED;
}


export const ComposerModelIcon = ({
  brand,
}: {
  brand: ChatModelBrand;
}) => {
  const megsyLogo = useBrandLogo();
  if (brand === "claude") return <Claude.Color size={18} />;
  if (brand === "gemini") return <Gemini.Color size={18} />;
  if (brand === "openai") return <OpenAI size={18} />;
  if (brand === "glm") return <Zhipu.Color size={18} />;
  if (brand === "kimi") return <Kimi.Color size={18} />;
  return (
    <img
      src={megsyLogo}
      alt="Megsy"
      className="w-[18px] h-[18px] object-contain"
      loading="lazy"
    />
  );
};
