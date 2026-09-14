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

test("Georgia pin is visible at home and hidden behind the rotated Earth", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#network");
  const globe = page.getByLabel("Interactive Earth globe", { exact: false });
  await expect(page.locator(".interactive-globe")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await globe.scrollIntoViewIfNeeded();

  async function bluePixels() {
    const screenshot = await page.locator(".interactive-globe").screenshot();
    return page.evaluate(async (base64) => {
      const image = new Image();
      image.src = `data:image/png;base64,${base64}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0);
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      let count = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (
          data[i + 2] > 180 &&
          data[i + 2] > data[i] * 2 &&
          data[i + 2] > data[i + 1] * 1.5
        )
          count++;
      }
      return count;
    }, screenshot.toString("base64"));
  }

  await globe.press("Home");
  const label = page.locator(".globe-label");
  await expect(label).toBeVisible();
  await expect(label).toHaveText("Georgia");
  expect(await bluePixels()).toBeGreaterThan(20);
  for (let i = 0; i < 21; i++) await globe.press("ArrowRight");
  await expect(label).toBeHidden();
  expect(await bluePixels()).toBe(0);
  await globe.press("Home");
  await expect(label).toBeVisible();
  expect(await bluePixels()).toBeGreaterThan(20);
});

test("the marker pulses gently, respects reduced motion, and fits narrow screens", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/#network");
  const marker = page.locator(".globe-dot");
  await expect(marker).toBeVisible();
  const pulse = () =>
    page.locator(".globe-dot").evaluate((dot) => {
      const style = getComputedStyle(dot, "::before");
      return { animation: style.animationName, opacity: style.opacity };
    });
  expect((await pulse()).animation).toBe("globe-pulse");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await pulse()).toEqual({ animation: "none", opacity: "0" });
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.reload();
    await page.locator(".interactive-globe[data-ready=true]").waitFor();
    const globe = page.getByLabel("Interactive Earth globe", { exact: false });
    await globe.scrollIntoViewIfNeeded();
    for (let step = 0; step < 42; step++) {
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
      );
      if (await marker.isVisible()) {
        const bounds = await page.locator(".globe-label").boundingBox();
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
      }
      await globe.press("ArrowRight");
    }
  }
});

test("Georgia annotation moves continuously when dragged past the label boundary", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#network");
  await page.locator(".interactive-globe[data-ready=true]").waitFor();
  const globe = page.getByLabel("Interactive Earth globe", { exact: false });
  await globe.scrollIntoViewIfNeeded();
  const bounds = await globe.boundingBox();
  const startX = bounds.x + bounds.width / 2;
  const y = bounds.y + bounds.height / 2;
  await page.mouse.move(startX, y);
  await page.mouse.down();
  let previous = null;
  let samples = 0;
  for (let step = -20; step <= 20; step++) {
    await page.mouse.move(startX + step * 2, y);
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    if (await page.locator(".globe-label").isVisible()) {
      const current = await page.locator(".globe-label").boundingBox();
      if (previous) expect(Math.abs(current.x - previous.x)).toBeLessThan(12);
      previous = current;
      samples++;
    } else previous = null;
  }
  await page.mouse.up();
  expect(samples).toBeGreaterThan(20);
});
