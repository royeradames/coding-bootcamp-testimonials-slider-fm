import { expect, test, type Page } from "@playwright/test";

const tanya = { name: "Tanya Sinclair", role: "UX Engineer", quote: /I’ve been interested in coding for a while/ };
const john = { name: "John Tarkpor", role: "Junior Front-end Developer", quote: /If you want to lay the best foundation possible/ };

const activeSlide = (page: Page) => page.locator('.slide[data-active="true"]');
const expectShowing = async (page: Page, person: typeof tanya, position: string) => {
  const slide = activeSlide(page);
  await expect(slide).toHaveCount(1);
  await expect(slide).toHaveAttribute("aria-label", position);
  await expect(slide.getByRole("blockquote")).toHaveText(person.quote);
  await expect(slide.locator("figcaption")).toHaveText(`${person.name} ${person.role}`);
  await expect(page.getByRole("img", { name: new RegExp(person.name) })).toBeVisible();
};

test("renders landmarks, the first testimonial and the supplied portraits", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Coding bootcamp testimonials slider | Royer Adames");
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Coding bootcamp student testimonials");
  await expect(page.getByRole("region", { name: "Student testimonials" })).toHaveAttribute("aria-roledescription", "carousel");
  await expectShowing(page, tanya, "1 of 2");
  // The hidden slide is out of the accessibility tree and not focusable.
  await expect(page.getByText(john.quote)).toBeHidden();
  await expect(page.getByRole("img")).toHaveCount(1);
  // The hidden photo starts loading after the page's load event, so wait for each one to finish.
  for (const image of await page.locator(".photo").all()) {
    await expect.poll(() => image.evaluate(element => element instanceof HTMLImageElement && element.complete && element.naturalWidth === 540)).toBe(true);
  }
});

test("declares one site name in the footer, og:site_name and WebSite JSON-LD", async ({ page }) => {
  await page.goto("/");
  const name = "Coding bootcamp testimonials slider";
  await expect(page.locator(".site-name")).toHaveText(name);
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", name);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Tanya Sinclair and John Tarkpor/);
  const jsonLd = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() ?? "{}");
  expect(jsonLd).toEqual({ "@context": "https://schema.org", "@type": "WebSite", name, url: "https://coding-bootcamp-testimonials-slider-fm.royeradames.com" });
});

test("previous and next buttons switch slides, wrap around and announce politely", async ({ page }) => {
  await page.goto("/");
  const status = page.getByRole("status");
  await expect(status).toHaveAttribute("aria-live", "polite");
  await expect(status).toHaveText("");
  await page.getByRole("button", { name: "Next testimonial" }).click();
  await expectShowing(page, john, "2 of 2");
  await expect(status).toHaveText("Testimonial 2 of 2: John Tarkpor, Junior Front-end Developer");
  await page.getByRole("button", { name: "Next testimonial" }).click();
  await expectShowing(page, tanya, "1 of 2");
  await page.getByRole("button", { name: "Previous testimonial" }).click();
  await expectShowing(page, john, "2 of 2");
  await page.getByRole("button", { name: "Previous testimonial" }).click();
  await expectShowing(page, tanya, "1 of 2");
  await expect(status).toHaveText("Testimonial 1 of 2: Tanya Sinclair, UX Engineer");
});

test("keyboard: Tab reaches the controls, Enter, Space and arrow keys change slides", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const previous = page.getByRole("button", { name: "Previous testimonial" });
  const next = page.getByRole("button", { name: "Next testimonial" });
  await expect(previous).toBeFocused();
  await expect(previous).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Tab");
  await expect(next).toBeFocused();
  await page.keyboard.press("Enter");
  await expectShowing(page, john, "2 of 2");
  await page.keyboard.press("Space");
  await expectShowing(page, tanya, "1 of 2");
  await page.keyboard.press("ArrowRight");
  await expectShowing(page, john, "2 of 2");
  await page.keyboard.press("ArrowLeft");
  await expectShowing(page, tanya, "1 of 2");
  await page.keyboard.press("ArrowLeft");
  await expectShowing(page, john, "2 of 2");
  await expect(next).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Frontend Mentor", exact: true })).toBeFocused();
});

