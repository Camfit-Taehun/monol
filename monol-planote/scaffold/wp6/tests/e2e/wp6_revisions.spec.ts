import { test, expect } from "@playwright/test";

test("Can create a revision (if git repo)", async ({ page, request }) => {
  const projRes = await request.get("/api/project");
  const projJson = await projRes.json();
  if (!projJson.ok || !projJson.data.isGitRepo) {
    test.skip(true, "Not a git repo in this environment");
  }

  await page.goto("/");
  await page.getByPlaceholder("New cycle title").fill("Rev cycle");
  await page.getByRole("button", { name: "New" }).click();

  await page.getByText("Rev cycle").click();

  await page.getByRole("button", { name: "Create Revision" }).click();

  // Patch may be empty; still should render pre block
  await expect(page.locator("pre").first()).toBeVisible();
});
