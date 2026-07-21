/**
 * Lightweight retry with exponential backoff. Defaults are conservative
 * (2 retries, ~300ms then ~900ms) so transient blips recover without
 * making real failures slow to surface.
 */

export type RetryOptions = {
  retries?: number;
  baseMs?: number;
  factor?: number;
  shouldRetry?: (err: unknown, attempt: number) => boolean;
  onRetry?: (err: unknown, attempt: number) => void;
};

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const { retries = 2, baseMs = 300, factor = 3, shouldRetry = isTransientError, onRetry } = opts;
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries || !shouldRetry(err, attempt)) throw err;
      onRetry?.(err, attempt);
      await sleep(baseMs * Math.pow(factor, attempt));
      attempt += 1;
    }
  }
}

/** Detect errors worth retrying — network blips, 5xx, timeouts. */
export function isTransientError(err: unknown): boolean {
  if (!err) return false;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return true;
  const e = err as { name?: string; message?: string; status?: number; code?: string };
  if (e.name === "AbortError") return false;
  if (e.name === "TypeError" && /fetch|network/i.test(e.message ?? "")) return true;
  if (e.code && /ETIMEDOUT|ECONNRESET|ENETUNREACH|EAI_AGAIN/.test(e.code)) return true;
  if (typeof e.status === "number" && (e.status === 408 || e.status === 429 || e.status >= 500))
    return true;
  if (typeof e.message === "string" && /network|timeout|fetch failed/i.test(e.message)) return true;
  return false;
}
