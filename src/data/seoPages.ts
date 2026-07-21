/**
 * 100 SEO landing entries for /:slug — models, services, use-cases, comparisons.
 * Each entry drives the SynapseX-style template in src/pages/seo/SeoLandingPage.tsx.
 */

export type SeoPageKind = "chat-model" | "image-model" | "video-model" | "service" | "use-case" | "comparison";

export interface SeoPageContent {
  slug: string;
  kind: SeoPageKind;
  name: string;
  watermark: string;
  heroLeft: [string, string];
  heroRight: [string, string];
  heroDescription: string;
  cinematic: string;
  metricsTitle: string;
  metrics: { value: string; label: string }[];
  adaptiveTitle: [string, string];
  adaptiveDesc: string;
  features: { title: string; desc: string }[];
  archSubtitle: string;
  archHeading: string;
  archDescription: string;
  layers: [string, string, string];
  footerTagline: string;
  meta: { title: string; description: string };
  videos?: {
    hero?: string;
    cinematic?: string;
    metrics?: string;
    tech?: string;
    footer?: string;
  };
}

// ─── Shared building blocks ─────────────────────────────────────────

const defaultLayers: [string, string, string] = ["Input", "Reason", "Deliver"];

function chatEntry(slug: string, name: string, vendor: string, opts?: { watermark?: string }): SeoPageContent {
  return {
    slug,
    kind: "chat-model",
    name,
    watermark: opts?.watermark ?? name.split(" ")[0].toUpperCase(),
    heroLeft: ["Think", "Faster"],
    heroRight: [name.split(" ")[0], name.split(" ").slice(1).join(" ") || "AI"],
    heroDescription: `${name} on Megsy AI — chat, reason, code, analyze files and browse the web from one workspace, priced in one credit.`,
    cinematic: `${name} by ${vendor} runs natively inside Megsy AI. Long context, tool use, multimodal input, and full streaming — with no extra subscription, no separate keys, and instant switching to any other frontier model.`,
    metricsTitle: "Model Performance",
    metrics: [
      { value: "1M+", label: "Context Tokens" },
      { value: "<400ms", label: "First Token" },
      { value: "100+", label: "Languages" },
    ],
    adaptiveTitle: ["Frontier", "Reasoning"],
    adaptiveDesc: `${name} is tuned for coding, analysis, long-document synthesis and multilingual conversation — all inside your Megsy workspace.`,
    features: [
      { title: "Deep Reasoning", desc: `${name} handles multi-step logic, code and math.` },
      { title: "Tool Use", desc: "Native web search, file Q&A, code, images and video." },
      { title: "Long Context", desc: "Whole documents, transcripts and repos in one prompt." },
      { title: "One Workspace", desc: "Switch models mid-thread without losing history." },
    ],
    archSubtitle: "Architecture",
    archHeading: `${name}, wired for real work.`,
    archDescription: `Prompt, ${name} reasons, Megsy delivers structured output — chat, files, images, slides or code — from a single credit balance.`,
    layers: ["Prompt", `${name} Reasoning`, "Output"],
    footerTagline: `Chat with ${name} and every other frontier model — on one subscription, priced in one credit.`,
    meta: {
      title: `${name} — Chat, Code & Reason on Megsy AI`,
      description: `Use ${name} by ${vendor} inside Megsy AI. Long context, tools, files and images — one workspace, one credit, no extra keys.`,
    },
  };
}

function imageEntry(slug: string, name: string, vendor: string): SeoPageContent {
  return {
    slug,
    kind: "image-model",
    name,
    watermark: "IMAGINE",
    heroLeft: ["Prompt", "To Image"],
    heroRight: [name.split(" ")[0], name.split(" ").slice(1).join(" ") || "Image"],
    heroDescription: `${name} on Megsy AI — generate, edit and remix images from text or reference photos, priced per generation in one credit.`,
    cinematic: `${name} from ${vendor} runs inside Megsy AI. Text-to-image, image-to-image, controlled aspect ratios, and high-resolution output — with every other image model one click away.`,
    metricsTitle: "Image Output",
    metrics: [
      { value: "4K", label: "Max Resolution" },
      { value: "12s", label: "Avg Generation" },
      { value: "20+", label: "Aspect Ratios" },
    ],
    adaptiveTitle: ["Precise", "Composition"],
    adaptiveDesc: `${name} nails prompt adherence, typography and complex composition — inside a single Megsy AI creative workspace.`,
    features: [
      { title: "Text-to-Image", desc: `Photoreal and stylized outputs from ${name}.` },
      { title: "Image-to-Image", desc: "Remix references, edit regions and change styles." },
      { title: "High Fidelity", desc: "Sharp typography, hands, faces and textures." },
      { title: "One Workspace", desc: `Compare ${name} against every other image model.` },
    ],
    archSubtitle: "Pipeline",
    archHeading: `${name}, from prompt to pixel.`,
    archDescription: `Describe the image, upload references, pick aspect and resolution — Megsy AI streams ${name} results into your gallery ready to download or edit.`,
    layers: ["Prompt", `${name}`, "Gallery"],
    footerTagline: `Generate with ${name} and every other top image model — on one Megsy AI subscription.`,
    meta: {
      title: `${name} — AI Image Generator on Megsy AI`,
      description: `Generate and edit images with ${name} by ${vendor} inside Megsy AI. One workspace, one credit, every top image model included.`,
    },
  };
}

