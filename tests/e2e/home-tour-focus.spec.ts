import { expect, test } from '@playwright/test';

for (const prefix of ['', '/en']) {
  for (const view of [
    { width: 1280, height: 720, textScale: 1 },
    { width: 390, height: 844, textScale: 1 },
    { width: 320, height: 568, textScale: 1 },
    { width: 390, height: 844, textScale: 2 },
  ]) {
    test(`home tour keyboard keeps its assessment visible ${prefix || 'es'} ${view.width}x${view.height} text ${view.textScale}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width: view.width, height: view.height });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`${prefix}/`);
      await page.locator('[data-consent-reject]').first().click();
      if (view.textScale === 2) await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
      await page.locator('.hero-start-link').click();
      const tour = page.locator('[data-home-tour-dialog]');
      const step = tour.locator('[data-home-tour-step="enquiries"]');
      await expect(step.locator('[data-home-tour-step-title]')).toBeFocused();
      if (view.width === 320) {
        const previewWidth = await step.locator('.panel-preview-content').evaluate(content => content.getBoundingClientRect().width);
        expect(previewWidth).toBeGreaterThan(200);
        expect(previewWidth).toBeLessThan(view.width);
      }
      await page.keyboard.press('Tab');
      await expect(step.locator('.home-tour-evidence-link')).toBeFocused();
      await page.keyboard.press('Tab');
      const assessment = step.locator('[data-home-tour-assess]');
      await expect(assessment).toBeFocused();
      expect(await assessment.evaluate(link => {
        const bounds = link.getBoundingClientRect();
        const hit = document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
        return Boolean(hit && (hit === link || link.contains(hit)));
      })).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await tour.screenshot({ path: testInfo.outputPath('assessment-keyboard-focus.png') });
      await page.keyboard.press('Escape');
      await expect(page.locator('.hero-start-link')).toBeFocused();
    });
  }
}
