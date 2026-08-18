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
const deepStateRoutes = [
  '/demos/aurem/gestion/?vista=reports',
  '/en/demos/aurem/gestion/?vista=reports',
  '/demos/aurem/gestion/?vista=channels',
  '/en/demos/aurem/gestion/?vista=channels',
  '/demos/aurem/gestion/?vista=automation',
  '/en/demos/aurem/gestion/?vista=automation',
];

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
  test.setTimeout(60_000);
  const violations = [];
  for (const path of [...auditedRoutes, ...deepStateRoutes]) {
    await gotoStable(page, path);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    violations.push(...formatViolations(path, result.violations));
  }
  expect(violations).toEqual([]);
});

test('every audited route exposes one main landmark and one page heading', async ({ page }) => {
  test.setTimeout(60_000);
  for (const path of [...auditedRoutes, ...deepStateRoutes]) {
    await gotoStable(page, path);
    await expect(page.locator('main'), `${path}: main landmark`).toHaveCount(1);
    await expect(page.locator('h1'), `${path}: page heading`).toHaveCount(1);
  }
});

test('every audited route reflows without page-level horizontal scrolling at 320px', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 320, height: 900 });
  for (const path of [...auditedRoutes, ...deepStateRoutes]) {
    await gotoStable(page, path);
    const reflow = await page.evaluate(() => {
      const pageScrollWidth = document.documentElement.scrollWidth;
      return {
        pageScrollWidth,
        viewportWidth: innerWidth,
        offenders: pageScrollWidth <= innerWidth ? [] : [...document.querySelectorAll<HTMLElement>('body *')].flatMap((element) => {
          const bounds = element.getBoundingClientRect();
          if (bounds.right <= innerWidth + 0.5) return [];
          return [{
            element: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${[...element.classList].map((name) => `.${name}`).join('')}`,
            left: Math.round(bounds.left * 10) / 10,
            right: Math.round(bounds.right * 10) / 10,
          }];
        }).slice(0, 12),
      };
    });
    expect(reflow, path).toEqual({ pageScrollWidth: 320, viewportWidth: 320, offenders: [] });
  }
});

test('representative families tolerate text resized to 200 percent', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const path of ['/', '/planes/', '/diagnostico/', '/demos/terrava/', '/demos/aurem/gestion/?vista=reports']) {
    await gotoStable(page, path);
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), path).toBe(true);
  }
});

test('diagnostic step and result changes move focus to the new context', async ({ page }) => {
  await gotoStable(page, '/diagnostico/');
  await page.getByRole('button', { name: 'Rechazar' }).click();
  await page.getByText('Apartamentos', { exact: true }).click();
  const next = page.locator('[data-next]');
  await next.click();
  await expect(page.locator('fieldset[data-step="2"] legend')).toBeFocused();
  for (let index = 0; index < 5; index += 1) await next.click();
  await expect(page.locator('[data-result-name]')).toBeFocused();
  await page.locator('[data-edit]').click();
  await expect(page.locator('fieldset[data-step="1"] legend')).toBeFocused();
});

test('cookie preferences expose and restore focus between their views', async ({ page }) => {
  await gotoStable(page, '/');
  const configure = page.getByRole('button', { name: 'Configurar preferencias' });
  await configure.click();
  await expect(page.getByRole('checkbox', { name: 'Cookies de analítica' })).toBeFocused();
  await page.getByRole('button', { name: 'Volver' }).click();
  await expect(configure).toBeFocused();
});

test('demo validation and checkout announce state while preserving focus', async ({ page }) => {
  await gotoStable(page, '/demos/aurem/');
  const form = page.locator('[data-demo-form]');
  const departure = form.locator('[name="to"]');
  await form.locator('[name="from"]').fill('2026-08-20');
  await departure.fill('2026-08-19');
  await form.getByRole('button', { name: 'Continuar a pago demo' }).click();
  await expect(page.getByRole('status')).toHaveText('La salida debe ser posterior a la entrada.');
  await expect(departure).toBeFocused();
  await departure.fill('2026-08-22');
  const submit = form.getByRole('button', { name: 'Continuar a pago demo' });
  await submit.click();
  await expect(page.getByRole('button', { name: 'Cerrar' })).toBeFocused();
  await page.getByRole('button', { name: 'Cerrar' }).click();
  await expect(submit).toBeFocused();
});

test('workspace utility panel restores focus to its opener on Escape', async ({ page }) => {
  await gotoStable(page, '/demos/aurem/gestion/');
  await page.getByRole('button', { name: 'Explorar libremente' }).click();
  const search = page.getByRole('button', { name: 'Buscar en el gestor' });
  await search.click();
  await expect(page.getByPlaceholder('Reservas, limpieza, informes…')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(search).toBeFocused();
});

test("Aurem guided milestones expose accessible progress and move focus with their context", async ({
  page,
}) => {
  await gotoStable(page, "/demos/aurem/gestion/");
  await page.getByRole("button", { name: "Visita guiada" }).click();
  const first = page.getByRole("dialog", {
    name: "Detecta la habitación en riesgo",
  });
  await expect(first.getByRole("button", { name: "Pausar" })).toBeFocused();
  await expect(first.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "1",
  );
  await first.getByRole("button", { name: "Siguiente hito" }).click();
  const second = page.getByRole("dialog", { name: "Limpieza prepara la 408" });
  await expect(second.getByRole("button", { name: "Pausar" })).toBeFocused();
  await expect(second.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "2",
  );
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(formatViolations("Aurem guided journey", result.violations)).toEqual(
    [],
  );
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