function videoEntry(slug: string, name: string, vendor: string): SeoPageContent {
  return {
    slug,
    kind: "video-model",
    name,
    watermark: "MOTION",
    heroLeft: ["Text", "To Video"],
    heroRight: [name.split(" ")[0], name.split(" ").slice(1).join(" ") || "Video"],
    heroDescription: `${name} on Megsy AI — cinematic text-to-video and image-to-video with sound, motion control and 4K output, priced per second.`,
    cinematic: `${name} from ${vendor} inside Megsy AI. Generate scenes, animate stills, extend shots and stitch cuts — all from a single workspace with the same credit balance as your chat and images.`,
    metricsTitle: "Video Output",
    metrics: [
      { value: "4K", label: "Resolution" },
      { value: "10s", label: "Per Shot" },
      { value: "24fps", label: "Cinematic" },
    ],
    adaptiveTitle: ["Cinematic", "Motion"],
    adaptiveDesc: `${name} understands camera language — dolly, tilt, aperture, focus — and delivers coherent, film-grade motion inside Megsy AI.`,
    features: [
      { title: "Text-to-Video", desc: `Full scenes from a single prompt with ${name}.` },
      { title: "Image-to-Video", desc: "Animate stills with camera and subject motion." },
      { title: "Audio & Sync", desc: "Native soundtrack and effect layers on supported models." },
      { title: "Long Shots", desc: "Extend and stitch clips into longer sequences." },
    ],
    archSubtitle: "Pipeline",
    archHeading: `${name}, from prompt to shot.`,
    archDescription: `Write the scene, drop a keyframe, pick duration and aspect — Megsy AI streams ${name} shots straight into your gallery.`,
    layers: ["Prompt", `${name}`, "Cut"],
    footerTagline: `Generate with ${name} and every top AI video model — inside one Megsy AI workspace.`,
    meta: {
      title: `${name} — AI Video Generator on Megsy AI`,
      description: `Generate cinematic video with ${name} by ${vendor} inside Megsy AI. Text-to-video, image-to-video, audio — one credit balance.`,
    },
  };
}

function serviceEntry(slug: string, title: string, benefit: string, watermark: string): SeoPageContent {
  return {
    slug,
    kind: "service",
    name: title,
    watermark,
    heroLeft: ["One", "Workspace"],
    heroRight: title.split(" ").length >= 2
      ? [title.split(" ")[0], title.split(" ").slice(1).join(" ")]
      : [title, "AI"],
    heroDescription: `${benefit} — powered by every frontier AI model, all inside a single Megsy AI subscription.`,
    cinematic: `${title} on Megsy AI unifies every top model into a single tool. ${benefit} No juggling subscriptions, no separate keys, no context loss — just one workspace priced in one credit.`,
    metricsTitle: "What You Get",
    metrics: [
      { value: "50+", label: "AI Models" },
      { value: "1", label: "Subscription" },
      { value: "0", label: "Extra Keys" },
    ],
    adaptiveTitle: ["Built", "For Speed"],
    adaptiveDesc: `${title} is tuned to keep you in flow — instant switching between models, files, images and video without ever leaving the workspace.`,
    features: [
      { title: "Every Top Model", desc: "GPT, Claude, Gemini, Kimi, GLM, Grok and more." },
      { title: "One Credit", desc: "Chat, images, video and code share one balance." },
      { title: "Files & Web", desc: "Native file Q&A and web search on every model." },
      { title: "Team Ready", desc: "Roles, sharing, history and skills built in." },
    ],
    archSubtitle: "Architecture",
    archHeading: `${title}, without the tab chaos.`,
    archDescription: `Every model, every modality, every file — behind one login and one credit balance. Megsy AI keeps context so you never restart the conversation.`,
    layers: defaultLayers,
    footerTagline: `${title} inside Megsy AI — one workspace for every top model, priced in one credit.`,
    meta: {
      title: `${title} — Megsy AI`,
      description: `${benefit} inside Megsy AI — every top model, one subscription, one credit balance.`,
    },
  };
}

function useCaseEntry(slug: string, audience: string, benefit: string): SeoPageContent {
  return {
    slug,
    kind: "use-case",
    name: `Megsy AI for ${audience}`,
    watermark: audience.toUpperCase(),
    heroLeft: ["Built", `For ${audience.split(" ")[0]}`],
    heroRight: ["One", "Workspace"],
    heroDescription: `${benefit} — inside a single Megsy AI subscription with every top model included.`,
    cinematic: `Megsy AI gives ${audience.toLowerCase()} one workspace for chat, images, video, docs, slides and code. ${benefit} One subscription, one credit balance, every frontier model.`,
    metricsTitle: `Made for ${audience}`,
    metrics: [
      { value: "50+", label: "AI Models" },
      { value: "10x", label: "Faster Delivery" },
      { value: "1", label: "Subscription" },
    ],
    adaptiveTitle: ["Your", "Flow"],
    adaptiveDesc: `Megsy AI adapts to how ${audience.toLowerCase()} actually work — brief in, output out, no context switching between tools.`,
    features: [
      { title: "Chat & Research", desc: "Any frontier model with web + file access." },
      { title: "Images & Video", desc: "Generate assets without leaving the workspace." },
      { title: "Docs & Slides", desc: "Draft, edit and export in seconds." },
      { title: "Automations", desc: "Skills, agents and shared team spaces." },
    ],
    archSubtitle: "Workflow",
    archHeading: `${audience}, upgraded.`,
    archDescription: `Megsy AI replaces a stack of AI subscriptions with one workspace tuned for ${audience.toLowerCase()} — every model, every modality, one credit balance.`,
    layers: defaultLayers,
    footerTagline: `Megsy AI for ${audience} — one subscription for every top model.`,
    meta: {
      title: `Megsy AI for ${audience} — One AI Workspace`,
      description: `${benefit} Megsy AI gives ${audience.toLowerCase()} every top model in one workspace, one credit balance.`,
    },
  };
}

