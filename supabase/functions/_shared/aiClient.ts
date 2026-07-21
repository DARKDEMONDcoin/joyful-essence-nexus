/** @doc Fetch wrapper with circuit-breaker + timeout for AI provider HTTP calls. Use instead of raw fetch() in edge functions calling external AI APIs. */

import { withCircuitBreaker, CircuitOpenError } from "./circuitBreaker.ts";

export { CircuitOpenError };

interface CallOptions {
  provider: string; // e.g. "openrouter", "dashscope", "lovable"
  timeoutMs?: number; // default 60_000
  failureThreshold?: number;
  cooldownMs?: number;
}

/**
 * Fetches an external AI endpoint with a per-provider circuit breaker and
 * request timeout. Rejects with CircuitOpenError when the breaker is open —
 * callers should catch that and fall back to another provider.
 *
 * Non-2xx responses count as failures ONLY for 5xx / 429 (server errors and
 * rate-limits). 4xx like 400/401 indicate a bug in the request itself and
 * should not open the breaker.
 */
export async function callAI(
  url: string,
  init: RequestInit,
  opts: CallOptions,
): Promise<Response> {
  const timeoutMs = opts.timeoutMs ?? 60_000;
  return await withCircuitBreaker(
    opts.provider,
    async () => {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), timeoutMs);
      try {
        const res = await fetch(url, { ...init, signal: ctrl.signal });
        if (res.status >= 500 || res.status === 429) {
          const body = await res.clone().text().catch(() => "");
          throw new Error(`Provider ${opts.provider} ${res.status}: ${body.slice(0, 200)}`);
        }
        return res;
      } finally {
        clearTimeout(t);
      }
    },
    { failureThreshold: opts.failureThreshold, cooldownMs: opts.cooldownMs },
  );
}
