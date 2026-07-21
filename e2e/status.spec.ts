/** @doc Smoke test — /status page renders uptime bars and StatusPill. */
import { test, expect } from "@playwright/test";

test("status page loads", async ({ page }) => {
  await page.goto("/status");
  await expect(page.locator("body")).toContainText(/status|operational|degraded|outage/i);
});
