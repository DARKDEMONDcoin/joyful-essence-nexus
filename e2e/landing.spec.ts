/** @doc Smoke test — landing page renders and key sections are visible. */
import { test, expect } from "@playwright/test";

test.describe("landing page", () => {
  test("loads with hero + navbar", async ({ page }) => {
    await page.goto("/");
    // Main landmark exists (from LandingPage <main id="main">)
    await expect(page.locator("#main")).toBeVisible();
    // Some form of primary CTA / auth link should exist
    const authLinks = page.locator('a[href*="/auth"]');
    await expect(authLinks.first()).toBeVisible({ timeout: 10_000 });
  });

  test("skip-to-content link is reachable via keyboard", async ({ page, isMobile }) => {
    test.skip(isMobile, "Skip link is desktop-only");
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: /skip to main content/i });
    await expect(skip).toBeFocused();
  });

  test("has no critical console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
    // Filter noise from 3rd-party analytics / hydration warnings
    const critical = errors.filter(
      (e) => !/analytics|hydrat|Failed to load resource|network|CORS|favicon/i.test(e),
    );
    expect(critical, `Unexpected errors: ${critical.join("\n")}`).toHaveLength(0);
  });
});
