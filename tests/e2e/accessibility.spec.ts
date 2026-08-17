import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const commercialRoutes = [
  '/', '/en/',
  '/soluciones/gestores/', '/en/solutions/managers/',
  '/soluciones/hoteles/', '/en/solutions/hotels/',
  '/planes/', '/en/plans/',
  '/diagnostico/', '/en/assessment/',
  '/docs/', '/en/docs/',
  '/recursos/gestor-reservas-apartamentos-turisticos/',
  '/recursos/web-hotel-reservas-directas-operacion/',
];

const legalRoutes = [
  '/legal/', '/privacidad/', '/cookies/',
  '/en/legal/', '/en/privacidad/', '/en/cookies/',
];

const demoRoutes = [
  '/demos/nivora/', '/en/demos/nivora/',
  '/demos/terrava/', '/en/demos/terrava/',
  '/demos/terrava/gestion/', '/en/demos/terrava/gestion/',
  '/demos/aurem/', '/en/demos/aurem/',
  '/demos/aurem/gestion/', '/en/demos/aurem/gestion/',
];

const auditedRoutes = [...commercialRoutes, ...legalRoutes, ...demoRoutes];

function formatViolations(path: string, violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) {
  return violations.map((violation) => ({
    path,
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    targets: violation.nodes.map((node) => node.target.join(' ')),
  }));
}

async function gotoStable(page: Page, path: string) {
  const response = await page.goto(path, { waitUntil: 'networkidle' });
  expect(response?.status(), path).toBe(200);
}

test('representative ES/EN routes have no automated WCAG 2.2 AA violations', async ({ page }) => {
  const violations = [];
  for (const path of auditedRoutes) {
    await gotoStable(page, path);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    violations.push(...formatViolations(path, result.violations));
  }
  expect(violations).toEqual([]);
});

test('every audited route exposes one main landmark and one page heading', async ({ page }) => {
  for (const path of auditedRoutes) {
    await gotoStable(page, path);
    await expect(page.locator('main'), `${path}: main landmark`).toHaveCount(1);
    await expect(page.locator('h1'), `${path}: page heading`).toHaveCount(1);
  }
});

for (const path of ['/', '/demos/terrava/', '/demos/aurem/gestion/']) {
  test(`${path} exposes a visible keyboard focus indicator`, async ({ page }) => {
    await gotoStable(page, path);
    await page.keyboard.press('Tab');
    const focus = page.locator(':focus');
    await expect(focus).toBeVisible();
    const indicator = await focus.evaluate((element) => {
      const style = getComputedStyle(element);
      return { outlineStyle: style.outlineStyle, outlineWidth: Number.parseFloat(style.outlineWidth), boxShadow: style.boxShadow };
    });
    expect(indicator.outlineStyle !== 'none' && indicator.outlineWidth >= 2 || indicator.boxShadow !== 'none').toBe(true);
  });
}

for (const path of ['/', '/demos/terrava/', '/demos/aurem/gestion/']) {
  test(`${path} suppresses non-essential motion when requested`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoStable(page, path);
    const offenders = await page.locator('body *').evaluateAll((elements) => elements.flatMap((element) => {
      const style = getComputedStyle(element);
      const durations = `${style.animationDuration},${style.transitionDuration}`.split(',').map((value) => Number.parseFloat(value) || 0);
      return durations.some((duration) => duration > 0.01) ? [element.tagName.toLowerCase()] : [];
    }));
    expect(offenders, path).toEqual([]);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  });
}
