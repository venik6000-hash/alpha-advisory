import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const directory = "output/implementation";
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  viewport: { width: 1280, height: 880 },
  reducedMotion: "reduce",
});
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.goto("http://127.0.0.1:5173");
await page.evaluate(() => document.fonts.ready);
for (const id of [
  "home",
  "expertise",
  "approach",
  "about",
  "network",
  "contact",
]) {
  await page.locator(`#${id}`).evaluate((element) => element.scrollIntoView());
  await page.evaluate(() =>
    Promise.all(
      [...document.images]
        .filter(
          (image) =>
            image.getBoundingClientRect().bottom > 0 &&
            image.getBoundingClientRect().top < innerHeight,
        )
        .map((image) => image.decode().catch(() => {})),
    ),
  );
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  await page.screenshot({ path: `${directory}/desktop-${id}.png` });
}
for (const width of [320, 390, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("http://127.0.0.1:5173");
  await page.evaluate(() => document.fonts.ready);
  console.log(
    JSON.stringify(
      await page.evaluate(() => ({
        width: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        overflow: [
          ...document.querySelectorAll("h1,h2,h3,p,input,textarea,nav"),
        ]
          .filter((element) => {
            const bounds = element.getBoundingClientRect();
            return (
              bounds.width > 0 &&
              (bounds.right > innerWidth + 1 || bounds.left < -1)
            );
          })
          .map((element) => ({
            tag: element.tagName,
            text: element.textContent.slice(0, 80),
          })),
      })),
    ),
  );
  if (width === 390) {
    for (const id of ["home", "approach", "about", "network", "contact"]) {
      await page
        .locator(`#${id}`)
        .evaluate((element) => element.scrollIntoView());
      await page.evaluate(() =>
        Promise.all(
          [...document.images].map((image) => {
            image.loading = "eager";
            return image.decode().catch(() => {});
          }),
        ),
      );
      await page.screenshot({ path: `${directory}/mobile-${id}.png` });
    }
    await page.screenshot({
      path: `${directory}/mobile-full.png`,
      fullPage: true,
    });
  }
}
console.log(JSON.stringify({ errors }));
await browser.close();
