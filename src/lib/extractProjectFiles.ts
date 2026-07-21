/** @doc Parses fenced code blocks from an assistant message and returns them as a virtual file tree so multi-file coding replies can be previewed together. */

export interface ProjectFile {
  path: string;
  lang: string;
  content: string;
}

const EXT_BY_LANG: Record<string, string> = {
  html: "html",
  htm: "html",
  css: "css",
  scss: "css",
  js: "js",
  javascript: "js",
  jsx: "jsx",
  ts: "ts",
  typescript: "ts",
  tsx: "tsx",
  json: "json",
  py: "py",
  python: "py",
  md: "md",
};

const DEFAULT_NAMES: Record<string, string> = {
  html: "index.html",
  css: "styles.css",
  js: "script.js",
  jsx: "App.jsx",
  tsx: "App.tsx",
  ts: "index.ts",
  json: "data.json",
  py: "main.py",
  md: "README.md",
};

function normalizeLang(raw: string): string {
  const l = (raw || "").toLowerCase().trim();
  if (!l) return "";
  if (l === "react") return "jsx";
  return l;
}

function detectFilenameFromContent(lang: string, code: string): string | null {
  const head = code.slice(0, 400);
  // Common conventions the AI uses to tag files
  const patterns: RegExp[] = [
    /(?:^|\n)\s*(?:\/\/|#|<!--)\s*(?:file|filename|path)\s*[:=]\s*([\w./-]+)/i,
    /(?:^|\n)\s*\/\*\s*(?:file|filename|path)\s*[:=]\s*([\w./-]+)\s*\*\//i,
    /(?:^|\n)===\s*([\w./-]+)\s*===/,
  ];
  for (const re of patterns) {
    const m = head.match(re);
    if (m && m[1]) return m[1].trim();
  }
  return null;
}

export function extractProjectFiles(content: string): ProjectFile[] {
  if (!content) return [];
  // ```lang[:filename] or ```lang filename
  const fence = /```([A-Za-z0-9_+\-]*)(?:[ \t]*[:\s][ \t]*([\w./-]+))?[ \t]*\n([\s\S]*?)```/g;
  const files: ProjectFile[] = [];
  const used = new Map<string, number>();
  let m: RegExpExecArray | null;
  while ((m = fence.exec(content)) !== null) {
    const langRaw = m[1] || "";
    const explicit = m[2] || "";
    const body = m[3] || "";
    const lang = normalizeLang(langRaw);
    if (!lang || lang === "json") {
      // skip json control blocks used elsewhere
      if (lang === "json" && /\"type\"\s*:\s*\"(questions|flow|cards)\"/.test(body)) continue;
    }
    let path = explicit || detectFilenameFromContent(lang, body) || "";
    if (!path) {
      const base = DEFAULT_NAMES[lang];
      if (!base) continue; // ignore blocks we cannot represent as a file (bash, etc.)
      const n = used.get(base) || 0;
      used.set(base, n + 1);
      path = n === 0 ? base : base.replace(/(\.[^.]+)?$/, `-${n}$1`);
    }
    const ext = EXT_BY_LANG[lang] || lang || "txt";
    if (!/\.[a-z0-9]+$/i.test(path)) path = `${path}.${ext}`;
    files.push({ path, lang, content: body });
  }
  return files;
}

/** Build a single HTML document that inlines local CSS/JS files referenced from the main HTML. */
export function buildProjectPreviewHtml(files: ProjectFile[]): string | null {
  if (!files.length) return null;
  const html = files.find((f) => /\.html?$/i.test(f.path)) || files.find((f) => f.lang === "html");
  if (!html) return null;
  // Vite/React-style entry HTML references .tsx/.jsx/.ts modules that the
  // browser cannot execute directly. Fall back to the bundle view so users
  // don't see a blank white iframe.
  if (/<script\b[^>]*(?:type=["']module["'][^>]*src=|src=["'][^"']+\.(?:tsx|jsx|ts)["'])/i.test(html.content)) {
    return null;
  }
  const byName = new Map<string, ProjectFile>();
  for (const f of files) byName.set(f.path.split("/").pop() || f.path, f);

  let out = html.content;
  // Inline <link rel="stylesheet" href="foo.css">
  out = out.replace(
    /<link\b[^>]*rel=["']?stylesheet["']?[^>]*href=["']([^"']+)["'][^>]*>/gi,
    (full, href) => {
      const key = href.split("/").pop() || href;
      const f = byName.get(key);
      return f ? `<style>\n${f.content}\n</style>` : full;
    },
  );
  // Inline <script src="foo.js"></script>
  out = out.replace(
    /<script\b[^>]*src=["']([^"']+)["'][^>]*>\s*<\/script>/gi,
    (full, src) => {
      const key = src.split("/").pop() || src;
      const f = byName.get(key);
      return f ? `<script>\n${f.content}\n</script>` : full;
    },
  );

  // If HTML did not reference sibling css/js, auto-inject them so the preview still works.
  const referenced = new Set<string>();
  html.content.replace(/href=["']([^"']+)["']/gi, (_, v) => (referenced.add(v.split("/").pop() || v), ""));
  html.content.replace(/src=["']([^"']+)["']/gi, (_, v) => (referenced.add(v.split("/").pop() || v), ""));

  const extraStyles = files
    .filter((f) => f.lang === "css" && !referenced.has(f.path.split("/").pop() || f.path))
    .map((f) => `<style>\n${f.content}\n</style>`)
    .join("\n");
  const extraScripts = files
    .filter((f) => (f.lang === "js" || f.lang === "javascript") && !referenced.has(f.path.split("/").pop() || f.path))
    .map((f) => `<script>\n${f.content}\n</script>`)
    .join("\n");

  if (extraStyles) {
    if (/<\/head>/i.test(out)) out = out.replace(/<\/head>/i, `${extraStyles}\n</head>`);
    else out = `${extraStyles}\n${out}`;
  }
  if (extraScripts) {
    if (/<\/body>/i.test(out)) out = out.replace(/<\/body>/i, `${extraScripts}\n</body>`);
    else out = `${out}\n${extraScripts}`;
  }
  return out;
}