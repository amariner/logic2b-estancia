import { expect, test, type Locator, type Page } from '@playwright/test';

const consentKey = 'logic-estancia-consent';
const consentVersion = '1.0.0';

const liveAnalyticsManifest = {
  schemaVersion: '1.0.0',
  mode: 'real',
  demoMode: false,
  commercialLeadsEnabled: false,
  sideEffects: true,
  durableWrites: false,
  jobs: false,
  providers: {
    analytics: 'live',
    email: 'disabled',
    payments: 'disabled',
    webhooks: 'disabled',
    externalStorage: 'disabled',
  },
  operations: {
    commercialLead: 'blocked',
    payments: 'unavailable',
    webhooks: 'unavailable',
    automations: 'unavailable',
  },
} as const;

const demoManifest = {
  ...liveAnalyticsManifest,
  mode: 'demo',
  demoMode: true,
  sideEffects: false,
  providers: { ...liveAnalyticsManifest.providers, analytics: 'disabled' },
} as const;

const incoherentAnalyticsManifest = {
  ...demoManifest,
  sideEffects: true,
  providers: { ...demoManifest.providers, analytics: 'live' },
} as const;

const solutionCases = [
  { path: '/soluciones/casas-rurales/', locale: 'es', segment: 'rural' },
  { path: '/soluciones/apartamentos/', locale: 'es', segment: 'apartments' },
  { path: '/soluciones/hoteles/', locale: 'es', segment: 'hotels' },
  { path: '/en/solutions/rural-stays/', locale: 'en', segment: 'rural' },
  { path: '/en/solutions/apartments/', locale: 'en', segment: 'apartments' },
  { path: '/en/solutions/hotels/', locale: 'en', segment: 'hotels' },
] as const;

const webViewCases = [
  { path: '/webs/nivora/', locale: 'es', web: 'nivora', plan: 'basico' },
  { path: '/webs/terrava/', locale: 'es', web: 'terrava', plan: 'gestion' },
  { path: '/webs/aurem/', locale: 'es', web: 'aurem', plan: 'inteligente' },
  { path: '/webs/linde/', locale: 'es', web: 'linde', plan: 'basico' },
  { path: '/webs/cobalto/', locale: 'es', web: 'cobalto', plan: 'inteligente' },
  { path: '/webs/oria/', locale: 'es', web: 'oria', plan: 'gestion' },
  { path: '/webs/boscara/', locale: 'es', web: 'boscara', plan: 'inteligente' },
  { path: '/webs/velares/', locale: 'es', web: 'velares', plan: 'gestion' },
  { path: '/webs/nocta/', locale: 'es', web: 'nocta', plan: 'basico' },
  { path: '/webs/riscoa/', locale: 'es', web: 'riscoa', plan: 'gestion' },
  { path: '/webs/solerna/', locale: 'es', web: 'solerna', plan: 'basico' },
  { path: '/webs/cendra/', locale: 'es', web: 'cendra', plan: 'inteligente' },
  { path: '/en/webs/nivora/', locale: 'en', web: 'nivora', plan: 'basico' },
  { path: '/en/webs/terrava/', locale: 'en', web: 'terrava', plan: 'gestion' },
  { path: '/en/webs/aurem/', locale: 'en', web: 'aurem', plan: 'inteligente' },
  { path: '/en/webs/linde/', locale: 'en', web: 'linde', plan: 'basico' },
  { path: '/en/webs/cobalto/', locale: 'en', web: 'cobalto', plan: 'inteligente' },
  { path: '/en/webs/oria/', locale: 'en', web: 'oria', plan: 'gestion' },
  { path: '/en/webs/boscara/', locale: 'en', web: 'boscara', plan: 'inteligente' },
  { path: '/en/webs/velares/', locale: 'en', web: 'velares', plan: 'gestion' },
  { path: '/en/webs/nocta/', locale: 'en', web: 'nocta', plan: 'basico' },
  { path: '/en/webs/riscoa/', locale: 'en', web: 'riscoa', plan: 'gestion' },
  { path: '/en/webs/solerna/', locale: 'en', web: 'solerna', plan: 'basico' },
  { path: '/en/webs/cendra/', locale: 'en', web: 'cendra', plan: 'inteligente' },
] as const;

