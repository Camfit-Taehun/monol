import { test, expect } from "@playwright/test";

test("Can create a cycle and bundle", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Cycles" })).toBeVisible();

  await page.getByPlaceholder("New cycle title").fill("Sprint A");
  await page.getByRole("button", { name: "New" }).click();

  await expect(page.getByText("Sprint A")).toBeVisible();

  // Select cycle
  await page.getByText("Sprint A").click();

  await page.getByRole("button", { name: "Create Prompt" }).click();
  await expect(page.getByText("Planote Bundle")).toBeVisible();
});
