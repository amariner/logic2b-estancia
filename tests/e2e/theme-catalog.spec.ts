import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const slugs = ['nivora', 'terrava', 'aurem', 'linde', 'cobalto', 'oria', 'boscara', 'velares', 'nocta', 'riscoa', 'solerna', 'cendra'];
const viewports = [
  { width: 320, height: 740 }, { width: 360, height: 800 },
  { width: 390, height: 844 }, { width: 430, height: 932 },
  { width: 768, height: 1024 }, { width: 844, height: 390 },
  { width: 1024, height: 768 }, { width: 1440, height: 1000 },
];

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    localStorage.setItem('logic-estancia-consent', JSON.stringify({ essential: true, analytics: false, timestamp: new Date().toISOString(), version: '1.0.0' }));
  });
});

for (const prefix of ['', '/en']) {
  const routes = [...slugs.map((slug) => `${prefix}/webs/${slug}/`), ...slugs.slice(0, 3).map((slug) => `${prefix}/demos/${slug}/`)];
  for (const route of routes) {
    test(`theme catalogue: complete responsive surface ${route}`, async ({ page }, testInfo) => {
      test.setTimeout(90_000);
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      for (const img of await page.locator('main img').all()) {
        await img.scrollIntoViewIfNeeded();
        await expect.poll(() => img.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(page.locator('main')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveCount(1);
      const isDemo = route.includes('/demos/');
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth), `${route} at ${viewport.width}×${viewport.height}`).toBe(viewport.width);
        const heading = page.locator('h1');
        const headingBox = await heading.boundingBox();
        expect(headingBox!.x).toBeGreaterThanOrEqual(0);
        expect(headingBox!.x + headingBox!.width).toBeLessThanOrEqual(viewport.width + 1);
        const hero = page.locator(isDemo ? '.demo-hero-copy' : '.web-concept-hero');
        const clippedText = await hero.evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          return [...element.querySelectorAll('h1, p, a')].filter((node) => {
            const box = node.getBoundingClientRect();
            return box.width > 0 && (box.bottom > bounds.bottom + 1 || box.right > bounds.right + 1 || box.left < bounds.left - 1);
          }).map((node) => node.textContent);
        });
        expect(clippedText, `Hero content must fit at ${viewport.width}`).toEqual([]);
        if (viewport.width === 320 || viewport.width === 1440) {
          const violations = (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()).violations;
          expect(violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) }))).toEqual([]);
        }
        if (process.env.CATALOG_SCREENSHOTS && (viewport.width === 390 || viewport.width === 1440)) {
          await page.screenshot({ path: testInfo.outputPath(`catalog-${viewport.width}.png`), fullPage: true });
        }
      }
      await page.setViewportSize({ width: 320, height: 740 });
      const navigation = page.locator(isDemo ? '.demo-nav nav' : '.web-concept-hero nav div');
      for (const link of await navigation.getByRole('link').all()) {
        await expect(link).toBeVisible();
        expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
        const hash = await link.getAttribute('href');
        await link.click();
        await expect(page.locator(hash!)).toBeInViewport();
      }
      for (const img of await page.locator('main img').all()) {
        await img.scrollIntoViewIfNeeded();
        await expect.poll(() => img.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
      }
      if (isDemo) {
        for (const figure of await page.locator('.demo-hero figure, .demo-editorial figure').all()) {
          const frame = (await figure.boundingBox())!;
          const photo = (await figure.locator('img').boundingBox())!;
          expect(Math.abs(frame.height - photo.height)).toBeLessThan(2);
          expect(Math.abs(frame.width - photo.width)).toBeLessThan(2);
        }
      }
      // Simulate enlarged text without concealing overflow or dropping navigation.
      await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
      const enlargedOverflow = await page.evaluate(() => [...document.querySelectorAll('body *')].filter((element) => {
        const box = element.getBoundingClientRect();
        return box.width > 0 && (box.right > innerWidth + 1 || box.left < -1);
      }).map((element) => ({ tag: element.tagName, class: element.className, text: element.textContent?.slice(0, 100) })));
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth), JSON.stringify(enlargedOverflow)).toBe(320);
      await expect(navigation).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test(`theme catalogue: all mobile previews open and return focus ${prefix || 'es'}`, async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${prefix}/`);
    for (const slug of slugs) {
      const trigger = page.locator(`[data-theme-showcase] [data-theme-preview-open="theme-preview-${slug}"]`);
      await trigger.click();
      const dialog = page.locator(`#theme-preview-${slug}`);
      await expect(dialog).toBeVisible();
      const frame = page.frameLocator(`#theme-preview-${slug} iframe`);
      await expect(frame.locator('h1')).toBeVisible();
      const frameWidth = (await dialog.locator('iframe').boundingBox())!.width;
      expect(await frame.locator('html').evaluate((html) => html.scrollWidth)).toBeLessThanOrEqual(frameWidth + 1);
      const close = dialog.locator('[data-theme-preview-close]');
      const box = (await close.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.y).toBeGreaterThanOrEqual(0);
      if (slugs.indexOf(slug) % 2 === 0) {
        await close.focus();
        await page.keyboard.press('Escape');
      } else await close.click();
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
    }
  });
}
