import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const width of [320, 390, 768, 1440]) {
  test(`refined product and graphics stay contained at ${width}px`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.locator('[data-consent-reject]').first().click();
    const header = page.locator('[data-site-header]');
    await expect(header.locator('[hreflang], [data-language-switcher], .locale-switch')).toHaveCount(0);
    for (const tab of await page.locator('[data-product-tab]').all()) {
      await tab.click();
      await expect(tab).toHaveAttribute('aria-selected', 'true');
      const panel = page.locator(`#${await tab.getAttribute('aria-controls')}`);
      await expect(panel).toBeVisible();
      const overflow = await panel.evaluate(element => [...element.querySelectorAll('.product-explorer-detail, .product-explorer-visual, .panel-preview, .website-preview')].filter(node => {
        const box = node.getBoundingClientRect();
        const parent = element.getBoundingClientRect();
        return box.right > parent.right + 1 || box.left < parent.left - 1 || node.scrollWidth > node.clientWidth + 1;
      }).map(node => node.className));
      expect(overflow).toEqual([]);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    }
    await page.locator('[data-product-tab="web"]').click();
    await page.keyboard.press('End');
    await expect(page.locator('[data-product-tab="operacion"]')).toBeFocused();
    await page.keyboard.press('Home');
    await expect(page.locator('[data-product-tab="web"]')).toBeFocused();
    if (width === 390 || width === 1440) {
      for (const selector of ['[data-product-explorer]', '.connection-overview', '#planes', '.home-closing']) {
        const section = page.locator(selector);
        await section.scrollIntoViewIfNeeded();
        await section.screenshot({ path: testInfo.outputPath(`${selector.replace(/[^a-z]/g, '')}-${width}.png`) });
      }
    }
  });
}

for (const prefix of ['', '/en']) {
  test(`shared preview devices, keyboard and isolation ${prefix || 'es'}`, async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    const writes: string[] = [];
    const failures: string[] = [];
    page.on('request', request => { if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method())) writes.push(request.url()); });
    page.on('requestfailed', request => {
      if (request.url().includes('/_astro/') && request.failure()?.errorText !== 'net::ERR_ABORTED') failures.push(`${request.url()} ${request.failure()?.errorText}`);
    });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of [`${prefix}/webs/`, `${prefix}/${prefix ? 'panels' : 'paneles'}/`]) {
        await page.goto(route);
        const trigger = page.locator('[data-theme-preview-open], [data-home-panel-dialog-open]').first();
        await trigger.click();
        const dialog = page.locator(`#${await page.locator('[data-preview-dialog][open]').getAttribute('id')}`);
        const frame = dialog.locator('[data-preview-frame]');
        await expect(dialog).toBeVisible();
        await expect(frame).toHaveAttribute('sandbox', 'allow-scripts');
        await expect(frame).toHaveAttribute('aria-busy', 'false');
        const close = dialog.locator('[data-preview-close]');
        await expect(close).toBeFocused();
        const request = new URL((await dialog.locator('.preview-actions .pill').getAttribute('href'))!, 'http://localhost');
        expect(request.searchParams.get('sourcePath')).toBe(route);
        expect(request.searchParams.get('plan')).toMatch(/^(basico|gestion|inteligente)$/);
        await dialog.locator('[data-preview-device="mobile"]').click();
        await expect(dialog).toHaveAttribute('data-device', 'mobile');
        await expect.poll(async () => (await frame.boundingBox())!.width).toBeLessThanOrEqual(390);
        await expect(dialog.locator('[data-preview-device="mobile"]')).toHaveAttribute('aria-pressed', 'true');
        await dialog.locator('[data-preview-device="desktop"]').click();
        const embedded = page.frameLocator(`#${await dialog.getAttribute('id')} iframe`);
        await expect(embedded.locator('h1')).toBeVisible();
        await embedded.locator('html').evaluate(() => document.fonts.ready);
        // The iframe's responsive layout commits after the outer device toggle.
        await embedded.locator('html').evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(null)))));
        expect(await embedded.locator('html').evaluate(() => {
          try { return Boolean(window.parent.document); } catch { return false; }
        })).toBe(false);
        if (!route.includes('webs')) {
          // Wait for the query-selected React view, not its initial home render.
          await expect(embedded.locator('h1')).toHaveText(prefix ? 'Enquiries' : 'Solicitudes');
          await expect(embedded.locator('.demo-conversion')).toBeHidden();
          const search = embedded.getByRole('button', { name: prefix ? 'Search workspace' : 'Buscar en el gestor' });
          await search.click();
          await expect(search).toHaveAttribute('aria-expanded', 'true');
          await embedded.locator('body').press('Escape');
          await expect(search).toHaveAttribute('aria-expanded', 'false');
        }
        // Axe's optional stylesheet XHR preloading is incompatible with connect-src 'none'.
        // Audit the rendered DOM/computed styles without weakening the preview's policy.
        const violations = (await new AxeBuilder({ page }).include('[data-preview-dialog][open]').options({ preload: false }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations;
        expect(violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) }))).toEqual([]);
        await dialog.screenshot({ path: testInfo.outputPath(`${route.includes('webs') ? 'theme' : 'panel'}-${width}.png`) });
        await close.focus();
        await page.keyboard.press('Escape');
        await expect(dialog).not.toBeVisible();
        await expect(frame).toHaveAttribute('src', 'about:blank');
        await expect(trigger).toBeFocused();
        await trigger.click();
        await expect(page.locator('[data-preview-dialog][open] [data-preview-device="desktop"]')).toHaveAttribute('aria-pressed', 'true');
        await page.locator('[data-preview-dialog][open] [data-preview-close]').click();
      }
    }
    expect(writes).toEqual([]);
    expect(failures).toEqual([]);
  });
}

test('compact mobile menu closes outside and preserves normal page access', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menu = page.locator('[data-site-header] .menu');
  await menu.click();
  await expect(page.locator('#mobile-nav a')).toHaveCount(5);
  await page.mouse.click(8, 500);
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await menu.click();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await expect(page.locator('main')).not.toHaveAttribute('inert');
});
