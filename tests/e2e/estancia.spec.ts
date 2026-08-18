import { expect, test, type Page } from '@playwright/test';

const paths = [
  '/', '/en/', '/docs/', '/en/docs/',
  '/soluciones/casas-rurales/', '/soluciones/apartamentos/', '/soluciones/hoteles/', '/planes/', '/diagnostico/',
  '/en/solutions/rural-stays/', '/en/solutions/apartments/', '/en/solutions/hotels/', '/en/plans/', '/en/assessment/',
  '/recursos/gestor-reservas-apartamentos-turisticos/', '/recursos/web-hotel-reservas-directas-operacion/',
  '/legal/', '/privacidad/', '/cookies/',
  '/en/legal/', '/en/privacidad/', '/en/cookies/',
  '/demos/nivora/', '/demos/terrava/', '/demos/aurem/',
  '/demos/terrava/gestion/', '/demos/aurem/gestion/',
  '/en/demos/nivora/', '/en/demos/terrava/', '/en/demos/aurem/',
  '/en/demos/terrava/gestion/', '/en/demos/aurem/gestion/',
];

async function expectCleanPage(page: Page, path: string) {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  const response = await page.goto(path, { waitUntil: 'networkidle' });
  expect(response?.status(), path).toBe(200);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} has horizontal overflow`).toBe(true);
  expect(errors, `${path} emitted browser errors`).toEqual([]);
}

test('public routes are complete and demos remain isolated', async ({ page }) => {
  for (const path of paths) {
    await expectCleanPage(page, path);
    if (path.includes('/demos/')) {
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
      expect(await page.locator('script[src*="googletagmanager"], script[src*="google-analytics"]').count()).toBe(0);
      expect(await page.locator('img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0))).toBe(true);
    }
  }
});

test('capability maps expose truthful evidence and exact localized targets', async ({ page, request }) => {
  await page.goto('/soluciones/casas-rurales/');
  await expect(page.locator('[data-capability-evidence]')).toHaveCount(6);
  const planning = page.locator('[data-capability="planning"]');
  await expect(planning).toContainText('Desde Gestión');
  await expect(planning).toContainText('Reasignación de unidad y ajuste de tarifa reversibles');
  await expect(planning).toContainText('Sin PMS, disponibilidad, pagos ni tarifas conectadas');
  await expect(planning.locator('[data-capability-evidence]')).toHaveAttribute('href', '/demos/terrava/gestion/?vista=planning');

  await page.goto('/soluciones/hoteles/');
  await expect(page.locator('[data-capability-evidence]')).toHaveCount(7);
  await expect(page.locator('[data-capability="channels"]')).toContainText('A validar');
  await expect(page.locator('[data-capability-evidence="channels"]')).toHaveAttribute('href', '/demos/aurem/gestion/?vista=channels');

  await page.goto('/en/plans/');
  const evidenceLinks = page.locator('[data-capability-evidence]');
  await expect(evidenceLinks).toHaveCount(14);
  await expect(page.locator('[data-capability="revenue"]')).toContainText('Minimum plan: Intelligent');
  await expect(page.locator('[data-capability="revenue"]')).toContainText('Future');
  await expect(page.locator('[data-capability-evidence="revenue"]')).toHaveAttribute('href', '/en/demos/aurem/gestion/?vista=reports');
  await expect(page.locator('[data-capability-evidence="email-enquiries"]')).toHaveAttribute('href', '/en/demos/nivora/#reserva');

  for (const href of await evidenceLinks.evaluateAll((links) => links.map((link) => link.getAttribute('href')).filter(Boolean) as string[])) {
    expect((await request.get(href)).status(), href).toBe(200);
  }
});

test('capability evidence opens the exact fictitious flow without external writes', async ({ page }) => {
  const externalWrites: string[] = [];
  page.on('request', (request) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method())) externalWrites.push(request.url());
  });

  await page.goto('/soluciones/hoteles/');
  await page.locator('[data-capability-evidence="channels"]').click();
  await expect(page).toHaveURL(/\/demos\/aurem\/gestion\/\?vista=channels$/);
  await page.getByRole('button', { name: 'Explorar libremente' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Canales' })).toBeVisible();
  await expect(page.getByRole('note')).toContainText('0 canales conectados');

  await page.goto('/planes/');
  await page.locator('[data-capability-evidence="email-enquiries"]').click();
  await expect(page).toHaveURL(/\/demos\/nivora\/#reserva$/);
  await expect(page.locator('#reserva [data-demo-form]')).toBeVisible();
  await expect(page.locator('#reserva')).toContainText('no bloquea inventario');
  expect(externalWrites).toEqual([]);
});

for (const width of [320, 375, 430, 1366]) {
  test(`core experiences fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 500 ? 860 : 900 });
    for (const path of ['/', '/diagnostico/', '/demos/terrava/', '/demos/aurem/gestion/']) await expectCleanPage(page, path);
  });
}

test('all demo forms stay local and cannot use Resend', async ({ page }) => {
  const externalWrites: string[] = [];
  page.on('request', (request) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method())) externalWrites.push(request.url());
  });
  for (const [path, expected] of [
    ['/demos/nivora/', 'No se ha bloqueado inventario'],
    ['/demos/terrava/', 'Solicitud demo creada'],
    ['/en/demos/nivora/', 'No inventory was blocked'],
    ['/en/demos/terrava/', 'Demo enquiry created'],
  ] as const) {
    const response = await page.goto(path);
    expect(response?.headers()['content-security-policy']).toContain("form-action 'none'");
    await expect(page.locator('#reserva')).toContainText(/Resend/);
    await page.locator('[data-demo-form] button[type="submit"]').click();
    await expect(page.locator('.demo-result')).toContainText(expected);
  }
  for (const path of ['/demos/aurem/', '/en/demos/aurem/']) {
    const response = await page.goto(path);
    expect(response?.headers()['content-security-policy']).toContain("form-action 'none'");
    await expect(page.locator('#reserva')).toContainText(/Resend/);
    await page.locator('[data-demo-form] button[type="submit"]').click();
    await expect(page.locator('[data-payment]')).toBeVisible();
    await page.locator('[data-close]').click();
  }
  expect(externalWrites).toEqual([]);
});