const panelViewCases = [
  { path: '/paneles/solicitudes/', locale: 'es', panel: 'enquiries', plan: 'gestion' },
  { path: '/paneles/planning/', locale: 'es', panel: 'planning', plan: 'gestion' },
  { path: '/paneles/huespedes-llegadas/', locale: 'es', panel: 'guests-arrivals', plan: 'gestion' },
  { path: '/paneles/preparacion/', locale: 'es', panel: 'preparation', plan: 'inteligente' },
  { path: '/paneles/operacion-ingresos/', locale: 'es', panel: 'operations-revenue', plan: 'inteligente' },
  { path: '/paneles/copiloto-supervisado/', locale: 'es', panel: 'copilot', plan: 'inteligente' },
  { path: '/en/panels/enquiries/', locale: 'en', panel: 'enquiries', plan: 'gestion' },
  { path: '/en/panels/planning/', locale: 'en', panel: 'planning', plan: 'gestion' },
  { path: '/en/panels/guests-arrivals/', locale: 'en', panel: 'guests-arrivals', plan: 'gestion' },
  { path: '/en/panels/preparation/', locale: 'en', panel: 'preparation', plan: 'inteligente' },
  { path: '/en/panels/operations-revenue/', locale: 'en', panel: 'operations-revenue', plan: 'inteligente' },
  { path: '/en/panels/supervised-copilot/', locale: 'en', panel: 'copilot', plan: 'inteligente' },
] as const;

const trackedEventNames = [
  'solution_view',
  'web_view',
  'panel_view',
  'web_handoff',
  'panel_handoff',
  'plan_select',
  'assessment_start',
  'assessment_step',
  'assessment_complete',
  'assessment_submit',
  'demo_open',
  'demo_mode_select',
  'demo_step_complete',
  'demo_flow_complete',
  'demo_cta',
  'lead_submit',
  'meeting_click',
  'cta_click',
] as const;

type RuntimeManifest = typeof liveAnalyticsManifest | typeof demoManifest | typeof incoherentAnalyticsManifest;

async function routeRuntime(page: Page, manifest: RuntimeManifest): Promise<void> {
  await page.route('**/api/capabilities', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify(manifest),
  }));
  await page.route('https://www.googletagmanager.com/**', (route) => route.fulfill({
    contentType: 'application/javascript',
    body: '/* analytics provider stubbed by the end-to-end test */',
  }));
}

async function seedConsent(page: Page, analytics: boolean, version = consentVersion): Promise<void> {
  await page.addInitScript(({ key, allowed, currentVersion }) => {
    localStorage.setItem(key, JSON.stringify({
      essential: true,
      analytics: allowed,
      timestamp: '2026-08-22T00:00:00.000Z',
      version: currentVersion,
    }));
  }, { key: consentKey, allowed: analytics, currentVersion: version });
}

async function waitForRuntime(page: Page): Promise<void> {
  await page.evaluate(async () => { await window.estanciaRuntimeReady; });
}

async function eventsNamed(page: Page, eventName: string): Promise<Record<string, unknown>[]> {
  return page.evaluate((name) => (window.dataLayer ?? []).filter((entry) => entry.event === name), eventName);
}

async function trackedEvents(page: Page): Promise<Record<string, unknown>[]> {
  return page.evaluate((names) => {
    const allowed = new Set(names);
    return (window.dataLayer ?? []).filter((entry) => typeof entry.event === 'string' && allowed.has(entry.event));
  }, trackedEventNames);
}

async function clickWithoutNavigation(link: Locator): Promise<void> {
  await link.evaluate((element) => element.addEventListener('click', (event) => event.preventDefault(), { once: true }));
  await link.click();
}

