import { test, expect } from "@playwright/test";

test("Can create an annotation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "README.md" })).toBeVisible();
  await page.getByRole("button", { name: "README.md" }).click();

  await expect(page.getByRole("heading", { name: "Annotations" })).toBeVisible();

  await page.getByPlaceholder("Title").fill("Test annotation");
  await page.getByRole("button", { name: "Add" }).click();

  await expect(page.getByText("Test annotation")).toBeVisible();
});
