// ─────────────────────────────────────────────────────────────────────────────
// Megsy AI — Docs auto-registry.
//
// PURPOSE
//   The /docs page should stay in sync with the codebase FOREVER, with zero
//   manual edits when a new page, edge function, integration, slides template
//   or skill is added/removed. This module is the single source of truth for
//   auto-discovered surface area of the product.
//
// HOW IT WORKS
//   We use Vite's `import.meta.glob` with `?raw` to load every file as a
//   string at build time, then parse the leading comment for a one-line
//   description. Authors are encouraged to add a comment at the top of every
//   page / edge function in this exact form:
//
//       /** @doc Short, human-friendly description of what this page does. */
//
//   If no `@doc` tag is found we fall back to the first non-empty line of the
//   leading comment block, then to a humanized version of the filename.
//
// CONTRIBUTOR RULE  (also documented in AGENTS.md)
//   Any new file under `src/pages/**` or `supabase/functions/*/index.ts` MUST
//   start with a `/** @doc ... */` comment so it shows up in /docs with a real
//   description. The Docs page will still render undocumented files (using a
//   humanized title), so nothing ever silently disappears.
// ─────────────────────────────────────────────────────────────────────────────

export interface DocEntry {
  /** Stable id (relative path without extension). */
  id: string;
  /** Human-friendly title derived from filename. */
  title: string;
  /** One-line description parsed from the file's leading comment. */
  description: string;
  /** Folder bucket (top-level segment) used for grouping in the sidebar. */
  group: string;
  /** Original file path (for debugging / linking). */
  filePath: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const humanize = (raw: string): string =>
  raw
    .replace(/[-_]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\bPage\b/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());

/**
 * Extract a one-line description from a file's leading comment block.
 *  1. Explicit `@doc <text>` tag wins.
 *  2. Otherwise the first non-empty, non-directive line of the leading
 *     comment block.
 *  3. Otherwise empty string (caller decides the fallback).
 */
function extractDescription(source: string): string {
  if (!source) return "";
  const head = source.slice(0, 2000); // only scan the top of the file

  // 1) @doc tag — supports `/** @doc ... */`, `// @doc ...`, or inside a /* */ block.
  const tag = head.match(/@doc\s+([^\n*/]+)/);
  if (tag && tag[1]) return tag[1].trim();

  // 2) Leading comment block — either /** ... */ or a run of // lines.
  const block = head.match(/^\s*\/\*\*?([\s\S]*?)\*\//);
  if (block) {
    const line = block[1]
      .split("\n")
      .map((l) => l.replace(/^\s*\*\s?/, "").trim())
      .find((l) => l && !l.startsWith("@") && !l.startsWith("eslint"));
    if (line) return line;
  }
  const lineBlock = head.match(/^(?:\s*\/\/[^\n]*\n)+/);
  if (lineBlock) {
    const line = lineBlock[0]
      .split("\n")
      .map((l) => l.replace(/^\s*\/\/\s?/, "").trim())
      .find((l) => l && !l.startsWith("@"));
    if (line) return line;
  }
  return "";
}

// ── Pages registry ─────────────────────────────────────────────────────────

const pageSources = import.meta.glob("/src/pages/**/*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const DOC_PAGES: DocEntry[] = Object.entries(pageSources)
  .map(([filePath, source]) => {
    const rel = filePath.replace("/src/pages/", "").replace(/\.tsx$/, "");
    const group = rel.includes("/") ? rel.split("/")[0] : "root";
    const base = rel.split("/").pop() || rel;
    const description =
      extractDescription(source) ||
      `Renders the ${humanize(base).toLowerCase()} surface of the app.`;
    return {
      id: rel,
      title: humanize(base),
      description,
      group,
      filePath,
    };
  })
  .sort((a, b) => a.id.localeCompare(b.id));

// ── Edge functions registry ───────────────────────────────────────────────

const edgeSources = import.meta.glob("/supabase/functions/*/index.ts", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const DOC_EDGE_FUNCTIONS: DocEntry[] = Object.entries(edgeSources)
  .map(([filePath, source]) => {
    const name = filePath.replace("/supabase/functions/", "").replace("/index.ts", "");
    const description =
      extractDescription(source) ||
      `Server-side edge function (\`${name}\`) running on Supabase / Deno.`;
    return {
      id: name,
      title: name,
      description,
      group: "edge",
      filePath,
    };
  })
  .filter((e) => !e.id.startsWith("_"))
  .sort((a, b) => a.id.localeCompare(b.id));

// ── Grouped helpers (used by DocsPage) ────────────────────────────────────

export function groupPagesByFolder(): Record<string, DocEntry[]> {
  return DOC_PAGES.reduce<Record<string, DocEntry[]>>((acc, p) => {
    (acc[p.group] ||= []).push(p);
    return acc;
  }, {});
}

export const DOC_REGISTRY_STATS = {
  pageCount: DOC_PAGES.length,
  edgeFunctionCount: DOC_EDGE_FUNCTIONS.length,
};
