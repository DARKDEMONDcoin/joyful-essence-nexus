import {
  Suspense,
  cloneElement,
  isValidElement,
  lazy,
  useCallback,
  useMemo,
  useState,
  type ComponentType,
  type ReactElement,
  type ReactNode,
} from "react";

interface Props<P> {
  /** Dynamic import returning the component. */
  load: () => Promise<{ default: ComponentType<P> }>;
  /** Trigger element (e.g. a Button). Interaction handlers are attached to it. */
  trigger: ReactElement;
  /** Props forwarded to the loaded component. */
  componentProps?: P;
  /** Optional Suspense fallback while the chunk downloads. */
  fallback?: ReactNode;
  /** Which events trigger loading (default: hover + focus + click + touch). */
  events?: Array<"hover" | "focus" | "click" | "touch">;
}

/**
 * Loads a component the first time the user shows *intent* to use it.
 * Great for: Emoji pickers, date pickers, color pickers, sharing modals,
 * PDF viewers, video players, code editors — anything heavy that a given
 * user might never open.
 *
 * The trigger element renders immediately (zero cost). On the first hover /
 * focus / touchstart the chunk starts downloading; on click the component
 * mounts. If the click happens before the chunk arrives, Suspense fallback
 * shows briefly.
 */
export function LazyOnInteraction<P extends object>({
  load,
  trigger,
  componentProps,
  fallback = null,
  events = ["hover", "focus", "click", "touch"],
}: Props<P>) {
  const [mounted, setMounted] = useState(false);
  const [importStarted, setImportStarted] = useState(false);

  const Loaded = useMemo(() => lazy(load), [load]);

  const startImport = useCallback(() => {
    if (importStarted) return;
    setImportStarted(true);
    // Kick the network request now; React.lazy caches the promise.
    load().catch(() => void 0);
  }, [importStarted, load]);

  const mount = useCallback(() => {
    startImport();
    setMounted(true);
  }, [startImport]);

  const trig = isValidElement(trigger)
    ? cloneElement(trigger, {
        ...(events.includes("hover") && {
          onMouseEnter: (e: unknown) => {
            startImport();
            (trigger.props as any).onMouseEnter?.(e);
          },
        }),
        ...(events.includes("focus") && {
          onFocus: (e: unknown) => {
            startImport();
            (trigger.props as any).onFocus?.(e);
          },
        }),
        ...(events.includes("touch") && {
          onTouchStart: (e: unknown) => {
            startImport();
            (trigger.props as any).onTouchStart?.(e);
          },
        }),
        ...(events.includes("click") && {
          onClick: (e: unknown) => {
            mount();
            (trigger.props as any).onClick?.(e);
          },
        }),
      } as Record<string, unknown>)
    : trigger;

  return (
    <>
      {trig}
      {mounted && (
        <Suspense fallback={fallback}>
          <Loaded {...(componentProps as P)} />
        </Suspense>
      )}
    </>
  );
}
