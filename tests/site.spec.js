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

test("language switch translates the site, persists and preserves form drafts", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Name", { exact: false }).fill("Nikita");
  await page.getByLabel("How can we help?").fill("My original draft");
  await page.getByRole("button", { name: "ქართული", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ka");
  await expect(page.locator("h1")).toContainText("სიცხადე დღეს.");
  await expect(page.locator(".service")).toHaveCount(6);
  await expect(page.locator(".service").first()).toBeVisible();
  await expect(page.locator("#name")).toHaveValue("Nikita");
  await expect(page.locator("#message")).toHaveValue("My original draft");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "ka");
  await page
    .getByRole("link", { name: "გაეცანით მომსახურებას" })
    .first()
    .click();
  await expect(page.locator("#message")).toHaveValue(
    /მსურს განვიხილო: ფინანსური სტრატეგია/,
  );
  await page.locator("#name").fill("Nikita");
  await page.locator("#email").fill("test@example.com");
  await page.getByRole("button", { name: "შეტყობინების გაგზავნა" }).click();
  await expect(page.getByRole("status")).toContainText(
    "თქვენი შეტყობინება არ გაგზავნილა",
  );
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator("h1")).toHaveText(
    "Clarity today. Confidence in what’s next.",
  );
  await expect(page.getByRole("status")).toContainText("not been sent");
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`Georgian layout fits ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.getByRole("button", { name: "ქართული", exact: true }).click();
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(
      page.getByRole("button", { name: "ქართული", exact: true }),
    ).toBeInViewport();
    if (width < 701) {
      await page.getByRole("button", { name: "მენიუს გახსნა" }).click();
      await page
        .locator("header")
        .getByRole("link", { name: "ჩვენ შესახებ" })
        .click();
      await expect(
        page.getByRole("button", { name: "მენიუს გახსნა" }),
      ).toBeVisible();
    }
  });
}
