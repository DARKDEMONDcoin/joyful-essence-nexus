/** @doc Live FX rate — fetches USD→EGP from open.er-api.com (open source, keyless, MIT). Cached in-memory for 6h. */
import { createServerFn } from "@tanstack/react-start";

type Cached = { rate: number; fetchedAt: number };
let cache: Cached | null = null;
const TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const FALLBACK_RATE = 49.13;

export const getUsdToEgpRate = createServerFn({ method: "GET" }).handler(async () => {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < TTL_MS) {
    return { rate: cache.rate, fetchedAt: cache.fetchedAt, source: "open.er-api.com", cached: true };
  }
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { rates?: Record<string, number>; result?: string };
    const rate = Number(data?.rates?.EGP);
    if (data?.result !== "success" || !Number.isFinite(rate) || rate <= 0) {
      throw new Error("Invalid FX payload");
    }
    cache = { rate, fetchedAt: now };
    return { rate, fetchedAt: now, source: "open.er-api.com", cached: false };
  } catch (err) {
    // Fall back to the last known good rate (cache) or a static fallback so
    // pricing UI never breaks if the FX provider is temporarily unreachable.
    if (cache) return { rate: cache.rate, fetchedAt: cache.fetchedAt, source: "open.er-api.com", cached: true, stale: true };
    return { rate: FALLBACK_RATE, fetchedAt: now, source: "fallback", cached: false, error: (err as Error).message };
  }
});
