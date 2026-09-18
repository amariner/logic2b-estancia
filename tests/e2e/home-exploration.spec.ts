import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const prefix of ['', '/en']) {
  for (const width of [390, 1440]) {
    test(`home exploration stays in context ${prefix || 'es'} ${width}`, async ({ page }, testInfo) => {
      const writes: string[] = [];
      page.on('request', request => { if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method())) writes.push(request.url()); });
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`${prefix}/`);
      await page.locator('[data-consent-reject]').first().click();
      const entry = page.locator('.hero-start-link');
      await entry.click();
      const tour = page.locator('[data-home-tour-dialog]');
      await expect(tour).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`${prefix}/$`));
      await expect(tour.locator('[data-home-tour-step="enquiries"]')).toBeVisible();
      await expect(tour.locator('[data-home-tour-progress]')).toHaveJSProperty('value', 1);
      await expect(tour.locator('[data-home-tour-complete]')).toBeHidden();
      const assessment = new URL((await tour.locator('[data-home-tour-step="enquiries"] [data-home-tour-assess]').getAttribute('href'))!, 'https://example.test');
      expect(assessment.searchParams.get('need')).toBe('enquiries');
      expect(assessment.searchParams.get('sourcePath')).toBe(`${prefix}/`);
      await tour.screenshot({ path: testInfo.outputPath('guided-enquiry.png') });
      expect((await new AxeBuilder({ page }).include('[data-home-tour-dialog]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations.map(v => v.id)).toEqual([]);
      for (let viewed = 2; viewed <= 4; viewed++) {
        await tour.locator('[data-home-tour-next]').click();
        await expect(tour.locator('[data-home-tour-progress]')).toHaveJSProperty('value', viewed);
        await expect(tour.locator('[data-home-tour-complete]')).toBeHidden();
      }
      await tour.locator('[data-home-tour-next]').click();
      await expect(tour.locator('[data-home-tour-step="brand-web"]')).toBeVisible();
      await expect(tour.locator('[data-home-tour-progress]')).toHaveJSProperty('value', 5);
      await expect(tour.locator('[data-home-tour-complete]')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(tour).not.toBeVisible();
      await expect(entry).toBeFocused();
      const theme = page.locator('[data-hero-proof="nivora"]');
      await theme.click();
      const dialog = page.locator('#theme-preview-nivora');
      await expect(dialog).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`${prefix}/$`));
      await expect(dialog.locator('iframe')).toHaveAttribute('sandbox', 'allow-scripts');
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      await expect(theme).toBeFocused();
      await expect(dialog.locator('iframe')).toHaveAttribute('src', 'about:blank');
      expect(writes).toEqual([]);
    });
  }
}
