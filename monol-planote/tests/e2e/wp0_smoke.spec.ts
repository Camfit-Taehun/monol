import { test, expect } from "@playwright/test";

test("UI loads", async ({ page }) => {
  await page.goto("/");
  // Tree should start loading
  await expect(page.getByText("Loading tree")).toBeVisible();
});
