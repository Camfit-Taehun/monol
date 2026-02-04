import { test, expect } from "@playwright/test";

test("Selection annotation highlights in preview", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "README.md" })).toBeVisible();
  await page.getByRole("button", { name: "README.md" }).click();

  // Create selection annotation (server-side) targeting a quote we know exists
  const quote = "Planote sample plan";
  const res = await request.post("/api/annotations", {
    data: {
      filePath: "plan/README.md",
      target: { kind: "selection", quote, anchorV1: { strategy: "quote", quote } },
      title: "Selection test",
      body: "",
      type: "todo",
      status: "open",
      priority: "medium",
      tags: [],
      workLinks: []
    }
  });
  expect(res.ok()).toBeTruthy();

  // Re-open file to refresh highlights
  await page.getByRole("button", { name: "README.md" }).click();

  await expect(page.locator('mark[data-ann]').first()).toBeVisible();
});
