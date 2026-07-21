/** @doc Hand-maintained changelog surfaced inside /docs. Add entries to the top. */

export interface ChangelogEntry {
  date: string; // ISO yyyy-mm-dd
  title: string;
  tag?: "new" | "improved" | "fixed" | "security";
  bullets: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    date: "2026-06-24",
    title: "Docs become a real product",
    tag: "new",
    bullets: [
      "⌘K / Ctrl+K now focuses the docs search from anywhere on the page.",
      "Every section heading gets a permanent copy-link button next to the title.",
      "Every code block ships with a one-click copy button.",
      "Previous / Next navigation appears at the end of every section.",
      "A new Changelog section auto-renders the most recent product updates.",
      "Deep links: /docs/<group>/<section> scroll directly to any section.",
      "Right-side mini table of contents appears on xl screens.",
      "Vitest now fails the build if a page is missing its `@doc` tag, guaranteeing every new surface is documented forever.",
    ],
  },
  {
    date: "2026-06-23",
    title: "Realtime, mobile & resilience deep-dive added",
    tag: "improved",
    bullets: [
      "Six new sections covering realtime collaboration, mobile experience, offline mode, performance, i18n / RTL and accessibility.",
      "Power workflows group added: shortcuts, command palette, share & export, notifications, credits math, recipes, hidden gems.",
      "Megsy Star replaces the Sparkles icon on the Docs hero and intro.",
    ],
  },
  {
    date: "2026-06-22",
    title: "Auto-discovery engine",
    tag: "new",
    bullets: [
      "Introduced src/lib/docsRegistry.ts — discovers every page and edge function via Vite import.meta.glob.",
      "Adding a new file with a /** @doc ... */ header makes it appear in docs instantly, forever, with zero manual work.",
      "Live auto-sync groups added for pricing, agents, blog, comparisons, integrations, slides templates and skills.",
    ],
  },
];