test('the lead endpoint rejects demo sources before Resend eligibility', async ({ request }) => {
  const response = await request.post('/api/leads', { data: {
    name: 'Demo local', businessName: 'Terrava ficticia', email: 'demo@example.test', accommodationType: 'rural', propertyCount: 1, unitCount: 1, sourcePath: '/demos/terrava/', accept: true,
  } });
  expect(response.status()).toBe(403);
  expect(await response.json()).toMatchObject({ outcome: 'blocked', error: 'demo_submission_disabled' });
});

test('the lead endpoint rejects cross-site browser submissions before coordination', async ({ request }) => {
  const response = await request.post('/api/leads', {
    headers: { origin: 'https://attacker.example', 'sec-fetch-site': 'cross-site' },
    data: {
      name: 'Cross-site test', businessName: 'Casa ficticia', email: 'demo@example.test', accommodationType: 'rural', propertyCount: 1, unitCount: 1, sourcePath: '/', accept: true,
    },
  });
  expect(response.status()).toBe(403);
  expect(await response.json()).toMatchObject({ outcome: 'blocked', error: 'cross_site_submission_disabled' });
});

test('the lead endpoint rejects oversized payloads before delivery', async ({ request }) => {
  const response = await request.post('/api/leads', { data: {
    name: 'Oversized test', businessName: 'Casa ficticia', email: 'demo@example.test', accommodationType: 'rural', propertyCount: 1, unitCount: 1, sourcePath: '/', accept: true, padding: 'x'.repeat(33_000),
  } });
  expect(response.status()).toBe(413);
  expect(await response.json()).toMatchObject({ outcome: 'invalid', error: 'payload_too_large' });
});

test('commercial pages expose bilingual SEO metadata and complete sitemap', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://estancia.logic2b.com/');
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', 'https://estancia.logic2b.com/en/');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Logic Estancia/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://estancia.logic2b.com/media/terrava/hero.webp');

  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
  const schemaTypes = schemas.flatMap((schema) => {
    const parsed = JSON.parse(schema) as { '@type'?: string } | { '@type'?: string }[];
    return (Array.isArray(parsed) ? parsed : [parsed]).map((item) => item['@type']);
  });
  expect(schemaTypes).toEqual(expect.arrayContaining(['Organization', 'WebSite', 'FAQPage']));

  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml).toContain('https://estancia.logic2b.com/en/privacidad/');
  expect(xml).toContain('https://estancia.logic2b.com/en/cookies/');
  expect(xml).not.toContain('/demos/');
});

test('plan interest carries the selected plan into the assessment', async ({ page }) => {
  await page.goto('/');
  await page.locator('.level-grid article').nth(1).getByRole('link', { name: /Ver si encaja/ }).click();
  await expect(page).toHaveURL(/\/diagnostico\/\?plan=gestion$/);
  await expect(page.locator('[name="bookingNeeds"][value="bookings"]')).toBeChecked();
});

test('business landing links preserve the prospect segment in the assessment', async ({ page }) => {
  for (const [path, segment, type] of [
    ['/soluciones/casas-rurales/', 'rural', 'rural'],
    ['/soluciones/apartamentos/', 'apartments', 'apartment'],
    ['/soluciones/hoteles/', 'hotels', 'hotel'],
  ] as const) {
    await page.goto(path);
    await page.locator('.solution-hero').getByRole('link', { name: 'Ver mi punto de partida' }).click();
    await expect(page).toHaveURL(new RegExp(`/diagnostico/\\?segment=${segment}$`));
    await expect(page.locator(`[name="accommodationType"][value="${type}"]`)).toBeChecked();
  }
});

test('managed human service is explicit across the commercial journey', async ({ page }) => {
  for (const path of ['/', '/soluciones/casas-rurales/', '/planes/']) {
    await page.goto(path);
    const service = page.locator('.human-service');
    await expect(service.getByRole('heading', { name: 'No te damos un software para que te apañes solo.' })).toBeVisible();
    await expect(service.getByRole('heading', { name: 'Lo configuramos por ti' })).toBeVisible();
    await expect(service).toContainText('todo lo acordado');
    await expect(service).toContainText('soporte base');
  }

  await page.goto('/en/solutions/apartments/');
  const service = page.locator('.human-service');
  await expect(service.getByRole('heading', { name: "We don't hand you software and leave you to figure it out." })).toBeVisible();
  await expect(service.getByRole('heading', { name: 'We configure it for you' })).toBeVisible();
  await expect(service).toContainText('everything agreed in scope');
});

test('WhatsApp contact follows the Camp pattern without covering the footer', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Rechazar' }).click();
  const contact = page.getByRole('link', { name: 'Contacta con Logic2B por WhatsApp' });
  await expect(contact).toHaveAttribute('data-visible', 'false');
  await page.evaluate(() => window.scrollTo(0, 700));
  await expect(contact).toHaveAttribute('data-visible', 'true');
  await expect(contact).toHaveAttribute('tabindex', '0');
  await expect(contact.locator('svg')).toBeVisible();

  expect(await contact.evaluate((node) => {
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return {
      text: node.textContent?.trim(),
      height: rect.height,
      border: style.border,
      borderRadius: style.borderRadius,
      background: style.backgroundColor,
      color: style.color,
    };
  })).toEqual({
    text: 'Contacta',
    height: 48,
    border: '3px solid rgb(19, 122, 59)',
    borderRadius: '14px',
    background: 'rgba(19, 122, 59, 0.1)',
    color: 'rgb(19, 122, 59)',
  });

  await page.locator('#contacto').scrollIntoViewIfNeeded();
  await expect(contact).toHaveAttribute('data-visible', 'false');
  await expect(contact).toHaveAttribute('tabindex', '-1');

  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(contact).toHaveAttribute('data-visible', 'false');
  await expect(contact).toHaveAttribute('tabindex', '-1');

  await page.goto('/en/');
  await expect(page.getByRole('link', { name: 'Contact Logic2B on WhatsApp' })).toContainText('Contact');
});

