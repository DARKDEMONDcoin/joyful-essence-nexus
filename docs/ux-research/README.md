# Mobile AI Chat UX — Deep Research Series (7 Reports)

Comprehensive UX research for the mobile chat experience covering every atom of the interface. All reports compare ChatGPT, Claude, Gemini, Perplexity, Grok, Poe, and DeepSeek with cited sources.

## Reports

1. **[01-composer.md](./01-composer.md)** — Composer & Input Bar UX
   Text input, autosize, keyboard avoidance, send button states, voice/mic, attachments, model picker, tools, slash commands, mentions, paste, multiline, drafts, RTL, safe-area insets.

2. **[02-loading-states.md](./02-loading-states.md)** — Unified Loading & Waiting States
   Thinking indicators, streaming, tool-call states, progress bars vs indeterminate, skeletons, orb animations, "thought for Ns" timers, cancel/stop, error recovery, prefers-reduced-motion. **Proposes one unified loading system** (UAILS) for chat, image, video, deep research, code.

3. **[03-message-rendering.md](./03-message-rendering.md)** — Message Bubble UX
   No-bubble assistant pattern, markdown, code blocks, citations, long-press actions, streaming caret, scroll-to-bottom, typography scale, spacing tokens, semantic colors.

4. **[04-navigation-threads.md](./04-navigation-threads.md)** — Navigation, Header & Thread/History UX
   Header layout, model selector patterns, sidebar drawer, thread list, search, pinning, folders, swipe-to-delete, share, archive, multi-account, settings entry, back navigation, gestures. Proposes unified mobile nav with bottom tab bar + swipe accelerators.

5. **[05-icon-system.md](./05-icon-system.md)** — Icon System
   Audit of Lucide, Phosphor, Iconoir, SF Symbols. Clean modern icon spec for all 27 chat icons (send, mic, attach, +, web-search, deep-research, code, image-gen, video-gen, settings, copy, regenerate, share, stop, etc.) with stroke width, sizes, corner radius. **Keeps the brand star intact** — defines how icons sit beside it.

6. **[06-onboarding.md](./06-onboarding.md)** — Onboarding, Empty States & First-Run UX
   Welcome screen, suggestion chips, "what can I help with?" pattern, capability hints, coachmarks, permission prompts, sign-in placement, anonymous trial, paywall placement, daily-limit UI. Recommends non-annoying unified pattern.

7. **[07-multimodal.md](./07-multimodal.md)** — Multimodal & Tool UX
   Mode switching, per-mode model pickers, settings sheets (aspect ratio, duration, style), result cards (image grid, video player, research report, code), download/share/save, regenerate variants, full-screen viewer, gallery, voice mode (orb + waveform + transcript). Proposes **Adaptive Composer** as single entry point with mode toggles.

## Key Cross-Cutting Recommendations

- **Composer is the universal entry point** — every mode lives inside it; never use top tabs that imply leaving the conversation
- **Unified loading system** — same orb/shimmer/timer language across chat, image gen, video gen, deep research, code
- **Brand star preserved** — icons sit beside it; star remains the agent identity mark (no generic Sparkles)
- **English-only copy** — all UI strings in English
- **Per-mode model memory** — switching to Image mode restores the last image model used
- **Result cards inside the thread** — never side-panel; progressive disclosure (collapsed → full-screen)
- **Zero-friction first contact** — input visible immediately, no auth gate, no splash, no tour
- **Always-visible Stop button** — morphs from Send; preserves partial output on cancel
- **prefers-reduced-motion** — every animation has a static fallback
- **44pt minimum tap targets** — safe-area insets honored on all platforms
