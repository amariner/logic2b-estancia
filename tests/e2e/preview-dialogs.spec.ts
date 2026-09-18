import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const locale of ['es', 'en'] as const) {
  for (const width of [320, 390, 1440]) {
    test(`preview keeps its next step and demo boundary clear · ${locale} · ${width}`, async ({ page }, testInfo) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.setViewportSize({ width, height: 844 });
      const prefix = locale === 'en' ? '/en' : '';
      const writes: string[] = [];
      page.on('request', request => {
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method())) writes.push(request.url());
      });

      for (const [kind, route] of [['theme', `${prefix}/webs/`], ['panel', `${prefix}/${locale === 'en' ? 'panels' : 'paneles'}/`]]) {
        await page.goto(route);
        const trigger = page.locator('[data-theme-preview-open], [data-home-panel-dialog-open]').first();
        await trigger.click();
        const dialog = page.locator('[data-preview-dialog][open]');
        const frame = dialog.locator('[data-preview-frame]');
        const details = dialog.locator('[data-preview-details]');
        const close = dialog.locator('[data-preview-close]');
        await expect(close).toBeFocused();
        await expect(frame).toHaveAttribute('sandbox', 'allow-scripts');
        await expect(frame).toHaveAttribute('aria-busy', 'false');
        await expect(details).not.toHaveAttribute('open');
        await page.evaluate(() => window.postMessage({ type: 'logic-estancia:close-preview' }, location.origin));
        await expect(dialog).toBeVisible();
        await expect(dialog.locator('.preview-boundary')).toContainText(locale === 'en' ? 'Fictional demo' : 'Demo ficticia');
        await expect(dialog.locator('.preview-actions a')).toHaveCount(1);
        const cta = dialog.locator('.preview-actions .pill');
        const handoff = new URL((await cta.getAttribute('href'))!, 'http://localhost');
        expect(handoff.searchParams.get('sourcePath')).toBe(route);
        expect(handoff.searchParams.get('plan')).toMatch(/^(basico|gestion|inteligente)$/);
        if (kind === 'theme') expect(handoff.searchParams.get('theme')).toBe('nivora');
        if (kind === 'panel') {
          expect(handoff.searchParams.get('need')).toBe('enquiries');
          await expect(cta).toContainText(locale === 'en' ? 'Assess this workspace' : 'Evaluar este panel');
        }
        const bounds = await dialog.boundingBox();
        const frameBounds = await frame.boundingBox();
        const ctaBounds = await cta.boundingBox();
        const boundaryBounds = await dialog.locator('.preview-boundary').boundingBox();
        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
        expect(boundaryBounds!.y + boundaryBounds!.height).toBeLessThanOrEqual(844);
        expect(ctaBounds!.height).toBeGreaterThanOrEqual(44);
        expect(frameBounds!.height).toBeGreaterThan(400);
        if (width === 1440) expect(frameBounds!.width).toBeGreaterThan(bounds!.width * .75);

        // Native disclosure works by keyboard and preserves one commercial destination.
        await details.locator('summary').focus();
        await page.keyboard.press('Enter');
        await expect(details).toHaveAttribute('open');
        await expect(details.locator('a')).toBeVisible();
        await page.keyboard.press('Enter');
        await expect(details).not.toHaveAttribute('open');
        await dialog.screenshot({ path: testInfo.outputPath(`${kind}-${locale}-${width}.png`) });

        // Escape must work after entering the sandboxed document as well.
        const embedded = page.frameLocator('[data-preview-dialog][open] iframe');
        if (kind === 'panel') {
          const search = embedded.getByRole('button', { name: locale === 'en' ? 'Search workspace' : 'Buscar en el gestor' });
          await search.click();
          await expect(search).toHaveAttribute('aria-expanded', 'true');
          await page.keyboard.press('Escape');
          await expect(search).toHaveAttribute('aria-expanded', 'false');
          await expect(dialog).toBeVisible();
        }
        await embedded.locator('h1').click();
        await page.keyboard.press('Escape');
        await expect(dialog).toHaveCount(0);
        await expect(trigger).toBeFocused();
        await trigger.click();
        await expect(details).not.toHaveAttribute('open');
        await expect(dialog.locator('[data-preview-device="desktop"]')).toHaveAttribute('aria-pressed', 'true');
        await close.click();
        await expect(page.locator('html')).not.toHaveClass(/preview-open/);
      }
      expect(writes).toEqual([]);
    });
  }
}

test('disclosed previews remain accessible and loading recovery clears on success', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  // The hero and catalogue intentionally open the same previews from separate controls.
  await page.locator('.hero-case-gallery [data-theme-preview-open]').first().click();
  const dialog = page.locator('[data-preview-dialog][open]');
  await expect(dialog.locator('iframe')).toHaveAttribute('aria-busy', 'false');
  await dialog.locator('summary').click();
  const audit = await new AxeBuilder({ page }).include('[data-preview-dialog][open]').options({ preload: false }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(audit.violations.map(({ id }) => id)).toEqual([]);
  await dialog.locator('[data-preview-close]').click();

  await page.clock.install();
  let releasePreview: () => void = () => {};
  const previewReady = new Promise<void>(resolve => { releasePreview = resolve; });
  await page.route('**/demos/terrava/gestion/**', async route => {
    await previewReady;
    await route.continue();
  });
  await page.locator('[data-home-panel-dialog-open]').first().click();
  const panel = page.locator('[data-preview-dialog][open]');
  await page.clock.fastForward(12_001);
  await expect(panel.locator('[data-preview-help]')).toBeVisible();
  releasePreview();
  await expect(panel.locator('[data-preview-help]')).toBeHidden();
  await expect(panel.locator('iframe')).toHaveAttribute('aria-busy', 'false');
});
