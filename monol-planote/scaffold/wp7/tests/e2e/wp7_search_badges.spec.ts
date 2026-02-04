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

  // README should show badge "1"
  await expect(page.getByRole("button", { name: /README\.md/ })).toBeVisible();
  await expect(page.getByLabel("1 open annotations")).toBeVisible();

  // Search should filter down
  await page.getByPlaceholder("Search…").fill("README");
  await expect(page.getByRole("button", { name: /README\.md/ })).toBeVisible();
});
