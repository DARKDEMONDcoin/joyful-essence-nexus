# Deep Research #2 — Unified Loading & Waiting States

> Full source notes in conversation history. Key findings below.

## Five Loading Phases (every AI app has these)
0. **Initiated** (0→100ms) — tap registered
1. **Pre-Token / TTFT** (200ms→15s) — "received, working"
2. **Active Stream** (2s→60s) — tokens arriving
3. **Tool Execution** (2s→30s per call) — search/image/code in flight
4. **Completion** — idle, end-of-answer signal

## Five Behavioral Types
- **A. Pre-token** — pulse + label
- **B. Streaming** — blinking cursor only (no shimmer)
- **C. Tool suspension** — named pill ("Searching X…")
- **D. Long-running agent** — step log + milestones + cancel + notify-me
- **E. Terminal/error** — preserve partial output, inline retry

## Best-in-Class Patterns
- **ChatGPT**: Send→Stop morphic button (180ms spring), Deep Research step log
- **Claude**: "Thinking · 12s" live timer + "Thought for 47 seconds" summary (best in market)
- **Gemini**: 4-color gradient orb, scale 1.0→1.08 active breathing
- **Perplexity**: Layered stack (rotating logo + source counter + phase labels) — perceived-performance benchmark
- **Grok**: Scrolling-snippets reasoning (theatrical)
- **DeepSeek**: Raw reasoning stream (max transparency, poor mobile UX)

## The Unified AI Loading System (UAILS) — Recommended

| Phase | Visual | Copy |
|---|---|---|
| Initiated | Send button morphs to Stop, instant haptic | — |
| Pre-token | Brand star pulses (1.4s, ±8% scale) + "Thinking · {N}s" timer | live counter |
| Streaming | Blinking caret at tail, progressive markdown | — |
| Tool: web search | Pill with magnifier icon | "Searching '{query}'" |
| Tool: image gen | Content-shaped skeleton + shimmer sweep (1.2s linear) | "Generating image…" |
| Tool: video gen | Determinate progress bar tied to real server phases | "Encoding · 1m 23s left" |
| Tool: deep research | Step log with ✓/◉/○ + milestone bar + Cancel + Notify-me | "Synthesizing 47 sources" |
| Tool: code | Inline code block fills, then "Running…" spinner | — |
| Completion | Caret disappears, scroll-to-bottom button settles | — |
| Error | Preserve partial text, inline retry, specific message | "Connection lost — Retry" |

## Motion Spec
- Spring physics for Send↔Stop: `cubic-bezier(0.34, 1.56, 0.64, 1)`, 180ms
- Breathing: 1.2s–2.0s period, sinusoidal ease-in-out, max ±8% scale
- Shimmer: 1.2s linear, left→right 15° diagonal, surface + 12% lightness
- Phase label crossfade: 200ms ease-out
- Step entry: slide-from-bottom 240ms

## prefers-reduced-motion (WCAG 2.3.3 AAA)
Every animation needs a static fallback:
- Breathing orb → static, single solid color
- Shimmer → static skeleton
- Token streaming → batch reveal (entire response at once)
- Send↔Stop morph → instant swap
- Phase crossfade → instant label swap

HuggingFace precedent: [PR #1131](https://github.com/huggingface/chat-ui/pull/1131) disables streaming under reduced-motion.

## Stop Button Contract
- Always visible during generation
- Same position/size as Send (no layout shift)
- `AbortController.abort()` immediately
- Preserves partial text (never destroys)
- Adds "Stopped" badge
- Re-enables input

## Sources
- aiverse.design — perceived performance
- digestibleux.com — reasoning display patterns
- ai-tldr.dev — LLM latency UX
- Nielsen Norman Group — 100ms/1s/10s thresholds
- HuggingFace chat-ui PR #1131
- vp0.com — Sora-style progress bars
- 60fps.design — Gemini & Perplexity loader analysis
