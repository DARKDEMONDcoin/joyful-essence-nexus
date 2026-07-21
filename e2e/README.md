# E2E Smoke Tests (Playwright)

Fast smoke checks against the running app. Not a full regression suite —
covers landing, pricing, and status pages plus core a11y (skip link, ARIA toggle).

## Run locally

```bash
# Auto-starts `bun run dev` on :8080
bun run test:e2e

# Interactive UI mode
bun run test:e2e:ui

# Against an already-running server (skips webServer)
E2E_BASE_URL=http://localhost:8080 bun run test:e2e
```

First run downloads Chromium:

```bash
bunx playwright install chromium
```

## CI

- Set `CI=1` to enable retries + GitHub reporter.
- Point `E2E_BASE_URL` to a preview deployment to skip the local dev server.

## Files

- `landing.spec.ts` — hero renders, skip-to-content focusable, no critical console errors
- `pricing.spec.ts` — plans render, billing toggle switches `aria-checked`
- `status.spec.ts` — `/status` renders operational/degraded/outage copy
