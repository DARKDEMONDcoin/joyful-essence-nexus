# Performance: Facebook-style code splitting

This project implements three layers of aggressive splitting on top of the
existing route-level `React.lazy`:

1. **Intent prefetch** — hover / focus / touchstart on any `<PrefetchLink>` or
   `<NavLink>` starts downloading the target route's chunks. By the time the
   user actually clicks, the JS is already in cache. Powered by
   `src/lib/routePrefetch.ts` + `src/lib/routePrefetch.registry.ts`.
2. **Interaction lazy-load** — heavy widgets (emoji pickers, video players,
   editors, PDF viewers, share modals) are wrapped in
   `<LazyOnInteraction>` so they only download on the first hover/click of
   their trigger.
3. **Visibility lazy-load** — below-the-fold sections (galleries, testimonials,
   FAQs, marketing videos) are wrapped in `<LazyOnVisible>` so the chunk +
   DOM don't cost anything until the user scrolls near them.

## How to adopt

### Replace `Link` with `PrefetchLink`

```diff
- import { Link } from "react-router-dom";
+ import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
```

No other change needed — same API. `NavLink` from
`@/components/layout/NavLink` already prefetches on intent, so any file using
that already benefits.

### Lazy-load a heavy widget on interaction

```tsx
import { LazyOnInteraction } from "@/components/common/LazyOnInteraction";
import { Button } from "@/components/ui/button";

<LazyOnInteraction
  load={() => import("@/components/chat/EmojiPickerPanel")}
  trigger={<Button variant="ghost">😀</Button>}
  componentProps={{ onSelect }}
  fallback={<div className="h-64 w-64 animate-pulse rounded bg-muted" />}
/>
```

Good candidates: emoji / date / color pickers, share modals, PDF/DOCX
viewers, video players, code editors, chart panels, mermaid renderers.

### Lazy-load below-the-fold sections

```tsx
import { LazyOnVisible } from "@/components/common/LazyOnVisible";

<LazyOnVisible minHeight={480} rootMargin="600px">
  <TestimonialsSection />
  <FaqSection />
  <FooterMega />
</LazyOnVisible>
```

## Registering new routes for prefetch

When you add a new route to `App.tsx`, also add a matching entry in
`src/lib/routePrefetch.registry.ts`. The loader **must** be the same
`() => import(...)` string used by `React.lazy` so the browser dedupes on
the module cache key. Missing entries just skip prefetch — they don't break
navigation.

## What NOT to do

- Do **not** call `prefetchRoute` in `useEffect` on mount — that defeats the
  intent signal and eagerly downloads every linked chunk.
- Do **not** wrap tiny components in `LazyOnInteraction`. The Suspense +
  extra chunk overhead only pays off for widgets > ~15 KB gzipped.
- Do **not** wrap above-the-fold hero content in `LazyOnVisible` — it
  hurts LCP.
