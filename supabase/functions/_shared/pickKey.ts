/** @doc Shared key-rotation helper: picks the least-recently-used active YEP/Apify/etc. key from the `api_keys` table and marks errors/blocks. Used by every chat/media edge function. */
import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

export interface ApiKeyRow {
  id: string;
  service: string;
  api_key: string;
  label: string | null;
  is_active: boolean;
  is_blocked: boolean;
  usage_count: number;
  error_count: number;
  credit_used_usd: number | null;
  credit_limit_usd: number | null;
  last_used_at: string | null;
  provider_meta: Record<string, unknown> | null;
  cooldown_until?: string | null;
}

/**
 * Picks the next active key for a given service.
 * - excludes blocked keys
 * - excludes keys that hit their credit limit
 * - orders by least-recently-used so traffic spreads across keys
 */
export async function pickActiveKey(service: string): Promise<ApiKeyRow> {
  const { data: rows, error } = await supabaseAdmin
    .from("api_keys")
    .select("*")
    .eq("service", service)
    .eq("is_active", true)
    .eq("is_blocked", false)
    .order("last_used_at", { ascending: true, nullsFirst: true })
    .limit(20);

  if (error) throw new Error(`pickActiveKey(${service}): ${error.message}`);
  const now = Date.now();
  const data = (rows ?? []).find((r: any) => {
    // Skip keys parked on cooldown (e.g. after a 429 daily-quota hit).
    if (r.cooldown_until && new Date(r.cooldown_until).getTime() > now) return false;
    if (r.credit_limit_usd != null && Number(r.credit_used_usd ?? 0) >= Number(r.credit_limit_usd)) return false;
    return true;
  });
  if (!data) throw new Error(`No active key available for service "${service}"`);

  // Touch last_used_at so the next call rotates to another key.
  await supabaseAdmin
    .from("api_keys")
    .update({
      last_used_at: new Date().toISOString(),
      usage_count: (data.usage_count ?? 0) + 1,
    })
    .eq("id", data.id);

  return data as ApiKeyRow;
}

/**
 * Music providers often return very short endpoint-level 429s. For interactive
 * UX, wait for a near cooldown to expire instead of immediately failing with
 * "No active key" when the key pool only has one usable key.
 */
export async function pickActiveKeyWaiting(
  service: string,
  opts: { maxWaitMs?: number } = {},
): Promise<ApiKeyRow> {
  try {
    return await pickActiveKey(service);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!/No active key available/i.test(msg)) throw err;
  }

  const { data: rows, error } = await supabaseAdmin
    .from("api_keys")
    .select("*")
    .eq("service", service)
    .eq("is_active", true)
    .eq("is_blocked", false)
    .order("cooldown_until", { ascending: true, nullsFirst: false })
    .limit(10);
  if (error) throw new Error(`pickActiveKeyWaiting(${service}): ${error.message}`);

  const now = Date.now();
  const maxWaitMs = opts.maxWaitMs ?? 75_000;
  const row = (rows ?? []).find((r: any) => {
    if (!r.cooldown_until) return false;
    const waitMs = new Date(r.cooldown_until).getTime() - now;
    if (waitMs < 0 || waitMs > maxWaitMs) return false;
    if (r.credit_limit_usd != null && Number(r.credit_used_usd ?? 0) >= Number(r.credit_limit_usd)) return false;
    return true;
  });
  if (!row) throw new Error(`No active key available for service "${service}"`);

  const waitMs = Math.max(0, new Date(row.cooldown_until!).getTime() - Date.now() + 250);
  if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs));
  return await pickActiveKey(service);
}

/** Return an id-specific key row (used when polling a job submitted with a specific key). */
export async function getKeyById(id: string): Promise<ApiKeyRow | null> {
  const { data } = await supabaseAdmin
    .from("api_keys")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data ?? null) as ApiKeyRow | null;
}

/**
 * Park a key on cooldown until a given UTC instant (default: next 00:00 UTC).
 * Used when a provider signals a daily-quota rate limit (e.g. deapi 429
 * "Too Many Attempts") — the key becomes available again after reset.
 */
export async function putKeyOnCooldown(
  id: string,
  reason: string,
  untilIso?: string,
): Promise<void> {
  const until = untilIso ?? nextUtcMidnightIso();
  await supabaseAdmin
    .from("api_keys")
    .update({
      cooldown_until: until,
      last_error_at: new Date().toISOString(),
      block_reason: reason.slice(0, 500),
    })
    .eq("id", id);
}

function nextUtcMidnightIso(): string {
  const d = new Date();
  d.setUTCHours(24, 0, 0, 0); // next 00:00 UTC
  return d.toISOString();
}

/** Mark a key as errored. Pass `block=true` for auth/credit failures (401, 402, 403). */
export async function markKeyError(
  id: string,
  reason: string,
  block = false,
): Promise<void> {
  const patch: Record<string, unknown> = {
    last_error_at: new Date().toISOString(),
  };
  if (block) {
    patch.is_blocked = true;
    patch.block_reason = reason.slice(0, 500);
  }
  // increment error_count via RPC-less pattern
  const { data: row } = await supabaseAdmin
    .from("api_keys")
    .select("error_count")
    .eq("id", id)
    .maybeSingle();
  patch.error_count = (row?.error_count ?? 0) + 1;

  await supabaseAdmin.from("api_keys").update(patch).eq("id", id);
}

/** Add to the credit_used_usd counter (best-effort). */
export async function addKeyUsageCost(id: string, costUsd: number): Promise<void> {
  if (!costUsd || costUsd <= 0) return;
  const { data: row } = await supabaseAdmin
    .from("api_keys")
    .select("credit_used_usd")
    .eq("id", id)
    .maybeSingle();
  const next = Number(row?.credit_used_usd ?? 0) + costUsd;
  await supabaseAdmin.from("api_keys").update({ credit_used_usd: next }).eq("id", id);
}

/**
 * Calls an async fn with a fresh key, and automatically rotates+retries
 * (up to `maxAttempts`) when the fn throws an auth/quota error.
 */
export async function withKeyRotation<T>(
  service: string,
  fn: (key: ApiKeyRow) => Promise<T>,
  opts: { maxAttempts?: number } = {},
): Promise<T> {
  const max = opts.maxAttempts ?? 3;
  let lastErr: unknown;
  for (let attempt = 0; attempt < max; attempt++) {
    const key = await pickActiveKeyWaiting(service, { maxWaitMs: 75_000 });
    try {
      return await fn(key);
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isAuth = /\b(401|402|403|invalid[_\s-]?key|unauthor)\b/i.test(msg);
      // 429 / daily quota / "too many attempts" → park until next UTC midnight,
      // then retry with the next key. This is the "move to another day" behavior.
      const isRateLimit = /\b(429|too\s*many|rate[_\s-]?limit|quota|exceeded)\b/i.test(msg);
      if (isRateLimit) {
        const isDailyLimit = /\b(daily|rpd|quota|exceeded)\b/i.test(msg);
        const until = isDailyLimit ? undefined : new Date(Date.now() + 65_000).toISOString();
        await putKeyOnCooldown(key.id, msg, until);
      } else {
        await markKeyError(key.id, msg, isAuth);
      }
      if (!isAuth && !isRateLimit) throw err; // non-recoverable
    }
  }
  throw lastErr ?? new Error(`withKeyRotation(${service}): exhausted`);
}
