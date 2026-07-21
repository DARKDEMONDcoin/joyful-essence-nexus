/**
 * Fails the build if any internal href in DocsPage points to a route
 * that doesn't exist in App.tsx. External (http/https/mailto) and
 * anchor (#...) links are skipped.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

function extractRoutes(appSrc: string): Set<string> {
  const routes = new Set<string>();
  // Match: path="/foo" or path="/foo/:bar"
  const re = /path="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(appSrc))) {
    let p = m[1].trim();
    if (!p.startsWith("/")) continue;
    // Strip dynamic params and trailing slash.
    p = p.replace(/\/:[^/]+/g, "").replace(/\/$/, "") || "/";
    routes.add(p);
  }
  // Common implicit entries we always allow.
  routes.add("/");
  return routes;
}

function extractDocsHrefs(docsSrc: string): string[] {
  const hrefs = new Set<string>();
  const re = /href:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(docsSrc))) hrefs.add(m[1]);
  // Also catch <Link to="..."> if present in the file.
  const toRe = /to="(\/[^"]+)"/g;
  while ((m = toRe.exec(docsSrc))) hrefs.add(m[1]);
  return [...hrefs];
}

describe("docs internal links", () => {
  it("every internal href in DocsPage resolves to a real route", () => {
    const appSrc = readFileSync(join(ROOT, "src/App.tsx"), "utf8");
    const docsSrc = readFileSync(join(ROOT, "src/pages/marketing/DocsPage.tsx"), "utf8");
    const routes = extractRoutes(appSrc);
    const hrefs = extractDocsHrefs(docsSrc).filter((h) => h.startsWith("/") && !h.startsWith("//"));
    const broken = hrefs.filter((h) => {
      // Drop query / hash before lookup.
      const path = h.split(/[?#]/)[0].replace(/\/$/, "") || "/";
      // Allow sub-paths of dynamic routes (e.g. /docs/foo, /blog/some-slug).
      if (routes.has(path)) return true ? false : true;
      const head = "/" + path.split("/").filter(Boolean)[0];
      if (routes.has(head)) return false;
      return true;
    });
    expect(
      broken,
      `Broken internal links in DocsPage (route missing in App.tsx):\n  ${broken.join("\n  ")}`,
    ).toEqual([]);
  });
});