function compareEntry(slug: string, rival: string, angle: string): SeoPageContent {
  return {
    slug,
    kind: "comparison",
    name: `Megsy AI vs ${rival}`,
    watermark: "COMPARE",
    heroLeft: ["Megsy AI", `vs ${rival.split(" ")[0]}`],
    heroRight: ["One", "Workspace"],
    heroDescription: `${rival} does one thing. Megsy AI unifies chat, images, video, slides and code — with every top model — inside one subscription.`,
    cinematic: `${angle} Megsy AI runs every frontier model on one subscription, priced in one credit — so you stop juggling ${rival} and every other tool in a dozen tabs.`,
    metricsTitle: `Megsy AI vs ${rival}`,
    metrics: [
      { value: "50+", label: "Models on Megsy" },
      { value: "1", label: "Credit Balance" },
      { value: "0", label: "Extra Subscriptions" },
    ],
    adaptiveTitle: ["One Tool,", "Every Model"],
    adaptiveDesc: `Instead of paying ${rival} plus every other frontier tool, Megsy AI puts them all inside one workspace with a shared credit balance.`,
    features: [
      { title: "All Models", desc: "GPT, Claude, Gemini, Kimi, GLM, Grok — on tap." },
      { title: "All Modalities", desc: "Chat, images, video, slides, docs, code." },
      { title: "One Credit", desc: "No juggling separate subscriptions and keys." },
      { title: "Portable Context", desc: "Switch models mid-thread with full history." },
    ],
    archSubtitle: "Comparison",
    archHeading: `Megsy AI vs ${rival}, in plain terms.`,
    archDescription: `${rival} solves one slice. Megsy AI covers the full workflow — chat, files, images, video, slides, docs and code — on one subscription.`,
    layers: ["Rival Stack", "Megsy AI Workspace", "Your Output"],
    footerTagline: `Stop stacking ${rival} with other tools. Megsy AI runs every top model on one subscription.`,
    meta: {
      title: `Megsy AI vs ${rival} — Every AI Model, One Workspace`,
      description: `Compare Megsy AI vs ${rival}. Megsy AI gives you every top model — chat, images, video, slides, code — on one subscription, one credit.`,
    },
  };
}

// ─── Catalog ──────────────────────────────────────────────────────

const CHAT_MODELS: Array<[string, string, string]> = [
  ["gpt-5-5", "GPT-5.5", "OpenAI"],
  ["gpt-5-4", "GPT-5.4", "OpenAI"],
  ["gpt-5-mini", "GPT-5 Mini", "OpenAI"],
  ["gpt-5-nano", "GPT-5 Nano", "OpenAI"],
  ["gpt-5-6-sol", "GPT-5.6 Sol", "OpenAI"],
  ["gpt-5-6-terra", "GPT-5.6 Terra", "OpenAI"],
  ["gpt-5-6-luna", "GPT-5.6 Luna", "OpenAI"],
  ["claude-sonnet-5", "Claude Sonnet 5", "Anthropic"],
  ["claude-opus-4-8", "Claude Opus 4.8", "Anthropic"],
  ["claude-haiku-4-6", "Claude Haiku 4.6", "Anthropic"],
  ["gemini-3-pro", "Gemini 3 Pro", "Google"],
  ["gemini-3-flash", "Gemini 3 Flash", "Google"],
  ["gemini-3-1-flash-lite", "Gemini 3.1 Flash Lite", "Google"],
  ["gemini-3-5-flash", "Gemini 3.5 Flash", "Google"],
  ["gemini-2-5-pro", "Gemini 2.5 Pro", "Google"],
  ["kimi-3", "Kimi 3", "Moonshot"],
  ["glm-5-3", "GLM 5.3", "Zhipu"],
  ["grok-4", "Grok 4", "xAI"],
  ["deepseek-v4", "DeepSeek V4", "DeepSeek"],
  ["qwen3-max", "Qwen 3 Max", "Alibaba"],
  ["llama-4-titan", "Llama 4 Titan", "Meta"],
  ["mistral-large-3", "Mistral Large 3", "Mistral"],
  ["command-r-plus-2", "Command R+ 2", "Cohere"],
  ["yi-large-2", "Yi Large 2", "01.AI"],
  ["ministral-large", "Ministral Large", "Mistral"],
  ["megsy-pro-chat", "Megsy Pro", "Megsy"],
  ["megsy-max-chat", "Megsy Max", "Megsy"],
  ["megsy-research", "Megsy Research", "Megsy"],
];

const IMAGE_MODELS: Array<[string, string, string]> = [
  ["nano-banana", "Nano Banana", "Google"],
  ["flux-pro-1-1", "Flux Pro 1.1", "Black Forest Labs"],
  ["flux-dev", "Flux Dev", "Black Forest Labs"],
  ["ideogram-3", "Ideogram 3", "Ideogram"],
  ["seedream-4", "Seedream 4", "ByteDance"],
  ["dall-e-4", "DALL·E 4", "OpenAI"],
  ["imagen-4-ultra", "Imagen 4 Ultra", "Google"],
  ["recraft-v4", "Recraft V4", "Recraft"],
  ["sd-4-ultra", "Stable Diffusion 4 Ultra", "Stability AI"],
  ["hidream-3", "HiDream 3", "HiDream"],
  ["playground-v3", "Playground V3", "Playground"],
  ["luma-photon", "Luma Photon", "Luma"],
  ["midjourney-7", "Midjourney 7", "Midjourney"],
  ["firefly-3", "Firefly 3", "Adobe"],
  ["gpt-image-2", "GPT Image 2", "OpenAI"],
  ["kandinsky-4", "Kandinsky 4", "Sberbank"],
  ["aurora-flow", "Aurora Flow", "xAI"],
  ["pixart-omega", "PixArt Omega", "PixArt"],
  ["cascade-xl", "Cascade XL", "Stability AI"],
  ["chroma-1", "Chroma 1", "Chroma"],
];

