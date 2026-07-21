/** @doc In-memory circuit breaker for AI provider calls. Opens after N failures, half-opens after cooldown to probe recovery. */

type State = "closed" | "open" | "half-open";

interface Breaker {
  state: State;
  failures: number;
  openedAt: number;
  successesInHalfOpen: number;
}

interface Options {
  failureThreshold?: number; // consecutive failures to open
  cooldownMs?: number; // time before half-open probe
  halfOpenSuccesses?: number; // successes needed to close from half-open
}

const breakers = new Map<string, Breaker>();

const DEFAULTS: Required<Options> = {
  failureThreshold: 5,
  cooldownMs: 30_000,
  halfOpenSuccesses: 2,
};

function getBreaker(key: string): Breaker {
  let b = breakers.get(key);
  if (!b) {
    b = { state: "closed", failures: 0, openedAt: 0, successesInHalfOpen: 0 };
    breakers.set(key, b);
  }
  return b;
}

export class CircuitOpenError extends Error {
  constructor(public provider: string, public retryAfterMs: number) {
    super(`Circuit open for provider "${provider}". Retry in ${Math.ceil(retryAfterMs / 1000)}s.`);
    this.name = "CircuitOpenError";
  }
}

/**
 * Wraps a provider call with circuit-breaker protection.
 * Throws CircuitOpenError immediately when the circuit is open, letting the
 * caller fall back to another provider instead of hanging on timeouts.
 */
export async function withCircuitBreaker<T>(
  provider: string,
  fn: () => Promise<T>,
  opts: Options = {},
): Promise<T> {
  const cfg = { ...DEFAULTS, ...opts };
  const b = getBreaker(provider);

  // Check open → half-open transition
  if (b.state === "open") {
    const elapsed = Date.now() - b.openedAt;
    if (elapsed < cfg.cooldownMs) {
      throw new CircuitOpenError(provider, cfg.cooldownMs - elapsed);
    }
    b.state = "half-open";
    b.successesInHalfOpen = 0;
  }

  try {
    const result = await fn();
    // Success handling
    if (b.state === "half-open") {
      b.successesInHalfOpen += 1;
      if (b.successesInHalfOpen >= cfg.halfOpenSuccesses) {
        b.state = "closed";
        b.failures = 0;
      }
    } else {
      b.failures = 0;
    }
    return result;
  } catch (err) {
    b.failures += 1;
    if (b.state === "half-open" || b.failures >= cfg.failureThreshold) {
      b.state = "open";
      b.openedAt = Date.now();
    }
    throw err;
  }
}

/** For observability / /status endpoint */
export function getBreakerSnapshot() {
  const out: Record<string, { state: State; failures: number }> = {};
  for (const [k, v] of breakers) out[k] = { state: v.state, failures: v.failures };
  return out;
}

/** Test/emergency reset */
export function resetBreaker(provider?: string) {
  if (provider) breakers.delete(provider);
  else breakers.clear();
}
