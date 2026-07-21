/** @doc Optional Sentry error monitoring. No-op when VITE_SENTRY_DSN is not set. */
import * as Sentry from "@sentry/react";

let initialized = false;

export function initSentry() {
  if (initialized) return;
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return; // silently disabled — Sentry is optional
  try {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 1.0,
      // Never send known noise
      ignoreErrors: [
        "ResizeObserver loop completed with undelivered notifications",
        "ResizeObserver loop limit exceeded",
        "Non-Error promise rejection captured",
        /Loading chunk \d+ failed/i,
        /Failed to fetch dynamically imported module/i,
      ],
      beforeSend(event) {
        // Strip potential PII from URLs/query strings
        if (event.request?.url) {
          try {
            const url = new URL(event.request.url);
            for (const key of ["email", "token", "code", "access_token"]) {
              if (url.searchParams.has(key)) url.searchParams.set(key, "[redacted]");
            }
            event.request.url = url.toString();
          } catch {
            /* ignore */
          }
        }
        return event;
      },
    });
    initialized = true;
  } catch {
    /* ignore — never let Sentry break the app */
  }
}

export function captureAppError(err: unknown, context?: Record<string, unknown>) {
  if (!initialized) return;
  try {
    Sentry.captureException(err, context ? { extra: context } : undefined);
  } catch {
    /* ignore */
  }
}
