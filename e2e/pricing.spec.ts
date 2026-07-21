/** @doc Smoke test — pricing page and billing toggle work. */
import { test, expect } from "@playwright/test";

test.describe("pricing page", () => {
  test("loads and shows plans", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page).toHaveTitle(/pricing|price|megsy/i);
    // Should render at least one price string with currency
    await expect(page.locator("body")).toContainText(/\$|USD|EGP|EUR/);
  });

  test("billing toggle switches state", async ({ page }) => {
    await page.goto("/pricing");
    const toggle = page.getByRole("switch");
    await expect(toggle.first()).toBeVisible();
    const initial = await toggle.first().getAttribute("aria-checked");
    await toggle.first().click();
    const after = await toggle.first().getAttribute("aria-checked");
    expect(after).not.toBe(initial);
  });
});