const VIDEO_MODELS: Array<[string, string, string]> = [
  ["veo-3", "Veo 3", "Google"],
  ["kling-2-5", "Kling 2.5", "Kuaishou"],
  ["seedance-2", "Seedance 2", "ByteDance"],
  ["hailuo-2", "Hailuo 2", "MiniMax"],
  ["luma-ray-3", "Luma Ray 3", "Luma"],
  ["runway-gen-5", "Runway Gen-5", "Runway"],
  ["pika-2-5", "Pika 2.5", "Pika"],
  ["wan-2-5", "Wan 2.5", "Alibaba"],
  ["ltx-video-3", "LTX Video 3", "Lightricks"],
  ["sora-turbo", "Sora Turbo", "OpenAI"],
  ["sora-pro", "Sora Pro", "OpenAI"],
  ["stable-video-4", "Stable Video 4", "Stability AI"],
  ["hotshot-4", "Hotshot 4", "Hotshot"],
  ["kaiber-4", "Kaiber 4", "Kaiber"],
  ["cogvideox-5", "CogVideoX 5", "Tsinghua"],
  ["videocrafter-3", "VideoCrafter 3", "Tencent"],
  ["morph-studio-4", "Morph Studio 4", "Morph"],
  ["meta-movie-gen", "Meta Movie Gen", "Meta"],
];

const SERVICES: Array<[string, string, string, string]> = [
  ["ai-chat", "AI Chat", "Talk to every frontier chat model in one place.", "CHAT"],
  ["ai-image-generator", "AI Image Generator", "Generate and edit images with every top model.", "IMAGE"],
  ["ai-video-generator", "AI Video Generator", "Cinematic text-to-video and image-to-video.", "VIDEO"],
  ["ai-slides", "AI Slides", "Turn a prompt into a full slide deck.", "SLIDES"],
  ["ai-docs", "AI Docs", "Draft, edit and export documents from one prompt.", "DOCS"],
  ["ai-code", "AI Code", "Ship features and fix bugs with agentic coding.", "CODE"],
  ["ai-web-search", "AI Web Search", "Live, cited web answers on every model.", "SEARCH"],
  ["ai-file-analysis", "AI File Analysis", "PDFs, sheets, audio and video Q&A.", "FILES"],
  ["ai-translation", "AI Translation", "Native-quality translation across 100+ languages.", "TRANSLATE"],
  ["ai-voice", "AI Voice", "Text-to-speech and voice cloning studio.", "VOICE"],
  ["ai-music", "AI Music", "Compose full tracks from a text prompt.", "MUSIC"],
  ["ai-avatar", "AI Avatar", "Talking avatars from a photo and a script.", "AVATAR"],
  ["ai-agents", "AI Agents", "Autonomous workers with tools and memory.", "AGENTS"],
  ["ai-workflows", "AI Workflows", "Chain prompts, models and tools into pipelines.", "FLOWS"],
  ["ai-api", "AI API", "One API for every model on Megsy AI.", "API"],
];

const USE_CASES: Array<[string, string, string]> = [
  ["for-marketers", "Marketers", "Draft campaigns, generate visuals and shoot short-form video from a single brief."],
  ["for-designers", "Designers", "Explore concepts, produce final renders and iterate storyboards without leaving the workspace."],
  ["for-developers", "Developers", "Ship features, refactor code and generate tests with the strongest coding models."],
  ["for-students", "Students", "Study, summarize, translate and cite — with every top research model on tap."],
  ["for-teachers", "Teachers", "Build lesson plans, worksheets, slides and quizzes in minutes."],
  ["for-writers", "Writers", "Outline, draft and polish long-form work with the models that match your voice."],
  ["for-researchers", "Researchers", "Synthesize papers, run deep research and produce cited reports."],
  ["for-startups", "Startups", "Replace a stack of AI subscriptions with one workspace for the whole team."],
  ["for-agencies", "Agencies", "Deliver client work faster — copy, visuals, decks and video in one place."],
  ["for-enterprises", "Enterprises", "Roles, audit trails and unified billing across every AI model."],
];

const COMPARISONS: Array<[string, string, string]> = [
  ["vs-chatgpt", "ChatGPT", "ChatGPT ships one model family."],
  ["vs-claude", "Claude", "Claude is a single model surface."],
  ["vs-gemini", "Gemini", "Gemini is Google-only."],
  ["vs-perplexity", "Perplexity", "Perplexity focuses on search alone."],
  ["vs-midjourney", "Midjourney", "Midjourney only makes images."],
  ["vs-runway", "Runway", "Runway focuses on video."],
  ["vs-copilot", "Copilot", "Copilot lives inside one editor."],
  ["vs-notion-ai", "Notion AI", "Notion AI is tied to Notion docs."],
  ["vs-jasper", "Jasper", "Jasper focuses on marketing copy."],
  ["vs-poe", "Poe", "Poe is a router without a workspace."],
  ["vs-you-com", "You.com", "You.com is a search-first assistant."],
  ["vs-openrouter", "OpenRouter", "OpenRouter is an API router, not a workspace."],
  ["vs-anthropic-console", "Anthropic Console", "Anthropic Console only serves Claude."],
  ["vs-openai-playground", "OpenAI Playground", "OpenAI Playground only serves OpenAI models."],
  ["vs-gemini-advanced", "Gemini Advanced", "Gemini Advanced is Google-only."],
  ["vs-grok", "Grok", "Grok lives inside X."],
  ["vs-deepseek", "DeepSeek", "DeepSeek is one model family."],
  ["vs-mistral-chat", "Mistral Chat", "Mistral Chat serves Mistral models only."],
  ["vs-character-ai", "Character.AI", "Character.AI focuses on roleplay chat."],
  ["vs-huggingface-chat", "HuggingChat", "HuggingChat is open-source models only."],
  ["vs-canva-ai", "Canva AI", "Canva AI lives inside Canva."],
  ["vs-gamma", "Gamma", "Gamma focuses on slide decks."],
  ["vs-descript", "Descript", "Descript focuses on video and audio editing."],
  ["vs-elevenlabs", "ElevenLabs", "ElevenLabs focuses on voice generation."],
  ["vs-suno", "Suno", "Suno focuses on music generation."],
];