test('analytics activates only with a coherent live runtime and current versioned consent', async ({ page }) => {
  await seedConsent(page, true);
  await routeRuntime(page, liveAnalyticsManifest);
  await page.goto('/docs/');
  await waitForRuntime(page);

  await expect(page.locator('script[data-gtm]')).toHaveCount(1);
  await page.evaluate(() => {
    window.estanciaLoadGtm?.();
    window.estanciaLoadGtm?.();
  });
  await expect(page.locator('script[data-gtm]')).toHaveCount(1);
  expect(await eventsNamed(page, 'gtm.js')).toHaveLength(1);

  await page.evaluate(() => {
    window.estanciaTrack?.('cta_click', { locale: 'es', source_section: 'resource' });
  });
  await expect.poll(() => eventsNamed(page, 'cta_click')).toEqual([
    { event: 'cta_click', locale: 'es', source_section: 'resource' },
  ]);
});

test('an incoherent live-looking runtime fails closed', async ({ page }) => {
  await seedConsent(page, true);
  await routeRuntime(page, incoherentAnalyticsManifest);
  await page.goto('/docs/');
  await waitForRuntime(page);

  await page.evaluate(() => {
    window.estanciaTrack?.('cta_click', { locale: 'es', source_section: 'resource' });
  });
  await expect.poll(() => trackedEvents(page)).toEqual([]);
  await expect(page.locator('script[data-gtm]')).toHaveCount(0);
});

test('revoking consent while the runtime is pending drops queued events', async ({ page }) => {
  await seedConsent(page, true);
  let releaseRuntime = () => {};
  const runtimeGate = new Promise<void>((resolve) => { releaseRuntime = resolve; });
  await page.route('**/api/capabilities', async (route) => {
    await runtimeGate;
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(liveAnalyticsManifest) });
  });
  await page.route('https://www.googletagmanager.com/**', (route) => route.fulfill({
    contentType: 'application/javascript', body: '/* provider must remain unloaded */',
  }));
  await page.goto('/docs/');
  await page.evaluate((key) => {
    window.estanciaTrack?.('cta_click', { locale: 'es', source_section: 'resource' });
    localStorage.removeItem(key);
  }, consentKey);
  releaseRuntime();
  await waitForRuntime(page);

  await expect.poll(() => trackedEvents(page)).toEqual([]);
  await expect(page.locator('script[data-gtm]')).toHaveCount(0);
});

test('all six localized solution landings emit one exact solution_view', async ({ page }) => {
  await seedConsent(page, true);
  await routeRuntime(page, liveAnalyticsManifest);

  for (const item of solutionCases) {
    await test.step(item.path, async () => {
      const response = await page.goto(item.path);
      expect(response?.status()).toBe(200);
      await waitForRuntime(page);
      await expect.poll(() => eventsNamed(page, 'solution_view')).toEqual([
        {
          event: 'solution_view',
          locale: item.locale,
          segment: item.segment,
          source_section: 'solution',
        },
      ]);
    });
  }
});

test('all twelve website directions emit one exact localized web_view', async ({ page }) => {
  await seedConsent(page, true);
  await routeRuntime(page, liveAnalyticsManifest);

  for (const item of webViewCases) {
    await test.step(item.path, async () => {
      const response = await page.goto(item.path);
      expect(response?.status()).toBe(200);
      await waitForRuntime(page);
      await expect.poll(() => eventsNamed(page, 'web_view')).toEqual([{
        event: 'web_view', locale: item.locale, web: item.web, plan: item.plan, source_section: 'web_portfolio',
      }]);
      await clickWithoutNavigation(page.locator('[data-web-handoff="assessment"]'));
      await expect.poll(() => eventsNamed(page, 'web_handoff')).toEqual([{
        event: 'web_handoff', locale: item.locale, web: item.web, plan: item.plan, handoff: 'assessment', source_section: 'web_portfolio',
      }]);
    });
  }
});

test('all six workspace evidence pages emit one exact localized panel_view', async ({ page }) => {
  await seedConsent(page, true);
  await routeRuntime(page, liveAnalyticsManifest);

  for (const item of panelViewCases) {
    await test.step(item.path, async () => {
      const response = await page.goto(item.path);
      expect(response?.status()).toBe(200);
      await waitForRuntime(page);
      await expect.poll(() => eventsNamed(page, 'panel_view')).toEqual([{
        event: 'panel_view', locale: item.locale, panel: item.panel, plan: item.plan, source_section: 'panel_portfolio',
      }]);
      await clickWithoutNavigation(page.locator('[data-panel-handoff="assessment"]'));
      await expect.poll(() => eventsNamed(page, 'panel_handoff')).toEqual([{
        event: 'panel_handoff', locale: item.locale, panel: item.panel, plan: item.plan, handoff: 'assessment', source_section: 'panel_portfolio',
      }]);
    });
  }
});