test('each accommodation landing explains its own detailed workflow', async ({ page }) => {
  for (const [path, heading, result] of [
    ['/soluciones/casas-rurales/', 'De descubrir tu historia a preparar la llegada.', 'Relación directa · contexto hasta la estancia'],
    ['/soluciones/apartamentos/', 'Una consulta entra una vez. El contexto acompaña todo el camino.', 'Una marca · un contexto · varias unidades'],
    ['/soluciones/hoteles/', 'De una señal dispersa a una incidencia cerrada y trazable.', 'Prioridad visible · responsable · seguimiento'],
  ] as const) {
    await page.goto(path);
    const workflow = page.locator('.workflow-section');
    await expect(workflow.getByRole('heading', { name: heading })).toBeVisible();
    await expect(workflow.locator('.workflow-step')).toHaveCount(5);
    await expect(workflow.locator('.workflow-step.human')).toHaveCount(1);
    await expect(workflow.locator('.workflow-branch')).toBeVisible();
    await expect(workflow.locator('.workflow-result')).toContainText(result);
  }

  await page.goto('/en/solutions/hotels/');
  const workflow = page.locator('.workflow-section');
  await expect(workflow.getByRole('heading', { name: 'From a scattered signal to a closed, traceable incident.' })).toBeVisible();
  await expect(workflow.locator('.workflow-step')).toHaveCount(5);
});

test('capability evidence stays concise until its boundary is requested', async ({ page }) => {
  await page.goto('/soluciones/hoteles/');
  const capability = page.locator('[data-capability="operations-centre"]');
  await expect(capability.getByRole('link', { name: /Ver evidencia en Aurem/ })).toBeVisible();
  await expect(capability.locator('.capability-details')).not.toHaveAttribute('open', '');
  await capability.locator('.capability-details summary').click();
  await expect(capability.locator('.capability-details')).toHaveAttribute('open', '');
  await expect(capability).toContainText('No toma decisiones ni ejecuta acciones de forma autónoma');
});

test('scope configurator recommends progressively and prefills the commercial form', async ({ page }) => {
  await page.goto('/');
  const scope = page.locator('[data-scope-estimator]');
  await expect(scope).toHaveAttribute('data-level', 'basico');
  await expect(scope.getByRole('heading', { name: 'Básico', exact: true })).toBeVisible();

  await scope.getByLabel('Propiedades').fill('8');
  await scope.getByLabel('Unidades').fill('8');
  await expect(scope).toHaveAttribute('data-level', 'basico');

  await scope.getByLabel('Reservas, huéspedes y planning').check();
  await expect(scope).toHaveAttribute('data-level', 'gestion');
  await expect(scope.getByRole('heading', { name: 'Gestión', exact: true })).toBeVisible();

  await scope.getByLabel('Mensajes, recordatorios y canales').check();
  await expect(scope).toHaveAttribute('data-level', 'inteligente');
  await scope.getByLabel('Equipo, mantenimiento y revenue').check();
  await expect(scope).toHaveAttribute('data-level', 'inteligente');
  await scope.getByRole('link', { name: 'Usar esta recomendación' }).click();

  await expect(page).toHaveURL(/\/diagnostico\/\?plan=inteligente&properties=8&units=8$/);
  await expect(page.locator('[name="propertyCount"]')).toHaveValue('8');
  await expect(page.locator('[name="unitCount"]')).toHaveValue('8');
});

test('scope configurator remains localized in English', async ({ page }) => {
  await page.goto('/en/');
  const scope = page.locator('[data-scope-estimator]');
  await scope.getByLabel('Messages, reminders and channels').check();
  await expect(scope).toHaveAttribute('data-level', 'inteligente');
  await expect(scope.getByRole('heading', { name: 'Intelligent', exact: true })).toBeVisible();
  await expect(scope.getByText('You included automation and channels.')).toBeVisible();
});

test('assessment reveals an operations recommendation before asking for contact details', async ({ page }) => {
  await page.goto('/diagnostico/');
  await page.getByText('Hotel', { exact: true }).click();
  await page.getByRole('button', { name: /Siguiente/ }).click();
  await page.getByLabel('Propiedades').fill('1');
  await page.getByLabel('Unidades o habitaciones').fill('48');
  await page.getByRole('button', { name: /Siguiente/ }).click();
  await page.getByText('PMS', { exact: true }).click();
  await page.getByRole('button', { name: /Siguiente/ }).click();
  await page.getByText('Reservas', { exact: true }).click();
  await page.getByRole('button', { name: /Siguiente/ }).click();
  await page.getByText('Mantenimiento', { exact: true }).click();
  await page.getByRole('button', { name: /Siguiente/ }).click();
  await page.getByRole('button', { name: /Ver recomendación/ }).click();
  await expect(page.locator('[data-result-name]')).toHaveText('Inteligente');
  await expect(page.getByRole('heading', { name: 'Hablemos sobre esta recomendación.' })).toBeVisible();
  await expect(page.locator('[data-demo-link]')).toHaveAttribute('href', '/demos/aurem/');
});

