import { test, expect } from "@playwright/test";

test("UI loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Planote" })).toBeVisible();
});
