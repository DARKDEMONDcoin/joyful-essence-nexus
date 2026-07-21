import { rewrite } from "@vercel/functions";

export const config = {
  // Run before Vercel's static file handler for every real app page, but never
  // for APIs, generated assets, Vercel internals, or files with extensions.
  matcher: ["/((?!api/|assets/|_vercel/|.*\\..*).*)"],
};

const FILE_REQUEST_RE = /\.[a-zA-Z0-9]+$/;

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const { pathname } = url;

  if (request.method !== "GET" && request.method !== "HEAD") return;
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/_vercel/") ||
    FILE_REQUEST_RE.test(pathname)
  ) {
    return;
  }

  return rewrite(new URL("/index.html", request.url));
}