test('assessment keeps context local until the single sales form is reviewed and submitted', async ({ page }) => {
  let leadRequests = 0;
  let submitted: Record<string, unknown> | null = null;
  await page.route('**/api/leads', async (route) => {
    leadRequests += 1;
    submitted = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ ok: true, outcome: 'delivered', ref: 'assessment-ref', meetingUrl: null }) });
  });
  await page.goto('/diagnostico/');
  await page.locator('[data-step="1"]').getByText('Apartamentos', { exact: true }).click();
  await page.getByLabel('Modelo de operación').selectOption('multi');
  await page.getByRole('button', { name: /Siguiente/ }).click();
  await page.getByLabel('Propiedades').fill('3');
  await page.getByLabel('Unidades o habitaciones').fill('12');
  await page.getByRole('button', { name: /Siguiente/ }).click();
  await page.getByText('Web', { exact: true }).click();
  await page.getByText('Email y hojas de cálculo', { exact: true }).click();
  await page.getByRole('button', { name: /Siguiente/ }).click();
  await page.getByText('Reservas', { exact: true }).click();
  await page.getByText('Planning', { exact: true }).click();
  await page.getByRole('button', { name: /Siguiente/ }).click();
  await page.getByRole('button', { name: /Siguiente/ }).click();
  await page.getByLabel('Plazo').selectOption('3-6');
  await page.getByLabel('Inversión de implantación').selectOption('8k-20k');
  await page.getByRole('button', { name: /Ver recomendación/ }).click();
  await expect(page.locator('[data-diagnostic-lead]')).toHaveCount(0);
  await expect(page.getByText(/este contexto se conserva temporalmente en esta pestaña/)).toBeVisible();
  const salesLink = page.getByRole('link', { name: /Continuar con este contexto/ });
  await expect(salesLink).toHaveAttribute('href', '/?assessment=1#contacto');
  const localContext = await page.evaluate(() => sessionStorage.getItem('logic-estancia-assessment-v1'));
  expect(localContext).toContain('"plan":"gestion"');
  for (const piiField of ['name', 'email', 'phone', 'message']) expect(Object.keys(JSON.parse(localContext ?? '{}'))).not.toContain(piiField);
  expect(leadRequests).toBe(0);
  await salesLink.click();
  await expect(page).toHaveURL(/\/\?assessment=1#contacto$/);
  const form = page.locator('[data-lead]');
  const handoff = form.locator('[data-assessment-handoff]');
  await expect(handoff).toBeVisible();
  await expect(handoff.getByRole('heading', { name: 'No tienes que empezar de nuevo.' })).toBeVisible();
  await expect(form.locator('[name="accommodationType"]')).toHaveValue('apartment');
  await expect(form.locator('[name="plan"]')).toHaveValue('gestion');
  await expect(form.locator('[name="propertyCount"]')).toHaveValue('3');
  await expect(form.locator('[name="unitCount"]')).toHaveValue('12');
  await handoff.getByText('Revisar el contexto que se adjuntará').click();
  await expect(handoff).toContainText('Email y hojas de cálculo');
  await expect(handoff).toContainText('Reservas, Planning');
  expect(leadRequests).toBe(0);

  await form.locator('[name="name"]').fill('Ada Demo');
  await form.locator('[name="businessName"]').fill('Apartamentos Demo');
  await form.locator('[name="email"]').fill('ada@example.test');
  await form.locator('[name="accept"]').check();
  await form.getByRole('button', { name: /Quiero una recomendación/ }).click();
  await expect(form.locator('[data-lead-receipt]')).toBeVisible();
  expect(leadRequests).toBe(1);
  expect(submitted).toMatchObject({
    accommodationType: 'apartment', businessMode: 'multi', propertyCount: 3, unitCount: 12, plan: 'gestion',
    currentStack: ['website', 'email'], requestedCapabilities: ['bookings', 'planning'], timeline: '3-6', investmentRange: '8k-20k',
    sourcePath: '/diagnostico/', name: 'Ada Demo', email: 'ada@example.test',
  });
  expect(await page.evaluate(() => sessionStorage.getItem('logic-estancia-assessment-v1'))).toBeNull();
});

test('English assessment context is reviewable and can be discarded before contact', async ({ page }) => {
  await page.goto('/en/assessment/');
  await page.evaluate(() => sessionStorage.setItem('logic-estancia-assessment-v1', JSON.stringify({
    version: '1.0.0', createdAt: Date.now(), locale: 'en', accommodationType: 'hotel', businessMode: 'mono',
    propertyCount: 1, unitCount: 32, plan: 'inteligente', currentStack: ['pms'], requestedCapabilities: ['maintenance'],
    timeline: 'exploring', investmentRange: 'unknown',
  })));
  await page.goto('/en/?assessment=1#contacto');
  const form = page.locator('[data-lead]');
  const handoff = form.locator('[data-assessment-handoff]');
  await expect(handoff.getByRole('heading', { name: 'You do not have to start again.' })).toBeVisible();
  await expect(form.locator('[name="accommodationType"]')).toHaveValue('hotel');
  await expect(form.locator('[name="plan"]')).toHaveValue('inteligente');
  await handoff.getByText('Review the context that will be attached').click();
  await expect(handoff).toContainText('Maintenance');
  await expect(handoff).toContainText('To be defined');
  await handoff.getByRole('button', { name: 'Do not attach these answers' }).click();
  await expect(handoff).toBeHidden();
  await expect(page).toHaveURL(/\/en\/#contacto$/);
  await expect(form.locator('[name="accommodationType"]')).toBeFocused();
  expect(await page.evaluate(() => sessionStorage.getItem('logic-estancia-assessment-v1'))).toBeNull();
});

test('the sales landing is the only form that calls the production lead endpoint', async ({ page }) => {
  let leadRequests = 0;
  await page.route('**/api/leads', (route) => {
    leadRequests += 1;
    return route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ ok: true, outcome: 'delivered', ref: 'test-ref', meetingUrl: null }) });
  });
  await page.goto('/');
  const form = page.locator('[data-lead]');
  await expect(form.getByText('Revisaremos el contexto y responderemos en un día laborable.')).toBeVisible();
  await expect(form.getByRole('link', { name: 'política de privacidad' })).toHaveAttribute('href', '/privacidad/');
  await expect(form.locator('label.honeypot')).toHaveCSS('position', 'absolute');
  await expect(form.locator('label.honeypot')).toHaveAttribute('inert', '');
  await form.locator('[name="name"]').fill('Ada Demo');
  await form.locator('[name="businessName"]').fill('Casa Demo');
  await form.locator('[name="email"]').fill('ada@example.test');
  await form.locator('[name="message"]').fill('Solicitud comercial de prueba.');
  await form.locator('[name="accept"]').check();
  await form.getByRole('button', { name: /Quiero una recomendación/ }).click();
  const receipt = form.locator('[data-lead-receipt]');
  await expect(receipt).toBeVisible();
  await expect(receipt).toBeFocused();
  await expect(receipt).toHaveAttribute('role', 'status');
  await expect(receipt).toContainText('La conversación ya está en marcha.');
  await expect(receipt.locator('[data-lead-reference]')).toContainText('test-ref');
  await expect(receipt.locator('[data-meeting-copy]')).toHaveText('No necesitas hacer nada más: te responderemos por email.');
  await expect(receipt.locator('[data-meeting-link]')).toBeHidden();
  expect(leadRequests).toBe(1);

  await page.goto('/demos/terrava/');
  await page.locator('[data-demo-form] button[type="submit"]').click();
  await expect(page.locator('.demo-result')).toContainText('Solicitud demo creada');
  expect(leadRequests).toBe(1);
});

