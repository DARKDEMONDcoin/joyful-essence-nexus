/** @doc Shared rate-limit + audit helpers for edge functions.
 *  Uses the `check_edge_rate_limit` SQL RPC (atomic, fixed-window).
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

export interface RateLimitOptions {
  endpoint: string;
  limit: number;
  windowSeconds: number;
  /** Falls back to IP hash when user is anonymous */
  identifier?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: string;
  identifier: string;
}

function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

async function hashIp(ip: string): Promise<string> {
  const salt = Deno.env.get("EDGE_IP_SALT") ?? "megsy-default-salt";
  const buf = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "0.0.0.0";
}

export async function resolveUserId(req: Request): Promise<string | null> {
  const auth = req.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  const anon = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";
  if (!token || token === anon) return null;
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const r = await fetch(`${url}/auth/v1/user`, {
      headers: { apikey: anon, Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return null;
    const u = await r.json();
    return u?.id ?? null;
  } catch {
    return null;
  }
}

export async function checkRateLimit(
  req: Request,
  opts: RateLimitOptions,
): Promise<RateLimitResult> {
  let identifier = opts.identifier;
  if (!identifier) {
    const uid = await resolveUserId(req);
    identifier = uid ? `u:${uid}` : `ip:${await hashIp(clientIp(req))}`;
  }
  const supa = admin();
  const { data, error } = await supa.rpc("check_edge_rate_limit", {
    _identifier: identifier,
    _endpoint: opts.endpoint,
    _limit: opts.limit,
    _window_seconds: opts.windowSeconds,
  });
  if (error) {
    // Fail-open on infrastructure error, but log
    console.error("[rateLimit] rpc failed", error);
    return {
      allowed: true,
      remaining: opts.limit,
      resetAt: new Date(Date.now() + opts.windowSeconds * 1000).toISOString(),
      identifier,
    };
  }
  const row = Array.isArray(data) ? data[0] : data;
  return {
    allowed: !!row?.allowed,
    remaining: Number(row?.remaining ?? 0),
    resetAt: row?.reset_at ?? new Date().toISOString(),
    identifier,
  };
}

export function rateLimitResponse(
  result: RateLimitResult,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(
    JSON.stringify({
      error: "rate_limit_exceeded",
      message: "Too many requests. Try again shortly.",
      retry_at: result.resetAt,
    }),
    {
      status: 429,
      headers: {
        ...extraHeaders,
        "Content-Type": "application/json",
        "Retry-After": String(
          Math.max(1, Math.ceil((new Date(result.resetAt).getTime() - Date.now()) / 1000)),
        ),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": result.resetAt,
      },
    },
  );
}

export async function auditLog(params: {
  endpoint: string;
  action: string;
  status?: number;
  userId?: string | null;
  req?: Request;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const supa = admin();
    const ip = params.req ? await hashIp(clientIp(params.req)) : null;
    const ua = params.req?.headers.get("user-agent") ?? null;
    await supa.from("edge_audit_log").insert({
      endpoint: params.endpoint,
      action: params.action,
      status: params.status ?? null,
      user_id: params.userId ?? null,
      ip_hash: ip,
      user_agent: ua?.slice(0, 500) ?? null,
      metadata: params.metadata ?? {},
    });
  } catch (e) {
    console.error("[auditLog] failed", e);
  }
}

/** Validate URL is safe to fetch (SSRF guard). Blocks private/loopback/metadata ranges. */
export function assertSafeUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Invalid URL");
  }
  if (!/^https?:$/.test(url.protocol)) throw new Error("Only http(s) URLs allowed");
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "0.0.0.0" ||
    host.endsWith(".localhost") ||
    host.endsWith(".internal") ||
    host === "metadata.google.internal"
  ) {
    throw new Error("Blocked host");
  }
  // Block RFC1918 / loopback / link-local when host is an IP literal
  const ipMatch = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipMatch) {
    const [a, b] = [parseInt(ipMatch[1]), parseInt(ipMatch[2])];
    if (
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a === 0 ||
      a >= 224
    ) {
      throw new Error("Blocked IP range");
    }
  }
  // Block IPv6 loopback/link-local
  if (host.includes(":")) {
    if (host === "::1" || host.startsWith("fe80:") || host.startsWith("fc") || host.startsWith("fd")) {
      throw new Error("Blocked IPv6 range");
    }
  }
  return url;
}