test('published demo and contact handoffs emit exact synchronous commercial events', async ({ page }) => {
  await seedConsent(page, true);
  await routeRuntime(page, liveAnalyticsManifest);

  await page.goto('/webs/nivora/');
  await waitForRuntime(page);
  await clickWithoutNavigation(page.locator('[data-web-handoff="demo"]'));
  await clickWithoutNavigation(page.locator('[data-web-handoff="contact"]'));
  expect(await eventsNamed(page, 'web_handoff')).toEqual([
    { event: 'web_handoff', locale: 'es', web: 'nivora', plan: 'basico', handoff: 'demo', source_section: 'web_portfolio' },
    { event: 'web_handoff', locale: 'es', web: 'nivora', plan: 'basico', handoff: 'contact', source_section: 'web_portfolio' },
  ]);

  await page.goto('/en/panels/planning/');
  await waitForRuntime(page);
  await clickWithoutNavigation(page.locator('[data-panel-handoff="demo"]'));
  await clickWithoutNavigation(page.locator('[data-panel-handoff="contact"]'));
  expect(await eventsNamed(page, 'panel_handoff')).toEqual([
    { event: 'panel_handoff', locale: 'en', panel: 'planning', plan: 'gestion', handoff: 'demo', source_section: 'panel_portfolio' },
    { event: 'panel_handoff', locale: 'en', panel: 'planning', plan: 'gestion', handoff: 'contact', source_section: 'panel_portfolio' },
  ]);
});

test('portfolio views wait for in-page consent and remain idempotent', async ({ page }) => {
  await routeRuntime(page, liveAnalyticsManifest);
  await page.goto('/webs/linde/');
  await waitForRuntime(page);

  const banner = page.getByRole('dialog', { name: 'Configuración de cookies' });
  await expect(banner).toBeVisible();
  expect(await eventsNamed(page, 'web_view')).toEqual([]);
  await clickWithoutNavigation(page.locator('[data-web-handoff="contact"]'));
  expect(await eventsNamed(page, 'web_handoff')).toEqual([]);
  await banner.getByRole('button', { name: 'Aceptar', exact: true }).click();

  const expected = [{ event: 'web_view', locale: 'es', web: 'linde', plan: 'basico', source_section: 'web_portfolio' }];
  await expect.poll(() => eventsNamed(page, 'web_view')).toEqual(expected);
  await clickWithoutNavigation(page.locator('[data-web-handoff="assessment"]'));
  await expect.poll(() => eventsNamed(page, 'web_handoff')).toEqual([
    { event: 'web_handoff', locale: 'es', web: 'linde', plan: 'basico', handoff: 'assessment', source_section: 'web_portfolio' },
  ]);
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('estancia:consent-updated', {
      detail: { essential: true, analytics: true, version: '1.0.0' },
    }));
  });
  await expect.poll(() => eventsNamed(page, 'web_view')).toEqual(expected);
});

test('a portfolio view is dropped when consent is revoked before runtime resolves', async ({ page }) => {
  await seedConsent(page, true);
  let releaseRuntime = () => {};
  const runtimeGate = new Promise<void>((resolve) => { releaseRuntime = resolve; });
  await page.route('**/api/capabilities', async (route) => {
    await runtimeGate;
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(liveAnalyticsManifest) });
  });
  await page.route('https://www.googletagmanager.com/**', (route) => route.fulfill({
    contentType: 'application/javascript', body: '/* provider must remain unloaded */',
  }));
  await page.goto('/paneles/preparacion/');
  await clickWithoutNavigation(page.locator('[data-panel-handoff="contact"]'));
  await page.evaluate((key) => localStorage.removeItem(key), consentKey);
  releaseRuntime();
  await waitForRuntime(page);

  await expect.poll(() => eventsNamed(page, 'panel_view')).toEqual([]);
  await expect.poll(() => eventsNamed(page, 'panel_handoff')).toEqual([]);
  await expect(page.locator('script[data-gtm]')).toHaveCount(0);
});

