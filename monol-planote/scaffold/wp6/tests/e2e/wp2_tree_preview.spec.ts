import { test, expect } from "@playwright/test";

test("Tree loads and preview opens a file", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Loading tree")).toBeVisible();

  // Wait for the tree to load the sample plan file
  await expect(page.getByRole("button", { name: "README.md" })).toBeVisible();

  await page.getByRole("button", { name: "README.md" }).click();

  await expect(page.getByText("Planote sample plan")).toBeVisible();
});