// Extra models
const EXTRA_CHAT_MODELS: Array<[string, string, string]> = [
  ["o4-reasoning", "o4 Reasoning", "OpenAI"],
  ["o4-mini", "o4 Mini", "OpenAI"],
  ["claude-sonnet-4-5", "Claude Sonnet 4.5", "Anthropic"],
  ["claude-opus-4", "Claude Opus 4", "Anthropic"],
  ["gemini-3-ultra", "Gemini 3 Ultra", "Google"],
  ["grok-3", "Grok 3", "xAI"],
  ["deepseek-r2", "DeepSeek R2", "DeepSeek"],
  ["qwen3-coder", "Qwen 3 Coder", "Alibaba"],
  ["llama-4-scout", "Llama 4 Scout", "Meta"],
  ["llama-4-maverick", "Llama 4 Maverick", "Meta"],
  ["phi-5", "Phi-5", "Microsoft"],
  ["nova-pro", "Nova Pro", "Amazon"],
  ["reka-core", "Reka Core", "Reka"],
  ["jamba-2", "Jamba 2", "AI21"],
  ["ernie-5", "Ernie 5", "Baidu"],
  ["hunyuan-large", "Hunyuan Large", "Tencent"],
  ["step-2", "Step-2", "StepFun"],
  ["inflection-pi-3", "Inflection Pi 3", "Inflection"],
  ["falcon-3", "Falcon 3", "TII"],
  ["olmo-2", "OLMo 2", "AI2"],
];

const EXTRA_IMAGE_MODELS: Array<[string, string, string]> = [
  ["flux-schnell", "Flux Schnell", "Black Forest Labs"],
  ["flux-krea", "Flux Krea", "Black Forest Labs"],
  ["imagen-4-fast", "Imagen 4 Fast", "Google"],
  ["sdxl-lightning", "SDXL Lightning", "Stability AI"],
  ["sd-3-5", "Stable Diffusion 3.5", "Stability AI"],
  ["midjourney-6-1", "Midjourney 6.1", "Midjourney"],
  ["ideogram-turbo", "Ideogram Turbo", "Ideogram"],
  ["recraft-red", "Recraft Red", "Recraft"],
  ["gpt-image-1", "GPT Image 1", "OpenAI"],
  ["seedream-3", "Seedream 3", "ByteDance"],
];

const EXTRA_VIDEO_MODELS: Array<[string, string, string]> = [
  ["veo-2", "Veo 2", "Google"],
  ["kling-2", "Kling 2", "Kuaishou"],
  ["hailuo-1", "Hailuo 1", "MiniMax"],
  ["runway-gen-4", "Runway Gen-4", "Runway"],
  ["pika-2", "Pika 2", "Pika"],
  ["luma-ray-2", "Luma Ray 2", "Luma"],
  ["mochi-1", "Mochi 1", "Genmo"],
  ["allegro", "Allegro", "Rhymes"],
];

// Industries (use-case style)
const INDUSTRIES: Array<[string, string, string]> = [
  ["for-ecommerce", "E-commerce", "Product descriptions, hero visuals and short-form video from one brief."],
  ["for-real-estate", "Real Estate", "Listings, virtual staging visuals and buyer follow-ups on autopilot."],
  ["for-healthcare", "Healthcare", "Draft patient education, summarize research and translate — with private workspaces."],
  ["for-legal", "Legal", "Summarize contracts, draft memos and search case law with cited answers."],
  ["for-finance", "Finance", "Model scenarios, summarize filings and turn data into decks in one workspace."],
  ["for-education", "Education", "Lesson plans, worksheets, quizzes and slide decks in minutes."],
  ["for-media", "Media", "Scripts, edits, thumbnails and short-form video from a single prompt."],
  ["for-gaming", "Gaming", "Concept art, dialogue writing and cinematic trailers in one place."],
  ["for-nonprofits", "Nonprofits", "Grant drafts, campaign copy and donor visuals on a lean budget."],
  ["for-consultants", "Consultants", "Research, slide decks and client deliverables from one workspace."],
  ["for-recruiters", "Recruiters", "Sourcing summaries, outreach drafts and interview kits in one flow."],
  ["for-sales-teams", "Sales Teams", "Personalized outreach, call summaries and follow-ups at scale."],
  ["for-customer-support", "Customer Support", "Faster replies, ticket summaries and knowledge base drafts."],
  ["for-hr", "HR Teams", "Job descriptions, policy drafts and onboarding kits in minutes."],
  ["for-product-managers", "Product Managers", "PRDs, user research summaries and roadmap drafts in one workspace."],
  ["for-founders", "Founders", "Investor updates, decks, landing copy and hiring drafts on one subscription."],
  ["for-content-creators", "Content Creators", "Scripts, thumbnails, edits and translations for every platform."],
  ["for-podcasters", "Podcasters", "Show notes, transcripts, translations and audiograms in one flow."],
  ["for-photographers", "Photographers", "Retouching prompts, moodboards and client-ready galleries faster."],
  ["for-architects", "Architects", "Concept visuals, moodboards and client presentations in one workspace."],
];

