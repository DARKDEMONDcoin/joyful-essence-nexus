/** @doc Publishes a Coder-generated multi-file project to a public shareable URL by storing compiled HTML in generated_sites. */

import { supabase } from "@/integrations/supabase/client";
import {
  buildProjectPreviewHtml,
  type ProjectFile,
} from "./extractProjectFiles";
import { buildReactRuntimeHtml, isReactProject } from "./buildReactRuntime";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Fallback: build a self-contained HTML "project bundle" page that lists every
 * file with syntax-friendly formatting, plus a one-click download of the raw
 * JSON. This runs when the project has no `index.html` entry (e.g. React/Vite).
 */
export function buildProjectBundleHtml(
  files: ProjectFile[],
  title: string,
): string {
  const filesJson = JSON.stringify(files, null, 2);
  const items = files
    .map(
      (f, i) => `
        <details ${i < 2 ? "open" : ""} class="file">
          <summary><span class="path">${esc(f.path)}</span><span class="lang">${esc(f.lang || "")}</span></summary>
          <pre><code>${esc(f.content)}</code></pre>
        </details>`,
    )
    .join("");

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(title)} · Megsy Coder</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; background: #0a0a0a; color: #f5f5f5; }
  header { padding: 32px 24px 16px; border-bottom: 1px solid rgba(255,255,255,.08); display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  header h1 { margin: 0 0 4px; font-size: 22px; font-weight: 800; letter-spacing: -.01em; }
  header p { margin: 0; color: #a3a3a3; font-size: 13px; }
  .brand { display: inline-flex; align-items: center; gap: 8px; font-weight: 700; color: #5B8DEF; }
  .brand .dot { width: 8px; height: 8px; border-radius: 999px; background: #5B8DEF; box-shadow: 0 0 12px #5B8DEF; }
  .actions { display: flex; gap: 8px; }
  .btn { appearance: none; border: 1px solid rgba(255,255,255,.14); background: #111; color: #fff; padding: 8px 14px; border-radius: 999px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; }
  .btn.primary { background: #fff; color: #000; border-color: #fff; }
  main { max-width: 1100px; margin: 0 auto; padding: 24px; display: grid; gap: 12px; }
  .file { background: #111; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; overflow: hidden; }
  .file summary { cursor: pointer; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 13px; }
  .path { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: #f5f5f5; }
  .lang { color: #737373; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; }
  pre { margin: 0; padding: 16px; background: #0a0a0a; overflow-x: auto; border-top: 1px solid rgba(255,255,255,.06); font-size: 12.5px; line-height: 1.55; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: #e5e5e5; }
  footer { text-align: center; padding: 32px 16px; color: #737373; font-size: 12px; }
  footer a { color: #a3a3a3; }
</style>
</head>
<body>
<header>
  <div>
    <div class="brand"><span class="dot"></span>Megsy Coder</div>
    <h1>${esc(title)}</h1>
    <p>${files.length} files · Complete project ready to run locally</p>
  </div>
  <div class="actions">
    <button class="btn primary" id="dl">Download ZIP-JSON</button>
    <a class="btn" href="https://megsy.ai" target="_blank" rel="noopener">Megsy</a>
  </div>
</header>
<main>${items}</main>
<footer>Built with Megsy Coder · Share this link with anyone to view the full project</footer>
<script>
  const files = ${filesJson};
  document.getElementById('dl').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(files, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = ${JSON.stringify(title.replace(/\s+/g, "-").toLowerCase() || "project")} + '.json';
    a.click();
  });
</script>
</body>
</html>`;
}

function randomSlug(): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  return `${t}-${r}`;
}

export interface PublishResult {
  slug: string;
  url: string;
  id: string;
}

/**
 * Compiles the project into a single HTML page, stores it in
 * `generated_sites`, and returns the public share URL.
 */
export async function publishProject(
  files: ProjectFile[],
  opts: { title?: string; prompt?: string } = {},
): Promise<PublishResult> {
  if (!files.length) throw new Error("No files to publish");

  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) throw new Error("Please sign in first to publish");

  const title = (opts.title || "Megsy Project").slice(0, 120);
  // Priority: 1) plain static HTML site (buildProjectPreviewHtml returns non-null
  // only for runnable index.html) → 2) React/Vite project → real in-browser runtime
  // → 3) last-resort: readable file bundle listing.
  const html =
    buildProjectPreviewHtml(files) ||
    (isReactProject(files) ? buildReactRuntimeHtml(files, title) : null) ||
    buildProjectBundleHtml(files, title);

  const slug = randomSlug();
  const publishedUrl = `${window.location.origin}/s/${slug}`;

  const { data, error } = await supabase
    .from("generated_sites")
    .insert({
      user_id: user.id,
      title,
      prompt: (opts.prompt || "").slice(0, 2000),
      jsx_code: "",
      html_compiled: html,
      share_slug: slug,
      is_public: true,
      status: "published",
      files: files as unknown as never,
      published_url: publishedUrl,
      model_used: "megsy-coder",
    })
    .select("id, share_slug")
    .single();

  if (error) throw new Error(error.message || "Failed to publish");

  return {
    id: data.id as string,
    slug: data.share_slug as string,
    url: publishedUrl,
  };
}