test('the English receipt exposes only a valid optional meeting link', async ({ page }) => {
  await page.route('**/api/leads', (route) => route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ ok: true, outcome: 'delivered', ref: 'safe-ref-01', meetingUrl: 'https://meet.example.test/logic-estancia' }) }));
  await page.goto('/en/');
  const form = page.locator('[data-lead]');
  await expect(form.getByRole('link', { name: 'privacy policy' })).toHaveAttribute('href', '/en/privacidad/');
  await form.locator('[name="name"]').fill('Ada Demo');
  await form.locator('[name="businessName"]').fill('Demo Stay');
  await form.locator('[name="email"]').fill('ada@example.test');
  await form.locator('[name="accept"]').check();
  await form.getByRole('button', { name: /Get my recommendation/ }).click();
  const receipt = form.locator('[data-lead-receipt]');
  await expect(receipt).toContainText('The conversation is now under way.');
  await expect(receipt.locator('[data-meeting-copy]')).toHaveText('If useful, you can also choose a time.');
  await expect(receipt.locator('[data-meeting-link]')).toHaveAttribute('href', 'https://meet.example.test/logic-estancia');
  await expect(receipt.locator('[data-meeting-link]')).toHaveAttribute('rel', 'noopener noreferrer');
});

test('the sales form does not claim delivery for a non-delivery 202 response', async ({ page }) => {
  await page.route('**/api/leads', (route) => route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ ok: true, outcome: 'demo' }) }));
  await page.goto('/');
  const form = page.locator('[data-lead]');
  await form.locator('[name="name"]').fill('Ada Demo');
  await form.locator('[name="businessName"]').fill('Casa Demo');
  await form.locator('[name="email"]').fill('ada@example.test');
  await form.locator('[name="accept"]').check();
  await form.getByRole('button', { name: /Quiero una recomendación/ }).click();
  await expect(form.locator('[data-lead-receipt]')).toBeHidden();
  await expect(form.locator('.form-status')).toHaveText('No hemos podido entregarla. Prueba por WhatsApp o vuelve a intentarlo.');
  await expect(form.getByRole('button', { name: /Quiero una recomendación/ })).toBeEnabled();
});

test('the sales form bounds a stalled request and can retry without claiming delivery', async ({ page }) => {
  await page.clock.install();
  let requests = 0;
  await page.route('**/api/leads', () => { requests += 1; });
  await page.goto('/');
  const form = page.locator('[data-lead]');
  await form.locator('[name="name"]').fill('Ada Demo');
  await form.locator('[name="businessName"]').fill('Casa Demo');
  await form.locator('[name="email"]').fill('ada@example.test');
  await form.locator('[name="accept"]').check();
  await form.getByRole('button', { name: /Quiero una recomendación/ }).click();
  await expect(form.getByRole('button', { name: /Enviando/ })).toBeDisabled();

  await page.clock.fastForward(15_000);

  await expect(form.locator('[data-lead-receipt]')).toBeHidden();
  await expect(form.locator('.form-status')).toHaveText('La conexión está tardando demasiado y no podemos confirmar la entrega. Vuelve a intentarlo: si la solicitud ya llegó, conservaremos una única referencia.');
  await expect(form.getByRole('button', { name: /Quiero una recomendación/ })).toBeEnabled();
  expect(requests).toBe(1);

  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await page.route('**/api/leads', (route) => route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ ok: true, outcome: 'delivered', ref: 'retry-ref', meetingUrl: null }) }));
  await form.getByRole('button', { name: /Quiero una recomendación/ }).click();
  await expect(form.locator('[data-lead-receipt]')).toContainText('retry-ref');
});

test('cookie preferences remain consent-gated, revocable and shared with demos', async ({ page }) => {
  await page.goto('/');
  const banner = page.getByRole('dialog', { name: 'Configuración de cookies' });
  await expect(banner).toBeVisible();
  await expect(page.locator('script[data-gtm]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Configurar preferencias' }).click();
  await expect(page.getByRole('heading', { name: 'Almacenamiento esencial' })).toBeVisible();
  await expect(page.getByText('Siempre activo')).toBeVisible();
  await page.getByRole('checkbox', { name: 'Cookies de analítica' }).check();
  await page.getByRole('button', { name: 'Guardar preferencias' }).click();
  await expect(banner).toBeHidden();
  await expect(page.locator('script[data-gtm]')).toHaveCount(1);
  await expect(page.locator('script[data-gtm]')).toHaveAttribute('src', 'https://www.googletagmanager.com/gtm.js?id=GTM-TVDWZ9LC');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('logic-estancia-consent') ?? 'null'))).toMatchObject({
    essential: true,
    analytics: true,
    version: '1.0.0',
  });

  await page.goto('/demos/terrava/');
  await expect(page.locator('script[data-gtm]')).toHaveCount(1);
  await expect(page.locator('script[data-gtm]')).toHaveAttribute('src', 'https://www.googletagmanager.com/gtm.js?id=GTM-TVDWZ9LC');

  await page.goto('/cookies/');
  await expect(page.getByRole('heading', { name: 'Almacenamiento y cookies' })).toBeVisible();
  await page.getByRole('button', { name: 'Cambiar mi elección de cookies' }).click();
  await expect(banner).toBeVisible();
  await expect(page.locator('script[data-gtm]')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('logic-estancia-consent'))).toBeNull();
  await page.getByRole('button', { name: 'Rechazar' }).click();
  await expect(banner).toBeHidden();
  await expect(page.locator('script[data-gtm]')).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('logic-estancia-consent') ?? 'null'))).toMatchObject({ analytics: false });
});

test('consented analytics keeps only contract events and parameters', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Configurar preferencias' }).click();
  await page.getByRole('checkbox', { name: 'Cookies de analítica' }).check();
  await page.getByRole('button', { name: 'Guardar preferencias' }).click();
  const before = await page.evaluate(() => window.dataLayer?.length ?? 0);
  await page.evaluate(() => {
    window.estanciaTrack?.('lead_submit', {
      locale: 'es',
      plan: 'gestion',
      source_section: 'homepage_contact',
      email: 'pii@example.test',
      message: 'No debe salir',
    });
    window.estanciaTrack?.('invented_event', { locale: 'es' });
  });
  const observed = await page.evaluate(() => window.dataLayer?.slice(-1)[0]);
  expect(observed).toMatchObject({ event: 'lead_submit', locale: 'es', plan: 'gestion', source_section: 'homepage_contact' });
  expect(observed).not.toHaveProperty('email');
  expect(observed).not.toHaveProperty('message');
  await expect.poll(() => page.evaluate(() => window.dataLayer?.length ?? 0)).toBe(before + 1);
});

