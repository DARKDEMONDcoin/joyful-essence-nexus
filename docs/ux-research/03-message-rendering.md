# Deep Research #3 — Message Rendering & Bubble UX

## Core Principles
- **Assistant: no bubble** — render markdown directly on chat surface using foreground token (ChatGPT/Claude pattern)
- **User: filled bubble** — high-contrast pair (`primary` + `primary-foreground`); never pale gradients with white text
- **Asymmetric spacing** — 24px left for assistant text, 16px+16px (outside+inside) for user bubble = 32px effective

## Message Anatomy
```
[Avatar 28px]  Assistant markdown (no bg)        ← left
                Inline citations [1] [2]
                Code block w/ copy + lang badge
                ─────────────────
                ↑   ↓   ⟲   ⋯                    ← actions on hover/long-press

                                  User bubble    ← right, filled
                                  16px padding
```

## Typography Scale (mobile)
| Element | Size | Weight | Line-height |
|---|---|---|---|
| Body text | 16px | 400 | 24px (1.5) |
| Code inline | 14px monospace | 500 | 20px |
| Code block | 13px monospace | 400 | 20px |
| H1 in message | 22px | 600 | 28px |
| H2 in message | 19px | 600 | 26px |
| H3 in message | 17px | 600 | 24px |
| Caption (timestamp, etc.) | 12px | 400 | 16px |
| Streaming caret | 16px (matches body) | — | — |

## Spacing Tokens
- Between messages: `16px`
- Inside bubble: `12px V` × `16px H`
- Action bar gap from message: `8px`
- Avatar to text: `12px`
- Citation chip gap: `4px`

## Color Tokens (semantic only, no hex)
- `--chat-bg` — main surface
- `--chat-user-bg` / `--chat-user-fg` — user bubble (4.5:1 contrast minimum)
- `--chat-assistant-fg` — assistant text (no bg)
- `--chat-code-bg` / `--chat-code-fg` — code block surface
- `--chat-citation` — citation chip accent
- `--chat-divider` — subtle separators
- `--chat-streaming-caret` — blinking caret

## Streaming
- **Blinking caret** at tail of last word (no shimmer, no skeleton during stream)
- **Progressive markdown** — render headers/code blocks as they complete
- **Buffered markdown** — wait for closing ``` before highlighting code (avoids flicker)
- **Auto-scroll** while user is at bottom; if user scrolls up, pause auto-scroll and show "↓ Jump to latest" pill

## Long-Press Actions (assistant)
1. Copy
2. Regenerate
3. Share
4. Like / Dislike
5. Read aloud
6. Report

## Long-Press Actions (user)
1. Copy
2. Edit
3. Delete

## Code Blocks
- Language badge top-left, line count top-right
- Copy button always visible (top-right)
- Horizontal scroll for long lines (never wrap code)
- Syntax highlighting via Prism/Shiki
- Tap-to-collapse on blocks > 40 lines

## Tables on Mobile
- Horizontal scroll inside bubble (full bleed if needed)
- Sticky first column
- "Tap to expand" → full-screen viewer for >5 columns

## Citations (Perplexity pattern)
- Inline `[1]` superscripts as tap targets
- Below answer: horizontal scroll strip of favicon + domain chips
- Tap chip → bottom sheet with site name, URL, excerpt, "Open in browser"

## Image Attachments in Message
- Full-width inside bubble (max ~280pt on 390pt screen)
- Tap → full-screen viewer (shared element transition)
- Multi-image: 2×2 grid

## Scroll-to-Bottom Button
- Appears when scroll position is >300px from bottom
- 44×44pt pill, bottom-right above composer
- Shows unread message count if new messages arrived

## Sources
- ChatGPT spacing analysis — news.ulektz.com
- shapeof.ai/patterns/citations — citation taxonomy
- ai-tldr.dev — streaming + buffered markdown
- Stream Chat docs — long-press action menus
- Koder Design — AI message bubble spec
