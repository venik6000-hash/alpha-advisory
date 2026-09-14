import { test, expect } from "@playwright/test";

test("a released drag resumes auto-rotation and stops while grabbed", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1280, height: 880 });
  await page.goto("/#network");
  const globe = page.getByLabel("Interactive Earth globe", { exact: false });
  await expect(page.locator(".interactive-globe")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await globe.hover();
  const bounds = await globe.boundingBox();
  await page.mouse.move(bounds.x + 170, bounds.y + 190);
  await page.mouse.down();
  await page.mouse.move(bounds.x + 300, bounds.y + 210, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(3500);
  const resumed = await globe.screenshot();
  await page.waitForTimeout(300);
  expect(resumed.equals(await globe.screenshot())).toBe(false);
  await page.mouse.down();
  const grabbed = await globe.screenshot();
  await page.waitForTimeout(300);
  expect(grabbed.equals(await globe.screenshot())).toBe(true);
  await page.mouse.up();
});

test("the 3D globe renders, can be dragged, and supports keyboard rotation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1280, height: 880 });
  await page.goto("/#network");
  const globe = page.getByLabel("Interactive Earth globe", { exact: false });
  await expect(globe).toBeVisible();
  await expect(page.locator(".interactive-globe")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await globe.hover();
  const before = await globe.screenshot();
  const bounds = await globe.boundingBox();
  await page.mouse.move(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds.x + bounds.width / 2 + 120,
    bounds.y + bounds.height / 2 + 35,
    { steps: 12 },
  );
  await page.mouse.up();
  const after = await globe.screenshot();
  expect(before.equals(after)).toBe(false);
  await globe.focus();
  await page.keyboard.press("ArrowLeft");
  expect(after.equals(await globe.screenshot())).toBe(false);
});

test("the globe has no rotation controls or drag hint", async ({ page }) => {
  await page.goto("/#network");
  await expect(page.locator(".interactive-globe")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await expect(page.locator(".globe-controls")).toHaveCount(0);
  await expect(page.getByText("Drag to rotate", { exact: true })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("button", { name: /globe rotation/i }),
  ).toHaveCount(0);
});

test("the original illustration stays available when WebGL is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type.startsWith("webgl") || type === "experimental-webgl")
        return null;
      return getContext.call(this, type, ...args);
    };
  });
  await page.goto("/#network");
  await page.locator(".interactive-globe").scrollIntoViewIfNeeded();
  await expect(page.locator(".globe-failed .globe-fallback img")).toBeVisible();
  await expect(page.locator(".globe-canvas canvas")).toHaveCount(0);
});

test("the globe fits mobile and can be reached without horizontal scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#network");
  await page.locator(".interactive-globe").scrollIntoViewIfNeeded();
  await expect(page.locator(".interactive-globe")).toHaveAttribute(
    "data-ready",
    "true",
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
});