// Language landing pages (service-style)
const LANGUAGE_PAGES: Array<[string, string, string, string]> = [
  ["ai-in-arabic", "AI in Arabic", "Chat, translate and generate images in native Arabic.", "AR"],
  ["ai-in-spanish", "AI in Spanish", "Native-quality Spanish across every AI model.", "ES"],
  ["ai-in-french", "AI in French", "Draft, translate and reason in fluent French.", "FR"],
  ["ai-in-german", "AI in German", "German-quality output across every top model.", "DE"],
  ["ai-in-portuguese", "AI in Portuguese", "Portuguese-fluent chat, docs and translation.", "PT"],
  ["ai-in-italian", "AI in Italian", "Italian-quality writing across every AI model.", "IT"],
  ["ai-in-turkish", "AI in Turkish", "Turkish-fluent chat, docs and generation.", "TR"],
  ["ai-in-japanese", "AI in Japanese", "Native Japanese chat, translation and creative writing.", "JA"],
  ["ai-in-korean", "AI in Korean", "Korean-quality output across every top model.", "KO"],
  ["ai-in-chinese", "AI in Chinese", "Chat and generate in fluent Simplified Chinese.", "ZH"],
  ["ai-in-hindi", "AI in Hindi", "Hindi-fluent chat, docs and translation.", "HI"],
  ["ai-in-russian", "AI in Russian", "Russian-quality reasoning and writing across every model.", "RU"],
  ["ai-in-dutch", "AI in Dutch", "Fluent Dutch chat, translation and docs.", "NL"],
  ["ai-in-polish", "AI in Polish", "Polish-quality writing and translation.", "PL"],
  ["ai-in-hebrew", "AI in Hebrew", "Native Hebrew chat and translation.", "HE"],
  ["ai-in-farsi", "AI in Farsi", "Farsi-fluent chat, docs and translation.", "FA"],
  ["ai-in-urdu", "AI in Urdu", "Urdu-quality writing and translation.", "UR"],
  ["ai-in-indonesian", "AI in Indonesian", "Indonesian-fluent chat and translation.", "ID"],
  ["ai-in-vietnamese", "AI in Vietnamese", "Vietnamese-quality chat and translation.", "VI"],
  ["ai-in-thai", "AI in Thai", "Thai-fluent chat, translation and creative writing.", "TH"],
];

// Additional services
const EXTRA_SERVICES: Array<[string, string, string, string]> = [
  ["ai-image-editor", "AI Image Editor", "Inpaint, outpaint and edit images with a prompt.", "EDIT"],
  ["ai-background-remover", "AI Background Remover", "Remove backgrounds in one click.", "BG"],
  ["ai-upscaler", "AI Upscaler", "Upscale images and video to 4K without artifacts.", "UPSCALE"],
  ["ai-logo-maker", "AI Logo Maker", "Brand-ready logos from a text brief.", "LOGO"],
  ["ai-photo-restoration", "AI Photo Restoration", "Restore old photos to crisp modern quality.", "RESTORE"],
  ["ai-video-editor", "AI Video Editor", "Cut, caption and score video with prompts.", "EDIT"],
  ["ai-lip-sync", "AI Lip Sync", "Sync any voice track to any face on video.", "SYNC"],
  ["ai-transcription", "AI Transcription", "Fast, accurate transcripts in 100+ languages.", "TEXT"],
  ["ai-summarizer", "AI Summarizer", "Summarize documents, meetings and long videos.", "TL;DR"],
  ["ai-writer", "AI Writer", "Draft anything — blog posts to novels — with top models.", "WRITE"],
  ["ai-resume-builder", "AI Resume Builder", "Tailored resumes and cover letters in minutes.", "CV"],
  ["ai-email-writer", "AI Email Writer", "On-brand emails and follow-ups on demand.", "EMAIL"],
  ["ai-social-media", "AI Social Media", "Captions, hashtags, visuals and short videos.", "SOCIAL"],
  ["ai-seo-writer", "AI SEO Writer", "Ranking-ready articles with search-aware drafts.", "SEO"],
  ["ai-data-analyst", "AI Data Analyst", "Query spreadsheets and generate charts from prompts.", "DATA"],
];

// ─── Build final catalog (target: 100 pages) ───────────────────────

const BASE_SEO_PAGES: SeoPageContent[] = [
  ...CHAT_MODELS.map(([s, n, v]) => chatEntry(s, n, v)),
  ...EXTRA_CHAT_MODELS.map(([s, n, v]) => chatEntry(s, n, v)),
  ...IMAGE_MODELS.map(([s, n, v]) => imageEntry(s, n, v)),
  ...EXTRA_IMAGE_MODELS.map(([s, n, v]) => imageEntry(s, n, v)),
  ...VIDEO_MODELS.map(([s, n, v]) => videoEntry(s, n, v)),
  ...EXTRA_VIDEO_MODELS.map(([s, n, v]) => videoEntry(s, n, v)),
  ...SERVICES.map(([s, t, b, w]) => serviceEntry(s, t, b, w)),
  ...EXTRA_SERVICES.map(([s, t, b, w]) => serviceEntry(s, t, b, w)),
  ...LANGUAGE_PAGES.map(([s, t, b, w]) => serviceEntry(s, t, b, w)),
  ...USE_CASES.map(([s, a, b]) => useCaseEntry(s, a, b)),
  ...INDUSTRIES.map(([s, a, b]) => useCaseEntry(s, a, b)),
  ...COMPARISONS.map(([s, r, a]) => compareEntry(s, r, a)),
];