test('canonical demos remain analytics-free even with stored consent', async ({ page }) => {
  await seedConsent(page, true);
  let capabilityRequests = 0;
  await page.route('**/api/capabilities', (route) => {
    capabilityRequests += 1;
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify(liveAnalyticsManifest) });
  });
  for (const path of ['/demos/nivora/', '/demos/terrava/', '/demos/aurem/', '/en/demos/nivora/', '/en/demos/terrava/', '/en/demos/aurem/']) {
    await page.goto(path);
    await page.waitForTimeout(25);
    expect(await eventsNamed(page, 'web_view')).toEqual([]);
    expect(await eventsNamed(page, 'web_handoff')).toEqual([]);
    expect(await eventsNamed(page, 'panel_handoff')).toEqual([]);
    await expect(page.locator('script[data-gtm]')).toHaveCount(0);
  }
  expect(capabilityRequests).toBe(0);
});

test('a solution view waits for in-page consent and stays idempotent after repeated approval', async ({ page }) => {
  await routeRuntime(page, liveAnalyticsManifest);
  await page.goto('/soluciones/apartamentos/');
  await waitForRuntime(page);

  const banner = page.getByRole('dialog', { name: 'Configuración de cookies' });
  await expect(banner).toBeVisible();
  expect(await eventsNamed(page, 'solution_view')).toEqual([]);

  await banner.getByRole('button', { name: 'Rechazar', exact: true }).click();
  await expect(banner).toBeHidden();
  expect(await eventsNamed(page, 'solution_view')).toEqual([]);

  await page.evaluate((key) => {
    localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent('estancia:consent-cleared'));
  }, consentKey);
  await expect(banner).toBeVisible();
  await banner.getByRole('button', { name: 'Aceptar', exact: true }).click();

  const expected = [{
    event: 'solution_view',
    locale: 'es',
    segment: 'apartments',
    source_section: 'solution',
  }];
  await expect.poll(() => eventsNamed(page, 'solution_view')).toEqual(expected);
  await page.evaluate(async () => {
    window.dispatchEvent(new CustomEvent('estancia:consent-updated', {
      detail: { essential: true, analytics: true, version: '1.0.0' },
    }));
    await window.estanciaRuntimeReady;
    await new Promise<void>((resolve) => setTimeout(resolve));
  });
  await expect.poll(() => eventsNamed(page, 'solution_view')).toEqual(expected);
  await expect(page.locator('script[data-gtm]')).toHaveCount(1);
});

test('an assessment preserves entry order when in-page consent precedes a slow runtime', async ({ page }) => {
  let releaseRuntime = () => {};
  const runtimeGate = new Promise<void>((resolve) => { releaseRuntime = resolve; });
  await page.route('**/api/capabilities', async (route) => {
    await runtimeGate;
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(liveAnalyticsManifest) });
  });
  await page.route('https://www.googletagmanager.com/**', (route) => route.fulfill({
    contentType: 'application/javascript', body: '/* provider stubbed by the end-to-end test */',
  }));
  await page.goto('/diagnostico/?segment=rural');

  const banner = page.getByRole('dialog', { name: 'Configuración de cookies' });
  await expect(banner).toBeVisible();
  expect(await eventsNamed(page, 'assessment_start')).toEqual([]);
  expect(await eventsNamed(page, 'assessment_step')).toEqual([]);

  await banner.getByRole('button', { name: 'Aceptar', exact: true }).click();
  await page.locator('[data-next]').click();
  await expect(page.locator('fieldset[data-step="2"]')).toBeVisible();
  releaseRuntime();
  await waitForRuntime(page);

  const start = [{
    event: 'assessment_start', locale: 'es', segment: 'rural', source_section: 'assessment',
  }];
  const steps = [{
    event: 'assessment_step', locale: 'es', step_index: 2, source_section: 'assessment',
  }];
  await expect.poll(() => eventsNamed(page, 'assessment_start')).toEqual(start);
  await expect.poll(() => eventsNamed(page, 'assessment_step')).toEqual(steps);
  await expect.poll(() => page.evaluate(() => (window.dataLayer ?? [])
    .filter(({ event }) => event === 'assessment_start' || event === 'assessment_step')
    .map(({ event }) => event))).toEqual(['assessment_start', 'assessment_step']);

  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('estancia:consent-updated', {
      detail: { essential: true, analytics: true, version: '1.0.0' },
    }));
  });
  await expect.poll(() => eventsNamed(page, 'assessment_start')).toEqual(start);
  await expect.poll(() => eventsNamed(page, 'assessment_step')).toEqual(steps);
});

