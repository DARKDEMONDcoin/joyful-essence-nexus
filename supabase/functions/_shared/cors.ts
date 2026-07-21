// Shared CORS headers for all edge functions.
// Use `corsHeaders` for the standard POST/OPTIONS contract, or
// `buildCors({ methods, extraHeaders })` for endpoints that need GET/PUT/DELETE
// or custom request headers (e.g. x-api-key).

export const STANDARD_ALLOW_HEADERS =
  "authorization, x-client-info, apikey, content-type, x-anon-fingerprint, x-retry-count";

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

export const jsonResponse = (
  body: unknown,
  status = 200,
  headers: Record<string, string> = corsHeaders,
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
