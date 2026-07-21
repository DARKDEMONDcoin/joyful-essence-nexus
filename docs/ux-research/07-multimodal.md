# Deep Research #7 — Multimodal & Tool UX (Adaptive Composer)

## Core Architectural Decision

**Composer is the single universal entry point.** Every mode (chat, image, video, search, code, deep research, voice) is a *modifier of the composer*, not a separate screen. Mode tabs in a top nav fracture context; mode chips inside the bottom-sheet composer preserve it.

> Validation: Gemini (Oct 2025) absorbed the model picker into the prompt bar; Gemini moved the prompt bar to a flush-with-keyboard bottom sheet. The industry is converging.

## Adaptive Composer Anatomy

```
┌─────────────────────────────────────────────┐
│ [📎] [Image · Imagen 3 ▾]            [🎙]  │  ← actions + mode pill
│ ┌─────────────────────────────────────────┐ │
│ │ Type or speak…                          │ │
│ └─────────────────────────────────────────┘ │
│ [💬 Chat][🖼 Image][🎬 Video][🔍 Search]   │  ← scrollable mode strip
│ [</>Code][🔬 Deep][📎 Analyze]              │
└─────────────────────────────────────────────┘
```

## Mode Strip (scrollable, in composer)
- Pinned 3 most-used + overflow `•••`
- Active chip = filled background; inactive = outlined
- **Long press chip** = open mode settings sheet (per-mode params + per-mode model picker)
- Active mode label appears in pill above input (e.g., "Image · Imagen 3 ▾")

## Per-Mode Model Memory
Switching back to Image mode restores the last-used image model. Model selection is mode-scoped, never global. Model + params persist per mode in user settings.

## Mode Settings Sheet (long-press chip)

### Image
```
Model:        [DALL·E 3] [Imagen 3 ●] [Flux Pro] [Seedream]
Aspect:       [1:1] [16:9] [9:16] [4:3] [3:4]
Style:        [Natural ●] [Vivid] [Anime] [Oil] [Sketch]
Count:        ● 1   ○ 2   ○ 4
Quality:      [Standard ▾]
```

### Video
```
Model:        [Sora 2 ●] [Runway Gen-4] [Kling 2] [Seedance]
Duration:     [5s] [10s] [20s] [Custom]
Aspect:       [16:9] [9:16] [1:1]
Motion:       [Slow ──●── Fast]
Camera:       [Static] [Pan L/R] [Zoom In/Out]
```

### Deep Research
```
Depth:        ○ Quick (2–5 min)   ● Thorough (10–30 min)
Sources:      [Web ✓] [PDFs ✓] [Drive ✓] [Scholar ✓]
Date range:   [Any ▾]
Output:       [Report ●] [Outline] [Bullets]
```

## Result Cards (live inside the thread)

### Image (1/2/4 grid)
- 1: full-width, max 400pt
- 2: side-by-side 1:1
- 4: 2×2 with 4pt gap
- Toolbar: `Save · Share · Favorite · Regenerate · Edit prompt · Expand`
- Tap → full-screen viewer with pinch zoom + swipe variants

### Video
- Thumbnail + play overlay (44pt centered)
- Duration badge bottom-right, mute toggle top-right
- Toolbar: `Save to Photos · Share · Edit · Regenerate · Fullscreen`
- Autoplay muted on scroll-into-view (≤10s clips only)

### Deep Research Report
**Collapsed card in thread:**
```
🔬 "Impact of LLMs on mobile UX"
━━━━━━━━━━━━━━━━━━━━━ ✓ Complete  2m 47s
Executive Summary (3 lines visible)…
📚 24 sources  •  Web + Scholar
[Read Full Report ↓] [Share] [Export PDF]
```
**Expanded** = full-screen sheet with TOC chips, inline citations as superscript tap targets, sticky bottom bar.

### Live Research Progress (interruptible since OpenAI Feb 2026 update)
```
🔬 "Topic"
━━━━━━━━━━━━━░░░░░  68%  1m 23s
✓ Forming research plan
✓ Searching web (47 sources)
◉ Analyzing: "Nielsen Norman 2025 report"
○ Synthesizing findings
○ Writing report
[Refine with follow-up…]    [Cancel]
```

### Web Search Result
- Answer bubble with inline `[1]` `[2]` citations
- Horizontal source strip (favicon + domain chips)
- Tap chip → source sheet with excerpt + "Open in browser"

### Code
- Syntax-highlighted block, language badge, line count
- Actions: `Copy · Run · Edit · Explain`
- Run opens inline sandbox panel (max 240pt height)