test('a valid assessment emits one exact submit before one complete without answers or PII', async ({ page }) => {
  await seedConsent(page, true);
  await routeRuntime(page, liveAnalyticsManifest);
  await page.goto('/diagnostico/?segment=hotels&plan=inteligente&properties=37&units=42');
  await waitForRuntime(page);

  await expect.poll(() => eventsNamed(page, 'assessment_start')).toEqual([{
    event: 'assessment_start', locale: 'es', segment: 'hotels', source_section: 'assessment',
  }]);
  await expect.poll(() => eventsNamed(page, 'assessment_step')).toEqual([{
    event: 'assessment_step', locale: 'es', step_index: 1, source_section: 'assessment',
  }]);

  const next = page.locator('[data-next]');
  for (let step = 0; step < 5; step += 1) await next.click();
  await expect(page.locator('fieldset[data-step="6"]')).toBeVisible();
  await page.locator('[name="timeline"]').selectOption('3-6');
  await page.locator('[name="investmentRange"]').selectOption('20k-plus');
  await next.click();
  await expect(page.locator('[data-result-name]')).toHaveText('Inteligente');

  await expect.poll(() => eventsNamed(page, 'assessment_submit')).toEqual([
    {
      event: 'assessment_submit',
      locale: 'es',
      segment: 'hotels',
      plan: 'inteligente',
      source_section: 'assessment',
    },
  ]);
  await expect.poll(() => eventsNamed(page, 'assessment_complete')).toEqual([
    {
      event: 'assessment_complete',
      locale: 'es',
      plan: 'inteligente',
      source_section: 'assessment',
    },
  ]);

  const terminalEvents = await page.evaluate(() => (window.dataLayer ?? []).filter((entry) =>
    entry.event === 'assessment_submit' || entry.event === 'assessment_complete'));
  expect(terminalEvents.map(({ event }) => event)).toEqual(['assessment_submit', 'assessment_complete']);
  for (const event of terminalEvents) {
    for (const privateKey of [
      'accommodationType', 'businessMode', 'propertyCount', 'unitCount', 'currentStack',
      'bookingNeeds', 'operationNeeds', 'timeline', 'investmentRange', 'email', 'name', 'phone', 'message',
    ]) expect(event).not.toHaveProperty(privateKey);
  }
  expect(JSON.stringify(terminalEvents)).not.toContain('20k-plus');
  expect(JSON.stringify(terminalEvents)).not.toContain('42');
});

test('invalid assessment validation emits no submit or complete event', async ({ page }) => {
  await seedConsent(page, true);
  await routeRuntime(page, liveAnalyticsManifest);
  await page.goto('/diagnostico/');
  await waitForRuntime(page);

  await page.locator('[data-next]').click();
  await expect(page.locator('fieldset[data-step="1"]')).toBeVisible();
  expect(await eventsNamed(page, 'assessment_submit')).toEqual([]);
  expect(await eventsNamed(page, 'assessment_complete')).toEqual([]);
});

