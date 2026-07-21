/**
 * @doc lazyOnIntent — load a component's chunk only when the user shows
 * intent to use it (hover / focus / touchstart on a trigger). Facebook-style
 * interaction-based code-splitting. The chunk is fetched once and cached.
 */
import { lazy, useEffect, useState, type ComponentType } from "react";
import { lazyWithRetry } from "@/lib/lazyWithRetry";

type Factory<T extends ComponentType<any>> = () => Promise<{ default: T }>;

const cache = new WeakMap<Factory<any>, Promise<unknown>>();

export function preload<T extends ComponentType<any>>(factory: Factory<T>): Promise<unknown> {
  const hit = cache.get(factory);
  if (hit) return hit;
  const p = factory().catch(() => undefined);
  cache.set(factory, p);
  return p;
}

/** Returns hover/focus/touch handlers that preload the chunk on first intent. */
export function intentHandlers<T extends ComponentType<any>>(factory: Factory<T>) {
  const trigger = () => {
    void preload(factory);
  };
  return {
    onMouseEnter: trigger,
    onFocus: trigger,
    onTouchStart: trigger,
    onPointerDown: trigger,
  } as const;
}

/** Wraps React.lazy with retry + exposes a `.preload()` method. */
export function lazyIntent<T extends ComponentType<any>>(factory: Factory<T>) {
  const Comp = lazyWithRetry(factory) as ReturnType<typeof lazy<T>> & {
    preload: () => Promise<unknown>;
  };
  Comp.preload = () => preload(factory);
  return Comp;
}

/** Hook: only start loading the module after `active` flips true. */
export function useLazyModule<M>(
  factory: () => Promise<M>,
  active: boolean,
): M | null {
  const [mod, setMod] = useState<M | null>(null);
  useEffect(() => {
    if (!active || mod) return;
    let cancelled = false;
    factory().then((m) => {
      if (!cancelled) setMod(m);
    }).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [active, mod, factory]);
  return mod;
}
