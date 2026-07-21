# Deep Research #4 — Navigation, Header & Thread/History UX

## Recommended Unified Mobile Nav (single-screen architecture)

```
┌─────────────────────────────────────────┐
│ STATUS BAR (edge-to-edge)               │
├─────────────────────────────────────────┤
│ HEADER (44–52pt)                        │
│ [← back | title]  [Model ▾]  [Avatar]  │
├─────────────────────────────────────────┤
│                                         │
│         CONVERSATION CONTENT            │
│                                         │
├─────────────────────────────────────────┤
│ INPUT BAR (above keyboard)              │
├─────────────────────────────────────────┤
│ BOTTOM NAV (49pt + safe-area)           │
│ [💬 Chats] [📌 Pinned] [🔍 Search] [👤] │
├─────────────────────────────────────────┤
│ HOME INDICATOR (34pt)                   │
└─────────────────────────────────────────┘
```

## Why Bottom Tabs Beat Hamburger
- Discord case study: drawer → tabs increased feature engagement
- NN/g: hamburger = "out of sight, out of mind"
- Thumb-zone research (Hoober): top-left = dead zone
- 4 tabs (not 5) on 390pt screens — keeps tap targets ≥97pt wide

## Gesture Layer (power-user accelerators)
- **Swipe from left edge** → opens Chats panel
- **Swipe from right edge** → opens Account/Settings
- **Swipe left on thread** → Archive / Delete
- **Swipe right on thread** → Pin / Share
- **Long press on thread** → full context menu

## Model Selector Patterns (Comparison)

| Pattern | App | Verdict |
|---|---|---|
| A. Inline title dropdown | ChatGPT | Low discoverability |
| B. Subtitle badge | Claude | Always-visible but small |
| C. Header pill ▾ | Gemini | **Best discoverability** |
| D. In input bar | Perplexity, Grok | Context-adjacent but cluttered |

**Recommendation:** Pattern C (header pill) in same row as new-chat action. Single-row header.

## Thread List Spec
```
🔍 Search conversations...        [+ New]
─────────────────────────────────────
📌 PINNED (collapsible)
📁 PROJECTS (collapsible)
─────────────────────────────────────
TODAY
│ Thread title              10:42 AM
YESTERDAY
│ Thread title              8:30 PM
PREVIOUS 7 DAYS
│ Thread title
```

- **Title only** — no message preview (AI responses are too long for preview)
- **Time grouping** — Today / Yesterday / Previous 7 / Previous 30 / [Month Year]
- **Pinned section first, then Projects, then chronological**

## Model Picker Sheet (bottom sheet on tap of header pill)
```
╾──────────╼  drag handle
Choose Model
──────────────────────────────
● GPT-4o          Most capable   ✓
  GPT-4o mini     Fast & efficient
  o3              Advanced reasoning
──────────────────────────────
↗ Learn about models
```
Detents: 40% / 70%. Selection auto-dismisses with haptic.

## Swipe Action Specs
- **Left swipe** = negative (Archive, Delete) — iOS Mail convention
- **Right swipe** = positive (Pin, Share)
- Destructive actions use snackbar with **Undo**, not blocking dialog (Material Design)

## Cross-App Gaps Identified
| Feature | Who lacks it | Add to unified pattern |
|---|---|---|
| Full-text search inside messages | All apps on mobile | ✅ |
| Archive (soft delete) | Claude, Gemini, Perplexity | ✅ |
| Pinning | Claude, Gemini, Perplexity | ✅ |
| Folders/Projects | Claude, Gemini | ✅ |
| Multi-account | Claude, Perplexity | ✅ |
| Delete confirmation | ChatGPT | ✅ |

## Settings Access Rule
≤ 2 taps from any primary screen (Gemini/Perplexity standard). Tap avatar → sheet with Settings, Account, Upgrade, Sign out.

## iOS Gesture Conflict Resolution
- Use `UIScreenEdgePanGestureRecognizer` for drawer swipe (priority)
- Set `exclusionRects` on scroll views in 20pt left strip
- Only activate drawer swipe at root level (let system back gesture work on stacked screens)

## Android Gesture Nav (API 29+)
- Register `View.systemGestureExclusionRects` for left-edge drawer trigger
- Extend edge-to-edge with `WindowCompat.setDecorFitsSystemWindows(window, false)`
- Implement predictive back (`OnBackPressedCallback`)

## Sources
- nngroup.com/articles/mobile-navigation-patterns
- nngroup.com/articles/hamburger-menus
- discord.com/blog — drawer-to-tabs migration
- Apple HIG — tab bars, gestures
- Material Design 3 — navigation bar spec
- thetechoutlook.com — Perplexity v2.250814.0 redesign
- 9to5google.com — Gemini redesigns