test('absent, rejected or stale consent and demo runtime emit no analytics events', async ({ browser }) => {
  const cases = [
    { name: 'absent consent', consent: null, version: consentVersion, manifest: liveAnalyticsManifest },
    { name: 'rejected consent', consent: false, version: consentVersion, manifest: liveAnalyticsManifest },
    { name: 'stale consent version', consent: true, version: '0.9.0', manifest: liveAnalyticsManifest },
    { name: 'demo runtime', consent: true, version: consentVersion, manifest: demoManifest },
  ] as const;

  for (const item of cases) {
    await test.step(item.name, async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      if (item.consent !== null) await seedConsent(page, item.consent, item.version);
      await routeRuntime(page, item.manifest);
      await page.goto('/soluciones/hoteles/');
      await waitForRuntime(page);

      expect(await trackedEvents(page)).toEqual([]);
      await expect(page.locator('script[data-gtm]')).toHaveCount(0);
      await context.close();
    });
  }
});

test('the live dataLayer strips PII and drops incomplete or non-canonical events', async ({ page }) => {
  await seedConsent(page, true);
  await routeRuntime(page, liveAnalyticsManifest);
  await page.goto('/docs/');
  await waitForRuntime(page);

  await page.evaluate(() => {
    window.estanciaTrack?.('assessment_submit', {
      locale: 'es',
      segment: 'hotels',
      plan: 'inteligente',
      source_section: 'assessment',
      email: 'buyer@example.test',
      name: 'Ada Lovelace',
      phone: '+34 600 000 000',
      message: 'Necesito ayuda con mi hotel',
    });
    window.estanciaTrack?.('assessment_submit', {
      locale: 'es',
      segment: 'hotels',
      plan: 'enterprise',
      source_section: 'assessment',
      demo: 'private-client',
      flow: 'secret-flow',
      step_index: 0,
      email: 'buyer@example.test',
      name: 'Ada Lovelace',
      phone: '+34 600 000 000',
      message: 'Necesito ayuda con mi hotel',
    });
    window.estanciaTrack?.('assessment_submit', {
      locale: 'es',
      segment: 'hotels',
      plan: 'none',
      source_section: 'assessment',
    });
    window.estanciaTrack?.('assessment_step', {
      locale: 'es',
      step_index: 7,
      source_section: 'assessment',
    });
    window.estanciaTrack?.('web_view', {
      locale: 'es',
      web: 'linde',
      plan: 'inteligente',
      source_section: 'web_portfolio',
      page_location: 'https://example.test/private',
    });
    window.estanciaTrack?.('panel_view', {
      locale: 'es',
      panel: 'private-panel',
      plan: 'gestion',
      source_section: 'panel_portfolio',
    });
    window.estanciaTrack?.('web_handoff', {
      locale: 'es',
      web: 'linde',
      plan: 'inteligente',
      handoff: 'private-route',
      source_section: 'web_portfolio',
      page_location: 'https://example.test/private-handoff',
    });
    window.estanciaTrack?.('panel_handoff', {
      locale: 'es',
      panel: 'copilot',
      plan: 'gestion',
      handoff: 'contact',
      source_section: 'panel_portfolio',
    });
    window.estanciaTrack?.('invented_event', {
      locale: 'es',
      segment: 'hotels',
      source_section: 'assessment',
    });
  });

  await expect.poll(() => eventsNamed(page, 'assessment_submit')).toEqual([
    {
      event: 'assessment_submit',
      locale: 'es',
      segment: 'hotels',
      plan: 'inteligente',
      source_section: 'assessment',
    },
  ]);
  expect(await eventsNamed(page, 'invented_event')).toEqual([]);
  expect(await eventsNamed(page, 'web_view')).toEqual([]);
  expect(await eventsNamed(page, 'panel_view')).toEqual([]);
  expect(await eventsNamed(page, 'web_handoff')).toEqual([]);
  expect(await eventsNamed(page, 'panel_handoff')).toEqual([]);
  const dataLayer = await page.evaluate(() => window.dataLayer ?? []);
  const serialized = JSON.stringify(dataLayer);
  for (const privateValue of [
    'enterprise', 'private-client', 'secret-flow', 'buyer@example.test',
    'Ada Lovelace', '+34 600 000 000', 'Necesito ayuda con mi hotel',
    'https://example.test/private', 'private-panel', 'private-route', 'https://example.test/private-handoff',
  ]) expect(serialized).not.toContain(privateValue);
});
