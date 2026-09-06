import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Keep each page independently bounded: a slow route must identify itself.
const routes = [
  '/', '/en/', '/planes/', '/en/plans/', '/webs/', '/en/webs/',
  '/paneles/', '/en/panels/', '/soluciones/casas-rurales/',
  '/soluciones/apartamentos/', '/soluciones/hoteles/', '/docs/',
  '/en/docs/', '/paneles/planning/', '/docs/reservas-recepcion/',
  '/recorrido/', '/diagnostico/', '/webs/linde/', '/privacidad/',
];

for (const route of routes) {
  test(`commercial refresh: accessible and responsive ${route}`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1280, height: 900 });
    const response = await page.goto(route, { waitUntil: 'load' });
    expect(response?.status()).toBe(200);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    const violations = (await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()).violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) }));
    expect(violations).toEqual([]);
    await page.setViewportSize({ width: 320, height: 900 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
    const menu = page.locator('[data-site-header] .menu');
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(menu).toBeFocused();
  });
}
