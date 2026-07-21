/** @doc Client-side promo unlock helper — grants "unlimited this month" flag when a user visits a special /promo/:code link. */

const STORAGE_KEY = "megsy_promo_unlock_v1";

export interface PromoUnlock {
  code: string;
  claimedAt: number;
  expiresAt: number;
  discountPct: number;
  unlimited: boolean;
}

function endOfCurrentMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0).getTime();
}

export function readPromoUnlock(): PromoUnlock | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PromoUnlock;
    if (!parsed?.expiresAt || parsed.expiresAt < Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function grantPromoUnlock(code: string): PromoUnlock {
  const unlock: PromoUnlock = {
    code,
    claimedAt: Date.now(),
    expiresAt: endOfCurrentMonth(),
    discountPct: 50,
    unlimited: true,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlock));
    window.dispatchEvent(new CustomEvent("megsy:promo-unlock", { detail: unlock }));
  } catch {
    /* ignore */
  }
  return unlock;
}

export function isPromoUnlocked(): boolean {
  return !!readPromoUnlock()?.unlimited;
}