// ─── Bulk generator: adds ~1000 combinatorial SEO pages ────────────

const TOP_CHAT_MODELS: Array<[string, string, string]> = [
  ["gpt-5-5", "GPT-5.5", "OpenAI"],
  ["claude-4-5-sonnet", "Claude 4.5 Sonnet", "Anthropic"],
  ["claude-sonnet-5", "Claude Sonnet 5", "Anthropic"],
  ["gemini-3-pro", "Gemini 3 Pro", "Google"],
  ["grok-4", "Grok 4", "xAI"],
  ["kimi-3", "Kimi 3", "Moonshot"],
  ["glm-5-3", "GLM 5.3", "Zhipu"],
  ["deepseek-r2", "DeepSeek R2", "DeepSeek"],
  ["llama-4", "Llama 4", "Meta"],
  ["mistral-large-3", "Mistral Large 3", "Mistral"],
];

const TOP_IMAGE_MODELS: Array<[string, string, string]> = [
  ["flux-1-1-pro", "FLUX 1.1 Pro", "Black Forest Labs"],
  ["midjourney-7", "Midjourney 7", "Midjourney"],
  ["sd-3-5", "Stable Diffusion 3.5", "Stability AI"],
  ["dalle-4", "DALL·E 4", "OpenAI"],
  ["ideogram-3", "Ideogram 3", "Ideogram"],
  ["imagen-4", "Imagen 4", "Google"],
];

const TOP_VIDEO_MODELS: Array<[string, string, string]> = [
  ["sora-2", "Sora 2", "OpenAI"],
  ["veo-3", "Veo 3", "Google"],
  ["kling-2", "Kling 2", "Kuaishou"],
  ["runway-gen-4", "Runway Gen-4", "Runway"],
  ["hailuo-1", "Hailuo 1", "MiniMax"],
];

const BULK_INDUSTRIES: Array<[string, string]> = [
  ["ecommerce", "E-commerce"], ["real-estate", "Real Estate"], ["healthcare", "Healthcare"],
  ["legal", "Legal"], ["finance", "Finance"], ["education", "Education"], ["media", "Media"],
  ["gaming", "Gaming"], ["marketing", "Marketing"], ["saas", "SaaS"], ["startups", "Startups"],
  ["agencies", "Agencies"], ["nonprofits", "Nonprofits"], ["consultants", "Consultants"],
  ["recruiters", "Recruiters"], ["sales", "Sales Teams"], ["support", "Customer Support"],
  ["hr", "HR Teams"], ["product", "Product Teams"], ["founders", "Founders"],
  ["creators", "Creators"], ["writers", "Writers"], ["designers", "Designers"],
  ["developers", "Developers"], ["students", "Students"], ["teachers", "Teachers"],
  ["freelancers", "Freelancers"], ["architects", "Architects"], ["photographers", "Photographers"],
  ["podcasters", "Podcasters"],
];

const BULK_CITIES: Array<[string, string]> = [
  ["cairo", "Cairo"], ["riyadh", "Riyadh"], ["dubai", "Dubai"], ["jeddah", "Jeddah"],
  ["doha", "Doha"], ["kuwait-city", "Kuwait City"], ["amman", "Amman"], ["beirut", "Beirut"],
  ["baghdad", "Baghdad"], ["casablanca", "Casablanca"], ["algiers", "Algiers"], ["tunis", "Tunis"],
  ["london", "London"], ["new-york", "New York"], ["san-francisco", "San Francisco"],
  ["los-angeles", "Los Angeles"], ["chicago", "Chicago"], ["toronto", "Toronto"],
  ["paris", "Paris"], ["berlin", "Berlin"], ["madrid", "Madrid"], ["rome", "Rome"],
  ["amsterdam", "Amsterdam"], ["istanbul", "Istanbul"], ["mumbai", "Mumbai"],
  ["delhi", "Delhi"], ["singapore", "Singapore"], ["tokyo", "Tokyo"], ["seoul", "Seoul"],
  ["sydney", "Sydney"],
];

const BULK_TASKS: Array<[string, string]> = [
  ["blog-post", "Blog Post"], ["landing-page", "Landing Page"], ["cover-letter", "Cover Letter"],
  ["resume", "Resume"], ["email", "Email"], ["newsletter", "Newsletter"],
  ["product-description", "Product Description"], ["ad-copy", "Ad Copy"],
  ["instagram-caption", "Instagram Caption"], ["tiktok-script", "TikTok Script"],
  ["youtube-script", "YouTube Script"], ["youtube-thumbnail", "YouTube Thumbnail"],
  ["logo", "Logo"], ["poster", "Poster"], ["flyer", "Flyer"], ["business-card", "Business Card"],
  ["invoice", "Invoice"], ["contract", "Contract"], ["proposal", "Proposal"],
  ["pitch-deck", "Pitch Deck"], ["press-release", "Press Release"], ["case-study", "Case Study"],
  ["white-paper", "White Paper"], ["ebook", "Ebook"], ["study-notes", "Study Notes"],
  ["lesson-plan", "Lesson Plan"], ["quiz", "Quiz"], ["worksheet", "Worksheet"],
  ["meeting-summary", "Meeting Summary"], ["podcast-notes", "Podcast Notes"],
  ["translation", "Translation"], ["transcript", "Transcript"], ["subtitle", "Subtitle"],
  ["voiceover", "Voiceover"], ["song", "Song"], ["poem", "Poem"], ["short-story", "Short Story"],
  ["novel-outline", "Novel Outline"], ["character-portrait", "Character Portrait"],
  ["comic-strip", "Comic Strip"],
];

