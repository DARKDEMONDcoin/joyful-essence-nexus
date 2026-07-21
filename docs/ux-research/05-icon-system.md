# Deep Research #5 — Icon System for AI Chat

## Icon Set Audit

| Set | Stroke | Style | Best for AI chat | Verdict |
|---|---|---|---|---|
| **Lucide** | 2px | Geometric, friendly | ✅ already in project | **Primary set** |
| **Phosphor** | 1.5–2px variable | Six weights | Good for status icons | Secondary option |
| **Iconoir** | 1.5px | Lighter, more modern | Niche | Skip |
| **SF Symbols** | Variable | Apple-only | iOS-only | Skip (cross-platform) |
| **Custom (Linear/Vercel style)** | 1.5px | Minimal | For brand-unique icons | Custom for star + agent marks |

**Decision:** Lucide as primary (already installed), custom SVGs for brand mark (star) and agent-specific icons that have no Lucide match.

## The Brand Star — Preservation Rules

The star is the **agent identity mark**. It is NOT a generic Sparkles icon. Rules:

1. **Never replaced** by `Sparkles` from lucide-react
2. **Never used as a control icon** (only as identity / loading orb / empty-state mascot)
3. **Placement**: assistant avatar position (left of assistant messages), empty-state hero, loading pulse animation, splash/logo
4. **Spacing beside Lucide icons**: ≥ 12px gap (so it never visually fights with stroked icons)
5. **Sizing**: 16/20/24/32/64 — same scale as other icons; large hero size 96–160px
6. **Color**: brand accent token, single-color fill (no gradients in small sizes); animated gradient only at hero size
7. **Animation**: gentle pulse (±8% scale, 1.4s ease-in-out) when AI is thinking — replaces orb pattern

## Icon Specification (27 icons)

All icons: **20px default**, **24px stroke-width 1.75px** for headers, **16px stroke-width 2px** for inline use.

| Icon | Lucide name | Size H/M/I | Notes |
|---|---|---|---|
| send | `arrow-up` (in circle) | 18 inside 36px circle | Morphs to `square` for stop |
| stop | `square` (filled) | 14 inside 36px circle | Replaces send during stream |
| mic | `mic` | 20 | Pulses during recording |
| attach | `paperclip` | 20 | + variant for menu |
| plus | `plus` | 22 | Open attachment/tools sheet |
| image | `image` | 20 | Mode chip, attachment |
| video | `video` | 20 | Mode chip, attachment |
| audio | `audio-lines` | 20 | Attachment, voice mode |
| file | `file-text` | 20 | Generic attachment |
| web-search | `globe` | 20 | Web tool active state |
| deep-research | `microscope` | 20 | Deep research mode |
| code | `code-2` | 20 | Code mode/result |
| image-gen | `wand-2` | 20 | Image generation |
| video-gen | `clapperboard` | 20 | Video generation |
| model-picker | `chevron-down` | 12 (with label) | Pill caret |
| settings | `sliders-horizontal` | 20 | Mode settings |
| copy | `copy` | 16 | Inline action |
| regenerate | `rotate-cw` | 16 | Inline action |
| share | `share` | 16 | Inline / thread |
| history | `clock` | 20 | Thread history |
| new-chat | `square-pen` | 22 | Header right |
| sidebar | `panel-left` | 22 | Header left (when used) |
| close | `x` | 22 | Sheets / chips |
| menu | `menu` | 22 | Hamburger (deprecated, prefer tabs) |
| like | `thumbs-up` | 16 | Message feedback |
| dislike | `thumbs-down` | 16 | Message feedback |
| more-options | `more-horizontal` | 20 | Long-press menu shortcut |

## Optical Balance Rules
- Square-ish icons (image, file): full 20px box
- Tall icons (mic, paperclip): scale to 18px height, center vertically
- Wide icons (more-horizontal): scale to 18px width
- Always centered in a 44×44pt tap target

## Stroke Width Strategy
- **16px size** → 2.0px stroke (denser, more visible at small size)
- **20px size** → 1.75px stroke (default)
- **24px size** → 1.5px stroke (lighter, breathes more)

## Corner Radius
- All icon containers: `rounded-full` for circular buttons (send, mic), `rounded-xl` for chips (12px), `rounded-2xl` for cards (16px)
- Icon paths themselves use Lucide defaults (rounded line caps + joins)

## Implementation

```tsx
import { Send, Square, Mic, Paperclip, Image, Video, Globe, Microscope, Code2, Wand2 } from "lucide-react";
import { BrandStar } from "@/components/branding/BrandStar"; // preserved star

// Send/Stop morph
<button className="w-9 h-9 rounded-full bg-primary text-primary-foreground grid place-items-center">
  {isStreaming ? <Square size={14} fill="currentColor" /> : <ArrowUp size={18} strokeWidth={2.25} />}
</button>

// Brand star (NEVER replace with Sparkles)
<BrandStar size={24} className="text-primary animate-pulse-soft" />
```

## Custom SVG Template (for non-Lucide needs)
```tsx
// Use 24×24 viewBox, 1.5px stroke, round caps/joins
<svg width={size} height={size} viewBox="0 0 24 24" fill="none"
  stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
  {/* paths */}
</svg>
```

## Do / Don't

✅ DO
- Use Lucide for all generic controls
- Keep the brand star as identity-only
- Use semantic color tokens (`text-primary`, `text-muted-foreground`)
- Match stroke width to icon size
- 44×44pt tap targets even when icon is 20px

❌ DON'T
- Replace brand star with `Sparkles` (generic AI placeholder)
- Mix icon families inside one screen (Lucide + Phosphor + emoji)
- Hardcode colors (`text-white`, `bg-gray-500`)
- Use icons smaller than 14px (illegible)
- Stack icons without ≥ 8px gap

## Sources
- Lucide official design guide — lucide.dev
- Phosphor vs Lucide — phosphoricons.com/comparison
- Atlassian Design System — optical sizing
- Carbon Design System — icon production rules
- Apple SF Symbols HIG
- Linear & Vercel design system principles
