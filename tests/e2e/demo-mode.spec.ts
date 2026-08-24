import { expect, test } from '@playwright/test';

test('the public runtime manifest is fail-closed and requires no secrets', async ({ request }) => {
  const response = await request.get('/api/capabilities');
  expect(response.status()).toBe(200);
  expect(response.headers()['x-logic-runtime-mode']).toBe('demo');
  await expect(response.json()).resolves.toMatchObject({
    mode: 'demo', demoMode: true, sideEffects: false, durableWrites: false, jobs: false,
    providers: {
      analytics: 'disabled', email: 'disabled', payments: 'disabled',
      webhooks: 'disabled', externalStorage: 'disabled',
    },
    operations: {
      commercialLead: 'blocked', payments: 'unavailable', webhooks: 'unavailable', automations: 'unavailable',
    },
  });
});

test('direct transactional API calls cannot bypass demo mode', async ({ request }) => {
  const lead = await request.post('/api/leads', { data: {
    name: 'Persona ficticia', businessName: 'Alojamiento ficticio', email: 'demo@example.test',
    accommodationType: 'rural', propertyCount: 1, unitCount: 1, accept: true,
  } });
  expect(lead.status()).toBe(403);
  await expect(lead.json()).resolves.toEqual({ ok: false, outcome: 'blocked', error: 'commercial_leads_disabled' });

  for (const path of ['/api/payments', '/api/webhooks/provider', '/api/jobs/run', '/api/automations']) {
    const response = await request.post(path, { data: { mustNotBeRead: true } });
    expect(response.status(), path).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'not_found' });
  }
});

test('the sales form produces a local simulation and makes no lead request in demo mode', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('logic-estancia-consent', JSON.stringify({
      essential: true, analytics: false, timestamp: '2026-08-19T00:00:00.000Z', version: '1.0.0',
    }));
  });
  let leadRequests = 0;
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/leads') leadRequests += 1;
  });
  await page.goto('/');
  const form = page.locator('[data-lead]');
  await expect(form.locator('[data-runtime-lead-note]')).toContainText('Modo demo seguro');
  await form.locator('[name="name"]').fill('Persona ficticia');
  await form.locator('[name="businessName"]').fill('Alojamiento ficticio');
  await form.locator('[name="email"]').fill('demo@example.test');
  await form.locator('[name="accept"]').check();
  await form.getByRole('button', { name: 'Quiero una recomendación' }).click();
  await expect(form.locator('.form-status')).toHaveText('Simulación completada. No se ha enviado, almacenado ni comunicado ningún dato.');
  await expect(form.locator('[data-lead-receipt]')).toBeHidden();
  expect(leadRequests).toBe(0);
});

test('the sales form cannot reach the lead API when JavaScript is unavailable', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  let leadRequests = 0;
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/leads') leadRequests += 1;
  });
  await page.goto('/');
  const form = page.locator('[data-lead]');
  await expect(form).toHaveAttribute('method', 'dialog');
  await expect(form).not.toHaveAttribute('action');
  await expect(form.getByRole('button', { name: 'Quiero una recomendación' })).toHaveAttribute('type', 'submit');
  await form.locator('[name="name"]').fill('Persona ficticia');
  await form.locator('[name="businessName"]').fill('Alojamiento ficticio');
  await form.locator('[name="email"]').fill('demo@example.test');
  await form.locator('[name="accept"]').evaluate((element) => {
    (element as HTMLInputElement).checked = true;
  });
  const currentUrl = page.url();
  await form.getByRole('button', { name: 'Quiero una recomendación' }).click({ force: true });
  await expect(page).toHaveURL(currentUrl);
  expect(leadRequests).toBe(0);
  await context.close();
});

for (const { locale, path, submit, unavailable } of [
  { locale: 'ES', path: '/', submit: 'Quiero una recomendación', unavailable: 'No hemos podido verificar el servicio. No se ha enviado, almacenado ni comunicado ningún dato.' },
  { locale: 'EN', path: '/en/', submit: 'Get my recommendation', unavailable: 'We could not verify the service. No data was sent, stored or communicated.' },
]) {
  test(`the ${locale} sales form recovers when the runtime manifest hangs`, async ({ page }) => {
    let leadRequests = 0;
    await page.route('**/api/capabilities', () => {});
    page.on('request', (request) => {
      if (new URL(request.url()).pathname === '/api/leads') leadRequests += 1;
    });
    await page.goto(path);
    const form = page.locator('[data-lead]');
    await form.locator('[name="name"]').fill('Persona ficticia');
    await form.locator('[name="businessName"]').fill('Alojamiento ficticio');
    await form.locator('[name="email"]').fill('demo@example.test');
    await form.locator('[name="accept"]').check();
    const button = form.getByRole('button', { name: submit });
    await button.click();
    await expect(form.locator('[data-runtime-lead-note]')).toHaveAttribute('data-mode', 'unavailable', { timeout: 6_000 });
    await expect(form.locator('.form-status')).toHaveText(unavailable);
    await expect(button).toBeEnabled();
    expect(leadRequests).toBe(0);
  });
}

test('demo mode never loads analytics providers, even with prior consent', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('logic-estancia-consent', JSON.stringify({
      essential: true, analytics: true, timestamp: '2026-08-19T00:00:00.000Z', version: '1.0.0',
    }));
  });
  const providerRequests: string[] = [];
  page.on('request', (request) => {
    const host = new URL(request.url()).hostname;
    if (host.endsWith('google-analytics.com') || host.endsWith('googletagmanager.com')) providerRequests.push(request.url());
  });
  await page.goto('/demos/aurem/gestion/', { waitUntil: 'networkidle' });
  await expect(page.locator('.demo-banner')).toContainText('MODO DEMO SEGURO');
  await page.goto('/', { waitUntil: 'networkidle' });
  expect(providerRequests).toEqual([]);
  await expect(page.locator('script[data-gtm]')).toHaveCount(0);
});

test('visual demo fixtures restore automatically on reload', async ({ page }) => {
  await page.goto('/demos/aurem/gestion/');
  const role = page.getByLabel('Rol');
  await role.selectOption('cleaning');
  await expect(role).toHaveValue('cleaning');
  await page.reload();
  await expect(role).toHaveValue('direction');
  expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('logic-estancia-demo-')))).toEqual([]);
});
