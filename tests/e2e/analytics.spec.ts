import { expect, test, type Page } from '@playwright/test';

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

const trackedEventNames = [
  'solution_view',
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
  const dataLayer = await page.evaluate(() => window.dataLayer ?? []);
  const serialized = JSON.stringify(dataLayer);
  for (const privateValue of [
    'enterprise', 'private-client', 'secret-flow', 'buyer@example.test',
    'Ada Lovelace', '+34 600 000 000', 'Necesito ayuda con mi hotel',
  ]) expect(serialized).not.toContain(privateValue);
});