## Variants (Regenerate vs Vary)
- **Regenerate** = same prompt, new seed
- **Vary (Subtle/Strong)** = Midjourney pattern, preserves composition
- **Edit prompt** = opens prompt in composer pre-populated
- Variants pushed into horizontal carousel **inside same message** (never replace originals)
- Cap: 8 variants per turn

## Full-Screen Viewer
- Image: pinch zoom (up to 4×), swipe L/R for prev/next, swipe down to dismiss (spring back to thumbnail), double-tap = 2× zoom centered
- Video: landscape rotation, scrub bar with 44pt touch zone, PiP support, auto-hide controls after 3s

## Gallery (first-class destination)
- Persistent app-level surface, ≤2 taps to reach (not buried in settings)
- Tabs: `All · Images · Videos · Reports · Code`
- 3-col grid for images/videos, 1-col for reports/code
- Search bar (searches prompt text + auto-tags)
- Metadata: asset, prompt, model, params, timestamp, conversation deep link, tags, favorite

**Both views:**
- **Per-conversation gallery** — chat overflow `⋯` → "View media in this chat"
- **Global gallery** — profile → "My Creations"

## Voice Mode (Full-Screen Overlay)

### 5-State Machine
```
IDLE → LISTENING → THINKING → SPEAKING → INTERRUPTED
  ↑                                          ↓
  └──────────────────────────────────────────┘
```

| State | Orb | Color |
|---|---|---|
| Idle | Slow pulse (1× per 3s) | Brand neutral |
| Listening | Scale to mic amplitude (1.0–1.3×) | Brand primary |
| Thinking | Continuous morph, no amplitude | Amber |
| Speaking | Pulse to TTS waveform | Brand secondary |
| Error | Two sharp pulses, settle | Red |

**Orb = minimum 120pt diameter.** Use brand star as the orb form (preserves identity, replaces generic blob).

### Voice Screen Layout
```
              [✕ End]
           [  ORB 120pt  ]
       ════ waveform ════
   You: "What's the latest…"
   AI:  "Based on my research…"

  [🔇 Mute]  [📷 Camera]  [📱 Screen]
  [Push to talk ●]  [Always on 🔘]
```

### Transcript
- Scrolling text middle 40% of screen
- Current spoken word: highlight cursor
- User/AI styled differently (alignment + color)
- Auto-scroll with 3s manual override
- Persists after session, appendable to thread

## Attachment Strip (above input, pre-send)
```
[🖼 photo.jpg ✕] [📄 report.pdf ✕] [🎥 clip.mp4 ✕] [+3 more]
 2.1 MB           412 KB             18 MB
```
Each chip: 72×72pt, thumbnail or file-type icon, 14-char name, size, dismiss button top-right.

## Auto-Mode-Switch on Attachment
- Attach PDF/XLSX without active mode → auto-switch to **Analyze** mode with banner: "📎 File analysis mode active"
- Prevents the common bug of sending plain Chat with file ignored

## Download / Share / Save Hierarchy

| Action | Image | Video | Report | Code |
|---|---|---|---|---|
| Save to device | ✅ Primary | ✅ Primary | ✅ PDF | ✅ File |
| OS share sheet | ✅ | ✅ | ✅ | ✅ |
| Favorite → Gallery | ✅ | ✅ | ✅ History | — |
| Copy to clipboard | ✅ File | — | ✅ Text | ✅ Code |
| Add to collection | ✅ | ✅ | — | — |

Use native `UIActivityViewController` (iOS) / Intent share (Android). Never custom share sheet.

## Accessibility
- `prefers-reduced-motion`: orb → static + text label
- Voice mode: transcript ALWAYS shown (deaf/HoH users)
- Mode strip: first-run tooltip "Swipe to explore modes →"
- Large file: progress in chip, 50MB cap, clear error
- Long research: push notification on completion, persistent header banner if user navigates away

## Key Takeaways
1. **Composer is the anchor** — every tool mode lives inside it
2. **Model selection is mode-scoped** — remember and restore
3. **Result cards must be progressive** — collapsed first, expanded second
4. **Voice mode is a state machine** — design all 5 states
5. **Deep Research needs live progress + interruption**
6. **Gallery is a retention surface** — first-class destination
7. **Aspect ratio before generation, not after**
8. **Long-press chip = power-user shortcut to mode settings**

## Sources
- OpenAI Deep Research update (Feb 2026)
- 9to5Google — Gemini prompt bar redesign (Sep/Oct 2025)
- Sora release notes (Mar 2026)
- Character.ai Imagine Gallery
- shapeof.ai patterns (Variations, Regenerate, Transform)
- uxpatterns.dev — Model Selector
- Koder Design — AI Voice Mode UI
- VP0 — Gemini Live Voice template, ChatGPT Voice API template
- Vercel AI Elements — Attachments reference
- LibreChat-Mobile PR #145 — conversation media gallery
