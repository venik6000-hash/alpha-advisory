import { test, expect } from "@playwright/test";

test("all six sections render and service enquiry reaches the contact form", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Clarity today. Confidence in what’s next.",
  );
  await expect(page.locator("main > section")).toHaveCount(6);
  await page.getByRole("link", { name: "Explore service" }).first().click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.getByLabel("How can we help?")).toHaveValue(
    /Financial strategy & CFO advisory/,
  );
});

test("form validates and never reports delivery without a configured endpoint", async ({
  page,
}) => {
  await page.goto("/#contact");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByLabel("Name", { exact: false })).toBeFocused();
  await page.getByLabel("Name", { exact: false }).fill("Test visitor");
  await page.getByLabel("Email", { exact: false }).fill("test@example.com");
  await page
    .getByLabel("How can we help?")
    .fill("A test enquiry, not for delivery.");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("status")).toContainText("not been sent");
  await expect(page.getByLabel("How can we help?")).toHaveValue(
    "A test enquiry, not for delivery.",
  );
});

test("mobile menu closes after navigation and the layout fits narrow screens", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.locator("header").getByRole("link", { name: "About us" }).click();
  await expect(page).toHaveURL(/#about$/);
  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