test("arrow controls darken on hover and meet the 44px target floor", async ({ page }) => {
  await page.goto("/");
  const next = page.getByRole("button", { name: "Next testimonial" });
  await expect(next).toHaveCSS("color", "rgb(133, 133, 172)");
  await next.hover();
  await expect(next).toHaveCSS("color", "rgb(32, 32, 71)");
  for (const width of [400, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const button of await page.locator(".controls button").all()) {
      const box = (await button.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  }
});

test("respects prefers-reduced-motion", async ({ browser }) => {
  for (const reducedMotion of ["reduce", "no-preference"] as const) {
    const context = await browser.newContext({ reducedMotion });
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:4571/");
    const durations = await page.locator(".slide, .photo").evaluateAll(elements => elements.map(element => getComputedStyle(element).transitionDuration));
    if (reducedMotion === "reduce") expect(durations.every(duration => duration.split(",").every(value => parseFloat(value) === 0))).toBe(true);
    else expect(durations.every(duration => parseFloat(duration) > 0)).toBe(true);
    await context.close();
  }
});

test("follows the Figma arrangement at mobile, tablet and desktop", async ({ page }) => {
  const box = async (selector: string) => (await page.locator(selector).first().boundingBox())!;
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  let stage = await box(".stage");
  let quotes = await box(".quotes");
  expect(Math.round(stage.width)).toBe(327);
  expect(quotes.y).toBeGreaterThan(stage.y + stage.height);
  await expect(page.locator(".slide blockquote p").first()).toHaveCSS("font-size", "18px");

  await page.setViewportSize({ width: 768, height: 1024 });
  stage = await box(".stage");
  quotes = await box(".quotes");
  expect(Math.round(stage.width)).toBe(520);
  expect(Math.abs(stage.x + stage.width / 2 - 384)).toBeLessThan(2);
  expect(Math.round(quotes.y - (stage.y + stage.height))).toBe(64);
  await expect(page.locator(".slide blockquote p").first()).toHaveCSS("font-size", "32px");
  await expect(page.locator(".slide blockquote p").first()).toHaveCSS("text-align", "center");

  await page.setViewportSize({ width: 1440, height: 800 });
  stage = await box(".stage");
  quotes = await box(".quotes");
  const photo = await box(".photo-frame");
  const controls = await box(".controls");
  expect(Math.round(stage.x)).toBe(670);
  expect(Math.round(stage.width)).toBe(697);
  expect(Math.round(quotes.x)).toBe(165);
  expect(Math.round(quotes.width)).toBe(570);
  expect(Math.round(quotes.x + quotes.width)).toBe(Math.round(photo.x));
  expect(Math.round(photo.width)).toBe(540);
  expect(Math.round(controls.x)).toBe(797);
  expect(Math.abs(controls.y + controls.height / 2 - (photo.y + photo.height))).toBeLessThan(2);
  await expect(page.locator(".slide blockquote p").first()).toHaveCSS("font-size", "32px");
  await expect(page.locator(".slide blockquote p").first()).toHaveCSS("text-align", "left");
});

test("fits 400 to 1440 and enlarged text with no overflow or text under 16px", async ({ page }) => {
  for (const width of [320, 375, 400, 640, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const smallText = await page.locator("blockquote p, figcaption span, footer, footer a").evaluateAll(elements =>
      elements.filter(element => element.getClientRects().length > 0 && parseFloat(getComputedStyle(element).fontSize) < 16).map(element => element.textContent));
    expect(smallText).toEqual([]);
    for (const link of await page.locator("footer a").all()) expect((await link.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    // Each footer sentence stays on one line so no period strands on its own.
    expect(await page.locator(".footer-part").evaluateAll(parts => parts.map(part => part.getClientRects().length))).toEqual([1, 1]);
    await page.getByRole("button", { name: "Next testimonial" }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 640, height: 900 });
  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("renders the first testimonial without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4571/");
  await expect(page.getByText(tanya.quote)).toBeVisible();
  await expect(page.getByRole("img", { name: /Tanya Sinclair/ })).toBeVisible();
  await context.close();
});

/* QA sweep October 8 (STS1, LA4): from 1030 px the quote column ran on top of the photo, so lines of the quote sat over the portrait. */
test("on desktop the quote text never runs over the photo, for either slide", async ({ page }) => {
  for (const width of [1024, 1030, 1100, 1200, 1280, 1440, 1600, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    for (let slide = 0; slide < 2; slide++) {
      if (slide) await page.getByRole("button", { name: "Next testimonial" }).click();
      const overlap = await page.evaluate(() => {
        const photo = document.querySelector(".photo-frame")!.getBoundingClientRect();
        const active = document.querySelector('.slide[data-active="true"]')!;
        const walker = document.createTreeWalker(active, NodeFilter.SHOW_TEXT);
        const lines: DOMRect[] = [];
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          const range = document.createRange();
          range.selectNodeContents(node);
          lines.push(...range.getClientRects());
        }
        return Math.max(0, ...lines.map(line => Math.min(line.right, photo.right) - Math.max(line.left, photo.left)));
      });
      expect(overlap, `quote over photo at ${width}, slide ${slide + 1}`).toBeLessThanOrEqual(0);
    }
  }
});
