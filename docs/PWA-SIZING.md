# PWA Sizing & Safe Areas

This project ships a layered system for handling PWA sizing on iOS and Android.
Read this before touching viewport, safe-area, or keyboard-related code.

## Layers

1. **`index.html` viewport meta** — `viewport-fit=cover` opts into the notch/
   Dynamic Island area, `interactive-widget=resizes-content` lets Android
   Chrome shrink the layout viewport when the keyboard opens.
2. **`src/styles/pwa-safe-area.css`** — exposes CSS variables
   `--safe-top/-bottom/-left/-right` (from `env(safe-area-inset-*)`), auto-pads
   fixed top/bottom chrome, and injects extra breathing room in standalone mode
   via `--pwa-extra-top` / `--pwa-extra-bottom`.
3. **`src/styles/pwa-responsive.css`** — fluid type/spacing scale (`--step-*`,
   `--space-*`), container/grid helpers, touch-target minimums on coarse
   pointers, dynamic viewport helpers (`h-svh/lvh`), keyboard-aware utilities
   (`.pb-keyboard`, `.hide-when-keyboard`), and foldable device support.
4. **`useVisualViewport()` hook** (`src/hooks/useVisualViewport.ts`) — reads
   the VisualViewport API for accurate keyboard inset on iOS Safari (where
   `interactive-widget` is ignored). Mirrors values to `--viewport-height` and
   `--keyboard-inset` on `<html>` and sets `data-keyboard="open|closed"`.
5. **`public/site.webmanifest`** — `id` locks the installed app identity so
   changing `start_url` doesn't create a "second app". `display_override` asks
   for `window-controls-overlay` on desktop (Chromium PWAs) and falls back
   through `standalone` → `minimal-ui` → `browser`.

## Tailwind utilities

- `h-dvh` / `h-svh` / `h-lvh` — dynamic/small/large viewport height.
- `pt-safe-t` / `pb-safe-b` / `pl-safe-l` / `pr-safe-r` — safe-area padding.
- `pb-keyboard` / `mb-keyboard` — bottom offset that grows with the keyboard.

## Magic numbers (documented)

| Location | Value | Why |
| --- | --- | --- |
| `pwa-safe-area.css` — `--pwa-extra-top` | `14px` (standalone) | Standalone mode has no URL bar; without this the header hugs the status bar. |
| `pwa-safe-area.css` — `--pwa-extra-bottom` | `12px` (standalone) | Same for the bottom composer above the home indicator. |
| `pwa-safe-area.css` — `<360px` html font | `15px` | Compact phones (iPhone SE 1st gen) need a smaller base to avoid clipping. |
| `pwa-responsive.css` — root font ramp `400/430/480px` | `16.5 → 17.5px` | Pro Max / Ultra class devices deserve more generous rem-based spacing. |
| `useVisualViewport` keyboard threshold | `120px` | Below this, iOS home indicator hides and browser chrome collapse can trigger false positives. |
| `PwaSplash` breakpoint | `820px OR pointer:coarse` | Mobile-only splash — tablets in coarse-pointer mode still qualify. |

## Do / Don't

- **Do** consume `env(safe-area-inset-*)` (or the `--safe-*` variables) for any
  fixed/sticky chrome that touches the screen edge.
- **Do** use `100dvh` (`h-dvh`) for full-screen surfaces so iOS URL-bar collapse
  doesn't push content off-screen.
- **Do** call `useVisualViewport()` in composer inputs to keep the send button
  above the on-screen keyboard on iOS.
- **Don't** pad `<body>` with `padding-top: env(safe-area-inset-top)` — fixed
  chrome ignores body padding. Pad the fixed element directly.
- **Don't** set `height: 100vh` on layout containers — pre-`dvh` and causes the
  known iOS "off-screen bottom" bug.
- **Don't** change `start_url` after launch — installed apps cache it; use the
  new `id` field instead if you need to change entry paths.