const BULK_RIVALS: string[] = [
  "ChatGPT", "Claude", "Gemini", "Perplexity", "Poe", "You.com", "Copilot",
  "MidJourney", "Runway", "Sora", "Suno", "ElevenLabs", "Gamma", "Beautiful.ai",
  "Notion AI", "Jasper", "Copy.ai", "Writesonic", "OpenRouter", "HuggingChat",
];

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function buildBulkPages(seen: Set<string>): SeoPageContent[] {
  const out: SeoPageContent[] = [];
  const push = (p: SeoPageContent) => {
    if (!seen.has(p.slug)) {
      seen.add(p.slug);
      out.push(p);
    }
  };

  // 1. best-{model}-for-{industry}  (chat × industry)
  for (const [ms, mn, mv] of TOP_CHAT_MODELS) {
    for (const [is, iname] of BULK_INDUSTRIES) {
      push(
        useCaseEntry(
          `best-${ms}-for-${is}`,
          `${iname}`,
          `${mn} by ${mv} tuned for ${iname.toLowerCase()} teams — chat, files, web and long context on Megsy AI.`,
        ),
      );
    }
  }

  // 2. ai-{task}-generator  (services)
  for (const [ts, tname] of BULK_TASKS) {
    push(
      serviceEntry(
        `ai-${ts}-generator`,
        `AI ${tname} Generator`,
        `Generate ${tname.toLowerCase()} in seconds with every top AI model on Megsy AI.`,
        tname.split(" ")[0].toUpperCase(),
      ),
    );
  }

  // 3. free-ai-{task}
  for (const [ts, tname] of BULK_TASKS) {
    push(
      serviceEntry(
        `free-ai-${ts}`,
        `Free AI ${tname}`,
        `Try free AI ${tname.toLowerCase()} on Megsy AI — every top model, one workspace.`,
        "FREE",
      ),
    );
  }

  // 4. how-to-write-{task} tutorials
  for (const [ts, tname] of BULK_TASKS) {
    push(
      serviceEntry(
        `how-to-write-${ts}-with-ai`,
        `How to Write a ${tname} with AI`,
        `Step-by-step guide to writing a ${tname.toLowerCase()} with AI on Megsy AI.`,
        "GUIDE",
      ),
    );
  }

  // 5. {service}-in-{city}
  const cityServices: Array<[string, string]> = [
    ["ai-chat", "AI Chat"], ["ai-image-generator", "AI Image Generator"],
    ["ai-video-generator", "AI Video Generator"], ["ai-writer", "AI Writer"],
    ["ai-translator", "AI Translator"], ["ai-tutor", "AI Tutor"],
    ["ai-marketing", "AI Marketing"], ["ai-coding-assistant", "AI Coding Assistant"],
  ];
  for (const [ss, sname] of cityServices) {
    for (const [cs, cname] of BULK_CITIES) {
      push(
        useCaseEntry(
          `${ss}-in-${cs}`,
          `${sname} in ${cname}`,
          `${sname} for teams in ${cname} — every top AI model on one Megsy AI subscription.`,
        ),
      );
    }
  }

  // 6. ai-tools-for-{industry}
  for (const [is, iname] of BULK_INDUSTRIES) {
    push(
      useCaseEntry(
        `ai-tools-for-${is}`,
        `${iname}`,
        `The AI toolkit for ${iname.toLowerCase()} — chat, docs, images, video and code on Megsy AI.`,
      ),
    );
    push(
      useCaseEntry(
        `ai-prompts-for-${is}`,
        `${iname} Prompts`,
        `Battle-tested AI prompts for ${iname.toLowerCase()} — run them on any model inside Megsy AI.`,
      ),
    );
    push(
      useCaseEntry(
        `ai-automation-for-${is}`,
        `${iname} Automation`,
        `Automate repetitive work for ${iname.toLowerCase()} with AI skills and agents on Megsy AI.`,
      ),
    );
  }

  // 7. {model}-alternative + vs pairs
  for (const r of BULK_RIVALS) {
    push(compareEntry(`${slugify(r)}-alternative`, r, `Looking for a ${r} alternative?`));
    push(compareEntry(`vs-${slugify(r)}`, r, `How Megsy AI compares to ${r}.`));
  }

  // 8. image model × industry
  for (const [ms, mn, mv] of TOP_IMAGE_MODELS) {
    for (const [is, iname] of BULK_INDUSTRIES) {
      push(
        useCaseEntry(
          `${ms}-for-${is}`,
          `${iname} with ${mn}`,
          `${mn} by ${mv} for ${iname.toLowerCase()} — brand-ready visuals on Megsy AI.`,
        ),
      );
    }
  }

  // 9. video model × industry
  for (const [ms, mn, mv] of TOP_VIDEO_MODELS) {
    for (const [is, iname] of BULK_INDUSTRIES) {
      push(
        useCaseEntry(
          `${ms}-for-${is}`,
          `${iname} with ${mn}`,
          `${mn} by ${mv} for ${iname.toLowerCase()} — cinematic video on Megsy AI.`,
        ),
      );
    }
  }

  return out;
}
// ─── Final export (after bulk constants are initialized) ───────────
export const SEO_PAGES: SeoPageContent[] = [
  ...BASE_SEO_PAGES,
  ...buildBulkPages(new Set(BASE_SEO_PAGES.map((p) => p.slug))),
];

export const SEO_SLUGS = SEO_PAGES.map((p) => p.slug);

export const getSeoPage = (slug: string | undefined): SeoPageContent | undefined =>
  SEO_PAGES.find((p) => p.slug === slug);