test('the cookie choice and complete legal surfaces are localized in English', async ({ page }) => {
  await page.goto('/en/');
  const banner = page.getByRole('dialog', { name: 'Cookie settings' });
  await expect(banner).toBeVisible();
  await page.getByRole('button', { name: 'Configure preferences' }).click();
  await expect(page.getByText('Always active')).toBeVisible();
  await page.getByRole('button', { name: 'Reject all' }).click();
  await expect(banner).toBeHidden();

  await page.goto('/en/legal/');
  await expect(page.getByText('Logic2b S.L.', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Demonstrations and scope' })).toBeVisible();
  await page.goto('/en/privacidad/');
  await expect(page.getByRole('heading', { name: 'Data, purpose and lawful basis' })).toBeVisible();
  await expect(page.getByText(/Resend: transport/)).toBeVisible();
  await expect(page.getByText(/HubSpot:/)).toHaveCount(0);
  await page.goto('/en/cookies/');
  await expect(page.getByRole('columnheader', { name: 'Category' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Change my cookie choice' })).toBeVisible();
});

test('Terrava carries a website enquiry into the workspace, converts it and resets', async ({ page }) => {
  await page.goto('/demos/terrava/');
  await page.getByLabel('Nombre').fill('Lucía Prado');
  await page.getByLabel('Huéspedes').fill('3');
  await page.getByLabel('Entrada').fill('2026-08-22');
  await page.getByLabel('Salida').fill('2026-08-26');
  await page.locator('[data-demo-form] button[type="submit"]').click();
  await page.getByRole('link', { name: 'Abrir la solicitud en el gestor' }).click();
  await page.getByRole('button', { name: 'Explorar libremente' }).click();
  await expect(page).toHaveURL(/vista=enquiries/);
  await expect(page.getByText('Lucía Prado · 3 huéspedes')).toBeVisible();
  await expect(page.getByText('Desde la web demo')).toBeVisible();
  await expect(page.getByText('€ 816')).toBeVisible();
  await page.getByRole('button', { name: 'Preparar alternativa' }).click();
  await page.getByRole('button', { name: 'Convertir en reserva' }).click();
  await expect(page.getByText('TER-104')).toBeVisible();
  await expect(page.getByText('Lucía Prado', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Restablecer/ }).click();
  await page.getByRole('button', { name: 'Solicitudes', exact: true }).click();
  await expect(page.getByText('Marina Costa · 4 huéspedes')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Preparar alternativa' })).toBeVisible();
});

test('the shared Terrava journey remains localized in English', async ({ page }) => {
  await page.goto('/en/demos/terrava/');
  await page.getByLabel('Name').fill('Jamie Demo');
  await page.locator('[data-demo-form] button[type="submit"]').click();
  await page.getByRole('link', { name: 'Open the enquiry in the workspace' }).click();
  await page.getByRole('button', { name: 'Explore freely' }).click();
  await expect(page.getByRole('heading', { name: 'Enquiries' })).toBeVisible();
  await expect(page.getByText('Jamie Demo · 2 guests')).toBeVisible();
  await expect(page.getByText('From demo website')).toBeVisible();
});

test('Terrava operates a stay and publishes a reversible website draft', async ({ page }) => {
  await page.goto('/demos/terrava/gestion/');
  await page.getByRole('button', { name: 'Explorar libremente' }).click();
  await page.getByRole('button', { name: 'Planning', exact: true }).click();
  await page.getByRole('button', { name: 'Reasignar a Casa Bruma' }).click();
  await page.getByRole('button', { name: 'Aplicar tarifa flexible +48 €' }).click();
  await expect(page.getByText('Planning y perfil actualizados')).toBeVisible();
  await page.getByRole('button', { name: 'Mi web', exact: true }).click();
  await page.getByLabel('Texto del hero').fill('Ocho casas. Una forma distinta de volver.');
  await page.getByRole('button', { name: 'Publicar cambio simulado' }).click();
  await expect(page.getByText('Publicada en esta demo')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ocho casas. Una forma distinta de volver.' })).toBeVisible();
});

test('workspace search opens from the keyboard and navigates to a matching area', async ({ page }) => {
  await page.goto('/demos/aurem/gestion/');
  await page.getByRole('button', { name: 'Explorar libremente' }).click();
  await page.getByRole('button', { name: 'Buscar en el gestor' }).click();
  const search = page.getByRole('dialog', { name: 'Búsqueda rápida' });
  await expect(search).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(search).toBeHidden();
  await page.keyboard.press('/');
  await expect(search).toBeVisible();
  await search.getByPlaceholder('Reservas, limpieza, informes…').fill('limpieza');
  await search.getByRole('button', { name: 'Limpieza', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Limpieza', exact: true })).toBeVisible();
  await expect(page).toHaveURL(/vista=cleaning/);

  await page.getByRole('button', { name: 'Buscar en el gestor' }).click();
  await expect(page.getByRole('dialog', { name: 'Búsqueda rápida' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Búsqueda rápida' })).toBeHidden();
});

test("Aurem guided journey connects operational evidence to the assessment and resumes exactly", async ({
  page,
}) => {
  const externalWrites: string[] = [];
  page.on("request", (request) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method()))
      externalWrites.push(request.url());
  });
  await page.goto("/demos/aurem/gestion/");
  await page.getByRole("button", { name: "Visita guiada" }).click();

  await expect(
    page.getByRole("dialog", { name: "Detecta la habitación en riesgo" }),
  ).toBeVisible();
  await expect(
    page.getByRole("progressbar", { name: "Progreso del recorrido" }),
  ).toHaveAttribute("aria-valuenow", "1");
  await page.getByRole("button", { name: "Siguiente hito" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Limpieza" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Siguiente hito" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Planning" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Siguiente hito" }).click();
  await expect(
    page.getByRole("dialog", { name: "Explica cada métrica" }),
  ).toContainText("96 habitaciones ficticias · sin predicción ni contabilidad");
  await expect(
    page.getByRole("heading", { level: 1, name: "Ingresos" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Pausar" }).click();
  await expect(
    page.getByRole("button", { name: "Reanudar recorrido" }),
  ).toBeVisible();
  await page.goto("/demos/aurem/gestion/");
  await expect(
    page.getByRole("dialog", { name: "Explica cada métrica" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/vista=reports/);

  await page.getByRole("button", { name: "Siguiente hito" }).click();
  await expect(
    page.getByRole("dialog", { name: "Revisa antes de conectar" }),
  ).toContainText("0 canales conectados · publicación bloqueada");
  await expect(
    page.getByRole("heading", { level: 1, name: "Canales" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Siguiente hito" }).click();
  await expect(
    page.getByRole("dialog", { name: "Edita, revisa y conserva el control" }),
  ).toContainText("Sin modelo ni proveedor · sin envío");
  await expect(
    page.getByRole("heading", { level: 1, name: "Automatización" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Siguiente hito" }).click();

  const finalStep = page.getByRole("dialog", {
    name: "Convierte la evidencia en alcance",
  });
  await expect(finalStep).toContainText(
    "Resultado visible antes de pedir datos",
  );
  await expect(
    finalStep.getByRole("link", { name: "Abrir diagnóstico" }),
  ).toHaveAttribute(
    "href",
    "/diagnostico/?segment=hotels&plan=inteligente&demo=aurem",
  );
  await finalStep.getByRole("link", { name: "Abrir diagnóstico" }).click();
  await expect(page).toHaveURL(
    /\/diagnostico\/\?segment=hotels&plan=inteligente&demo=aurem$/,
  );
  await expect(page.getByLabel("Hotel")).toBeChecked();
  await expect(page.getByLabel("Automatización")).toBeChecked();
  expect(externalWrites).toEqual([]);
});

test("Aurem guided journey keeps its evidence and exit localized in English", async ({
  page,
}) => {
  await page.goto("/en/demos/aurem/gestion/");
  await page.getByRole("button", { name: "Guided tour" }).click();
  for (let step = 0; step < 5; step += 1)
    await page.getByRole("button", { name: "Next milestone" }).click();
  await expect(
    page.getByRole("dialog", { name: "Edit, review and keep control" }),
  ).toContainText("No model or provider · no delivery");
  await page.getByRole("button", { name: "Next milestone" }).click();
  const finalStep = page.getByRole("dialog", {
    name: "Turn evidence into scope",
  });
  await expect(
    finalStep.getByRole("link", { name: "Open assessment" }),
  ).toHaveAttribute(
    "href",
    "/en/assessment/?segment=hotels&plan=inteligente&demo=aurem",
  );
});

test('Aurem revenue explains every fictitious metric and links to demo evidence', async ({ page }) => {
  await page.goto('/demos/aurem/gestion/?vista=reports');
  await page.getByRole('button', { name: 'Explorar libremente' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Ingresos' })).toBeVisible();
  await expect(page.getByRole('note')).toContainText('96 habitaciones ficticias durante 28 días');
  await expect(page.locator('.revenue-metrics button')).toHaveCount(4);

  await page.getByRole('button', { name: /Tarifa media diaria/ }).click();
  await expect(page.locator('.revenue-explanation')).toContainText('€296.608 de ingresos ÷ 2.392 noches ocupadas');
  await page.getByRole('button', { name: 'Abrir reservas ficticias' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Reservas' })).toBeVisible();
  await expect(page).toHaveURL(/vista=bookings/);
});

test('Aurem revenue remains explainable and navigable in English', async ({ page }) => {
  await page.goto('/en/demos/aurem/gestion/?vista=reports');
  await page.getByRole('button', { name: 'Explore freely' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Revenue' })).toBeVisible();
  await expect(page.getByRole('note')).toContainText('96 fictitious rooms over 28 days');
  await expect(page.locator('.revenue-ledger tbody tr')).toHaveCount(4);

  await page.getByRole('button', { name: /Revenue per available room/ }).click();
  await expect(page.locator('.revenue-explanation')).toContainText('€296,608 revenue ÷ 2,688 available room nights');
  await page.getByRole('button', { name: 'Open fictitious planning' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Planning' })).toBeVisible();
  await expect(page).toHaveURL(/vista=planning/);
});

test('Aurem channel review stays local, supervised and persistent', async ({ page }) => {
  const externalWrites: string[] = [];
  page.on('request', (request) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method())) externalWrites.push(request.url());
  });
  await page.goto('/demos/aurem/gestion/?vista=channels');
  await page.getByRole('button', { name: 'Explorar libremente' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Canales' })).toBeVisible();
  await expect(page.getByRole('note')).toContainText('0 canales conectados');
  await expect(page.locator('.channel-matrix tbody tr')).toHaveCount(4);
  await expect(page.getByText('Última sincronización de muestra')).toHaveCount(0);

  await page.getByRole('button', { name: 'Marcar revisión local' }).click();
  await expect(page.getByRole('status')).toHaveText('Revisado en este navegador · sin publicación');
  await expect(page.getByRole('button', { name: 'Publicar deshabilitado · sin conexión' })).toBeDisabled();
  await expect(page.locator('.channel-metrics > div').filter({ hasText: 'Revisiones pendientes' }).locator('strong')).toHaveText('0');
  expect(externalWrites).toEqual([]);

  await page.reload();
  await expect(page.getByRole('status')).toHaveText('Revisado en este navegador · sin publicación');
});

test('Aurem channel review enforces roles and explains live requirements in English', async ({ page }) => {
  await page.goto('/en/demos/aurem/gestion/?vista=channels');
  await page.getByRole('button', { name: 'Explore freely' }).click();
  await page.getByLabel('Role').selectOption('cleaning');
  await expect(page.getByRole('button', { name: 'Requires Direction or Reception' })).toBeDisabled();

  await page.getByRole('button', { name: /Direct iCal/ }).click();
  await expect(page.locator('.channel-review')).toContainText('timezone, deduplication and error handling');
  await expect(page.getByRole('heading', { name: 'What a live connection would require' })).toBeVisible();
  await expect(page.getByText('Agreement and credentials')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Publish disabled · no connection' })).toBeDisabled();
});

test('Aurem supervised AI draft stays local, reviewable and persistent', async ({ page }) => {
  const externalWrites: string[] = [];
  page.on('request', (request) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method())) externalWrites.push(request.url());
  });
  await page.goto('/demos/aurem/gestion/?vista=automation');
  await page.getByRole('button', { name: 'Explorar libremente' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Automatización' })).toBeVisible();
  await expect(page.getByRole('note')).toContainText('sin modelo ni proveedor');

  const message = 'Hola Elena, la habitación estará lista a las 16:00. Confirma tu hora de llegada.';
  await page.getByLabel('Mensaje preparado').fill(message);
  await page.getByRole('button', { name: 'Guardar borrador local' }).click();
  await expect(page.getByText('Versión 2 · edición local')).toBeVisible();
  await expect(page.getByText('Guardada como versión 2')).toBeVisible();
  await page.getByRole('button', { name: 'Marcar como revisado' }).click();
  await expect(page.getByText('Revisado', { exact: true })).toBeVisible();
  await expect(page.getByText('Aprobada solo en local')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enviar deshabilitado · proveedor no conectado' })).toBeDisabled();
  expect(externalWrites).toEqual([]);

  await page.reload();
  await expect(page.getByLabel('Mensaje preparado')).toHaveValue(message);
  await expect(page.getByText('Revisado', { exact: true })).toBeVisible();
  expect(externalWrites).toEqual([]);
});

test('Aurem supervised AI explains fixtures and enforces review roles in English', async ({ page }) => {
  await page.goto('/en/demos/aurem/gestion/?vista=automation');
  await page.getByRole('button', { name: 'Explore freely' }).click();
  await page.getByLabel('Role').selectOption('cleaning');

  await expect(page.getByRole('note')).toContainText('no model or provider');
  await expect(page.getByLabel('Draft sources')).toContainText('Fixture sources');
  await expect(page.getByText('No external model call')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Requires Direction or Reception' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Send disabled · provider not connected' })).toBeDisabled();
});

test('operational notifications expose context and open the related area', async ({ page }) => {
  await page.goto('/demos/aurem/gestion/');
  await page.getByRole('button', { name: 'Explorar libremente' }).click();
  await page.getByRole('button', { name: 'Abrir avisos' }).click();
  const notifications = page.getByRole('dialog', { name: 'Avisos operativos' });
  await expect(notifications.getByText('Habitación 408 requiere atención')).toBeVisible();
  await notifications.getByRole('button', { name: /Habitación 408 requiere atención/ }).click();
  await expect(page.getByRole('heading', { name: 'Limpieza', exact: true })).toBeVisible();
  await expect(page).toHaveURL(/vista=cleaning/);
});

test('Aurem completes checkout-cleaning-arrival handoff and resets', async ({ page }) => {
  await page.goto('/demos/aurem/gestion/');
  await page.getByRole('button', { name: 'Explorar libremente' }).click();
  await page.locator('.role-select select').selectOption('cleaning');
  await page.getByRole('button', { name: 'Limpieza', exact: true }).click();
  await page.getByRole('button', { name: 'Empezar preparación' }).click();
  await page.getByRole('button', { name: 'Marcar lista para revisar' }).click();
  await page.locator('.role-select select').selectOption('reception');
  await page.getByRole('button', { name: 'Validar habitación' }).click();
  await expect(page.getByText('Habitación disponible para la entrada')).toBeVisible();
  await page.getByRole('button', { name: 'Abrir avisos' }).click();
  await expect(page.getByRole('dialog', { name: 'Avisos operativos' }).getByText('Habitación 408 validada')).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await page.getByRole('button', { name: /Restablecer/ }).click();
  await expect(page.getByText('Pendiente', { exact: true })).toBeVisible();
});

test('Aurem assigns and resolves a maintenance incident locally', async ({ page }) => {
  await page.goto('/demos/aurem/gestion/');
  await page.getByRole('button', { name: 'Explorar libremente' }).click();
  await page.getByRole('button', { name: 'Mantenimiento', exact: true }).click();
  await page.getByRole('button', { name: 'Asignar a mantenimiento' }).click();
  await page.getByRole('button', { name: 'Resolver y liberar' }).click();
  await expect(page.getByText('Sin impacto en la llegada')).toBeVisible();
  await expect(page.getByText('Resuelta', { exact: true })).toBeVisible();
});

test('Aurem rejects an impossible stay before opening demo payment', async ({ page }) => {
  await page.goto('/demos/aurem/');
  await page.getByLabel('Entrada').fill('2026-08-18');
  await page.getByLabel('Salida').fill('2026-08-17');
  await page.locator('[data-demo-form] button[type="submit"]').click();
  await expect(page.locator('.demo-result')).toHaveText('La salida debe ser posterior a la entrada.');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('link', { name: 'Ver la reserva en el gestor' })).toBeHidden();

  await page.getByLabel('Salida').fill('2026-08-19');
  await page.locator('[data-demo-form] button[type="submit"]').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('Terrace · 1 noche')).toBeVisible();
  await expect(page.getByText('€ 228')).toBeVisible();
});

test('Aurem neutral payment carries the simulated booking into the workspace', async ({ page }) => {
  await page.goto('/demos/aurem/');
  await page.getByLabel('Nombre').fill('Álex Moreno');
  await page.getByLabel('Huéspedes').fill('3');
  await page.getByLabel('Salida').fill('2026-08-18');
  await page.locator('[data-demo-form] button[type="submit"]').click();
  await expect(page.getByText('No se realizará ningún cobro.')).toBeVisible();
  await expect(page.getByText('Terrace · 4 noches')).toBeVisible();
  await expect(page.getByText('€ 912')).toBeVisible();
  await page.getByRole('button', { name: 'Confirmar reserva simulada' }).click();
  await expect(page.locator('.demo-result')).toContainText('No se ha realizado ningún cobro');
  await page.getByRole('link', { name: 'Ver la reserva en el gestor' }).click();
  await page.getByRole('button', { name: 'Explorar libremente' }).click();
  await expect(page).toHaveURL(/vista=bookings/);
  await expect(page.getByText('Álex Moreno llega desde la reserva simulada de la web.')).toBeVisible();
  await expect(page.getByText('Álex Moreno', { exact: true })).toBeVisible();
});
