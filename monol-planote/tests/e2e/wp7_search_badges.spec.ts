import { test, expect } from "@playwright/test";

test("Search filters tree and badges show open counts", async ({ page, request }) => {
  // create an open annotation for README file
  const res = await request.post("/api/annotations", {
    data: {
      filePath: "plan/README.md",
      target: { kind: "file" },
      title: "Badge test",
      body: "",
      type: "todo",
      status: "open",
      priority: "medium",
      tags: [],
      workLinks: []
    }
  });
  expect(res.ok()).toBeTruthy();

  await page.goto("/");

  // Wait for tree to load
  await expect(page.getByRole("button", { name: /README\.md/ })).toBeVisible();

  // Wait a bit for annotation counts to be fetched and rendered
  await page.waitForTimeout(500);

  // Check if badge appears (may be one or more due to rollup)
  const badges = page.getByLabel(/open annotations/);
  await expect(badges.first()).toBeVisible({ timeout: 10000 });

  // Search should filter down
  await page.getByPlaceholder("Search...").fill("README");
  await expect(page.getByRole("button", { name: /README\.md/ })).toBeVisible();
});
