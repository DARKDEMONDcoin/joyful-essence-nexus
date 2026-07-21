#!/usr/bin/env node
/**
 * Mobile-first performance audit for the main app routes.
 *
 * Usage:
 *   node scripts/perf-audit.mjs           # uses http://localhost:8080
 *   BASE=https://megsyai.com node scripts/perf-audit.mjs
 *
 * Requires Playwright Chromium. Install once:
 *   bunx playwright install chromium
 */
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE || "http://localhost:8080";

// Only the "main" app pages — chat, media, code, settings, auth, billing.
// Public / marketing landing routes are intentionally excluded.
const ROUTES = [
  "/",
  "/chat",
  "/media",
  "/media/gallery",
  "/code",
  "/auth",
  "/reset-password",
  "/settings/profile",
  "/settings/security",
  "/settings/notifications",
  "/settings/language",
  "/settings/memory",
  "/settings/privacy",
  "/billing",
];

// Budgets — fail the run if any route exceeds these on a throttled mobile.
const BUDGET = {
  fcpMs: 3500,
  domMs: 5000,
  totalKb: 1500,
};

async function measure(page, url) {
  const start = Date.now();
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  } catch (e) {
    return { error: String(e).slice(0, 120) };
  }
  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] || {};
    const paints = Object.fromEntries(
      performance.getEntriesByType("paint").map((p) => [p.name, p.startTime]),
    );
    const res = performance.getEntriesByType("resource");
    const totalBytes = res.reduce((s, r) => s + (r.transferSize || 0), 0);
    return {
      dom: Math.round(nav.domContentLoadedEventEnd || 0),
      fcp: Math.round(paints["first-contentful-paint"] || 0),
      jsRequests: res.filter((r) => /\.js(\?|$)/.test(r.name)).length,
      cssRequests: res.filter((r) => /\.css(\?|$)/.test(r.name)).length,
      totalKb: Math.round(totalBytes / 1024),
    };
  });
  metrics.wallMs = Date.now() - start;
  return metrics;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.new_context
    ? await browser.new_context({ viewport: { width: 390, height: 844 } })
    : await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  // Throttle CPU 4x to approximate a low-end mobile device.
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  const results = {};
  const failures = [];
  for (const route of ROUTES) {
    await page.goto("about:blank");
    const m = await measure(page, `${BASE}${route}`);
    results[route] = m;
    if (m.error) {
      console.log(`✗ ${route}  ${m.error}`);
      failures.push(`${route}: ${m.error}`);
      continue;
    }
    const flags = [];
    if (m.fcp > BUDGET.fcpMs) flags.push(`FCP>${BUDGET.fcpMs}`);
    if (m.dom > BUDGET.domMs) flags.push(`DOM>${BUDGET.domMs}`);
    if (m.totalKb > BUDGET.totalKb) flags.push(`KB>${BUDGET.totalKb}`);
    const mark = flags.length ? "✗" : "✓";
    console.log(
      `${mark} ${route.padEnd(28)} FCP=${m.fcp}ms DOM=${m.dom}ms KB=${m.totalKb} JS=${m.jsRequests} CSS=${m.cssRequests}${flags.length ? "  [" + flags.join(",") + "]" : ""}`,
    );
    if (flags.length) failures.push(`${route}: ${flags.join(", ")}`);
  }

  fs.mkdirSync("./perf-reports", { recursive: true });
  fs.writeFileSync(
    `./perf-reports/audit-${Date.now()}.json`,
    JSON.stringify({ base: BASE, budget: BUDGET, results }, null, 2),
  );

  await browser.close();
  if (failures.length) {
    console.error(`\n${failures.length} route(s) over budget:\n  - ${failures.join("\n  - ")}`);
    process.exit(1);
  }
  console.log("\nAll routes within budget ✓");
})();
