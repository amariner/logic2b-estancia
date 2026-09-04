import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const commercialRoutes = [
  '/', '/en/',
  '/soluciones/casas-rurales/', '/en/solutions/rural-stays/',
  '/soluciones/apartamentos/', '/en/solutions/apartments/',
  '/soluciones/hoteles/', '/en/solutions/hotels/',
  '/planes/', '/en/plans/', '/webs/', '/en/webs/',
  '/paneles/', '/en/panels/',
  '/paneles/solicitudes/', '/en/panels/enquiries/',
  '/paneles/planning/', '/en/panels/planning/',
  '/paneles/huespedes-llegadas/', '/en/panels/guests-arrivals/',
  '/paneles/preparacion/', '/en/panels/preparation/',
  '/paneles/operacion-ingresos/', '/en/panels/operations-revenue/',
  '/paneles/copiloto-supervisado/', '/en/panels/supervised-copilot/',
  '/webs/linde/', '/en/webs/linde/',
  '/webs/cobalto/', '/en/webs/cobalto/',
  '/webs/oria/', '/en/webs/oria/',
  '/webs/boscara/', '/en/webs/boscara/',
  '/webs/velares/', '/en/webs/velares/',
  '/webs/nocta/', '/en/webs/nocta/',
  '/webs/riscoa/', '/en/webs/riscoa/',
  '/webs/solerna/', '/en/webs/solerna/',
  '/webs/cendra/', '/en/webs/cendra/',
  '/diagnostico/', '/en/assessment/',
  '/docs/', '/en/docs/',
  '/docs/direccion-propiedad/', '/en/docs/ownership-direction/',
  '/docs/reservas-recepcion/', '/en/docs/reservations-reception/',
  '/docs/operaciones/', '/en/docs/operations/',
  '/docs/marketing-ingresos/', '/en/docs/marketing-revenue/',
  '/docs/tecnica-privacidad/', '/en/docs/technical-privacy/',
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
  '/demos/terrava/gestion/?vista=enquiries',
  '/en/demos/terrava/gestion/?vista=planning',
  '/demos/terrava/gestion/?vista=website',
  '/en/demos/terrava/gestion/?vista=website',
  '/demos/aurem/gestion/?vista=cleaning',
  '/en/demos/aurem/gestion/?vista=maintenance',
  '/demos/aurem/gestion/?vista=reports',
  '/en/demos/aurem/gestion/?vista=reports',
  '/demos/aurem/gestion/?vista=channels',
  '/en/demos/aurem/gestion/?vista=channels',
  '/demos/aurem/gestion/?vista=automations',
  '/en/demos/aurem/gestion/?vista=automations',
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
  const response = await page.goto(path, { waitUntil: 'load' });
  expect(response?.status(), path).toBe(200);
  await page.locator('main').waitFor({ state: 'visible' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
}

test('representative ES/EN routes have no automated WCAG 2.2 AA violations', async ({ page }) => {
  test.setTimeout(120_000);
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

test('recovered assessment context stays accessible and reflows at 320px', async ({ page }) => {
  await gotoStable(page, '/');
  await page.evaluate(() => {
    localStorage.setItem('logic-estancia-consent', JSON.stringify({ essential: true, analytics: false, timestamp: new Date().toISOString(), version: '1.0.0' }));
    sessionStorage.setItem('logic-estancia-assessment-v1', JSON.stringify({
      version: '1.0.0', createdAt: Date.now(), locale: 'es', accommodationType: 'hotel', businessMode: 'multi',
      propertyCount: 2, unitCount: 48, plan: 'inteligente', currentStack: ['pms', 'channels'],
      requestedCapabilities: ['maintenance', 'automation', 'metrics'], timeline: '3-6', investmentRange: '8k-20k',
    }));
  });
  await page.setViewportSize({ width: 320, height: 900 });
  await gotoStable(page, '/?assessment=1#contacto');
  const handoff = page.locator('[data-assessment-handoff]');
  await handoff.getByText('Revisar el contexto que se adjuntará').click();
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(formatViolations('assessment handoff', result.violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  await expect(page.locator('[data-whatsapp]')).toHaveAttribute('data-visible', 'false');
});

test('every audited route exposes one main landmark and one page heading', async ({ page }) => {
  test.setTimeout(120_000);
  for (const path of [...auditedRoutes, ...deepStateRoutes]) {
    await gotoStable(page, path);
    await expect(page.locator('main'), `${path}: main landmark`).toHaveCount(1);
    await expect(page.locator('h1'), `${path}: page heading`).toHaveCount(1);
  }
});

test('every audited route reflows without page-level horizontal scrolling at 320px', async ({ page }) => {
  test.setTimeout(120_000);
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
  for (const path of ['/', '/planes/', '/paneles/solicitudes/', '/webs/linde/', '/diagnostico/', '/demos/nivora/', '/demos/terrava/', '/demos/terrava/gestion/?vista=website', '/demos/aurem/gestion/?vista=automations', '/demos/aurem/gestion/?vista=reports']) {
    await gotoStable(page, path);
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    const reflow = await page.evaluate(() => ({
      pageScrollWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth,
      offenders: [document.body, ...document.querySelectorAll<HTMLElement>('body *')].flatMap((element) => {
        const bounds = element.getBoundingClientRect();
        return bounds.right <= innerWidth + 0.5 && element.scrollWidth <= element.clientWidth + 0.5 ? [] : [`${element.tagName.toLowerCase()}${element.className ? `.${String(element.className).replace(/\s+/g, '.')}` : ''}`];
      }).slice(0, 8),
    }));
    expect(reflow.pageScrollWidth <= reflow.viewportWidth, `${path}: ${JSON.stringify(reflow)}`).toBe(true);
  }
});

test('Nivora enquiry interaction remains accessible and reflows at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await gotoStable(page, '/demos/nivora/');
  const demo = page.locator('[data-email-enquiry-demo]');
  await demo.getByRole('button', { name: 'Viaje en familia' }).click();
  await expect(demo.locator('[data-email-enquiry-status]')).toBeVisible();
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(formatViolations('Nivora email enquiry', result.violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
});

test('Terrava supervised editor remains accessible after local approval at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await gotoStable(page, '/demos/terrava/gestion/?vista=website');
  await page.getByLabel('Texto del hero').fill('Una estancia empieza antes de llegar.');
  await page.getByLabel('Rol').selectOption('direction');
  await page.getByRole('button', { name: 'Aprobar vista local' }).click();
  await expect(page.locator('.editor-controls .tag')).toHaveText('Aprobada en esta demo');
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(formatViolations('Terrava website editor', result.violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
});

test('Aurem inert automations remain accessible after local review at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await gotoStable(page, '/demos/aurem/gestion/?vista=automations');
  await page.getByRole('button', { name: /Elevar una incidencia/ }).click();
  await page.getByRole('button', { name: 'Registrar revisión local' }).click();
  await expect(page.locator('.automation-inspector .tag')).toHaveText('Revisada · sigue inactiva');
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(formatViolations('Aurem inert automations', result.violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
});

test('diagnostic step and result changes move focus to the new context', async ({ page }) => {
  await gotoStable(page, '/diagnostico/');
  await page.getByRole('button', { name: 'Rechazar' }).click();
  await page.locator('[data-step="1"]').getByText('Apartamentos', { exact: true }).click();
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

test("Aurem guided milestones expose accessible progress and move focus with their context", async ({
  page,
}) => {
  await gotoStable(page, "/demos/aurem/gestion/");
  await page.getByRole("button", { name: "Ver recorrido" }).click();
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

for (const path of ['/', '/paneles/solicitudes/', '/webs/linde/', '/demos/terrava/', '/demos/aurem/gestion/']) {
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

for (const path of ['/', '/paneles/solicitudes/', '/webs/linde/', '/demos/terrava/', '/demos/aurem/gestion/']) {
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
