// Shared CORS headers for all edge functions.
//
// Two APIs:
//  - `corsHeaders` / `buildCors(...)`     → static, wildcard origin. Kept for
//    backward compatibility with existing functions that already ship.
//  - `resolveCors(req, opts?)`            → origin-aware allowlist. Preferred
//    for new/sensitive functions. Reflects the request Origin only if it
//    matches the allowlist; otherwise omits Allow-Origin so browsers block.
//
// Allowlist sources (in order):
//   1. `opts.allowedOrigins` (per-call override)
//   2. `EXTRA_ALLOWED_ORIGINS` env var (comma-separated)
//   3. Built-in Lovable preview + production defaults
//
// Requests without an `Origin` header (server-to-server, webhooks, curl) are
// allowed through with no CORS headers — browsers are the only clients that
// enforce CORS, so this doesn't weaken webhook auth (which must still verify
// signatures independently).

export const STANDARD_ALLOW_HEADERS =
  "authorization, x-client-info, apikey, content-type, x-anon-fingerprint, x-retry-count";

const DEFAULT_ALLOWED_ORIGIN_PATTERNS: RegExp[] = [
  // Lovable preview + published domains
  /^https:\/\/([a-z0-9-]+\.)*lovable\.app$/i,
  /^https:\/\/([a-z0-9-]+\.)*lovableproject\.com$/i,
  /^https:\/\/([a-z0-9-]+\.)*lovableproject-dev\.com$/i,
  /^https:\/\/([a-z0-9-]+\.)*lovable\.dev$/i,
  // Custom production domains
  /^https:\/\/([a-z0-9-]+\.)?megsyai\.com$/i,
  // Localhost dev
  /^http:\/\/localhost(:\d+)?$/i,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/i,
];

function readExtraOrigins(): string[] {
  try {
    // deno-lint-ignore no-explicit-any
    const env = (globalThis as any).Deno?.env?.get?.("EXTRA_ALLOWED_ORIGINS");
    if (!env) return [];
    return String(env)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function isOriginAllowed(
  origin: string | null,
  extra: (string | RegExp)[] = [],
): boolean {
  if (!origin) return false;
  const extras = [...readExtraOrigins(), ...extra];
  for (const rule of extras) {
    if (typeof rule === "string" && rule === origin) return true;
    if (rule instanceof RegExp && rule.test(origin)) return true;
  }
  return DEFAULT_ALLOWED_ORIGIN_PATTERNS.some((rx) => rx.test(origin));
}

// Backward-compatible static wildcard headers.
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": STANDARD_ALLOW_HEADERS,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
} as const;

export function buildCors(opts: { methods?: string; extraHeaders?: string } = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": opts.extraHeaders
      ? `${STANDARD_ALLOW_HEADERS}, ${opts.extraHeaders}`
      : STANDARD_ALLOW_HEADERS,
    "Access-Control-Allow-Methods": opts.methods ?? "POST, OPTIONS",
  };
}

/**
 * Origin-aware CORS headers. Reflects `Origin` only when allowlisted.
 * For non-browser callers (no Origin header), returns an empty object —
 * CORS is irrelevant; auth/signature checks are what protect the endpoint.
 */
export function resolveCors(
  req: Request,
  opts: {
    methods?: string;
    extraHeaders?: string;
    allowedOrigins?: (string | RegExp)[];
    allowCredentials?: boolean;
  } = {},
): Record<string, string> {
  const origin = req.headers.get("origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": opts.extraHeaders
      ? `${STANDARD_ALLOW_HEADERS}, ${opts.extraHeaders}`
      : STANDARD_ALLOW_HEADERS,
    "Access-Control-Allow-Methods": opts.methods ?? "POST, OPTIONS",
    Vary: "Origin",
  };
  if (origin && isOriginAllowed(origin, opts.allowedOrigins)) {
    headers["Access-Control-Allow-Origin"] = origin;
    if (opts.allowCredentials) {
      headers["Access-Control-Allow-Credentials"] = "true";
    }
  }
  return headers;
}

export const jsonResponse = (
  body: unknown,
  status = 200,
  headers: Record<string, string> = corsHeaders,
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
